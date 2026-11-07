"use client";

import React from "react";

/**
 * Parses inline markdown: **bold**, *italic*, `code`, and [links](url).
 */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let keyIndex = 0;

  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={keyIndex++} className="font-semibold text-[var(--color-ink)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={keyIndex++} className="italic text-[var(--color-ink-2)]">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={keyIndex++}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const closingBracket = token.indexOf("](");
      const label = token.slice(1, closingBracket);
      const url = token.slice(closingBracket + 2, -1);
      parts.push(
        <a
          key={keyIndex++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-[var(--color-accent-2)] hover:text-[var(--color-accent-2)] font-medium"
        >
          {label}
        </a>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : parts;
}

interface MarkdownRendererProps {
  content: string;
}

/**
 * Lightweight, zero-dependency Markdown renderer tailored for DastaaVault.
 * Handles headings (###, ##, #), bold, italic, bullet lists, numbered lists,
 * and statutory callouts/disclaimers with Hallmark Coral design tokens.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: React.ReactNode[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "ul") {
        elements.push(
          <ul
            key={key++}
            className="space-y-2 my-2.5 pl-4 list-disc marker:text-[var(--color-accent-2)] text-xs sm:text-[13px] leading-relaxed text-[var(--color-ink-2)]"
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="pl-1">
                {item}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol
            key={key++}
            className="space-y-2 my-2.5 pl-5 list-decimal marker:font-mono marker:font-semibold marker:text-xs marker:text-[var(--color-ink)] text-xs sm:text-[13px] leading-relaxed text-[var(--color-ink-2)]"
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="pl-1">
                {item}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Heading level 3
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h4
          key={key++}
          className="text-sm font-semibold text-[var(--color-ink)] mt-4 mb-2 tracking-tight flex items-center gap-2"
        >
          {renderInline(line.slice(4))}
        </h4>
      );
      continue;
    }

    // Heading level 2
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h3
          key={key++}
          className="text-base font-semibold text-[var(--color-ink)] mt-5 mb-2.5 tracking-tight"
        >
          {renderInline(line.slice(3))}
        </h3>
      );
      continue;
    }

    // Heading level 1
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h2
          key={key++}
          className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-3 tracking-tight"
        >
          {renderInline(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Bullet list items (* or -)
    const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(renderInline(bulletMatch[1]));
      continue;
    }

    // Numbered list items (1., 2., etc.)
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(renderInline(numMatch[2]));
      continue;
    }

    flushList();

    // Alert or Template warning callout banner
    if (
      line.startsWith("⚠️") ||
      line.startsWith("! ") ||
      line.includes("UNFILLED STATUTORY TEMPLATE") ||
      line.includes("WARNING")
    ) {
      elements.push(
        <div
          key={key++}
          className="p-3 my-2.5 rounded-[var(--radius-input)] bg-[color-mix(in_oklab,var(--color-accent-2)_8%,var(--color-paper))] border border-[var(--color-accent-2)] text-xs sm:text-[13px] leading-relaxed text-[var(--color-ink)] font-medium"
        >
          {renderInline(line)}
        </div>
      );
      continue;
    }

    // Legal / statutory disclaimer
    if (line.startsWith("⚖️")) {
      elements.push(
        <div
          key={key++}
          className="p-3 my-3 rounded-[var(--radius-input)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[11px] leading-relaxed text-[var(--color-muted)]"
        >
          {renderInline(line)}
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p
        key={key++}
        className="text-xs sm:text-[13px] leading-relaxed text-[var(--color-ink-2)] my-2"
      >
        {renderInline(line)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1">{elements}</div>;
}
