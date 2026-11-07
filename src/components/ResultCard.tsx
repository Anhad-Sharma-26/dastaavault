"use client";

import React from "react";
import type { Flag, Severity, Confidence } from "@/lib/types";

interface ResultCardProps {
  docType: string;
  data: Record<string, any>;
  flags: Flag[];
  severity: Severity;
}

export function ResultCard({ docType, data, flags, severity }: ResultCardProps) {
  const isTax = docType === "income_tax_notice";
  const isRent = docType === "rent_agreement";

  const getSeverityStyle = (sev: Severity) => {
    switch (sev) {
      case "critical":
        return "bg-[color-mix(in_oklab,var(--color-error)_10%,var(--color-paper))] text-[var(--color-error)] border-[var(--color-error)]";
      case "high":
        return "bg-[color-mix(in_oklab,var(--color-accent-2)_10%,var(--color-paper))] text-[var(--color-accent-2)] border-[var(--color-accent-2)]";
      case "medium":
        return "bg-[var(--color-paper-2)] text-[var(--color-ink-2)] border-[var(--color-rule-2)]";
      default:
        return "bg-[var(--color-paper-2)] text-[var(--color-muted)] border-[var(--color-rule)]";
    }
  };

  return (
    <div className="bg-[var(--color-cotton)] border border-[var(--color-rule)] rounded-[var(--radius-card)] p-5 space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--color-rule)]">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-ink)]">
            {isTax
              ? data.notice_type_name || "Income tax notice"
              : isRent
              ? "Residential rent agreement"
              : "Extracted document data"}
          </h3>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            {isTax && data.assessment_year ? `Assessment year: ${data.assessment_year}` : ""}
            {isRent && data.property_address ? `Property: ${data.property_address}` : ""}
          </p>
        </div>

        <span
          className={`text-xs px-2.5 py-0.5 rounded-[var(--radius-pill)] border font-medium ${getSeverityStyle(
            severity
          )}`}
        >
          {severity} severity
        </span>
      </div>

      {/* Tax Notice Section Cross-Mapping */}
      {isTax && (
        <div className="p-3.5 rounded-[var(--radius-input)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-xs space-y-1">
          <div className="text-[var(--color-muted)] font-medium">
            Section cross-mapping (1961 Act ↔ 2025 Act)
          </div>
          <div className="text-[var(--color-ink)]">
            Printed on notice: <span className="font-mono font-semibold">u/s {data.notice_section_printed || "N/A"}</span>
            {data.notice_section_mapped && (
              <>
                {" "} ➔ Corresponding section: <span className="font-mono font-semibold">u/s {data.notice_section_mapped}</span>
              </>
            )}
            {data.act_version && (
              <span className="text-[var(--color-muted)] ml-2">
                ({data.act_version} Act)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Core Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isTax ? (
          <>
            <div className="p-3 rounded-[var(--radius-input)] bg-[var(--color-paper)] border border-[var(--color-rule)]">
              <span className="text-xs text-[var(--color-muted)] block">Demand amount</span>
              <span className={`text-base font-semibold font-mono tabular-nums ${data.demand_amount ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]"}`}>
                {data.demand_amount ? `₹${Number(data.demand_amount).toLocaleString("en-IN")}` : "Nil"}
              </span>
            </div>

            <div className="p-3 rounded-[var(--radius-input)] bg-[var(--color-paper)] border border-[var(--color-rule)]">
              <span className="text-xs text-[var(--color-muted)] block">Response deadline</span>
              <span className="text-xs font-mono font-medium text-[var(--color-ink)] block mt-1">
                {data.response_deadline || "Not stated"}
              </span>
            </div>

            <div className="p-3 rounded-[var(--radius-input)] bg-[var(--color-paper)] border border-[var(--color-rule)]">
              <span className="text-xs text-[var(--color-muted)] block">Days remaining</span>
              <span
                className={`text-base font-semibold font-mono tabular-nums ${
                  data.days_remaining !== null && data.days_remaining <= 5
                    ? "text-[var(--color-error)]"
                    : "text-[var(--color-ink)]"
                }`}
              >
                {data.days_remaining !== null ? `${data.days_remaining} days` : "Check notice"}
              </span>
            </div>

            <div className="p-3 rounded-[var(--radius-input)] bg-[var(--color-paper)] border border-[var(--color-rule)]">
              <span className="text-xs text-[var(--color-muted)] block">Masked PAN</span>
              <span className="text-xs font-mono font-medium text-[var(--color-ink)] block mt-1">
                {data.pan_masked || "Redacted"}
              </span>
            </div>
          </>
        ) : isRent ? (
          <>
            <div className="p-3 rounded-[var(--radius-input)] bg-[var(--color-paper)] border border-[var(--color-rule)]">
              <span className="text-xs text-[var(--color-muted)] block">Monthly rent</span>
              <span className="text-base font-semibold font-mono tabular-nums text-[var(--color-ink)]">
                {data.monthly_rent ? `₹${Number(data.monthly_rent).toLocaleString("en-IN")}` : "N/A"}
              </span>
            </div>

            <div className="p-3 rounded-[var(--radius-input)] bg-[var(--color-paper)] border border-[var(--color-rule)]">
              <span className="text-xs text-[var(--color-muted)] block">Security deposit</span>
              <span className="text-base font-semibold font-mono tabular-nums text-[var(--color-ink)]">
                {data.security_deposit ? `₹${Number(data.security_deposit).toLocaleString("en-IN")}` : "N/A"}
              </span>
            </div>

            <div className="p-3 rounded-[var(--radius-input)] bg-[var(--color-paper)] border border-[var(--color-rule)]">
              <span className="text-xs text-[var(--color-muted)] block">Lock-in / notice</span>
              <span className="text-xs font-mono font-medium text-[var(--color-ink)] block mt-1">
                {data.lock_in_months ? `${data.lock_in_months}m lock-in` : "None"} /{" "}
                {data.notice_period_months ? `${data.notice_period_months}m notice` : "None"}
              </span>
            </div>

            <div className="p-3 rounded-[var(--radius-input)] bg-[var(--color-paper)] border border-[var(--color-rule)]">
              <span className="text-xs text-[var(--color-muted)] block">Annual escalation</span>
              <span className="text-base font-semibold font-mono tabular-nums text-[var(--color-ink)]">
                {data.escalation_pct ? `${data.escalation_pct}%` : "None specified"}
              </span>
            </div>
          </>
        ) : null}
      </div>

      {/* Flags Section */}
      {flags.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-[var(--color-ink-2)] block">
            Statutory and risk flags ({flags.length})
          </span>
          <div className="space-y-2">
            {flags.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] text-xs"
              >
                <div className="font-semibold text-[var(--color-ink)]">
                  {item.title}
                </div>
                <p className="mt-0.5 text-[var(--color-muted)] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence footer */}
      <div className="pt-2 border-t border-[var(--color-rule)] flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>Extraction confidence: {data.extraction_confidence || "standard"}</span>
        {data.uncertain_fields && data.uncertain_fields.length > 0 && (
          <span className="text-[var(--color-accent-2)]">
            Verify: {data.uncertain_fields.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
