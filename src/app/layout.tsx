import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DastaaVault: Indian Document Reviewer",
  description:
    "Review Indian Income Tax notices and rent agreements. Structured field extraction, 1961 vs 2025 Act section mapping, deadline tracking, and risk analysis in English, Hindi, and Hinglish.",
  openGraph: {
    title: "DastaaVault: Indian Document Reviewer",
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
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] font-sans desk-surface">
        {children}
      </body>
    </html>
  );
}
