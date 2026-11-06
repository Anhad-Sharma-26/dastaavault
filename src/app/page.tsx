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
      // Render demo HTML to base64 JPEG
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
            // ignore malformed frame
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
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <span>✨</span> Built for BharatCode Build League 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Don&apos;t panic over legal notices.<br className="hidden sm:inline" /> Understand them in 30 seconds.
          </h1>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Upload your Indian Income Tax Notice or Rent Agreement. Get structured data, risk flags, statutory cross-mappings (1961 ↔ 2025 Act), deadline countdowns, and plain-language action steps in English, Hindi, or Hinglish.
          </p>
        </div>

        {/* Privacy & Safety Alerts */}
        <SafetyBanner
          criticalSeverity={severity === "critical"}
          highStakesFlags={extractedData?.high_stakes_flags}
        />

        {/* Input & Demo Document Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📤</span> Upload Document
              </h2>
              <FileUpload onImageReady={handleCustomUpload} disabled={isAnalyzing} />

              <div className="pt-2 border-t border-gray-800 space-y-3">
                <LanguagePicker
                  selected={language}
                  onChange={setLanguage}
                  disabled={isAnalyzing}
                />

                <button
                  type="button"
                  disabled={!imageBase64 || isAnalyzing}
                  onClick={runAnalysis}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                    !imageBase64 || isAnalyzing
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 hover:scale-[1.01] cursor-pointer"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Analyzing Document...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Analyze {docName ? `"${docName}"` : "Document"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-lg">
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

        {/* Results Showcase */}
        {(extractedData || explanationText) && (
          <div className="space-y-6 pt-4">
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/40 py-8 mt-12 text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-gray-300">
              DastaaVault — Open Source Indian Legal & Tax Document Reviewer
            </p>
            <p>
              Built by Anhad Sharma for the BharatCode Build League Hackathon (Nov 2026).
            </p>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <span className="px-2 py-1 rounded bg-gray-800 text-[11px] font-mono">MIT License</span>
            <span className="px-2 py-1 rounded bg-gray-800 text-[11px] font-mono">qwen-3.8-27b</span>
          </div>
        </div>
      </footer>
    </div>
  );
}