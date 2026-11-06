import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DastaaVault — Your Document, Decoded",
  description:
    "Upload a photo or PDF of an Indian income tax notice or rent agreement. Get structured extraction, risk flags, deadline countdowns, and action steps in English, Hindi, or Hinglish. Nothing stored. PII masked. Not legal advice.",
  openGraph: {
    title: "DastaaVault — Your Document, Decoded",
    description:
      "AI-powered analysis of Indian income tax notices and rent agreements. Free, private, open-source.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100 font-sans">
        {children}
      </body>
    </html>
  );
}
