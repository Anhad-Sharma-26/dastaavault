"use client";

import React, { useState } from "react";
import type { Severity } from "@/lib/types";

interface ActionChecklistProps {
  docType: string;
  sectionPrinted?: string;
  deadline?: string;
  daysRemaining?: number | null;
  severity: Severity;
}

interface ActionItem {
  id: string;
  text: string;
  urgency: "urgent" | "recommended" | "optional";
  linkText?: string;
  linkUrl?: string;
}

export function ActionChecklist({
  docType,
  sectionPrinted,
  deadline,
  daysRemaining,
  severity,
}: ActionChecklistProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getActionItems = (): ActionItem[] => {
    if (docType === "loan_sanction") {
      return [
        {
          id: "dispute-foreclosure",
          text: "Issue a formal written objection refusing any foreclosure or prepayment fee on this floating-rate individual loan, quoting RBI Circular DBOD.No.Dir.BC.107/13.03.00/2011-12.",
          urgency: "urgent",
          linkText: "RBI Circular",
          linkUrl: "https://www.rbi.org.in",
        },
        {
          id: "demand-kfs-apr",
          text: "Demand a compliant Key Fact Statement (KFS) that explicitly discloses the Annualized Percentage Rate (APR) and an exhaustive schedule of all fees before signing loan documents.",
          urgency: "urgent",
        },
        {
          id: "calendar-30day-title",
          text: "Calendar a 30-day timeline upon final loan closure: the lender is legally required to release all original property title deeds within 30 days or pay ₹5,000/day statutory compensation.",
          urgency: "recommended",
        },
        {
          id: "restrict-lien-clause",
          text: "Request modification or exclusion of any banker's general lien / right of set-off clause to isolate collateral exposure strictly to this mortgaged asset.",
          urgency: "recommended",
        },
        {
          id: "rbi-cms-complaint",
          text: "If the lender refuses to remove unlawful foreclosure penalties, lodge an online complaint with the RBI Banking Ombudsman.",
          urgency: "optional",
          linkText: "RBI CMS Portal",
          linkUrl: "https://cms.rbi.org.in",
        },
      ];
    }

    if (docType === "gst_notice") {
      const isSec74 = sectionPrinted?.includes("74");
      const items: ActionItem[] = [];

      if (isSec74) {
        items.push({
          id: "contest-sec74-allegation",
          text: "Critical Defense: Section 74 alleges fraud or suppression carrying a 100% penalty. Contest the invocation of fraud in writing; plead bona fide clerical error so the case is downgraded to Section 73 (10% penalty).",
          urgency: "urgent",
        });
      }

      items.push({
        id: "demand-personal-hearing",
        text: "Statutory Right: Formally request a Personal Hearing under Section 75(4) of the CGST Act before the Adjudicating Authority passes any adverse assessment order.",
        urgency: "urgent",
      });

      items.push({
        id: "download-scn-annexure",
        text: "Download the complete factual Show Cause Notice annexure from the GST Portal ('View Additional Notices and Orders') rather than relying solely on the DRC-01 summary table.",
        urgency: "urgent",
        linkText: "GST Portal",
        linkUrl: "https://services.gst.gov.in",
      });

      items.push({
        id: "file-drc06-deadline",
        text: `Draft and submit a comprehensive factual reply in Form GST DRC-06 before ${deadline || "the 30-day statutory deadline"} (${daysRemaining !== undefined && daysRemaining !== null ? `${daysRemaining} days remaining in IST` : "calendar immediately"}).`,
        urgency: "urgent",
      });

      items.push({
        id: "reconcile-gstr2b",
        text: "Reconcile supplier GSTR-1 filings against GSTR-2B and purchase ledger to substantiate input tax credit (ITC) eligibility with e-way bills and tax invoices.",
        urgency: "recommended",
      });

      return items;
    }

    if (docType === "msme_contract") {
      return [
        {
          id: "enforce-45day-cap",
          text: "Enforce Section 15 of the MSMED Act: inform the buyer that any contractual clause demanding 60, 90, or 120-day credit is void ab initio and capped at 45 days by statute.",
          urgency: "urgent",
        },
        {
          id: "claim-penal-interest",
          text: "Calculate compound penal interest at 3x the RBI Bank Rate (currently 19.5% p.a. with monthly rests) for all overdue days beyond the 45-day statutory appointment day.",
          urgency: "urgent",
        },
        {
          id: "warn-sec43bh-buyer",
          text: "Issue a formal written notice to buyer's finance head that unpaid balances to registered MSEs risk corporate tax expense disallowance under Section 43B(h) of the Income Tax Act.",
          urgency: "urgent",
        },
        {
          id: "file-msme-samadhaan",
          text: "If payment remains unpaid past the statutory ceiling, file an online recovery application on the MSME Samadhaan delayed payment monitoring portal.",
          urgency: "recommended",
          linkText: "MSME Samadhaan",
          linkUrl: "https://samadhaan.msme.gov.in",
        },
        {
          id: "print-udyam-number",
          text: "Verify that your 19-digit Udyam Registration Number is prominently printed on all future tax invoices and email correspondences.",
          urgency: "optional",
        },
      ];
    }

    if (docType === "income_tax_notice") {
      const items: ActionItem[] = [];

      if (sectionPrinted?.includes("143(1)")) {
        items.push({
          id: "verify-26as",
          text: "Verify Form 26AS and AIS on the e-filing portal to check deductor TDS credits.",
          urgency: "urgent",
          linkText: "AIS portal",
          linkUrl: "https://eportal.incometax.gov.in",
        });
        items.push({
          id: "rectification",
          text: "If tax credit was missed by CPC, file an online rectification request u/s 154.",
          urgency: "recommended",
        });
      } else if (sectionPrinted?.includes("148")) {
        items.push({
          id: "audit-ca",
          text: "High risk reassessment notice: consult a certified Chartered Accountant immediately.",
          urgency: "urgent",
        });
        items.push({
          id: "retrieve-itr",
          text: "Download original ITR computation, bank statements, and investment proofs for the relevant year.",
          urgency: "recommended",
        });
      } else {
        items.push({
          id: "read-notice",
          text: "Read the specific annexure questionnaire mentioned in your notice.",
          urgency: "recommended",
        });
      }

      if (deadline) {
        items.push({
          id: "calendar-deadline",
          text: `Submit response before ${deadline} (${daysRemaining !== undefined && daysRemaining !== null ? `${daysRemaining} days left in IST` : "check notice"}).`,
          urgency: "urgent",
        });
      }

      items.push({
        id: "check-din",
        text: "Authenticate the notice DIN on the Income Tax portal via 'Authenticate Notice/Order'.",
        urgency: "optional",
        linkText: "Verify DIN",
        linkUrl: "https://eportal.incometax.gov.in",
      });

      return items;
    }

    if (docType === "rent_agreement") {
      return [
        {
          id: "negotiate-lockin",
          text: "Negotiate lock-in period so it matches or remains shorter than your notice period.",
          urgency: severity === "critical" || severity === "high" ? "urgent" : "recommended",
        },
        {
          id: "forfeiture-clause",
          text: "Amend forfeiture clause to limit deductions strictly to substantiated physical damage.",
          urgency: "urgent",
        },
        {
          id: "registration-check",
          text: "If tenure is 12 months or longer, execute registered lease deed at Sub-Registrar office.",
          urgency: "recommended",
        },
        {
          id: "inventory-photo",
          text: "Document handover inventory with timestamped photos and signed inspection sheet.",
          urgency: "optional",
        },
      ];
    }

    if (docType === "statutory_form") {
      return [
        {
          id: "check-eligibility",
          text: "Verify statutory eligibility and rules for this form on the Income Tax e-filing portal.",
          urgency: "urgent",
          linkText: "e-Filing portal",
          linkUrl: "https://eportal.incometax.gov.in",
        },
        {
          id: "gather-certificates",
          text: "Collect required certifications, project budgets, and institutional approvals.",
          urgency: "recommended",
        },
        {
          id: "complete-blanks",
          text: "Fill in all sponsor and assessee details, ensuring valid PAN and official designations.",
          urgency: "recommended",
        },
        {
          id: "consult-ca",
          text: "Have your Chartered Accountant review the completed form before submission to the Prescribed Authority.",
          urgency: "optional",
        },
      ];
    }

    return [
      {
        id: "consult-expert",
        text: "Review the full physical contract with legal counsel prior to execution.",
        urgency: "recommended",
      },
    ];
  };

  const items = getActionItems();
  const completedCount = items.filter((item) => checkedIds.has(item.id)).length;

  return (
    <div className="stationery-sheet p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-ink)]">
            Recommended next steps
          </h3>
          <p className="text-[11px] text-[var(--color-muted)]">
            Things you should do to handle this document on time
          </p>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink-2)]">
          {completedCount} of {items.length} done
        </span>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const isChecked = checkedIds.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3 rounded-[var(--radius-input)] border text-xs cursor-pointer transition-colors flex items-start gap-3 ${
                isChecked
                  ? "bg-[var(--color-paper-2)] border-[var(--color-rule)] opacity-70"
                  : "bg-[var(--color-cotton)] border-[var(--color-rule)] hover:border-[var(--color-rule-2)]"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {}}
                className="mt-0.5 rounded border-[var(--color-rule-2)] text-[var(--color-ink)] focus:ring-[var(--color-focus)] cursor-pointer"
              />

              <div className="flex-1 space-y-1">
                <p className={`leading-relaxed ${isChecked ? "line-through text-[var(--color-muted)]" : "text-[var(--color-ink)]"}`}>
                  {item.text}
                </p>

                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      item.urgency === "urgent"
                        ? "bg-[color-mix(in_oklab,var(--color-error)_15%,var(--color-paper))] text-[var(--color-error)]"
                        : "bg-[var(--color-paper-2)] text-[var(--color-muted)]"
                    }`}
                  >
                    {item.urgency}
                  </span>

                  {item.linkText && item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[var(--color-accent-2)] hover:underline whitespace-nowrap"
                    >
                      {item.linkText} ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
