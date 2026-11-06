"use client";

/**
 * @module image-utils
 * @description Client-side image utilities for resizing and encoding.
 *
 * Uses the browser Canvas API — must only be imported in client components.
 */

/**
 * Convert a File to a base-64 encoded string (without the data URI prefix).
 *
 * @param file - Image file from an `<input>` or drag-and-drop.
 * @returns Raw base-64 string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URI prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Failed to extract base64 data from file"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Resize an image file to fit within `maxDimension` (width or height),
 * maintaining aspect ratio.  Returns a base-64 encoded JPEG string
 * (without the data URI prefix).
 *
 * @param file         - Image file to resize.
 * @param maxDimension - Maximum width or height in pixels (default 1600).
 * @returns Raw base-64 JPEG string.
 */
export function resizeImage(
  file: File,
  maxDimension: number = 1600
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Only downscale, never upscale
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG at 85% quality
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = dataUrl.split(",")[1];
      if (!base64) {
        reject(new Error("Failed to extract base64 from canvas"));
        return;
      }

      resolve(base64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for resizing"));
    };

    img.src = url;
  });
}
