/**
 * @module bharatcode-client
 * @description Server-side API client for the BharatCode model API with automatic
 * multi-provider fallback.
 *
 * Primary: BharatCode OpenAI-compatible API (`qwen-3.8-27b`).
 * Fallback: OpenAI, Groq, OpenRouter, or custom provider when primary encounters
 * quota exhaustion (HTTP 429), subscription requirements (HTTP 402), or downtime (HTTP 503).
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

function getApiKey(): string | null {
  return process.env.BHARATCODE_API_KEY || null;
}

/**
 * Detect and resolve fallback API configuration from environment variables.
 */
export function getFallbackConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: string;
} | null {
  const apiKey =
    process.env.FALLBACK_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) return null;

  let baseUrl = process.env.FALLBACK_BASE_URL;
  let model = process.env.FALLBACK_MODEL;
  let provider = "custom";

  if (!baseUrl) {
    if (process.env.GROQ_API_KEY) {
      baseUrl = "https://api.groq.com/openai/v1";
      model = model || "llama-3.3-70b-versatile";
      provider = "Groq";
    } else if (process.env.OPENROUTER_API_KEY) {
      baseUrl = "https://openrouter.ai/api/v1";
      model = model || "qwen/qwen-2.5-72b-instruct";
      provider = "OpenRouter";
    } else if (process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.FALLBACK_API_KEY) {
      baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai";
      model = model || "gemini-2.0-flash";
      provider = "Google Gemini";
    } else {
      baseUrl = "https://api.openai.com/v1";
      model = model || "gpt-4o-mini";
      provider = "OpenAI";
    }
  }

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    model: model || "gpt-4o-mini",
    provider,
  };
}

/** Check if an HTTP status should trigger the fallback provider. */
function shouldFallback(status: number): boolean {
  return status !== 200;
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
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildBody(
  messages: Message[],
  options: CallOptions & {
    responseFormat?: any;
    textFormat?: {
      type: "json_schema";
      name: string;
      schema: Record<string, unknown>;
    };
  }
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: MODEL,
    messages: messages,
    stream: options.stream ?? false,
    max_tokens: options.maxOutputTokens ?? options.maxTokens ?? 4096,
  };

  if (options.reasoning && options.reasoning !== "none") {
    body.reasoning_effort = options.reasoning;
  }

  if (options.responseFormat) {
    body.response_format = options.responseFormat;
  } else if (options.textFormat) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: options.textFormat.name,
        schema: options.textFormat.schema,
      },
    };
  }

  return body;
}

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

function extractUsage(data: any): TokenUsage {
  if (data.usage) {
    return {
      input_tokens: data.usage.input_tokens ?? data.usage.prompt_tokens ?? 0,
      output_tokens: data.usage.output_tokens ?? data.usage.completion_tokens ?? 0,
      total_tokens: data.usage.total_tokens ?? 0,
    };
  }
  return { input_tokens: 0, output_tokens: 0, total_tokens: 0 };
}

function formatApiError(status: number, rawText: string): string {
  try {
    const parsed = JSON.parse(rawText);
    if (parsed.error?.code === "subscription_required" || parsed.error?.type === "subscription_required") {
      return "BharatCode API requires an active Lite, Pro, or verified student account for custom uploaded files. To test the full analysis pipeline right now for free, choose any of our interactive sample presets!";
    }
    if (parsed.error?.message) {
      return `BharatCode API (${status}): ${parsed.error.message}`;
    }
  } catch {
    // fallback
  }
  return `BharatCode API error ${status}: ${rawText}`;
}

// ─── Core fetch with retry ───────────────────────────────────────────────────

