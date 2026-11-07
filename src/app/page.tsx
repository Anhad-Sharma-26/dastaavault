"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { SafetyBanner } from "@/components/SafetyBanner";
import { LanguagePicker } from "@/components/LanguagePicker";
import { StepIndicator } from "@/components/StepIndicator";
import { DemoDocPicker, type DemoDocItem } from "@/components/DemoDocPicker";
import { FileUpload } from "@/components/FileUpload";
import { ResultCard } from "@/components/ResultCard";
import { ExplanationStream } from "@/components/ExplanationStream";
import { ActionChecklist } from "@/components/ActionChecklist";
import { htmlUrlToImageBase64 } from "@/lib/html-to-image";
import type { Language, Flag, Severity } from "@/lib/types";

export default function Home() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");

  // Pipeline state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted results
  const [docType, setDocType] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [severity, setSeverity] = useState<Severity>("low");
  const [explanationText, setExplanationText] = useState<string>("");

  const resetState = () => {
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
    resetState();
  };

  const handleSelectDemo = async (demo: DemoDocItem) => {
    setSelectedDemoId(demo.id);
    setDocName(demo.name);
    resetState();

    try {
      const base64 = await htmlUrlToImageBase64(`/demo-docs/${demo.fileName}`);
      setImageBase64(base64);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load sample document.";
      setError(msg);
    }
  };

  const runAnalysis = async () => {
    if (!imageBase64 || isAnalyzing) return;

    setIsAnalyzing(true);
    resetState();
    setCurrentStep(1);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          language,
          demoId: selectedDemoId || undefined,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded (15 requests per 5 minutes). Please wait a moment.");
        }
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable response stream.");

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
            // ignore
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

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 sm:px-12 py-8 space-y-8">
        {/* Hallmark Hero Section: Headline <= 7 words, Sentence <= 12 words, Action */}
        <section className="space-y-3 pt-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
            Decode legal notices and agreements.
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted)] max-w-2xl leading-relaxed">
            Structured facts, risk checks, and deadlines explained in clear language.
          </p>
        </section>

        {/* Safety & Redaction Banner */}
        <SafetyBanner
          criticalSeverity={severity === "critical"}
          highStakesFlags={extractedData?.high_stakes_flags}
        />

        {/* Workspace: Upload + Sample Picker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[var(--color-cotton)] border border-[var(--color-rule)] rounded-[var(--radius-card)] p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[var(--color-ink)]">
                Document input
              </h2>
              <FileUpload onImageReady={handleCustomUpload} disabled={isAnalyzing} />

              <div className="pt-2 border-t border-[var(--color-rule)] space-y-3">
                <LanguagePicker
                  selected={language}
                  onChange={setLanguage}
                  disabled={isAnalyzing}
                />

                <button
                  type="button"
                  disabled={!imageBase64 || isAnalyzing}
                  onClick={runAnalysis}
                  className={`w-full py-2.5 px-4 rounded-[var(--radius-input)] font-medium text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
                    !imageBase64 || isAnalyzing
                      ? "bg-[var(--color-paper-3)] text-[var(--color-muted)] cursor-not-allowed"
                      : "bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] cursor-pointer"
                  }`}
                >
                  {isAnalyzing ? (
                    <span>Analyzing…</span>
                  ) : (
                    <span>Analyze {docName ? `"${docName}"` : "document"}</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[var(--color-cotton)] border border-[var(--color-rule)] rounded-[var(--radius-card)] p-5">
              <DemoDocPicker
                onSelectDoc={handleSelectDemo}
                selectedDocId={selectedDemoId}
                disabled={isAnalyzing}
              />
            </div>
          </div>
        </div>

        {/* Step Indicator Progress */}
        <StepIndicator
          currentStep={currentStep}
          isComplete={isComplete}
          error={error}
        />

        {/* Results */}
        {(extractedData || explanationText) && (
          <section className="space-y-6 pt-2">
            {extractedData && (
              <ResultCard
                docType={docType || "income_tax_notice"}
                data={extractedData}
                flags={flags}
                severity={severity}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <ExplanationStream
                  text={explanationText}
                  isStreaming={isAnalyzing && currentStep === 5}
                />
              </div>

              <div className="lg:col-span-5">
                <ActionChecklist
                  docType={docType || "income_tax_notice"}
                  sectionPrinted={extractedData?.notice_section_printed}
                  deadline={extractedData?.response_deadline}
                  daysRemaining={extractedData?.days_remaining}
                  severity={severity}
                />
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Hallmark Masthead Footer */}
      <footer className="border-t border-[var(--color-rule)] bg-[var(--color-paper-2)] py-8 mt-16 text-xs text-[var(--color-muted)]">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-[var(--color-ink)]">
              DastaaVault: Indian legal and tax document reviewer
            </p>
            <p>
              Built for BharatCode Build League 2026. Sourced from Income Tax Act 1961 and 2025 Act statutory mappings.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[var(--color-ink-2)] font-mono text-[11px]">
            <span>MIT License</span>
            <span>qwen-3.8-27b</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
