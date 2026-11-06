/**
 * @module bharatcode-client
 * @description Server-side API client for the BharatCode model API.
 *
 * Uses the OpenAI-compatible `/responses` endpoint with the
 * `qwen-3.8-27b` model.  Includes automatic retry with exponential
 * back-off on 503 responses and token-usage tracking.
 *
 * ⚠️  This module must only be imported in server-side code
 *     (API routes, server components, server actions).
 */

import type { TokenUsage } from "@/lib/types";
import { addTokens } from "@/lib/token-tracker";

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.BHARATCODE_BASE_URL || "https://bharatcode.ai/api/model/v1";
const MODEL = process.env.BHARATCODE_MODEL || "qwen-3.8-27b";
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1_000;

function getApiKey(): string {
  const key = process.env.BHARATCODE_API_KEY;
  if (!key) {
    throw new Error(
      "BHARATCODE_API_KEY is not set. Add it to your .env.local file."
    );
  }
  return key;
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Reasoning effort level. */
export type ReasoningEffort = "none" | "low" | "medium" | "high";

/** Content part for multi-modal messages. */
export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: { url: string } };

/** A single message in the conversation. */
export interface Message {
  role: "user" | "assistant" | "system";
  content: string | ContentPart[];
}

/** Options shared across call variants. */
export interface CallOptions {
  /** Maximum output tokens. Defaults to 4096. */
  maxOutputTokens?: number;
  maxTokens?: number;
  /** Reasoning effort. Defaults to "none". */
  reasoning?: ReasoningEffort;
  /** Whether to stream. */
  stream?: boolean;
}

