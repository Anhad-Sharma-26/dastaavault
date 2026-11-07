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
  const languages: Array<{ id: Language; label: string }> = [
    { id: "en", label: "English" },
    { id: "hinglish", label: "Hinglish" },
    { id: "hi", label: "हिंदी" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[var(--color-paper-2)] rounded-[var(--radius-card)] border border-[var(--color-rule)]">
      <span className="text-xs text-[var(--color-ink-2)]">
        Explanation language
      </span>
      <div className="inline-flex rounded-[var(--radius-input)] bg-[var(--color-paper-3)] p-0.5 border border-[var(--color-rule)]">
        {languages.map((lang) => {
          const isActive = selected === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(lang.id)}
              className={`px-3 py-1 text-xs rounded-[calc(var(--radius-input)-2px)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
                isActive
                  ? "bg-[var(--color-cotton)] text-[var(--color-ink)] font-semibold shadow-xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
