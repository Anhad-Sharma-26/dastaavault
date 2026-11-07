"use client";

import React from "react";

export function Header() {
  return (
    <header className="border-b border-[var(--color-rule)] bg-[var(--color-paper)] sticky top-0 z-40">
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-[var(--radius-input)] bg-[var(--color-accent)] text-[var(--color-accent-ink)] flex items-center justify-center font-bold text-sm">
            DV
          </div>
          <div>
            <span className="font-semibold text-base text-[var(--color-ink)]">
              DastaaVault
            </span>
            <p className="text-xs text-[var(--color-muted)]">
              Indian document reviewer
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-[var(--color-muted)] hidden sm:inline">
            Client-side redaction, no storage
          </span>
          <span className="text-xs px-2.5 py-1 rounded-[var(--radius-pill)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink-2)]">
            Not legal advice
          </span>
        </div>
      </div>
    </header>
  );
}
