"use client";

import React from "react";
import { DEMO_SIMULATIONS } from "@/lib/demo-simulator";
import type { Language } from "@/lib/types";

interface DocumentViewerProps {
  selectedDemoId?: string | null;
  uploadedImageBase64?: string | null;
  uploadedDocName?: string | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  canAnalyze: boolean;
}

export function DocumentViewer({
  selectedDemoId,
  uploadedImageBase64,
  uploadedDocName,
  language,
  onLanguageChange,
  onAnalyze,
  isAnalyzing,
  canAnalyze,
}: DocumentViewerProps) {
  const sim = selectedDemoId ? DEMO_SIMULATIONS[selectedDemoId] : null;

  return (
    <div className="stationery-sheet p-5 sm:p-6 space-y-5 flex flex-col justify-between min-h-[560px]">
      {/* Document Sheet Header */}
      <div className="space-y-2 pb-4 border-b border-[var(--color-rule)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-2)]"></span>
            <span className="font-mono text-xs font-semibold text-[var(--color-ink)]">
              Document inspection desk
            </span>
          </div>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-muted)]">
            {uploadedImageBase64 && !selectedDemoId
              ? "Custom upload"
              : selectedDemoId
              ? "Synthetic ground truth"
              : "No document loaded"}
          </span>
        </div>

        <p className="text-xs text-[var(--color-muted)]">
          {uploadedDocName
            ? `Active file: ${uploadedDocName}`
            : "Select a sample document above or upload your own notice to review."}
        </p>
      </div>

      {/* Document Body / Live Inspection Sheet */}
      <div className="flex-1 flex flex-col justify-center">
        {selectedDemoId && sim ? (
          <div className="rounded-[var(--radius-input)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] p-4 sm:p-5 font-mono text-xs text-[var(--color-ink)] space-y-3 leading-relaxed shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-rule-2)] text-[11px] text-[var(--color-muted)]">
              <span>CONFIDENTIAL · STATUTORY RECORD</span>
              <span>IST COMPLIANCE</span>
            </div>

            <div className="whitespace-pre-wrap font-mono text-[11px] sm:text-xs text-[var(--color-ink-2)] bg-[var(--color-cotton)] p-3.5 rounded border border-[var(--color-rule)] max-h-[300px] overflow-y-auto">
              {sim.transcription}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--color-muted)] pt-1">
              <div>
                <span className="text-[var(--color-ink)]">Doc classification: </span>
                {sim.doc_type === "income_tax_notice"
                  ? "Income tax notice"
                  : sim.doc_type === "rent_agreement"
                  ? "Rent agreement"
                  : "Edge case / unsupported"}
              </div>
              <div className="text-right">
                <span className="text-[var(--color-ink)]">PII state: </span>
                Redacted before model call
              </div>
            </div>
          </div>
        ) : uploadedImageBase64 ? (
          <div className="rounded-[var(--radius-input)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] p-4 flex flex-col items-center justify-center space-y-2">
            <div className="max-h-[300px] w-full overflow-hidden rounded border border-[var(--color-rule)] bg-[var(--color-cotton)] flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedImageBase64}
                alt="Document preview"
                className="max-h-[280px] max-w-full object-contain"
              />
            </div>
            <span className="text-[11px] text-[var(--color-muted)] font-mono">
              Ready for client-side OCR and verification
            </span>
          </div>
        ) : (
          <div className="border border-dashed border-[var(--color-rule-2)] rounded-[var(--radius-input)] p-8 text-center space-y-2 text-[var(--color-muted)] bg-[var(--color-paper)]">
            <div className="w-10 h-10 rounded-[var(--radius-input)] bg-[var(--color-cotton)] border border-[var(--color-rule)] mx-auto flex items-center justify-center font-mono text-xs font-semibold text-[var(--color-ink)]">
              DV
            </div>
            <p className="font-medium text-xs text-[var(--color-ink)]">
              No document currently staged
            </p>
            <p className="text-[11px]">
              Select any of the 13 sample documents above to test immediately, or drop your own notice or agreement.
            </p>
          </div>
        )}
      </div>

      {/* Action Controls & Language Bar */}
      <div className="pt-4 border-t border-[var(--color-rule)] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-[var(--color-paper-2)] p-1 rounded-[var(--radius-input)] border border-[var(--color-rule)]">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => onLanguageChange("en")}
              className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
                language === "en"
                  ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              English
            </button>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => onLanguageChange("hi")}
              className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
                language === "hi"
                  ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => onLanguageChange("hinglish")}
              className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
                language === "hinglish"
                  ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              Hinglish
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            disabled={!canAnalyze || isAnalyzing}
            onClick={onAnalyze}
            className={`py-2.5 px-5 rounded-[var(--radius-input)] text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-xs focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
              !canAnalyze || isAnalyzing
                ? "bg-[var(--color-paper-3)] text-[var(--color-muted)] cursor-not-allowed"
                : "bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] cursor-pointer"
            }`}
          >
            {isAnalyzing ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      </div>
    </div>
  );
}
