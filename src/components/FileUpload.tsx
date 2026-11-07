"use client";

import React, { useRef, useState } from "react";
import { resizeImage } from "@/lib/image-utils";
import { pdfToImages } from "@/lib/pdf-to-images";

interface FileUploadProps {
  onImageReady: (base64Data: string, fileName: string) => void;
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
        throw new Error("Upload a PDF or an image file (JPG, PNG, WebP).");
      }

      setPreviewUrl(base64Result);
      setFileName(file.name);
      onImageReady(base64Result, file.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process file.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        tabIndex={0}
        role="button"
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
        className={`relative border-2 border-dashed rounded-[var(--radius-card)] p-6 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
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
            <div className="relative w-32 h-32 rounded-[var(--radius-input)] overflow-hidden border border-[var(--color-rule)] mb-3 bg-[var(--color-paper-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Document preview"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-semibold text-[var(--color-ink)] truncate max-w-xs">{fileName}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">Click or drag another file to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-[var(--radius-input)] bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex items-center justify-center text-[var(--color-ink-2)] mb-2 font-mono text-xs">
              DOC
            </div>
            <p className="font-semibold text-sm text-[var(--color-ink)]">
              {isProcessing ? "Optimizing document..." : "Upload notice or agreement"}
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Drop photo or PDF (single page, up to 15MB)
            </p>
            <div className="flex items-center gap-2 mt-3 text-[11px] text-[var(--color-muted)]">
              <span>Client-side resize</span>
              <span>·</span>
              <span>No cloud storage</span>
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
