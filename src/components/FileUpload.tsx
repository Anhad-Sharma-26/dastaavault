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
        throw new Error("Please upload a PDF or an image file (JPG, PNG, WebP).");
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
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isProcessing) inputRef.current?.click();
        }}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-indigo-400 bg-indigo-950/40 scale-[1.01]"
            : "border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/60"
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
            <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-gray-700 shadow-md mb-3 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Uploaded document preview"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-semibold text-gray-200 truncate max-w-xs">{fileName}</p>
            <p className="text-[11px] text-indigo-400 mt-1 hover:underline">Click or drop another file to change</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl text-indigo-400 mb-3">
              {isProcessing ? "⏳" : "📥"}
            </div>
            <p className="font-semibold text-sm text-gray-200">
              {isProcessing ? "Processing & Optimizing Image..." : "Drop your document here, or browse"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports Tax Notice or Rent Agreement (PDF, JPG, PNG up to 15MB)
            </p>
            <div className="flex items-center gap-3 mt-4 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">🔒 Client-side resize</span>
              <span>•</span>
              <span className="flex items-center gap-1">⚡ Instant OCR</span>
              <span>•</span>
              <span className="flex items-center gap-1">🛡️ PII masked</span>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}