async function fetchWithRetry(body: Record<string, unknown>): Promise<Response> {
  const url = `${BASE_URL}/chat/completions`;
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("BHARATCODE_API_KEY is not set.");
  }

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

    const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
    console.warn(
      `[bharatcode-client] 503 received, retrying in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
    );
    await sleep(backoff);
  }

  throw new Error("Max retries exceeded");
}

// ─── Fallback Engine ──────────────────────────────────────────────────────────

async function callFallbackModel(
  messages: Message[],
  options?: CallOptions & { responseFormat?: any }
): Promise<ModelResult> {
  const config = getFallbackConfig();
  if (!config) {
    throw new Error("No fallback API key configured.");
  }

  console.log(`[bharatcode-client] Routing call to fallback provider: ${config.provider} (${config.model})`);

  const url = `${config.baseUrl}/chat/completions`;
  const body: Record<string, any> = {
    model: config.model,
    messages,
    max_tokens: options?.maxOutputTokens ?? options?.maxTokens ?? 4096,
  };

  if (options?.responseFormat) {
    body.response_format = options.responseFormat;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Fallback API (${config.provider} ${res.status}): ${errText}`);
  }

  const json = await res.json();
  const text = extractText(json);
  const usage = extractUsage(json);

  addTokens(usage);

  return {
    text,
    parsed: null,
    usage,
    tokensUsed: usage.total_tokens,
    confidence: "high",
    finishReason: json.choices?.[0]?.finish_reason ?? null,
    incomplete: false,
  };
}

async function* callFallbackStreaming(
  messages: Message[],
  options?: CallOptions
): AsyncGenerator<string, TokenUsage, undefined> {
  const config = getFallbackConfig();
  if (!config) {
    throw new Error("No fallback API key configured.");
  }

  console.log(`[bharatcode-client] Streaming via fallback provider: ${config.provider} (${config.model})`);

  const url = `${config.baseUrl}/chat/completions`;
  const body = {
    model: config.model,
    messages,
    stream: true,
    max_tokens: options?.maxOutputTokens ?? options?.maxTokens ?? 4096,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Fallback streaming error (${config.provider} ${res.status}): ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No readable stream in fallback response");

  const decoder = new TextDecoder();
  let buffer = "";
  let finalUsage: TokenUsage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const dataStr = trimmed.slice(6);
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) {
            yield chunk;
          }
          if (parsed.usage) {
            finalUsage = {
              input_tokens: parsed.usage.prompt_tokens ?? 0,
              output_tokens: parsed.usage.completion_tokens ?? 0,
              total_tokens: parsed.usage.total_tokens ?? 0,
            };
          }
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  addTokens(finalUsage);
  return finalUsage;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function callModel(params: {
  messages: Message[];
  options?: CallOptions;
}): Promise<ModelResult> {
  const fallbackAvailable = Boolean(getFallbackConfig());

  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      if (fallbackAvailable) {
        return await callFallbackModel(params.messages, params.options);
      }
      throw new Error("BHARATCODE_API_KEY is not set.");
    }

    const body = buildBody(params.messages, {
      ...params.options,
      stream: false,
    });
    const response = await fetchWithRetry(body);

    if (!response.ok) {
      const errorText = await response.text();
      if (shouldFallback(response.status) && fallbackAvailable) {
        console.warn(`[bharatcode-client] Primary API returned ${response.status}. Falling back to configured fallback model...`);
        return await callFallbackModel(params.messages, params.options);
      }
      throw new Error(formatApiError(response.status, errorText));
    }

    const data = (await response.json()) as APIResponse;
    const text = extractText(data);
    const usage = extractUsage(data);
    const incomplete = data.status === "incomplete";

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
  } catch (err: unknown) {
    if (fallbackAvailable) {
      console.warn(`[bharatcode-client] Primary API error: ${(err as Error).message}. Attempting fallback provider...`);
      return await callFallbackModel(params.messages, params.options);
    }
    throw err;
  }
}

