"use client";

import React from "react";

interface SafetyBannerProps {
  criticalSeverity?: boolean;
  highStakesFlags?: string[];
}

export function SafetyBanner({ criticalSeverity, highStakesFlags = [] }: SafetyBannerProps) {
  return (
    <div className="space-y-3">
      {criticalSeverity && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 shadow-lg shadow-red-950/40 text-red-200">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h4 className="font-bold text-red-100 text-sm tracking-wide uppercase">
                High-Stakes Legal / Demand Notice Detected
              </h4>
              <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
                This document contains high financial demands (&gt; ₹1,00,000) or mentions potential prosecution / court summons.
                <strong> Do not rely solely on automated analysis.</strong> Please consult a practicing Chartered Accountant (CA) or tax advocate immediately.
              </p>
              {highStakesFlags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {highStakesFlags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold bg-red-900/80 text-red-100 px-2 py-0.5 rounded border border-red-700/60"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 text-gray-400 text-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-base">🛡️</span>
          <span>
            <strong>Client-Side Privacy Guarantee:</strong> PII (PAN, Aadhaar, Phone, Email) is masked before model processing. Zero document persistence.
          </span>
        </div>
        <span className="text-gray-500 text-[11px]">
          Compliant with DPDP privacy principles
        </span>
      </div>
    </div>
  );
}