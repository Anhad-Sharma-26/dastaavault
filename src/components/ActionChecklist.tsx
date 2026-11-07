"use client";

import React, { useState } from "react";
import type { Severity } from "@/lib/types";

interface ActionChecklistProps {
  docType: string;
  sectionPrinted?: string;
  deadline?: string | null;
  daysRemaining?: number | null;
  severity?: Severity;
}

export function ActionChecklist({
  docType,
  sectionPrinted,
  deadline,
  daysRemaining,
  severity,
}: ActionChecklistProps) {
  const isTax = docType === "income_tax_notice";

  const getTaxSteps = () => {
    const isReassessment = sectionPrinted?.includes("148") || sectionPrinted?.includes("231");
    const isScrutiny = sectionPrinted?.includes("143(2)") || sectionPrinted?.includes("221(2)");

    if (isReassessment || severity === "critical") {
      return [
        { id: "ca", text: "Consult a Chartered Accountant or tax advocate immediately.", urgent: true },
        { id: "login", text: "Log into the e-Filing portal (incometax.gov.in) with PAN credentials." },
        { id: "eproceedings", text: "Open Pending Actions ➔ e-Proceedings to inspect reasons recorded." },
        { id: "docs", text: "Gather bank statements, sale deeds, or investment proofs for the cited financial year." },
        { id: "deadline", text: `Submit official response before the deadline (${deadline || "stated on notice"}).`, urgent: true },
        { id: "ack", text: "Download and preserve the submission acknowledgment receipt." },
      ];
    }

    if (isScrutiny) {
      return [
        { id: "login", text: "Log into incometax.gov.in and check Pending Actions ➔ e-Proceedings." },
        { id: "reasons", text: "Download the questionnaire specifying items selected for scrutiny." },
        { id: "ca", text: "Seek professional CA guidance to draft responses and reconciliations." },
        { id: "deadline", text: `Upload response documents before ${deadline || "stipulated date"}.`, urgent: true },
        { id: "receipt", text: "Save the e-filing acknowledgment receipt." },
      ];
    }

    // Default intimation
    return [
      { id: "login", text: "Log into incometax.gov.in and check e-File ➔ View Filed Returns." },
      { id: "compare", text: "Compare the demand calculation with your filed ITR computation." },
      { id: "decision", text: "If calculation is correct: pay net demand via e-Pay Tax." },
      { id: "rectify", text: "If calculation has error: file online rectification request within 30 days." },
      { id: "deadline", text: `Complete payment or response before ${deadline || "30 days from receipt"}.`, urgent: (daysRemaining ?? 30) <= 7 },
    ];
  };

  const getRentSteps = () => {
    return [
      { id: "lockin", text: "Verify lock-in duration: ensure you will not need to relocate before expiry." },
      { id: "deposit", text: "Transfer security deposit through traceable bank transfer and obtain receipt." },
      { id: "condition", text: "Record photo and video walkthrough of the premises on move-in day." },
      { id: "registration", text: "If agreement is 12 months or longer, insist on statutory registration.", urgent: true },
      { id: "notice", text: "Set a calendar reminder for required notice period before planned lease exit." },
    ];
  };

  const steps = isTax ? getTaxSteps() : getRentSteps();
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setCheckedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = steps.filter((s) => checkedSteps[s.id]).length;

  return (
    <div className="bg-[var(--color-cotton)] border border-[var(--color-rule)] rounded-[var(--radius-card)] p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
        <h3 className="text-base font-semibold text-[var(--color-ink)]">
          Action checklist
        </h3>
        <span className="text-xs font-mono text-[var(--color-muted)]">
          {completedCount} of {steps.length} completed
        </span>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isDone = checkedSteps[step.id];
          return (
            <label
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`p-3 rounded-[var(--radius-input)] border flex items-start gap-3 cursor-pointer transition-colors select-none ${
                isDone
                  ? "bg-[var(--color-paper-2)] border-[var(--color-rule)] text-[var(--color-muted)] line-through"
                  : step.urgent
                  ? "bg-[color-mix(in_oklab,var(--color-error)_6%,var(--color-paper))] border-[var(--color-error)] text-[var(--color-ink)]"
                  : "bg-[var(--color-paper)] border-[var(--color-rule)] text-[var(--color-ink)] hover:border-[var(--color-rule-2)]"
              }`}
            >
              <input
                type="checkbox"
                checked={!!isDone}
                onChange={() => {}}
                className="mt-0.5 w-4 h-4 rounded border-[var(--color-rule-2)] text-[var(--color-accent-2)] focus:ring-[var(--color-focus)] cursor-pointer shrink-0"
              />
              <div className="text-xs flex-1 leading-relaxed">
                <span className="font-mono mr-1.5">{idx + 1}.</span>
                <span>{step.text}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
