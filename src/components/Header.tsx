"use client";

import React from "react";

export function Header() {
  return (
    <header className="border-b border-[var(--color-rule)] bg-[var(--color-paper)] sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-2.5 sm:py-3.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[var(--radius-input)] bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center font-mono font-semibold text-xs shadow-xs shrink-0">
            DV
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-sm sm:text-base text-[var(--color-ink)] tracking-tight">
                DastaaVault
              </span>
              <span className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-muted)] font-mono shrink-0">
                v1.0
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[var(--color-muted)] truncate max-w-[240px] xs:max-w-xs sm:max-w-none">
              भारतीय दस्तावेज़ समीक्षक: Tax, GST, Banking KFS, MSME, RERA Property &amp; Health Insurance
            </p>
          </div>
        </div>

        {/* Live System Capabilities */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-input)] bg-[var(--color-cotton)] border border-[var(--color-rule)] text-[var(--color-ink-2)] text-[11px] font-mono">
            <span>Zero cloud storage</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-input)] bg-[var(--color-cotton)] border border-[var(--color-rule)] text-[var(--color-ink-2)] text-[11px] font-mono">
            <span>Client PII redacted</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[var(--radius-input)] bg-[var(--color-cotton)] border border-[var(--color-rule)] text-[var(--color-ink-2)] text-[10px] sm:text-[11px] font-mono">
            <span>1961 ↔ 2025 Act</span>
          </div>

          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[var(--radius-pill)] bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] text-[var(--color-muted)] text-[10px] sm:text-[11px] font-mono">
            Not legal advice
          </div>
        </div>
      </div>
    </header>
  );
}
