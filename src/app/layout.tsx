import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DastaaVault — Indian Document Reviewer",
  description:
    "Review Indian Income Tax notices and rent agreements. Structured field extraction, 1961 vs 2025 Act section mapping, deadline tracking, and risk analysis in English, Hindi, and Hinglish.",
  openGraph: {
    title: "DastaaVault — Indian Document Reviewer",
    description:
      "Privacy-first statutory analysis of Indian income tax notices and rent agreements.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] font-sans">
        {children}
      </body>
    </html>
  );
}
