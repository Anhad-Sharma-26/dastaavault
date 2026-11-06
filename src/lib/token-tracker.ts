/**
 * @module token-tracker
 * @description Simple in-memory daily token counter.
 *
 * Tracks cumulative input + output tokens for the current calendar
 * day (IST) and exposes limit-check helpers so the API route can
 * short-circuit before burning tokens.
 */

import type { TokenUsage } from "@/lib/types";

/** Daily token limit (configurable via env, defaults to 10 M). */
const DAILY_LIMIT = Number(process.env.DAILY_TOKEN_LIMIT) || 10_000_000;

/** Warn threshold: 80 % of the daily limit. */
const WARN_PCT = 0.8;

/** Hard-stop threshold: 95 % of the daily limit. */
const STOP_PCT = 0.95;

/** Internal accumulator. */
let state = {
  date: todayIST(),
  input_tokens: 0,
  output_tokens: 0,
  total_tokens: 0,
};

/** Return today's date string in IST (Asia/Kolkata). */
function todayIST(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

/** Reset the counter if the date has rolled over. */
function maybeReset(): void {
  const today = todayIST();
  if (state.date !== today) {
    state = { date: today, input_tokens: 0, output_tokens: 0, total_tokens: 0 };
  }
}

/**
 * Record token usage from a model call.
 *
 * @param usage - The `usage` object from the API response.
 */
export function addTokens(usage: TokenUsage): void {
  maybeReset();
  state.input_tokens += usage.input_tokens;
  state.output_tokens += usage.output_tokens;
  state.total_tokens += usage.total_tokens;
}

/** Snapshot of the current day's usage. */
export interface UsageSnapshot {
  /** Tokens consumed so far today. */
  today_total: number;
  /** Configured daily limit. */
  limit: number;
  /** Percentage of the limit consumed (0–100). */
  pct_used: number;
}

/**
 * Get the current day's usage stats.
 */
export function getUsage(): UsageSnapshot {
  maybeReset();
  return {
    today_total: state.total_tokens,
    limit: DAILY_LIMIT,
    pct_used: (state.total_tokens / DAILY_LIMIT) * 100,
  };
}

/**
 * `true` when usage exceeds 80 % of the daily limit.
 */
export function isNearLimit(): boolean {
  maybeReset();
  return state.total_tokens > DAILY_LIMIT * WARN_PCT;
}

/**
 * `true` when usage exceeds 95 % of the daily limit.
 */
export function isAtLimit(): boolean {
  maybeReset();
  return state.total_tokens > DAILY_LIMIT * STOP_PCT;
}
