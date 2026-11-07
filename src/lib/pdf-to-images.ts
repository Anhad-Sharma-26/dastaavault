"use client";

/**
 * @module pdf-to-images
 * @description Client-side PDF-to-image converter using pdfjs-dist.
 *
 * Renders PDF pages to canvas at 2× scale for readability, then
 * outputs JPEG base-64 data URLs.
 *
 * Uses the browser Canvas API — must only be imported in client components.
 */

import * as pdfjs from "pdfjs-dist";

// Set the PDF.js worker source to the local bundle in public folder to prevent CDN failures
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

/** Target scale factor for rendering (2× for good OCR readability). */
const RENDER_SCALE = 2;

/** Maximum dimension after resizing (matches image-utils default). */
const MAX_DIMENSION = 1600;

/**
 * Convert a PDF file into an array of JPEG base-64 data URLs,
 * one per page.
 *
 * @param file     - PDF file from `<input>` or drag-and-drop.
 * @param maxPages - Maximum number of pages to process (default 1 for MVP).
 * @returns Array of `data:image/jpeg;base64,...` strings.
 */
export async function pdfToImages(
  file: File,
  maxPages: number = 1
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
  }).promise;

  const pagesToRender = Math.min(pdf.numPages, maxPages);
  const results: string[] = [];

  for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: RENDER_SCALE });

    // Create an off-screen canvas
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error(`Failed to get 2D context for page ${pageNum}`);
    }

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    // Resize if the rendered canvas exceeds MAX_DIMENSION
    const finalCanvas = resizeCanvas(canvas, MAX_DIMENSION);

    // Export as JPEG data URL
    const dataUrl = finalCanvas.toDataURL("image/jpeg", 0.85);
    results.push(dataUrl);
  }

  return results;
}

/**
 * Resize a canvas to fit within `maxDim` while maintaining aspect ratio.
 * Returns the original canvas if it already fits.
 */
function resizeCanvas(
  source: HTMLCanvasElement,
  maxDim: number
): HTMLCanvasElement {
  const { width, height } = source;

  if (width <= maxDim && height <= maxDim) {
    return source;
  }

  const ratio = Math.min(maxDim / width, maxDim / height);
  const newWidth = Math.round(width * ratio);
  const newHeight = Math.round(height * ratio);

  const dest = document.createElement("canvas");
  dest.width = newWidth;
  dest.height = newHeight;

  const ctx = dest.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D context for resize canvas");
  }

  ctx.drawImage(source, 0, 0, newWidth, newHeight);
  return dest;
}
