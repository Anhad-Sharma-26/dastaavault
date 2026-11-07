"use client";

import React, { useState } from "react";
import type { Severity } from "@/lib/types";

interface ActionChecklistProps {
  docType: string;
  sectionPrinted?: string;
  deadline?: string;
  daysRemaining?: number | null;
  severity: Severity;
}

interface ActionItem {
  id: string;
  text: string;
  urgency: "urgent" | "recommended" | "optional";
  linkText?: string;
  linkUrl?: string;
}

export function ActionChecklist({
  docType,
  sectionPrinted,
  deadline,
  daysRemaining,
  severity,
}: ActionChecklistProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getActionItems = (): ActionItem[] => {
    if (docType === "income_tax_notice") {
      const items: ActionItem[] = [];

      if (sectionPrinted?.includes("143(1)")) {
        items.push({
          id: "verify-26as",
          text: "Verify Form 26AS and AIS on the e-filing portal to check deductor TDS credits.",
          urgency: "urgent",
          linkText: "AIS portal",
          linkUrl: "https://eportal.incometax.gov.in",
        });
        items.push({
          id: "rectification",
          text: "If tax credit was missed by CPC, file an online rectification request u/s 154.",
          urgency: "recommended",
        });
      } else if (sectionPrinted?.includes("148")) {
        items.push({
          id: "audit-ca",
          text: "High risk reassessment notice: consult a certified Chartered Accountant immediately.",
          urgency: "urgent",
        });
        items.push({
          id: "retrieve-itr",
          text: "Download original ITR computation, bank statements, and investment proofs for the relevant year.",
          urgency: "recommended",
        });
      } else {
        items.push({
          id: "read-notice",
          text: "Read the specific annexure questionnaire mentioned in your notice.",
          urgency: "recommended",
        });
      }

      if (deadline) {
        items.push({
          id: "calendar-deadline",
          text: `Submit response before ${deadline} (${daysRemaining !== undefined && daysRemaining !== null ? `${daysRemaining} days left` : "check notice"}).`,
          urgency: "urgent",
        });
      }

      items.push({
        id: "check-din",
        text: "Authenticate the notice DIN on the Income Tax portal via 'Authenticate Notice/Order'.",
        urgency: "optional",
        linkText: "Verify DIN",
        linkUrl: "https://eportal.incometax.gov.in",
      });

      return items;
    }

    if (docType === "rent_agreement") {
      return [
        {
          id: "negotiate-lockin",
          text: "Negotiate lock-in period so it matches or remains shorter than your notice period.",
          urgency: severity === "critical" || severity === "high" ? "urgent" : "recommended",
        },
        {
          id: "forfeiture-clause",
          text: "Amend forfeiture clause to limit deductions strictly to substantiated physical damage.",
          urgency: "urgent",
        },
        {
          id: "registration-check",
          text: "If tenure is 12 months or longer, execute registered lease deed at Sub-Registrar office.",
          urgency: "recommended",
        },
        {
          id: "inventory-photo",
          text: "Document handover inventory with timestamped photos and signed inspection sheet.",
          urgency: "optional",
        },
      ];
    }

    return [
      {
        id: "consult-expert",
        text: "Review the full physical contract with legal counsel prior to execution.",
        urgency: "recommended",
      },
    ];
  };

  const items = getActionItems();
  const completedCount = items.filter((item) => checkedIds.has(item.id)).length;

  return (
    <div className="stationery-sheet p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-ink)]">
            Recommended next steps
          </h3>
          <p className="text-[11px] text-[var(--color-muted)]">
            Things you should do to handle this document on time
          </p>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink-2)]">
          {completedCount} of {items.length} done
        </span>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const isChecked = checkedIds.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3 rounded-[var(--radius-input)] border text-xs cursor-pointer transition-colors flex items-start gap-3 ${
                isChecked
                  ? "bg-[var(--color-paper-2)] border-[var(--color-rule)] opacity-70"
                  : "bg-[var(--color-cotton)] border-[var(--color-rule)] hover:border-[var(--color-rule-2)]"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {}}
                className="mt-0.5 rounded border-[var(--color-rule-2)] text-[var(--color-ink)] focus:ring-[var(--color-focus)] cursor-pointer"
              />

              <div className="flex-1 space-y-1">
                <p className={`leading-relaxed ${isChecked ? "line-through text-[var(--color-muted)]" : "text-[var(--color-ink)]"}`}>
                  {item.text}
                </p>

                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      item.urgency === "urgent"
                        ? "bg-[color-mix(in_oklab,var(--color-error)_15%,var(--color-paper))] text-[var(--color-error)]"
                        : "bg-[var(--color-paper-2)] text-[var(--color-muted)]"
                    }`}
                  >
                    {item.urgency}
                  </span>

                  {item.linkText && item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[var(--color-accent-2)] hover:underline whitespace-nowrap"
                    >
                      {item.linkText} ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