/** Shape of a non-streaming API response. */
interface APIResponse {
  id: string;
  status: string;
  output: Array<{
    type: string;
    content: Array<{ type: string; text: string }>;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

/** Result from a non-streaming model call. */
export interface ModelResult {
  text: string;
  parsed?: any;
  usage: TokenUsage;
  tokensUsed?: number;
  confidence?: "high" | "medium" | "low";
  finishReason: string | null;
  incomplete: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Sleep for `ms` milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build the fetch request body.
 */
function buildBody(
  messages: Message[],
  options: CallOptions & {
    textFormat?: {
      type: "json_schema";
      name: string;
      schema: Record<string, unknown>;
    };
  }
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: MODEL,
    input: messages,
    store: false,
    stream: options.stream ?? false,
    max_output_tokens: options.maxOutputTokens ?? options.maxTokens ?? 4096,
  };

  if (options.reasoning && options.reasoning !== "none") {
    body.reasoning = { effort: options.reasoning };
  }

  if (options.textFormat) {
    body.text = { format: options.textFormat };
  }

  return body;
}

/**
 * Parse the output text from an API response (supports both /responses and /chat/completions).
 */
function extractText(data: any): string {
  // 1. OpenAI chat completions format
  if (data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  // 2. BharatCode /responses format
  if (data.output && Array.isArray(data.output)) {
    for (const block of data.output) {
      if (block.type === "message" && block.content && Array.isArray(block.content)) {
        for (const part of block.content) {
          if (part.type === "output_text" && part.text) return part.text;
          if (part.text) return part.text;
        }
      }
    }
  }

  // 3. Simple text field
  if (typeof data.text === "string") return data.text;

  return "";
}

/**
 * Parse token usage from an API response.
 */
function extractUsage(data: APIResponse): TokenUsage {
  if (data.usage) {
    return {
      input_tokens: data.usage.input_tokens ?? 0,
      output_tokens: data.usage.output_tokens ?? 0,
      total_tokens: data.usage.total_tokens ?? 0,
    };
  }
  return { input_tokens: 0, output_tokens: 0, total_tokens: 0 };
}

// ─── Core fetch with retry ───────────────────────────────────────────────────

/**
 * Execute a fetch to the responses endpoint with retry on 503.
 */
async function fetchWithRetry(
  body: Record<string, unknown>
): Promise<Response> {
  const url = `${BASE_URL}/responses`;
  const apiKey = getApiKey();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 503 || attempt === MAX_RETRIES) {
      return response;
    }

    // Exponential back-off: 1s, 2s, 4s
    const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
    console.warn(
      `[bharatcode-client] 503 received, retrying in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
    );
    await sleep(backoff);
  }

  // Should not reach here, but satisfy TS
  throw new Error("Max retries exceeded");
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Format an API error with clean human-readable message if JSON. */
function formatApiError(status: number, rawText: string): string {
  try {
    const parsed = JSON.parse(rawText);
    if (parsed.error?.message) {
      return `BharatCode API (${status}): ${parsed.error.message}`;
    }
  } catch {
    // fallback to raw
  }
  return `BharatCode API error ${status}: ${rawText}`;
}

/**
 * Non-streaming model call.
 *
 * @param params.messages - Conversation messages.
 * @param params.options  - Call options.
 * @returns Parsed model result with text and usage.
 */
export async function callModel(params: {
  messages: Message[];
  options?: CallOptions;
}): Promise<ModelResult> {
  const body = buildBody(params.messages, {
    ...params.options,
    stream: false,
  });
  const response = await fetchWithRetry(body);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(formatApiError(response.status, errorText));
  }

  const data = (await response.json()) as APIResponse;

  const text = extractText(data);
  const usage = extractUsage(data);
  const incomplete = data.status === "incomplete";

  if (incomplete) {
    console.warn(
      "[bharatcode-client] Response status is 'incomplete' — output may be truncated."
    );
  }

  // Track tokens
  addTokens(usage);

  return {
    text,
    parsed: null,
    usage,
    tokensUsed: usage.total_tokens,
    confidence: incomplete ? "low" : "high",
    finishReason: data.status ?? null,
    incomplete,
  };
}

/**
 * Streaming model call. Yields text chunks as they arrive via SSE.
 *
 * @param params.messages - Conversation messages.
 * @param params.options  - Call options (stream is forced to true).
 * @yields Text delta strings.
 * @returns Final token usage after the stream completes.
 */
export async function* callModelStreaming(params: {
  messages: Message[];
  options?: CallOptions;
}): AsyncGenerator<string, TokenUsage, undefined> {
  const body = buildBody(params.messages, {
    ...params.options,
    stream: true,
  });
  const response = await fetchWithRetry(body);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(formatApiError(response.status, errorText));
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No readable stream in response");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalUsage: TokenUsage = {
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process SSE lines
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const jsonStr = trimmed.slice(6); // Remove "data: "
        if (jsonStr === "[DONE]") continue;

        try {
          const event = JSON.parse(jsonStr);

          // Text delta
          if (event.type === "response.output_text.delta" && event.delta) {
            yield event.delta;
          }

          // Final usage
          if (event.type === "response.completed" && event.response?.usage) {
            finalUsage = {
              input_tokens: event.response.usage.input_tokens ?? 0,
              output_tokens: event.response.usage.output_tokens ?? 0,
              total_tokens: event.response.usage.total_tokens ?? 0,
            };
          }

          // Incomplete warning
          if (
            event.type === "response.completed" &&
            event.response?.status === "incomplete"
          ) {
            console.warn(
              "[bharatcode-client] Streaming response incomplete — output may be truncated."
            );
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Track tokens
  addTokens(finalUsage);

  return finalUsage;
}

/**
 * Send an image + text prompt to the model (vision call).
 *
 * @param imageBase64 - Base-64 encoded JPEG/PNG image data (without data URI prefix).
 * @param prompt      - Text instructions for the model.
 * @param options     - Call options.
 */
export async function callModelWithVision(
  imageBase64: string,
  prompt: string,
  options?: CallOptions
): Promise<ModelResult> {
  // Determine MIME type from the first bytes (default to JPEG)
  const mime = imageBase64.startsWith("/9j/")
    ? "image/jpeg"
    : imageBase64.startsWith("iVBOR")
      ? "image/png"
      : "image/jpeg";

  const dataUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:${mime};base64,${imageBase64}`;

  const messages: Message[] = [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: dataUrl } },
      ],
    },
  ];

  return callModel({ messages, options });
}

/**
 * Call the model with structured JSON output.
 *
 * @param prompt     - Text prompt.
 * @param jsonSchema - JSON Schema object the model must conform to.
 * @param options    - Call options.
 */
export async function callModelWithStructuredOutput(
  prompt: string,
  jsonSchema: Record<string, unknown>,
  options?: CallOptions & { schemaName?: string }
): Promise<ModelResult> {
  const body = buildBody(
    [{ role: "user", content: prompt }],
    {
      ...options,
      stream: false,
      textFormat: {
        type: "json_schema",
        name: options?.schemaName ?? "structured_output",
        schema: jsonSchema,
      },
    }
  );

  const response = await fetchWithRetry(body);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(formatApiError(response.status, errorText));
  }

  const data = (await response.json()) as APIResponse;

  const text = extractText(data);
  const usage = extractUsage(data);
  const incomplete = data.status === "incomplete";

  if (incomplete) {
    console.warn(
      "[bharatcode-client] Structured output response incomplete — output may be truncated."
    );
  }

  addTokens(usage);

  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.warn(
      "[bharatcode-client] Structured output response could not be parsed as JSON."
    );
  }

  return {
    text,
    parsed,
    usage,
    tokensUsed: usage.total_tokens,
    confidence: incomplete ? "low" : "high",
    finishReason: data.status ?? null,
    incomplete,
  };
}
