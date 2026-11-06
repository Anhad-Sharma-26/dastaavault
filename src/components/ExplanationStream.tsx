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
    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h3 className="text-base font-bold text-white">Plain-Language Breakdown</h3>
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
              Streaming
            </span>
          )}
        </div>

        {text && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <span className="text-emerald-400">✓</span> Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>

      <div className="prose prose-invert prose-sm max-w-none text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {text}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-1 align-middle"></span>
        )}
      </div>
    </div>
  );
}