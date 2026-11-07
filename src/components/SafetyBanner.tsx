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
  return (
    <div className="space-y-3">
      {criticalSeverity && (
        <div className="p-4 rounded-[var(--radius-card)] border border-[var(--color-error)] bg-[color-mix(in_oklab,var(--color-error)_8%,var(--color-paper))] text-[var(--color-ink)]">
          <h4 className="font-semibold text-sm text-[var(--color-error)]">
            High-stakes legal or demand notice
          </h4>
          <p className="text-xs text-[var(--color-ink-2)] mt-1">
            This notice specifies high financial demands or mentions prosecution
            proceedings. Consult a practicing Chartered Accountant or tax advocate.
          </p>
          {highStakesFlags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {highStakesFlags.map((flag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded-[var(--radius-input)] bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink-2)]"
                >
                  {flag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-3.5 rounded-[var(--radius-card)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-xs text-[var(--color-muted)] flex flex-wrap items-center justify-between gap-2">
        <span>
          Personal details (PAN, Aadhaar, contact details) are redacted client-side before processing. Nothing is stored on any server.
        </span>
        <span className="text-[var(--color-ink-2)]">
          DPDP privacy principles
        </span>
      </div>
    </div>
  );
}
