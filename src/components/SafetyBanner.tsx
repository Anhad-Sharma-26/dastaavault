"use client";

import React from "react";

interface SafetyBannerProps {
  criticalSeverity?: boolean;
  highStakesFlags?: string[];
}

export function SafetyBanner({
  criticalSeverity,
  highStakesFlags = [],
}: SafetyBannerProps) {
  if (criticalSeverity || highStakesFlags.length > 0) {
    return (
      <div className="rounded-[var(--radius-input)] bg-[color-mix(in_oklab,var(--color-error)_10%,var(--color-paper))] border border-[var(--color-error)] p-4 text-[var(--color-error)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[color-mix(in_oklab,var(--color-error)_20%,var(--color-paper))] border border-[var(--color-error)]">
                HIGH STAKES
              </span>
              <p className="font-semibold text-sm">
                Formal legal or tax advisor consultation required
              </p>
            </div>
            <p className="text-xs text-[color-mix(in_oklab,var(--color-error)_80%,black)] leading-relaxed">
              This document contains significant liability (demand exceeding ₹1,00,000, prosecution clauses, or aggressive forfeiture). DastaaVault provides automated informational guidance only: do not treat this as legal or tax counsel.
            </p>
          </div>

          <a
            href="https://eportal.incometax.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-[var(--radius-input)] bg-[var(--color-error)] text-[var(--color-paper)] font-medium shrink-0 hover:opacity-90 transition-opacity whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          >
            e-Filing portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-input)] bg-[var(--color-cotton)] border border-[var(--color-rule)] p-2.5 sm:p-3 text-xs text-[var(--color-muted)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-start gap-2">
        <span className="font-mono text-[10px] sm:text-[11px] text-[var(--color-ink-2)] bg-[var(--color-paper-2)] px-1.5 sm:px-2 py-0.5 rounded border border-[var(--color-rule)] shrink-0 mt-0.5">
          PRIVACY SANDBOX
        </span>
        <span className="text-[11px] sm:text-xs leading-relaxed">
          PAN, Aadhaar, and phone numbers are masked locally before inference. No documents are logged or retained.
        </span>
      </div>
      <span className="font-mono text-[10px] sm:text-[11px] text-[var(--color-muted)] shrink-0 self-end sm:self-auto">
        Rate limit: 15 req / 5 min
      </span>
    </div>
  );
}
