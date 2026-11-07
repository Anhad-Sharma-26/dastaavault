"use client";

import React, { useState } from "react";

interface ExplanationStreamProps {
  text: string;
  isStreaming: boolean;
}

export function ExplanationStream({ text, isStreaming }: ExplanationStreamProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!text && !isStreaming) return null;

  return (
    <div className="bg-[var(--color-cotton)] border border-[var(--color-rule)] rounded-[var(--radius-card)] p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-[var(--color-ink)]">
            Document explanation
          </h3>
          {isStreaming && (
            <span className="text-[11px] font-mono text-[var(--color-accent-2)]">
              Streaming…
            </span>
          )}
        </div>

        {text && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs px-2.5 py-1 rounded-[var(--radius-input)] bg-[var(--color-paper-2)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink-2)] transition-colors cursor-pointer border border-[var(--color-rule)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          >
            {copied ? "Copied" : "Copy text"}
          </button>
        )}
      </div>

      <div className="prose prose-sm max-w-none text-[var(--color-ink)] text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {text}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 bg-[var(--color-accent-2)] ml-0.5 align-middle"></span>
        )}
      </div>
    </div>
  );
}
