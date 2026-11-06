"use client";

/**
 * @module html-to-image
 * @description Client-side helper to render synthetic HTML test documents
 * to high-resolution JPEG images using Canvas and SVG foreignObject.
 */

export async function htmlUrlToImageBase64(htmlUrl: string): Promise<string> {
  const res = await fetch(htmlUrl);
  if (!res.ok) {
    throw new Error(`Failed to load document at ${htmlUrl}`);
  }
  const html = await res.text();
  return htmlToImageBase64(html);
}

export function htmlToImageBase64(
  html: string,
  width: number = 850,
  height: number = 1150
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Extract inline and embedded styles
      const styleElements = Array.from(doc.querySelectorAll("style"));
      const styles = styleElements.map((s) => s.outerHTML).join("\n");
      const bodyContent = doc.body ? doc.body.innerHTML : html;

      // Construct SVG with foreignObject containing the HTML body
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff; width:100%; height:100%; box-sizing:border-box;">
              ${styles}
              ${bodyContent}
            </div>
          </foreignObject>
        </svg>
      `;

      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context unavailable"));
          return;
        }

        // White background fallback
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        resolve(dataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("SVG foreignObject rendering failed."));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}