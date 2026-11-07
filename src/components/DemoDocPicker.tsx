"use client";

import React from "react";

export interface DemoDocItem {
  id: string;
  name: string;
  category: "Tax notice" | "Rent agreement" | "Edge cases";
  highlight: string;
  fileName: string;
}

const DEMO_DOCS: DemoDocItem[] = [
  {
    id: "it-143-1",
    name: "IT notice 143(1)",
    category: "Tax notice",
    highlight: "TDS mismatch demand of ₹12,450",
    fileName: "it-notice-143-1-clean.html",
  },
  {
    id: "it-new-act",
    name: "IT notice 2025 Act",
    category: "Tax notice",
    highlight: "Section 221(1) mapped from 143(1)",
    fileName: "it-notice-new-section.html",
  },
  {
    id: "it-large-demand",
    name: "High demand u/s 156",
    category: "Tax notice",
    highlight: "₹3.45L demand with prosecution risk",
    fileName: "it-notice-large-demand.html",
  },
  {
    id: "it-hindi",
    name: "Bilingual notice 142(1)",
    category: "Tax notice",
    highlight: "Hindi and English inquiry notice",
    fileName: "it-notice-hindi-bilingual.html",
  },
  {
    id: "rent-clean",
    name: "Standard rent agreement",
    category: "Rent agreement",
    highlight: "11-month lease with 3m lock-in, 2m notice",
    fileName: "rent-11-month-clean.html",
  },
  {
    id: "rent-lockin",
    name: "Lock-in trap agreement",
    category: "Rent agreement",
    highlight: "6-month lock-in vs 1-month notice period",
    fileName: "rent-lockin-trap.html",
  },
  {
    id: "rent-forfeiture",
    name: "Deposit forfeiture clause",
    category: "Rent agreement",
    highlight: "Full deposit forfeiture on minor marks",
    fileName: "rent-forfeiture.html",
  },
  {
    id: "rent-12m",
    name: "12-month lease deed",
    category: "Rent agreement",
    highlight: "Requires compulsory registration u/s 17",
    fileName: "rent-12-month.html",
  },
  {
    id: "rent-high-esc",
    name: "High rent escalation",
    category: "Rent agreement",
    highlight: "15% annual increase and 10 months deposit",
    fileName: "rent-high-escalation.html",
  },
  {
    id: "blurry",
    name: "Degraded scan photo",
    category: "Edge cases",
    highlight: "Tests OCR robustness and confidence warning",
    fileName: "blurry-photo.html",
  },
  {
    id: "unrelated",
    name: "Electricity utility bill",
    category: "Edge cases",
    highlight: "Rejection test for non-supported doc",
    fileName: "unrelated-doc.html",
  },
];

interface DemoDocPickerProps {
  onSelectDoc: (doc: DemoDocItem) => void;
  selectedDocId?: string | null;
  disabled?: boolean;
}

export function DemoDocPicker({
  onSelectDoc,
  selectedDocId,
  disabled,
}: DemoDocPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--color-ink)]">
          Sample documents (one-click test)
        </span>
        <span className="text-[var(--color-muted)]">Synthetic test data</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {DEMO_DOCS.map((doc) => {
          const isSelected = selectedDocId === doc.id;
          return (
            <button
              key={doc.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDoc(doc)}
              className={`p-3 rounded-[var(--radius-card)] border text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
                isSelected
                  ? "bg-[var(--color-paper-2)] border-[var(--color-ink)]"
                  : "bg-[var(--color-cotton)] border-[var(--color-rule)] hover:border-[var(--color-rule-2)] hover:bg-[var(--color-paper-2)]"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-xs text-[var(--color-ink)] truncate">
                  {doc.name}
                </span>
                <span className="text-[11px] text-[var(--color-muted)] shrink-0">
                  {doc.category}
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted)] line-clamp-1">
                {doc.highlight}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
