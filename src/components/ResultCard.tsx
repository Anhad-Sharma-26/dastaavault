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

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case "critical":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      case "high":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  const getConfidenceBadge = (conf?: Confidence) => {
    switch (conf) {
      case "high":
        return { label: "High Confidence (95%+)", bar: "w-full bg-emerald-500" };
      case "medium":
        return { label: "Medium Confidence", bar: "w-2/3 bg-amber-500" };
      default:
        return { label: "Low Confidence (Double Check)", bar: "w-1/3 bg-red-500" };
    }
  };

  const confidenceInfo = getConfidenceBadge(data.extraction_confidence);

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{isTax ? "🏛️" : isRent ? "🏠" : "📄"}</span>
            <h3 className="text-base font-bold text-white">
              {isTax
                ? data.notice_type_name || "Income Tax Notice"
                : isRent
                ? "Residential Rent Agreement"
                : "Extracted Document Data"}
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {isTax && data.assessment_year ? `Assessment Year: ${data.assessment_year}` : ""}
            {isRent && data.property_address ? `Property: ${data.property_address}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wider ${getSeverityBadge(
              severity
            )}`}
          >
            {severity} Risk
          </span>
        </div>
      </div>

      {/* Tax Notice Section Mapping Callout */}
      {isTax && (
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold mb-0.5">
              Statutory Section Cross-Mapping (1961 Act ↔ 2025 Act)
            </div>
            <div className="text-gray-200">
              Printed on Notice: <span className="font-mono font-bold text-white bg-indigo-900/60 px-1.5 py-0.5 rounded">u/s {data.notice_section_printed || "N/A"}</span>
              {data.notice_section_mapped && (
                <>
                  {" "} ➔ Corresponding section: <span className="font-mono font-bold text-indigo-200 bg-indigo-900/60 px-1.5 py-0.5 rounded">u/s {data.notice_section_mapped}</span>
                </>
              )}
            </div>
          </div>
          {data.act_version && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
              Cites {data.act_version} Act
            </span>
          )}
        </div>
      )}

      {/* Core Key-Value Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isTax ? (
          <>
            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
              <span className="text-[11px] text-gray-400 block mb-0.5">Demand Amount</span>
              <span className={`text-base font-bold ${data.demand_amount ? "text-rose-400" : "text-gray-200"}`}>
                {data.demand_amount ? `₹${Number(data.demand_amount).toLocaleString("en-IN")}` : "Nil / None"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
              <span className="text-[11px] text-gray-400 block mb-0.5">Response Deadline</span>
              <span className="text-sm font-semibold text-amber-300">
                {data.response_deadline || "See Notice Text"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
              <span className="text-[11px] text-gray-400 block mb-0.5">Days Remaining (IST)</span>
              <span
                className={`text-base font-extrabold ${
                  data.days_remaining !== null && data.days_remaining <= 5
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
              >
                {data.days_remaining !== null ? `${data.days_remaining} Days` : "Check Notice"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
              <span className="text-[11px] text-gray-400 block mb-0.5">Masked PAN</span>
              <span className="text-xs font-mono font-bold text-gray-200">
                {data.pan_masked || "Redacted"}
              </span>
            </div>
          </>
        ) : isRent ? (
          <>
            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
              <span className="text-[11px] text-gray-400 block mb-0.5">Monthly Rent</span>
              <span className="text-base font-bold text-emerald-400">
                {data.monthly_rent ? `₹${Number(data.monthly_rent).toLocaleString("en-IN")}` : "N/A"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
              <span className="text-[11px] text-gray-400 block mb-0.5">Security Deposit</span>
              <span className="text-base font-bold text-gray-200">
                {data.security_deposit ? `₹${Number(data.security_deposit).toLocaleString("en-IN")}` : "N/A"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
              <span className="text-[11px] text-gray-400 block mb-0.5">Lock-in vs Notice</span>
              <span className="text-xs font-semibold text-amber-300">
                {data.lock_in_months ? `${data.lock_in_months}m lock-in` : "No lock-in"} /{" "}
                {data.notice_period_months ? `${data.notice_period_months}m notice` : "No notice"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
              <span className="text-[11px] text-gray-400 block mb-0.5">Annual Escalation</span>
              <span className="text-base font-bold text-gray-200">
                {data.escalation_pct ? `${data.escalation_pct}%` : "Not specified"}
              </span>
            </div>
          </>
        ) : null}
      </div>

      {/* Flags Section */}
      {flags.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
            Automated Statutory & Risk Flags ({flags.length})
          </span>
          <div className="space-y-2">
            {flags.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  item.severity === "warning"
                    ? "bg-amber-950/30 border-amber-500/30 text-amber-200"
                    : "bg-blue-950/30 border-blue-500/30 text-blue-200"
                }`}
              >
                <span className="text-base shrink-0">{item.severity === "warning" ? "⚠️" : "ℹ️"}</span>
                <div>
                  <div className="font-semibold text-white">{item.title}</div>
                  <p className="mt-0.5 text-gray-300 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Confidence Meter */}
      <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span>Model Extraction Confidence:</span>
          <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${confidenceInfo.bar}`}></div>
          </div>
          <span className="text-gray-300 font-medium">{confidenceInfo.label}</span>
        </div>

        {data.uncertain_fields && data.uncertain_fields.length > 0 && (
          <span className="text-[11px] text-amber-400">
            Uncertain fields: {data.uncertain_fields.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}