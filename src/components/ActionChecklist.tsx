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
        { id: "ca", text: "🚨 Consult a Chartered Accountant (CA) or Tax Lawyer immediately", urgent: true },
        { id: "login", text: "Log into the e-Filing portal (incometax.gov.in) with your PAN credentials" },
        { id: "eproceedings", text: "Navigate to 'Pending Actions' ➔ 'e-Proceedings' to inspect the exact notices & reasons" },
        { id: "docs", text: "Gather supporting bank statements, sale deeds, or investment proofs for the cited financial year" },
        { id: "deadline", text: `Submit official response / return before the deadline (${deadline || "stated on notice"})`, urgent: true },
        { id: "ack", text: "Download and preserve the official submission acknowledgment PDF" },
      ];
    }

    if (isScrutiny) {
      return [
        { id: "login", text: "Log into incometax.gov.in and check 'Pending Actions' ➔ 'e-Proceedings'" },
        { id: "reasons", text: "Download the questionnaire specifying the exact items selected for scrutiny" },
        { id: "ca", text: "Seek professional CA guidance to draft questionnaire responses and reconciliations" },
        { id: "deadline", text: `Upload response documents before ${deadline || "stipulated date"}`, urgent: true },
        { id: "receipt", text: "Save the e-filing acknowledgment receipt" },
      ];
    }

    // Default routine intimation (143(1) / 221(1) / 139(9))
    return [
      { id: "login", text: "Log into incometax.gov.in and check 'e-File' ➔ 'Income Tax Returns' ➔ 'View Filed Returns'" },
      { id: "compare", text: "Compare the demand / adjustment calculation sheet with your original computation" },
      { id: "decision", text: "If calculation is correct: pay net demand via e-Pay Tax (Challan 280 / New Portal)" },
      { id: "rectify", text: "If calculation has error: file Rectification Request u/s 154 / 269 within 30 days" },
      { id: "deadline", text: `Complete payment or response before ${deadline || "30 days from receipt"}`, urgent: (daysRemaining ?? 30) <= 7 },
    ];
  };

  const getRentSteps = () => {
    return [
      { id: "lockin", text: "Verify lock-in duration: ensure you will not need to relocate before the lock-in expires" },
      { id: "deposit", text: "Transfer security deposit only through traceable bank transfer (NEFT/UPI), obtain written receipt" },
      { id: "condition", text: "Record photo/video walkthrough of the premises on move-in day to safeguard deposit against dispute" },
      { id: "registration", text: "If agreement is 12 months or longer, insist on statutory registration before the Sub-Registrar", urgent: true },
      { id: "notice", text: "Mark a calendar reminder for required notice period before intended lease termination" },
    ];
  };

  const steps = isTax ? getTaxSteps() : getRentSteps();
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setCheckedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = steps.filter((s) => checkedSteps[s.id]).length;

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <h3 className="text-base font-bold text-white">Your Action Checklist</h3>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
          {completedCount} of {steps.length} completed
        </span>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = checkedSteps[step.id];
          return (
            <label
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all select-none ${
                isDone
                  ? "bg-gray-950/60 border-gray-800 text-gray-400 line-through"
                  : step.urgent
                  ? "bg-red-950/30 border-red-500/30 text-red-200 hover:border-red-500/50"
                  : "bg-gray-950/40 border-gray-800 text-gray-200 hover:border-gray-700"
              }`}
            >
              <input
                type="checkbox"
                checked={!!isDone}
                onChange={() => {}}
                className="mt-0.5 w-4 h-4 rounded border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-gray-900 cursor-pointer shrink-0"
              />
              <div className="text-xs flex-1">
                <span className="font-semibold mr-1.5">{idx + 1}.</span>
                <span>{step.text}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}