"use client";

import React, { useState, useRef } from "react";
import { pdfToImages } from "@/lib/pdf-to-images";
import { resizeImage } from "@/lib/image-utils";

interface FileUploadProps {
  onImageReady: (base64Image: string, fileName: string) => void;
  disabled?: boolean;
}

export function FileUpload({ onImageReady, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      let base64Result: string;

      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const pages = await pdfToImages(file, 1);
        if (!pages || pages.length === 0) {
          throw new Error("Could not render page from PDF.");
        }
        base64Result = pages[0];
      } else if (file.type.startsWith("image/")) {
        base64Result = await resizeImage(file, 1600);
      } else {
        throw new Error("Please upload a PDF document or an image (JPEG, PNG, WEBP).");
      }

      setFileName(file.name);
      setPreviewUrl(base64Result);
      onImageReady(base64Result, file.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process document.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload document"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isProcessing) inputRef.current?.click();
        }}
        className={`relative border border-dashed rounded-[var(--radius-input)] p-5 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
          isDragging
            ? "border-[var(--color-accent-2)] bg-[var(--color-paper-2)]"
            : "border-[var(--color-rule-2)] bg-[var(--color-cotton)] hover:bg-[var(--color-paper-2)]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={handleChange}
          disabled={disabled || isProcessing}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 rounded-[var(--radius-input)] overflow-hidden border border-[var(--color-rule)] mb-2 bg-[var(--color-paper-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Document preview"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-semibold text-[var(--color-ink)] truncate max-w-xs">{fileName}</p>
            <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Click or drag another file to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-[var(--radius-input)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex items-center justify-center text-[var(--color-ink-2)] mb-2 font-mono text-xs font-semibold">
              PDF
            </div>
            <p className="font-semibold text-xs text-[var(--color-ink)]">
              {isProcessing ? "Optimizing document locally…" : "Upload tax notice or agreement"}
            </p>
            <p className="text-[11px] text-[var(--color-muted)] mt-1">
              Drop photo or PDF (single page, up to 15MB)
            </p>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--color-muted)] font-mono">
              <span>Client-side resize</span>
              <span>:</span>
              <span>Zero cloud storage</span>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-[var(--radius-input)] bg-[color-mix(in_oklab,var(--color-error)_8%,var(--color-paper))] border border-[var(--color-error)] text-[var(--color-error)] text-xs">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
