/**
 * @file /api/analyze — Main analysis endpoint for DastaaVault.
 *
 * Accepts an image (base64) and a language preference, then runs a
 * multi-step pipeline:
 *   1. Transcribe (vision model)
 *   2. Mask PII (regex-based)
 *   3. Classify document type
 *   4. Extract structured data
 *   5. Verify with code-based checks
 *   6. Stream a plain-language explanation
 *
 * Results are returned as Server-Sent Events (SSE) so the client can
 * render each step progressively.
 */

import {
  callModelWithVision,
  callModelWithStructuredOutput,
  callModelStreaming,
} from "@/lib/bharatcode-client";
import { maskAll } from "@/lib/pii-masker";
import {
  classificationJsonSchema,
  itNoticeJsonSchema,
  rentAgreementJsonSchema,
} from "@/lib/schemas";
import {
  getTranscriptionPrompt,
  getClassificationPrompt,
  getExtractionPrompt,
  getExplanationPrompt,
} from "@/lib/prompts";
import { verifyITNotice, verifyRentAgreement } from "@/lib/verification";
import { getSectionMappingForPrompt } from "@/lib/section-mapping";
import { addTokens, isAtLimit } from "@/lib/token-tracker";
import { DEMO_SIMULATIONS, type SimulatedDocResult } from "@/lib/demo-simulator";
import type { Language, AnalysisRequest } from "@/lib/types";

// ---------------------------------------------------------------------------
// In-memory rate limiter (per-IP, 15 requests / 5 min window)
// ---------------------------------------------------------------------------

/** Rate-limit state for a single IP address. */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/** Maximum requests allowed in a single window. */
const RATE_LIMIT = 15;

/** Window duration in milliseconds (5 minutes). */
const WINDOW_MS = 5 * 60 * 1000;

/** Prune expired IP entries from memory to prevent unbounded map growth. */
function cleanupExpiredRateLimits(now: number): void {
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

/**
 * Check (and increment) the rate-limit counter for `ip`.
 * Returns `true` if the request is allowed, `false` if the limit is exceeded.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Prune expired entries periodically to prevent memory leaks
  if (rateLimitMap.size > 200) {
    cleanupExpiredRateLimits(now);
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve client IP with priority to platform-verified headers. */
function getClientIp(request: Request): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "127.0.0.1";
}

/**
 * Encode a single SSE frame.
 *
 * @param event - The SSE event name (e.g. "step", "transcription").
 * @param data  - Payload object, serialised to JSON.
 */
