"use client";

import React from "react";
import type { Language } from "@/lib/types";

interface LanguagePickerProps {
  selected: Language;
  onChange: (lang: Language) => void;
  disabled?: boolean;
}

export function LanguagePicker({
  selected,
  onChange,
  disabled,
}: LanguagePickerProps) {
  const options: { value: Language; label: string; sub: string }[] = [
    { value: "en", label: "English", sub: "Standard legal terminology" },
    { value: "hi", label: "हिंदी", sub: "सरल हिंदी सारांश" },
    { value: "hinglish", label: "Hinglish", sub: "Conversational everyday mix" },
  ];

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[var(--color-ink)]">
        Output language
      </label>
      <div className="grid grid-cols-3 gap-1.5 bg-[var(--color-paper-2)] p-1 rounded-[var(--radius-input)] border border-[var(--color-rule)]">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={`py-1.5 px-2 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors text-center whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
                isSelected
                  ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
