"use client";

import React, { useState } from "react";

interface ExplanationStreamProps {
  text: string;
  isStreaming: boolean;
}

export function ExplanationStream({ text, isStreaming }: ExplanationStreamProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!text && !isStreaming) return null;

  return (
    <div className="stationery-sheet p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--color-ink)]">
              What this means for you
            </h3>
            {isStreaming && (
              <span className="text-[11px] font-mono text-[var(--color-accent-2)]">
                Streaming…
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--color-muted)]">
            Clear explanation of your document in simple everyday language
          </p>
        </div>

        {text && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs px-3 py-1.5 rounded-[var(--radius-input)] bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink-2)] transition-colors cursor-pointer border border-[var(--color-rule)] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] font-mono"
          >
            {copied ? "Copied" : "Copy text"}
          </button>
        )}
      </div>

      <div className="prose prose-sm max-w-none text-[var(--color-ink)] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {text}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 bg-[var(--color-accent-2)] ml-0.5 align-middle animate-pulse"></span>
        )}
      </div>
    </div>
  );
}
