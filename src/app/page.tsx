"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { SafetyBanner } from "@/components/SafetyBanner";
import { StepIndicator } from "@/components/StepIndicator";
import { DemoDocPicker, type DemoDocItem } from "@/components/DemoDocPicker";
import { FileUpload } from "@/components/FileUpload";
import { DocumentViewer } from "@/components/DocumentViewer";
import { ResultCard } from "@/components/ResultCard";
import { ExplanationStream } from "@/components/ExplanationStream";
import { ActionChecklist } from "@/components/ActionChecklist";
import { htmlUrlToImageBase64 } from "@/lib/html-to-image";
import type { Language, Flag, Severity } from "@/lib/types";

export default function Home() {
  const [sourceMode, setSourceMode] = useState<"preset" | "upload">("preset");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>("Intimation u/s 143(1) (Clean)");
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>("it-143-1");
  const [language, setLanguage] = useState<Language>("en");

  // Pipeline execution state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted data state
  const [docType, setDocType] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [severity, setSeverity] = useState<Severity>("low");
  const [explanationText, setExplanationText] = useState<string>("");

  const resetAnalysisState = () => {
    setCurrentStep(0);
    setIsComplete(false);
    setError(null);
    setDocType(null);
    setExtractedData(null);
    setFlags([]);
    setSeverity("low");
    setExplanationText("");
  };

  const handleCustomUpload = (base64: string, name: string) => {
    setImageBase64(base64);
    setDocName(name);
    setSelectedDemoId(null);
    resetAnalysisState();
  };

  const handleSelectDemo = async (demo: DemoDocItem) => {
    setSelectedDemoId(demo.id);
    setDocName(demo.name);
    resetAnalysisState();

    try {
      const base64 = await htmlUrlToImageBase64(`/demo-docs/${demo.fileName}`);
      setImageBase64(base64);
    } catch {
      // Demo simulations work without client canvas image
    }
  };

  const runAnalysis = async () => {
    if ((!imageBase64 && !selectedDemoId) || isAnalyzing) return;

    setIsAnalyzing(true);
    resetAnalysisState();
    setCurrentStep(1);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64 || "data:image/png;base64,demo",
          language,
          demoId: selectedDemoId || undefined,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded: maximum 15 requests per 5 minutes. Please wait a moment.");
        }
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable response stream available.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventName = "message";
          let dataStr = "";

          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) {
              eventName = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.slice(6).trim();
            }
          }

          if (!dataStr) continue;

          try {
            const parsed = JSON.parse(dataStr);

            switch (eventName) {
              case "step":
                setCurrentStep(parsed.progress || 1);
                break;
              case "classification":
                setDocType(parsed.doc_type);
                break;
              case "extraction":
                setExtractedData(parsed);
                if (parsed.severity) setSeverity(parsed.severity);
                break;
              case "verification":
                if (parsed.flags) setFlags(parsed.flags);
                if (parsed.severity) setSeverity(parsed.severity);
                break;
              case "explanation_chunk":
                if (parsed.text) {
                  setExplanationText((prev) => prev + parsed.text);
                }
                break;
              case "done":
                setIsComplete(true);
                break;
              case "error":
                setError(parsed.message || "An error occurred during analysis.");
                break;
            }
          } catch {
            // ignore malformed SSE frames
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed.";
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-10 py-8 space-y-6">
        {/* Editorial Hero Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
              Decode Indian legal notices, loans, and commercial contracts.
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] max-w-2xl leading-relaxed">
              Deterministic section cross-mapping, RBI &amp; MSMED statutory audits, deadline countdowns in IST, and clause risk checks in plain English, Hindi, and Hinglish.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--color-muted)] shrink-0">
            <span>18 test presets</span>
            <span>·</span>
            <span>ICAI 1961 ↔ 2025 Act</span>
            <span>·</span>
            <span>RBI / MSMED / RERA / IRDAI</span>
          </div>
        </div>

        {/* Safety & Compliance Bar */}
        <SafetyBanner
          criticalSeverity={severity === "critical"}
          highStakesFlags={extractedData?.high_stakes_flags}
        />

        {/* Source Mode Toggle: Preset Documents vs Custom Upload */}
        <div className="stationery-sheet p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[var(--color-rule)]">
            <div className="flex items-center gap-1.5 bg-[var(--color-paper-2)] p-1 rounded-[var(--radius-input)] border border-[var(--color-rule)]">
              <button
                type="button"
                onClick={() => setSourceMode("preset")}
                className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
                  sourceMode === "preset"
                    ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                Sample presets (18)
              </button>
              <button
                type="button"
                onClick={() => setSourceMode("upload")}
                className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
                  sourceMode === "upload"
                    ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                Upload PDF or photo
              </button>
            </div>

            <span className="text-[11px] text-[var(--color-muted)] font-mono">
              {sourceMode === "preset"
                ? "One-click test documents: zero quota consumed"
                : "Client-side resize and PII masking before transmission"}
            </span>
          </div>

          {sourceMode === "preset" ? (
            <DemoDocPicker
              onSelectDoc={handleSelectDemo}
              selectedDocId={selectedDemoId}
              disabled={isAnalyzing}
            />
          ) : (
            <FileUpload
              onImageReady={handleCustomUpload}
              disabled={isAnalyzing}
            />
          )}

          {/* Action Row: Language Selector + Analyze Document CTA */}
          <div className="pt-4 border-t border-[var(--color-rule)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--color-muted)]">Language:</span>
              <div className="flex items-center gap-1 bg-[var(--color-paper-2)] p-1 rounded-[var(--radius-input)] border border-[var(--color-rule)]">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
                    language === "en"
                      ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => setLanguage("hi")}
                  className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
                    language === "hi"
                      ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => setLanguage("hinglish")}
                  className={`px-3 py-1.5 rounded-[calc(var(--radius-input)-2px)] text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer ${
                    language === "hinglish"
                      ? "bg-[var(--color-cotton)] text-[var(--color-ink)] shadow-xs"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  Hinglish
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {docName && (
                <span className="text-xs text-[var(--color-muted)] truncate max-w-xs hidden md:inline">
                  Ready: <strong className="font-medium text-[var(--color-ink)]">{docName}</strong>
                </span>
              )}
              <button
                type="button"
                disabled={(!imageBase64 && !selectedDemoId) || isAnalyzing}
                onClick={runAnalysis}
                className={`py-2.5 px-6 rounded-[var(--radius-input)] text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-xs focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
                  (!imageBase64 && !selectedDemoId) || isAnalyzing
                    ? "bg-[var(--color-paper-3)] text-[var(--color-muted)] cursor-not-allowed"
                    : "bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] cursor-pointer"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[var(--color-paper)] border-t-transparent rounded-full animate-spin"></span>
                    <span>Reviewing document…</span>
                  </>
                ) : (
                  <span>Analyze document</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Step Indicator Scan Bar (Active during analysis) */}
        <StepIndicator
          currentStep={currentStep}
          isComplete={isComplete}
          error={error}
        />

        {/* Two-Pane Workspace Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane: Document Inspection Desk */}
          <div className="lg:col-span-5 space-y-4">
            <DocumentViewer
              selectedDemoId={selectedDemoId}
              uploadedImageBase64={imageBase64}
              uploadedDocName={docName}
            />
          </div>

          {/* Right Pane: Statutory Dossier & Radar */}
          <div className="lg:col-span-7 space-y-6">
            {extractedData || explanationText ? (
              <>
                {extractedData && (
                  <ResultCard
                    docType={docType || "income_tax_notice"}
                    data={extractedData}
                    flags={flags}
                    severity={severity}
                  />
                )}

                <ExplanationStream
                  text={explanationText}
                  isStreaming={isAnalyzing && currentStep === 5}
                />

                <ActionChecklist
                  docType={docType || "income_tax_notice"}
                  sectionPrinted={
                    extractedData?.notice_section_printed ||
                    extractedData?.rule_or_section
                  }
                  deadline={extractedData?.response_deadline}
                  daysRemaining={extractedData?.days_remaining}
                  severity={severity}
                />
              </>
            ) : (
              /* Idle Inspection Blueprint */
              <div className="stationery-sheet p-6 space-y-5">
                <div className="pb-3 border-b border-[var(--color-rule)] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[var(--color-ink)]">
                      What we check for you
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-muted)]">
                      Automated review
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                    Click &ldquo;Analyze document&rdquo; to begin. We will automatically review:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="letterpress-card p-3.5 space-y-1">
                    <span className="font-semibold text-xs text-[var(--color-ink)]">
                      1. Old vs new tax law
                    </span>
                    <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
                      Checks whether your notice uses the old 1961 Act or the new 2025 Act section numbers effective 1 April 2026.
                    </p>
                  </div>

                  <div className="letterpress-card p-3.5 space-y-1">
                    <span className="font-semibold text-xs text-[var(--color-ink)]">
                      2. Exact deadline and days left
                    </span>
                    <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
                      Finds the response date from your document and calculates the exact days remaining so you avoid penalty interest.
                    </p>
                  </div>

                  <div className="letterpress-card p-3.5 space-y-1">
                    <span className="font-semibold text-xs text-[var(--color-ink)]">
                      3. Unfair rental lock-in traps
                    </span>
                    <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
                      Warns you if a lock-in period is longer than your notice period or if deposit forfeiture terms are overly harsh.
                    </p>
                  </div>

                  <div className="letterpress-card p-3.5 space-y-1">
                    <span className="font-semibold text-xs text-[var(--color-ink)]">
                      4. High tax demands or penalties
                    </span>
                    <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">
                      Flags any demand over ₹1,00,000 or prosecution warning, advising you when to consult a licensed Chartered Accountant.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-[var(--radius-input)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-medium text-[var(--color-ink)]">
                      Ready to inspect: {docName || "your document"}
                    </span>
                    <p className="text-[11px] text-[var(--color-muted)]">
                      Click “Analyze document” above to begin automated review.
                    </p>
                  </div>

                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[var(--color-cotton)] border border-[var(--color-rule)] text-[var(--color-muted)] shrink-0">
                    Local privacy sandbox
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Editorial Masthead Footer */}
      <footer className="border-t border-[var(--color-rule)] bg-[var(--color-paper-2)] py-8 mt-12 text-xs text-[var(--color-muted)]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-[var(--color-ink)]">
              DastaaVault: Indian legal and tax document reviewer
            </p>
            <p>
              Built for BharatCode Build League 2026. Grounded on Income Tax Act 1961, Income Tax Act 2025, and Registration Act 1908.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[var(--color-ink-2)] font-mono text-[11px]">
            <a
              href="https://github.com/Anhad-Sharma-26/dastaavault"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              GitHub repository
            </a>
            <span>MIT License</span>
            <span>qwen-3.8-27b</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