function sseEncode(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // 1. Rate-limit check ------------------------------------------------
  const ip = getClientIp(request);

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again in a few minutes." }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  // 2. Parse and validate request body ---------------------------------
  let body: AnalysisRequest;

  try {
    body = (await request.json()) as AnalysisRequest;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { imageBase64, language = "en", demoId } = body;

  if (demoId && !DEMO_SIMULATIONS[demoId]) {
    return new Response(
      JSON.stringify({ error: `Unknown demo document ID "${demoId}".` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!demoId && (!imageBase64 || typeof imageBase64 !== "string")) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid `imageBase64` field." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // 3. Create SSE stream -----------------------------------------------
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const safeClose = () => {
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch {
            // Controller was already closed or client aborted connection
          }
        }
      };

      /** Convenience: enqueue a single SSE frame safely. */
      const emit = (event: string, data: Record<string, unknown>) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(sseEncode(event, data)));
        } catch {
          isClosed = true;
        }
      };

      /** Emit a progress step indicator. */
      const emitStep = (step: string, progress: number) => {
        emit("step", { step, progress });
      };

      /** Total tokens consumed across all model calls in this request. */
      let totalTokensUsed = 0;

      try {
        // If a synthetic demo document is selected, stream its verified grounded simulation
        if (body.demoId && DEMO_SIMULATIONS[body.demoId]) {
          const sim = DEMO_SIMULATIONS[body.demoId];
          const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

          emitStep("transcribing", 1);
          await sleep(350);
          emit("transcription", { text: sim.transcription, confidence: "high" });

          emitStep("masking", 2);
          await sleep(200);

          emitStep("classifying", 3);
          await sleep(300);
          emit("classification", { doc_type: sim.doc_type, confidence: 0.98 });

          if (sim.doc_type === "unsupported") {
            emit("error", {
              message:
                "Document identified as an electricity bill. DastaaVault currently specializes in Indian Income Tax Notices and Rent Agreements.",
            });
            safeClose();
            return;
          }

          emitStep("extracting", 4);
          await sleep(400);
          emit("extraction", sim.extracted);

          emitStep("verifying", 4);
          await sleep(300);
          const verification =
            sim.doc_type === "income_tax_notice"
              ? verifyITNotice(sim.extracted as any)
              : verifyRentAgreement(sim.extracted as any);

          emit("verification", {
            flags: verification.flags,
            severity: verification.severity,
          });

          emitStep("explaining", 5);
          await sleep(250);
          const explanationText =
            sim.explanation[language as Language] || sim.explanation.en;
          const words = explanationText.split(" ");
          for (let i = 0; i < words.length; i += 3) {
            const chunk = words.slice(i, i + 3).join(" ") + " ";
            emit("explanation_chunk", { text: chunk });
            await sleep(25);
          }

          emit("done", { total_tokens_used: 1200 });
          safeClose();
          return;
        }

        // ---------------------------------------------------------------
        // Step 1 — Transcribe (live vision model)
        // ---------------------------------------------------------------
        emitStep("transcribing", 1);

        const transcription = await callModelWithVision(
          imageBase64,
          getTranscriptionPrompt(),
          { reasoning: "none", maxTokens: 4096 },
        );

        totalTokensUsed += transcription.tokensUsed ?? 0;

        emit("transcription", {
          text: transcription.text,
          confidence: transcription.confidence ?? "high",
        });

        // ---------------------------------------------------------------
        // Step 2 — Mask PII (local, no model call)
        // ---------------------------------------------------------------
        emitStep("masking", 2);
        const maskedText = maskAll(transcription.text);

        // ---------------------------------------------------------------
        // Step 3 — Classify document type
        // ---------------------------------------------------------------
        emitStep("classifying", 3);

        const classification = await callModelWithStructuredOutput(
          getClassificationPrompt(maskedText),
          classificationJsonSchema,
          { reasoning: "none", maxTokens: 512 },
        );

        totalTokensUsed += classification.tokensUsed ?? 0;

        const docType: string = classification.parsed?.doc_type ?? "unknown";
        const classConfidence: number = classification.parsed?.confidence ?? 0;
        const reason: string = classification.parsed?.reason?.trim() ?? "";

        emit("classification", {
          doc_type: docType,
          confidence: classConfidence,
          reason,
        });

        // Bail out if the document type is not supported.
        if (docType === "unsupported" || docType === "unknown") {
          const detail = reason ? ` (${reason})` : "";
          emit("error", {
            message:
              `Document identified as unsupported${detail}. DastaaVault currently specializes in Indian Income Tax Notices/Intimations (e.g. u/s 143(1), 142(1), 148, 156 with demand/refund determination) and Rent Agreements. Please upload an Income Tax notice or rent deed, or choose from our 13 test presets above.`,
          });
          safeClose();
          return;
        }

        // ---------------------------------------------------------------
        // Step 4 — Extract structured fields
        // ---------------------------------------------------------------
        emitStep("extracting", 4);

        const sectionContext = JSON.stringify(getSectionMappingForPrompt());

        const extractionSchema =
          docType === "income_tax_notice"
            ? itNoticeJsonSchema
            : rentAgreementJsonSchema;

        const extraction = await callModelWithStructuredOutput(
          getExtractionPrompt(maskedText, docType, sectionContext),
          extractionSchema,
          { reasoning: "medium", maxTokens: 4096 },
        );

        totalTokensUsed += extraction.tokensUsed ?? 0;

        emit("extraction", extraction.parsed ?? {});

        // ---------------------------------------------------------------
        // Step 5 — Verify (code-based, no model call)
        // ---------------------------------------------------------------
        emitStep("verifying", 4);

        const verification =
          docType === "income_tax_notice"
            ? verifyITNotice(extraction.parsed)
            : verifyRentAgreement(extraction.parsed);

        emit("verification", {
          flags: verification.flags,
          severity: verification.severity,
        });

        // ---------------------------------------------------------------
        // Step 6 — Explain (streamed)
        // ---------------------------------------------------------------
        emitStep("explaining", 5);

        const explanationPayload = {
          ...(extraction.parsed ?? {}),
          verification: {
            flags: verification.flags,
            severity: verification.severity,
          },
        };

        const explanationStream = callModelStreaming({
          messages: [
            {
              role: "user",
              content: getExplanationPrompt(
                JSON.stringify(explanationPayload),
                language as Language,
                docType,
              ),
            },
          ],
          options: { reasoning: "low", maxOutputTokens: 8192 },
        });

        for await (const chunk of explanationStream) {
          if (typeof chunk === "string" && chunk) {
            emit("explanation_chunk", { text: chunk });
          }
        }

        // ---------------------------------------------------------------
        // Done
        // ---------------------------------------------------------------
        emit("done", { total_tokens_used: totalTokensUsed });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";

        console.error("[/api/analyze] Pipeline error:", err);

        emit("error", { message });
      } finally {
        safeClose();
      }
    },
  });

  // 4. Return SSE response ---------------------------------------------
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
