"use client";

import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  currentStepName?: string;
  isComplete?: boolean;
  error?: string | null;
}

export function StepIndicator({
  currentStep,
  isComplete,
  error,
}: StepIndicatorProps) {
  const steps = [
    { num: 1, label: "Transcribing", desc: "Vision OCR" },
    { num: 2, label: "Classifying", desc: "Notice vs lease" },
    { num: 3, label: "Extracting", desc: "Structured fields" },
    { num: 4, label: "Checking", desc: "Section mappings" },
    { num: 5, label: "Explaining", desc: "Plain language" },
  ];

  if (currentStep === 0 && !error) return null;

  return (
    <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-cotton)] border border-[var(--color-rule)]">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-[var(--color-ink)]">
          {error
            ? "Analysis halted"
            : isComplete
            ? "Analysis complete"
            : `Processing step ${currentStep} of 5`}
        </span>
        <span className="text-[var(--color-muted)] font-mono">
          {isComplete ? "5 of 5 done" : `step ${currentStep}/5`}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((step) => {
          const isDone = isComplete || currentStep > step.num;
          const isCurrent = !isComplete && currentStep === step.num;

          return (
            <div
              key={step.num}
              className={`p-2.5 rounded-[var(--radius-input)] border text-xs ${
                isDone
                  ? "bg-[var(--color-paper-2)] border-[var(--color-rule-2)] text-[var(--color-ink)]"
                  : isCurrent
                  ? "bg-[var(--color-paper-3)] border-[var(--color-ink)] text-[var(--color-ink)] font-semibold"
                  : "bg-[var(--color-paper)] border-[var(--color-rule)] text-[var(--color-muted)] opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono">0{step.num}</span>
                {isDone && <span className="text-[var(--color-success)] text-xs">✓</span>}
              </div>
              <div className="truncate">{step.label}</div>
              <div className="text-[11px] text-[var(--color-muted)] truncate">
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-[var(--radius-input)] bg-[color-mix(in_oklab,var(--color-error)_8%,var(--color-paper))] border border-[var(--color-error)] text-[var(--color-error)] text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
