# DastaaVault: Modern Document Reviewer UI Design Specification

> **Research & Implementation Guide for AI Coding Agents**  
> *Inspired by Harvey AI, Robin AI, and Ironclad · Built on the Hallmark Coral Design System*

---

## 1. Executive Summary & Root Cause Analysis

### 1.1 The Incident: Why the UI Looked Unstyled
In earlier builds, the user experienced a view where text ran together with zero layout, resembling an unstyled HTML prototype.
- **Root Cause:** Next.js was executing via Webpack while using Tailwind CSS v4. Without `@tailwindcss/postcss` and a dedicated `postcss.config.mjs`, Webpack emitted `@layer utilities { @tailwind utilities; }` verbatim into the final stylesheet (`.next/static/css/`).
- **Browser Impact:** The browser disregarded the unexpanded `@tailwind` directive, stripping away all layout (`flex`, `grid`, `col-span-*`), spacing (`p-*`, `gap-*`), and typographic styling.
- **Resolution:** `@tailwindcss/postcss` and `postcss` have been installed, and `postcss.config.mjs` is configured. All utility classes are now compiled directly into the production CSS bundle.

---

## 2. Competitive UX Research: How Modern Legal AI Apps Look & Feel

Leading legal and contract intelligence platforms—specifically **Harvey AI**, **Robin AI**, **Ironclad (Jurist)**, and **Spellbook**—have established distinct UI patterns that differentiate high-end legal intelligence from toy chatbots:

### 2.1 Pattern 1: "Prompt Dissolution" (Workflow Over Chat)
- **The Finding:** Professional attorneys, tax consultants, and contract reviewers do not want open-ended text chatboxes where they have to guess prompts.
- **The Execution:** The interface embeds deterministic review actions directly into the workflow (e.g., *"Run 1961 ↔ 2025 Act Cross-Mapping"*, *"Detect Rental Lock-in Traps"*). The prompt box is dissolved into structured buttons with visual states.

### 2.2 Pattern 2: The Two-Pane Split-Screen ("Canonical Document" + "Triage Deck")
- **Left Pane (Canonical Document Sheet):** 
  - Represents the ground truth document.
  - Formatted like authentic legal stationery with subtle paper texture, legal borders, reference bars, and DIN/PAN metadata.
  - Highlights specific clauses when a risk is selected on the right.
- **Right Pane (The Triage Deck):**
  - Displays structured legal intelligence categorized by severity.
  - Critical/High-Stakes items (Demands > ₹1 Lakh, Criminal prosecution clauses, Lock-in traps) appear in high-contrast debossed warning cards.
  - Normal/Settled items (Refund determinations, Standard 11-month terms) appear in clean ink cards.

### 2.3 Pattern 3: Transparent Grounding & Verbatim Citations
- Every legal assertion must link to verbatim document evidence.
- A card cannot simply state: *"The tenant may lose deposit."* It must cite:
  > *Document text: "Clause 14: In case of any marks on walls, security deposit shall be forfeited in full."*
- Accompanied by confidence meters (`high`, `medium`, `low`) so the reviewer knows when human review is mandatory.

### 2.4 Pattern 4: Official Status Stamps & Actionable Checklists
- An authoritative debossed ink stamp at the top of the dossier (e.g. `CRITICAL DEMAND: ₹3,45,000`, `LOCK-IN EXCEEDS NOTICE`, `REFUND APPROVED: ₹8,200`).
- An interactive, checkable action list with direct links to statutory portals (e.g. Income Tax e-Filing Portal, AIS Portal).

---

