"use client";

import React, { useState } from "react";

export interface DemoDocItem {
  id: string;
  name: string;
  category: "Tax notice" | "Rent agreement" | "Banking & credit" | "Business & MSME" | "Edge cases";
  tag: string;
  highlight: string;
  fileName: string;
}

export const DEMO_DOCS: DemoDocItem[] = [
  // Income Tax Notices
  {
    id: "it-143-1",
    name: "Intimation u/s 143(1) (Clean)",
    category: "Tax notice",
    tag: "u/s 143(1)",
    highlight: "TDS mismatch demand of ₹12,450 with 30-day response window",
    fileName: "it-notice-143-1-clean.html",
  },
  {
    id: "it-new-act",
    name: "New Act Intimation u/s 221(1)",
    category: "Tax notice",
    tag: "2025 Act",
    highlight: "Section 221(1) issued under new tax law replacing Section 143(1)",
    fileName: "it-notice-new-section.html",
  },
  {
    id: "it-large-demand",
    name: "Demand Notice with Prosecution Threat",
    category: "Tax notice",
    tag: "High Stakes",
    highlight: "₹3.45L demand with Section 276C prosecution warning language",
    fileName: "it-notice-large-demand.html",
  },
  {
    id: "it-hindi",
    name: "Bilingual Inquiry Notice u/s 142(1)",
    category: "Tax notice",
    tag: "Bilingual",
    highlight: "Hindi and English questionnaire requiring bank statements",
    fileName: "it-notice-hindi-bilingual.html",
  },
  {
    id: "it-old-refund",
    name: "1961 Act Refund Intimation",
    category: "Tax notice",
    tag: "Refund",
    highlight: "Assessment Year 2024-25 intimation confirming ₹8,200 direct refund",
    fileName: "it-notice-old-section.html",
  },
  {
    id: "it-148-photo",
    name: "Scanned Reassessment Notice u/s 148",
    category: "Tax notice",
    tag: "u/s 148",
    highlight: "Reassessment notice with skew and official stamp testing OCR",
    fileName: "it-notice-148-photo.html",
  },
  {
    id: "blurry",
    name: "Degraded Mobile Scan Notice",
    category: "Tax notice",
    tag: "Degraded",
    highlight: "Blurry low-contrast photo testing extraction confidence fallback",
    fileName: "blurry-photo.html",
  },

  // Rent Agreements
  {
    id: "rent-clean",
    name: "Standard 11-Month Lease Deed",
    category: "Rent agreement",
    tag: "Clean",
    highlight: "Balanced 11-month tenure with 3m lock-in and 2m notice period",
    fileName: "rent-11-month-clean.html",
  },
  {
    id: "rent-lockin",
    name: "Lock-in Trap Agreement",
    category: "Rent agreement",
    tag: "Trap Flag",
    highlight: "6-month lock-in against 1-month notice period (tenant penalty trap)",
    fileName: "rent-lockin-trap.html",
  },
  {
    id: "rent-forfeiture",
    name: "Security Deposit Forfeiture Deed",
    category: "Rent agreement",
    tag: "Forfeiture",
    highlight: "Total loss of 3-month security deposit upon minor wall wear",
    fileName: "rent-forfeiture.html",
  },
  {
    id: "rent-12m",
    name: "12-Month Unregistered Lease",
    category: "Rent agreement",
    tag: "Unregistered",
    highlight: "12-month tenure requiring compulsory statutory registration u/s 17",
    fileName: "rent-12-month.html",
  },
  {
    id: "rent-high-esc",
    name: "Excessive Escalation Agreement",
    category: "Rent agreement",
    tag: "15% Jump",
    highlight: "15% annual rent jump and 10 months deposit (exceeds typical norms)",
    fileName: "rent-high-escalation.html",
  },

  // Banking & Credit Protection (Wave 1)
  {
    id: "bank-home-loan",
    name: "Home Loan Sanction & KFS",
    category: "Banking & credit",
    tag: "RBI Floating Ban",
    highlight: "Floating rate loan with unlawful 3% foreclosure fee and missing APR in KFS",
    fileName: "banking-home-loan-sanction.html",
  },

  // Business & MSME Defense (Wave 2)
  {
    id: "gst-drc01",
    name: "Form GST DRC-01 (Sec 74)",
    category: "Business & MSME",
    tag: "100% Penalty",
    highlight: "Discrepancy notice with 100% fraud penalty and missing hearing schedule u/s 75(4)",
    fileName: "gst-drc01-notice.html",
  },
  {
    id: "msme-45day",
    name: "MSME Commercial Invoice",
    category: "Business & MSME",
    tag: "45-Day Cap",
    highlight: "90-day credit clause voided by Section 15 with 19.5% penal interest & 43B(h) risk",
    fileName: "msme-overdue-invoice.html",
  },

  // Edge Cases
  {
    id: "unrelated",
    name: "Electricity Utility Bill",
    category: "Edge cases",
    tag: "Unsupported",
    highlight: "Tests safety rejection when an unrelated bill or invoice is provided",
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
  const [activeTab, setActiveTab] = useState<"tax" | "rent" | "banking" | "msme" | "edge">("tax");

  const filteredDocs = DEMO_DOCS.filter((d) => {
    if (activeTab === "tax") return d.category === "Tax notice";
    if (activeTab === "rent") return d.category === "Rent agreement";
    if (activeTab === "banking") return d.category === "Banking & credit";
    if (activeTab === "msme") return d.category === "Business & MSME";
    return d.category === "Edge cases";
  });

  return (
    <div className="space-y-3">
      {/* Segmented Category Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[var(--color-rule)]">
        <div className="flex items-center gap-1 bg-[var(--color-paper-2)] p-1 rounded-[var(--radius-input)] border border-[var(--color-rule)] flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("tax")}
            className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
              activeTab === "tax"
                ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs font-semibold"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            Income tax (7)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rent")}
            className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
              activeTab === "rent"
                ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs font-semibold"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            Rent (5)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("banking")}
            className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
              activeTab === "banking"
                ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs font-semibold"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            Banking &amp; Loans (1)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("msme")}
            className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
              activeTab === "msme"
                ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs font-semibold"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            Business &amp; MSME (2)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("edge")}
            className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
              activeTab === "edge"
                ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs font-semibold"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            Edge cases (1)
          </button>
        </div>

        <span className="text-[11px] font-mono text-[var(--color-muted)] hidden sm:inline">
          Click any preset to inspect instant ground-truth analysis
        </span>
      </div>

      {/* Preset Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredDocs.map((doc) => {
          const isSelected = selectedDocId === doc.id;
          return (
            <button
              key={doc.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDoc(doc)}
              className={`p-3 rounded-[var(--radius-input)] border text-left transition-colors relative focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
                isSelected
                  ? "bg-[var(--color-paper-2)] border-[var(--color-ink)] shadow-xs"
                  : "bg-[var(--color-cotton)] border-[var(--color-rule)] hover:border-[var(--color-rule-2)] hover:bg-[var(--color-paper-2)]"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-xs text-[var(--color-ink)] truncate">
                  {doc.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-ink-2)] shrink-0">
                  {doc.tag}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-muted)] line-clamp-2 leading-relaxed">
                {doc.highlight}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