export async function* callModelStreaming(params: {
  messages: Message[];
  options?: CallOptions;
}): AsyncGenerator<string, TokenUsage, undefined> {
  const fallbackAvailable = Boolean(getFallbackConfig());

  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      if (fallbackAvailable) {
        yield* callFallbackStreaming(params.messages, params.options);
        return { input_tokens: 0, output_tokens: 0, total_tokens: 0 };
      }
      throw new Error("BHARATCODE_API_KEY is not set.");
    }

    const body = buildBody(params.messages, {
      ...params.options,
      stream: true,
    });
    const response = await fetchWithRetry(body);

    if (!response.ok) {
      const errorText = await response.text();
      if (shouldFallback(response.status) && fallbackAvailable) {
        console.warn(`[bharatcode-client] Primary streaming API returned ${response.status}. Falling back...`);
        yield* callFallbackStreaming(params.messages, params.options);
        return { input_tokens: 0, output_tokens: 0, total_tokens: 0 };
      }
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
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const jsonStr = trimmed.slice(6);
          if (jsonStr === "[DONE]") continue;

          try {
            const event = JSON.parse(jsonStr);

            const content =
              event.choices?.[0]?.delta?.content ??
              (event.type === "response.output_text.delta" ? event.delta : null) ??
              event.delta;

            if (content) {
              yield content;
            }

            const usage =
              event.usage ??
              (event.type === "response.completed" ? event.response?.usage : null);

            if (usage) {
              finalUsage = {
                input_tokens: usage.input_tokens ?? usage.prompt_tokens ?? 0,
                output_tokens: usage.output_tokens ?? usage.completion_tokens ?? 0,
                total_tokens: usage.total_tokens ?? 0,
              };
            }
          } catch {
            // skip
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    addTokens(finalUsage);
    return finalUsage;
  } catch (err: unknown) {
    if (fallbackAvailable) {
      console.warn(`[bharatcode-client] Primary streaming failed: ${(err as Error).message}. Attempting fallback provider...`);
      yield* callFallbackStreaming(params.messages, params.options);
      return { input_tokens: 0, output_tokens: 0, total_tokens: 0 };
    }
    throw err;
  }
}

export async function callModelWithVision(
  imageBase64: string,
  prompt: string,
  options?: CallOptions
): Promise<ModelResult> {
  if (!imageBase64 || typeof imageBase64 !== "string") {
    throw new Error("Missing or invalid imageBase64 payload for vision model call.");
  }

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

export async function callModelWithStructuredOutput(
  prompt: string,
  jsonSchema: Record<string, unknown>,
  options?: CallOptions & { schemaName?: string }
): Promise<ModelResult> {
  const fallbackAvailable = Boolean(getFallbackConfig());

  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      if (fallbackAvailable) {
        return await callFallbackStructured(prompt, jsonSchema, options);
      }
      throw new Error("BHARATCODE_API_KEY is not set.");
    }

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
      if (shouldFallback(response.status) && fallbackAvailable) {
        console.warn(`[bharatcode-client] Primary API returned ${response.status}. Attempting structured fallback...`);
        return await callFallbackStructured(prompt, jsonSchema, options);
      }
      throw new Error(formatApiError(response.status, errorText));
    }

    const data = (await response.json()) as APIResponse;
    const text = extractText(data);
    const usage = extractUsage(data);
    const incomplete = data.status === "incomplete";

    addTokens(usage);

    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn("[bharatcode-client] Structured output response could not be parsed as JSON.");
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
  } catch (err: unknown) {
    if (fallbackAvailable) {
      console.warn(`[bharatcode-client] Primary structured call failed: ${(err as Error).message}. Attempting fallback...`);
      return await callFallbackStructured(prompt, jsonSchema, options);
    }
    throw err;
  }
}

async function callFallbackStructured(
  prompt: string,
  jsonSchema: Record<string, unknown>,
  options?: CallOptions & { schemaName?: string }
): Promise<ModelResult> {
  const promptWithSchema = `${prompt}\n\nYou MUST respond with ONLY a valid JSON object strictly conforming to this JSON schema:\n${JSON.stringify(jsonSchema, null, 2)}\n\nDo not include backticks, markdown fences, or commentary. Output pure JSON.`;

  const result = await callFallbackModel(
    [{ role: "user", content: promptWithSchema }],
    {
      ...options,
      responseFormat: { type: "json_object" },
    }
  );

  let parsed: any = null;
  try {
    const cleaned = result.text.replace(/```(?:json)?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.warn("[bharatcode-client] Fallback structured output could not be parsed as JSON.");
  }

  return {
    ...result,
    parsed,
  };
}
