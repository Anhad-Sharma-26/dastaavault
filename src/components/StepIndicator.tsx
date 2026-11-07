"use client";

import React from "react";

interface StepIndicatorProps {
  currentStep: number; // 0 to 5
  isComplete: boolean;
  error?: string | null;
}

const STEPS = [
  { id: 1, name: "Vision OCR", desc: "Transcribe document" },
  { id: 2, name: "PII Masking", desc: "Redact PAN and phone" },
  { id: 3, name: "Classification", desc: "Identify document type" },
  { id: 4, name: "Statutory Mapping", desc: "1961 ↔ 2025 Act" },
  { id: 5, name: "Verification", desc: "Rules and explanation" },
];

export function StepIndicator({
  currentStep,
  isComplete,
  error,
}: StepIndicatorProps) {
  if (currentStep === 0 && !isComplete && !error) {
    return null;
  }

  return (
    <div className="bg-[var(--color-cotton)] border border-[var(--color-rule)] rounded-[var(--radius-card)] p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--color-ink)]">
          Analysis pipeline progress
        </span>
        <span className="font-mono text-[11px] text-[var(--color-muted)]">
          {error
            ? "Halted"
            : isComplete
            ? "Complete: 5 of 5 steps finished"
            : `Step ${currentStep} of 5 in progress`}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STEPS.map((step) => {
          const isDone = isComplete || currentStep > step.id;
          const isCurrent = !isComplete && currentStep === step.id;
          const isFailed = error && currentStep === step.id;

          let cardStyle = "bg-[var(--color-paper-2)] border-[var(--color-rule)] text-[var(--color-muted)]";
          let badgeText = "Pending";

          if (isFailed) {
            cardStyle = "bg-[color-mix(in_oklab,var(--color-error)_10%,var(--color-paper))] border-[var(--color-error)] text-[var(--color-error)]";
            badgeText = "Error";
          } else if (isDone) {
            cardStyle = "bg-[var(--color-paper-3)] border-[var(--color-rule-2)] text-[var(--color-ink)]";
            badgeText = "Done";
          } else if (isCurrent) {
            cardStyle = "bg-[var(--color-cotton)] border-[var(--color-accent-2)] text-[var(--color-accent-2)] shadow-xs";
            badgeText = "Running";
          }

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-[var(--radius-input)] border text-left transition-colors ${cardStyle}`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span>0{step.id}</span>
                <span className="font-semibold">{badgeText}</span>
              </div>
              <p className="font-medium text-xs truncate text-[var(--color-ink)]">
                {step.name}
              </p>
              <p className="text-[10px] text-[var(--color-muted)] truncate">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 rounded-[var(--radius-input)] bg-[color-mix(in_oklab,var(--color-error)_10%,var(--color-paper))] border border-[var(--color-error)] text-[var(--color-error)] text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
