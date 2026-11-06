"use client";

import React from "react";

interface StepIndicatorProps {
  currentStep: number; // 0 (idle) to 5 (explaining)
  currentStepName?: string;
  isComplete?: boolean;
  error?: string | null;
}

export function StepIndicator({ currentStep, isComplete, error }: StepIndicatorProps) {
  const steps = [
    { num: 1, label: "Transcribing", icon: "📄", desc: "Vision OCR" },
    { num: 2, label: "Classifying", icon: "🤖", desc: "Tax vs Rent" },
    { num: 3, label: "Extracting", icon: "🔍", desc: "JSON Schema" },
    { num: 4, label: "Verifying", icon: "⚖️", desc: "Law & Risks" },
    { num: 5, label: "Explaining", icon: "💬", desc: "Plain language" },
  ];

  if (currentStep === 0 && !error) return null;

  return (
    <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          {error ? (
            <span className="text-red-400">Analysis Halted</span>
          ) : isComplete ? (
            <span className="text-emerald-400">Analysis Complete</span>
          ) : (
            <span className="text-indigo-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              Pipeline Running...
            </span>
          )}
        </span>
        <span className="text-xs text-gray-500 font-mono">
          {isComplete ? "5 / 5 done" : `Step ${currentStep} of 5`}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((step) => {
          const isDone = isComplete || currentStep > step.num;
          const isCurrent = !isComplete && currentStep === step.num;
          const isPending = currentStep < step.num;

          return (
            <div
              key={step.num}
              className={`p-2.5 rounded-lg border text-xs transition-all ${
                isDone
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                  : isCurrent
                  ? "bg-indigo-950/50 border-indigo-500 shadow-sm shadow-indigo-500/20 text-white animate-pulse"
                  : "bg-gray-950/40 border-gray-800 text-gray-500 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{step.icon}</span>
                {isDone ? (
                  <span className="text-emerald-400 text-xs">✓</span>
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                ) : (
                  <span className="text-[10px] text-gray-600">#{step.num}</span>
                )}
              </div>
              <div className="font-semibold truncate">{step.label}</div>
              <div className="text-[10px] opacity-75 truncate">{step.desc}</div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}