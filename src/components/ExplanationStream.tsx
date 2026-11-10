"use client";

import React, { useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

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
    <div className="stationery-sheet p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[var(--color-rule)]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
              What this means for you
            </h3>
            {isStreaming && (
              <span className="text-[10px] sm:text-[11px] font-mono text-[var(--color-accent-2)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-2)] animate-ping"></span>
                Streaming…
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[var(--color-muted)]">
            Clear explanation of your document in simple everyday language
          </p>
        </div>

        {text && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[var(--radius-input)] bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink-2)] transition-colors cursor-pointer border border-[var(--color-rule)] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] font-mono self-start sm:self-auto shrink-0"
          >
            {copied ? "Copied" : "Copy text"}
          </button>
        )}
      </div>

      <div className="text-[var(--color-ink)] font-sans">
        <MarkdownRenderer content={text} />
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 bg-[var(--color-accent-2)] ml-0.5 align-middle animate-pulse"></span>
        )}
      </div>
    </div>
  );
}
