"use client";

import React from "react";

export interface DemoDocItem {
  id: string;
  name: string;
  category: "Tax Notice" | "Rent Agreement" | "Edge Cases";
  highlight: string;
  fileName: string;
  badgeColor: string;
}

const DEMO_DOCS: DemoDocItem[] = [
  {
    id: "it-143-1",
    name: "IT Notice 143(1)",
    category: "Tax Notice",
    highlight: "TDS mismatch demand of ₹12,450",
    fileName: "it-notice-143-1-clean.html",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    id: "it-new-act",
    name: "IT Notice 2025 Act",
    category: "Tax Notice",
    highlight: "Section 221(1) under new 2025 Act (mapped from 143(1))",
    fileName: "it-notice-new-section.html",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    id: "it-large-demand",
    name: "IT High-Stakes Demand",
    category: "Tax Notice",
    highlight: "₹3.45L demand + prosecution warning",
    fileName: "it-notice-large-demand.html",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  {
    id: "it-hindi",
    name: "Hindi Bilingual Notice",
    category: "Tax Notice",
    highlight: "Bilingual section 142(1) inquiry in Hindi & English",
    fileName: "it-notice-hindi-bilingual.html",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    id: "rent-clean",
    name: "Standard Rent Agreement",
    category: "Rent Agreement",
    highlight: "Clean 11-month lease, 3m lock-in, 2m notice",
    fileName: "rent-11-month-clean.html",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    id: "rent-lockin",
    name: "Lock-in Trap Agreement",
    category: "Rent Agreement",
    highlight: "6-month lock-in vs only 1-month notice period",
    fileName: "rent-lockin-trap.html",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  {
    id: "rent-forfeiture",
    name: "Deposit Forfeiture Clause",
    category: "Rent Agreement",
    highlight: "Aggressive total deposit forfeiture on minor marks",
    fileName: "rent-forfeiture.html",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  {
    id: "rent-12m",
    name: "12-Month Lease Deed",
    category: "Rent Agreement",
    highlight: "12-month tenure requiring statutory registration",
    fileName: "rent-12-month.html",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  {
    id: "rent-high-esc",
    name: "High Escalation Rate",
    category: "Rent Agreement",
    highlight: "15% annual rent jump + 10 months deposit",
    fileName: "rent-high-escalation.html",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  },
  {
    id: "blurry",
    name: "Blurry / Skewed Photo",
    category: "Edge Cases",
    highlight: "Tests vision robustness and confidence fallback",
    fileName: "blurry-photo.html",
    badgeColor: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
  {
    id: "unrelated",
    name: "Electricity Bill",
    category: "Edge Cases",
    highlight: "Utility bill to test unsupported doc rejection",
    fileName: "unrelated-doc.html",
    badgeColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
];

interface DemoDocPickerProps {
  onSelectDoc: (doc: DemoDocItem) => void;
  selectedDocId?: string | null;
  disabled?: boolean;
}

export function DemoDocPicker({ onSelectDoc, selectedDocId, disabled }: DemoDocPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          One-Click Demo Documents (Try Without Uploading)
        </span>
        <span className="text-[11px] text-gray-500">100% Synthetic • No Real Data</span>
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
              className={`p-2.5 rounded-xl border text-left transition-all group ${
                isSelected
                  ? "bg-indigo-950/70 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/50"
                  : "bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900/90"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-xs text-gray-200 group-hover:text-white truncate">
                  {doc.name}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${doc.badgeColor}`}>
                  {doc.category}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 line-clamp-1 leading-snug">
                {doc.highlight}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}