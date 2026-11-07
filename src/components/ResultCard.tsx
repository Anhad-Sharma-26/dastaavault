"use client";

import React from "react";
import type { Flag, Severity } from "@/lib/types";

interface ResultCardProps {
  docType: string;
  data: Record<string, any>;
  flags: Flag[];
  severity: Severity;
}

export function ResultCard({ docType, data, flags, severity }: ResultCardProps) {
  const isTax = docType === "income_tax_notice";
  const isRent = docType === "rent_agreement";

  const getStampText = () => {
    if (isTax) {
      if (data.refund_amount) {
        return `REFUND APPROVED: ₹${data.refund_amount.toLocaleString("en-IN")}`;
      }
      if (data.demand_amount) {
        if (severity === "critical") {
          return `CRITICAL DEMAND: ₹${data.demand_amount.toLocaleString("en-IN")}`;
        }
        return `TAX DEMAND: ₹${data.demand_amount.toLocaleString("en-IN")}`;
      }
      return "INQUIRY NOTICE";
    }

    if (isRent) {
      if (severity === "critical" || severity === "high") {
        return "HIGH RISK CLAUSE DETECTED";
      }
      return "STANDARD RENT AGREEMENT";
    }

    return "DOCUMENT REVIEWED";
  };

  const getStampColor = () => {
    switch (severity) {
      case "critical":
        return "border-[var(--color-error)] text-[var(--color-error)] bg-[color-mix(in_oklab,var(--color-error)_8%,var(--color-paper))]";
      case "high":
        return "border-[var(--color-accent-2)] text-[var(--color-accent-2)] bg-[color-mix(in_oklab,var(--color-accent-2)_8%,var(--color-paper))]";
      case "medium":
        return "border-[var(--color-ink-2)] text-[var(--color-ink)] bg-[var(--color-paper-2)]";
      default:
        return "border-[var(--color-success)] text-[var(--color-success)] bg-[color-mix(in_oklab,var(--color-success)_8%,var(--color-paper))]";
    }
  };

  return (
    <div className="stationery-sheet p-6 space-y-6">
      {/* Top Bar with Document Name and Status Stamp */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[var(--color-rule)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-muted)]">
              {isTax ? "Income Tax" : isRent ? "Rent Agreement" : "Document"}
            </span>
            {data.pan_masked && (
              <span className="text-xs text-[var(--color-muted)] font-mono">
                PAN: {data.pan_masked}
              </span>
            )}
            {data.din_number && (
              <span className="text-xs text-[var(--color-muted)] font-mono">
                · DIN: {data.din_number}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-ink)] tracking-tight">
            {isTax
              ? data.notice_type_name || "Income Tax Notice"
              : isRent
              ? "Residential Rental Agreement"
              : "Document Analysis"}
          </h2>
          <p className="text-xs text-[var(--color-muted)]">
            {isTax && data.assessment_year ? `Assessment Year ${data.assessment_year}` : ""}
            {isRent && data.property_address ? `Property: ${data.property_address}` : ""}
            {data.issuing_authority ? ` · Authority: ${data.issuing_authority}` : ""}
          </p>
        </div>

        {/* Letterpress Stamp */}
        <div className={`px-3 py-1.5 rounded-[var(--radius-input)] border font-mono font-semibold text-xs tracking-tight shadow-xs ${getStampColor()}`}>
          {getStampText()}
        </div>
      </div>

      {/* Statutory Section Concordance Card (1961 Act ↔ 2025 Act) */}
      {isTax && data.notice_section_printed && (
        <div className="letterpress-card p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-muted)] pb-1 border-b border-[var(--color-rule)]">
            <span>Notice section breakdown (Old vs New Law)</span>
            <span>Official ICAI mapping</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Section printed on your notice:</span>
              <p className="font-mono font-semibold text-sm text-[var(--color-ink)]">
                u/s {data.notice_section_printed} (1961 Act)
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Equivalent section in new 2025 Act:</span>
              <p className="font-mono font-semibold text-sm text-[var(--color-accent-2)]">
                u/s {data.notice_section_mapped || "N/A"} (2025 Act)
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-muted)] leading-relaxed pt-1">
            India introduced the new Income Tax Act 2025 on 1 April 2026, renumbering sections. DastaaVault maps both old and new numbers so you know exactly which section applies to your notice.
          </p>
        </div>
      )}

      {/* 4-Metric Key Figures Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Financial Outcome */}
        <div className="letterpress-card p-3 space-y-1">
          <span className="text-[11px] text-[var(--color-muted)] font-mono">
            {isTax ? (data.refund_amount ? "Refund amount" : "Tax amount due") : "Monthly rent"}
          </span>
          <p className="font-mono font-semibold text-base sm:text-lg text-[var(--color-ink)]">
            {isTax ? (
              data.refund_amount ? (
                `₹${data.refund_amount.toLocaleString("en-IN")}`
              ) : data.demand_amount ? (
                `₹${data.demand_amount.toLocaleString("en-IN")}`
              ) : (
                "₹0 (Nil)"
              )
            ) : isRent ? (
              data.rent_amount ? `₹${data.rent_amount.toLocaleString("en-IN")}` : "Not stated"
            ) : (
              "Nil"
            )}
          </p>
          <span className="text-[10px] text-[var(--color-muted)] block truncate">
            {isTax
              ? data.refund_amount
                ? "Will be refunded to bank"
                : data.demand_amount
                ? "Payable before deadline"
                : "No tax payable"
              : isRent && data.deposit_amount
              ? `Security deposit: ₹${data.deposit_amount.toLocaleString("en-IN")}`
              : "Check terms"}
          </span>
        </div>

        {/* Metric 2: Deadline */}
        <div className="letterpress-card p-3 space-y-1">
          <span className="text-[11px] text-[var(--color-muted)] font-mono">
            {isTax ? "Last date to respond" : "Notice period"}
          </span>
          <p className="font-mono font-semibold text-base sm:text-lg text-[var(--color-ink)]">
            {isTax ? (
              data.response_deadline || "As per notice"
            ) : isRent ? (
              data.notice_period_months ? `${data.notice_period_months} months` : "Not stated"
            ) : (
              "N/A"
            )}
          </p>
          <span className="text-[10px] text-[var(--color-muted)] block truncate">
            {isTax && data.days_remaining !== undefined && data.days_remaining !== null
              ? `${data.days_remaining} days left in IST`
              : isRent && data.lock_in_months
              ? `Lock-in: ${data.lock_in_months} months`
              : "Check notice date"}
          </span>
        </div>

        {/* Metric 3: Authentication / Authority */}
        <div className="letterpress-card p-3 space-y-1">
          <span className="text-[11px] text-[var(--color-muted)] font-mono">
            {isTax ? "Issuing office" : "Tenure"}
          </span>
          <p className="font-mono font-semibold text-sm sm:text-base text-[var(--color-ink)] truncate">
            {isTax ? (
              data.issuing_authority || "Income Tax Department"
            ) : isRent ? (
              data.lease_duration_months ? `${data.lease_duration_months} months` : "Not stated"
            ) : (
              "Verified"
            )}
          </p>
          <span className="text-[10px] text-[var(--color-muted)] block truncate">
            {isTax && data.din_number
              ? "Official DIN verified"
              : isRent && data.lease_duration_months && data.lease_duration_months >= 12
              ? "Registration compulsory"
              : "Statutory record"}
          </span>
        </div>

        {/* Metric 4: Severity & Risk Rating */}
        <div className="letterpress-card p-3 space-y-1">
          <span className="text-[11px] text-[var(--color-muted)] font-mono">
            Risk rating
          </span>
          <p className="font-mono font-semibold text-base sm:text-lg text-[var(--color-ink)] capitalize">
            {severity === "critical"
              ? "Urgent attention"
              : severity === "high"
              ? "High attention"
              : severity === "medium"
              ? "Medium attention"
              : "Low risk"}
          </p>
          <span className="text-[10px] text-[var(--color-muted)] block truncate">
            {flags.length} {flags.length === 1 ? "check flagged" : "checks flagged"}
          </span>
        </div>
      </div>

      {/* Verification Flags Section */}
      {flags && flags.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-[var(--color-ink)]">
            Important checks &amp; warnings
          </h3>

          <div className="space-y-2">
            {flags.map((flag, index) => {
              const isWarning = flag.severity === "warning";
              const flagBg = isWarning
                ? "bg-[color-mix(in_oklab,var(--color-accent-2)_8%,var(--color-paper))] border-[var(--color-accent-2)]"
                : "bg-[var(--color-paper-2)] border-[var(--color-rule)]";

              return (
                <div
                  key={index}
                  className={`p-3 rounded-[var(--radius-input)] border text-xs space-y-1.5 ${flagBg}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-[var(--color-ink)]">
                      {flag.title}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--color-cotton)] border border-[var(--color-rule)] text-[var(--color-muted)] shrink-0">
                      {flag.flag_id}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--color-ink-2)] leading-relaxed">
                    {flag.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