## 3. UI Component Architecture for DastaaVault

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER: Brand Mark · Sanskrit Subtitle · Trust Badges (Zero Storage, PII Redacted)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SAFETY STRIP: Educational & CA Consultation Warning (Triggers on ₹1L+ or Prosecution) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  DOCUMENT PRESET SELECTOR: Categorized Segmented Tabs                                  │
│  [ Income Tax Notices (7) ]   [ Rent Agreements (5) ]   [ Edge Cases (1) ]   [ Upload ]│
├───────────────────────────────────────────────────┬────────────────────────────────────┤
│  LEFT PANE: THE DOCUMENT SHEET                    │  RIGHT PANE: THE TRIAGE DOSSIER    │
│  - Stationery Sheet with lit/shade edges          │  - Real-Time 5-Step Radar Bar      │
│  - Authentic Reference Bar (PAN, DIN, AY)         │  - Authoritative Letterpress Stamp │
│  - Verbatim Clause Inspector                      │  - Statutory Concordance Card      │
│  - Language Selector (English / हिंदी / Hinglish) │    (Old 1961 Act ↔ New 2025 Act)   │
│  - Primary CTA: "Analyze Document"                │  - 4 Tabular Metric Cards          │
│                                                   │  - Deterministic Risk Checks       │
│                                                   │  - Streaming Legal Memorandum      │
│                                                   │  - Interactive Action Checklist    │
└───────────────────────────────────────────────────┴────────────────────────────────────┘
```

---

## 4. Design System Tokens (Hallmark Coral Theme)

The UI adheres strictly to the **Hallmark Coral** design system declared in `src/app/tokens.css` and `src/app/base.css`:

### 4.1 Color Palette
- **Paper Ground:** `var(--color-paper)` (Warm light parchment)
- **Stationery Sheet:** `var(--color-cotton)` (`oklch(98.8% 0.0045 80)`)
- **Primary Ink:** `var(--color-ink)` (`oklch(21% 0.012 38)`)
- **Secondary Ink:** `var(--color-ink-2)` (`oklch(29% 0.013 40)`)
- **Muted Labels:** `var(--color-muted)` (`oklch(47% 0.013 45)`)
- **Coral Accent:** `var(--color-accent-2)` (`oklch(54% 0.165 29)`)
- **Critical Error/Risk:** `var(--color-error)` (`oklch(52% 0.19 27)`)
- **Success/Settled:** `var(--color-success)` (`oklch(50% 0.12 150)`)

### 4.2 Tactile Physical Surfaces
- **Stationery Sheet:**
  ```css
  background: var(--color-cotton);
  border: 1px solid var(--color-rule);
  box-shadow: var(--edge-stock), var(--cast-stock);
  border-radius: var(--radius-card);
  ```
- **Letterpress Cards:**
  ```css
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule-2);
  box-shadow: var(--press-groove);
  border-radius: var(--radius-input);
  ```

### 4.3 Typography Hierarchy
- **Display & Headings:** General Sans 600, roman, untracked, sentence case.
- **Body Text:** General Sans 400 and 500, line-height 1.55.
- **Numbers, Currency & Dates:** Geist Mono tabular numerals (`font-variant-numeric: tabular-nums`).

---

## 5. Strict Hallmark Linter Rules (`sloplint.mjs`)

Any agent modifying the UI **MUST** pass `node .agents/skills/hallmark/scripts/sloplint.mjs dastaavault/src` with **0 FAIL, 0 REFLEX, 0 WARN**.

1. **No Color or Font Literals:** Never use hex (`#fff`), rgb, or direct oklch outside `tokens.css`. Always use `var(--color-*)` and `var(--font-*)`.
2. **No Emojis as Icons:** Do not prepend or append emojis as icons to text labels. Use clean SVG icons or monospace text markers.
3. **No Dashes in Copy:** Never use em-dash (`—`) or en-dash (`–`) in prose or labels. Use colons (`:`), commas, parentheses, or periods.
4. **No Three-Period Ellipsis:** Never write `...`. Always use the true Unicode ellipsis character (`…`).
5. **No Tracked Capitals or Small Caps:** Never use `uppercase tracking-wider`. Keep labels in sentence case in the theme face.
6. **Button Text Nowrap:** Every button or interactive clickable label must have the `whitespace-nowrap` class to prevent awkward line breaks.
7. **No `transition: all`:** Explicitly name transition properties (e.g. `transition-colors`, `transition-opacity`).

---

## 6. Implementation Checklist for Subagents

When assigned tasks to enhance or refine the UI, follow these steps in order:

- [ ] **Step 1: Check Build & CSS Pipeline:**
  Ensure `postcss.config.mjs` is present and `@tailwindcss/postcss` is installed. Verify that `.flex` and `.grid` exist in the built CSS.
- [ ] **Step 2: Component Verification:**
  - `Header.tsx`: Keep branding minimal, font-mono version pill, no tracked caps.
  - `SafetyBanner.tsx`: Dual-mode (quiet privacy badge vs urgent high-stakes alert).
  - `DemoDocPicker.tsx`: Clean categorized segmented tabs (Tax, Rent, Edge).
  - `DocumentViewer.tsx`: Document inspection pane with live transcription reader, reference bar, and language pills.
  - `ResultCard.tsx`: Status stamp, 1961 ↔ 2025 Act concordance card, 4-card metric grid, and deterministic risk checks.
  - `ExplanationStream.tsx`: Typewriter stream with clean copy button and true ellipsis.
  - `ActionChecklist.tsx`: Checkable items with priority indicators and e-Filing links.
- [ ] **Step 3: Automated Linter Check:**
  Run:
  ```bash
  node .agents/skills/hallmark/scripts/sloplint.mjs dastaavault/src
  ```
  Confirm output reports: `sloplint: clean. 0 FAIL, 0 REFLEX, 0 WARN across 15 file(s)`.
- [ ] **Step 4: Test Suite Verification:**
  Run:
  ```bash
  node --test dastaavault/tests/test-suite.mjs
  ```
  Confirm all 15 tests pass.
- [ ] **Step 5: Production Build Test:**
  Run:
  ```bash
  node .\node_modules\next\dist\bin\next build --webpack
  ```
  Confirm zero TypeScript errors and successful static page generation (5/5).
