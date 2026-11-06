/**
 * @module types
 * @description Shared TypeScript types and interfaces for DastaaVault.
 */

/** Supported UI / explanation languages. */
export type Language = "en" | "hi" | "hinglish";

/** Recognised document categories. */
export type DocType = "income_tax_notice" | "rent_agreement" | "unsupported";

/** Risk severity levels (descending). */
export type Severity = "critical" | "high" | "medium" | "low";

/** Extraction confidence band. */
export type Confidence = "high" | "medium" | "low";

/** Payload sent from the client to start an analysis. */
export interface AnalysisRequest {
  /** Base-64 encoded image (JPEG / PNG). */
  imageBase64: string;
  /** Preferred explanation language. */
  language: Language;
}

/** Server-sent event for pipeline progress. */
export interface StepEvent {
  step:
    | "transcribing"
    | "classifying"
    | "extracting"
    | "verifying"
    | "explaining";
  /** 1-based step number (1–5). */
  progress: number;
}

/** Result of the OCR / transcription step. */
export interface TranscriptionResult {
  /** Raw transcribed text. */
  text: string;
  /** Model-reported confidence. */
  confidence: Confidence;
}

/** A single verification flag (used for both doc types). */
export interface Flag {
  flag_id: string;
  severity: "warning" | "info";
  title: string;
  detail: string;
}

/** Aggregated verification output. */
export interface VerificationResult {
  flags: Flag[];
  severity: Severity;
}

/** Token-level usage stats returned by the model API. */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}
