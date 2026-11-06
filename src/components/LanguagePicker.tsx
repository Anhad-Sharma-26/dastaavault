"use client";

import React from "react";
import type { Language } from "@/lib/types";

interface LanguagePickerProps {
  selected: Language;
  onChange: (lang: Language) => void;
  disabled?: boolean;
}

export function LanguagePicker({ selected, onChange, disabled }: LanguagePickerProps) {
  const languages: Array<{ id: Language; label: string; desc: string }> = [
    { id: "en", label: "English", desc: "Clear & simple" },
    { id: "hinglish", label: "Hinglish", desc: "Hindi + English mix" },
    { id: "hi", label: "हिंदी", desc: "सरल व स्पष्ट भाषा" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
      <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        Explanation Language:
      </span>
      <div className="inline-flex rounded-lg bg-gray-950 p-1 border border-gray-800">
        {languages.map((lang) => {
          const isActive = selected === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(lang.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}