"use client";

import React from "react";
import type { Flag, Severity } from "@/lib/types";

interface ResultCardProps {
  docType: string;
  data: Record<string, any>;
  flags: Flag[];
  severity: Severity;
}

export function ResultCard({ docType, data, flags, severity }: ResultCardProps) {
  const isTax = docType === "income_tax_notice";
  const isRent = docType === "rent_agreement";
  const isForm = docType === "statutory_form";
  const isLoan = docType === "loan_sanction";
  const isGST = docType === "gst_notice";
  const isMSME = docType === "msme_contract";
  const isGeneral = docType === "unsupported";
  const isBlank = data.is_blank_template ?? (isForm ? true : false);

  const getStampText = () => {
    if (isForm) {
      if (isBlank) return "EMPTY STATUTORY TEMPLATE";
      return "STATUTORY FILING FORM";
    }

    if (isGeneral) {
      return "GENERAL DOCUMENT";
    }

    if (isLoan) {
      if (flags.some((f) => f.flag_id === "prohibited_foreclosure_fee")) {
        return "PROHIBITED FORECLOSURE FEE DETECTED";
      }
      if (flags.some((f) => f.flag_id === "missing_apr_kfs_violation")) {
        return "MISSING APR IN KFS";
      }
      if (severity === "critical" || severity === "high") {
        return "HIGH RISK SANCTION CLAUSE";
      }
      return "LOAN SANCTION LETTER";
    }

    if (isGST) {
      if (data.section === "74" || flags.some((f) => f.flag_id === "high_penalty_fraud_allegation")) {
        return "GST SCN SEC 74 (FRAUD ALLEGATION)";
      }
      if (data.section === "73") {
        return "GST SCN SEC 73 (STANDARD DEMAND)";
      }
      if (data.total_demand && severity === "critical") {
        return `CRITICAL DEMAND: ₹${data.total_demand.toLocaleString("en-IN")}`;
      }
      return "GST DEMAND NOTICE";
    }

    if (isMSME) {
      if (flags.some((f) => f.flag_id === "msme_statutory_credit_cap_exceeded")) {
        return "MSME 45-DAY CEILING OVERRIDE";
      }
      if (flags.some((f) => f.flag_id === "section_43b_h_tax_disallowance_risk")) {
        return "SEC 43B(h) TAX DISALLOWANCE RISK";
      }
      return "MSME COMMERCIAL INVOICE";
    }

    if (isTax) {
      if (data.refund_amount) {
        return `REFUND APPROVED: ₹${data.refund_amount.toLocaleString("en-IN")}`;
      }
      if (data.demand_amount) {
        if (severity === "critical") {
          return `CRITICAL DEMAND: ₹${data.demand_amount.toLocaleString("en-IN")}`;
        }
        return `TAX DEMAND: ₹${data.demand_amount.toLocaleString("en-IN")}`;
      }
      return "INQUIRY NOTICE";
    }

    if (isRent) {
      if (severity === "critical" || severity === "high") {
        return "HIGH RISK CLAUSE DETECTED";
      }
      return "STANDARD RENT AGREEMENT";
    }

    return "DOCUMENT REVIEWED";
  };

  const getStampColor = () => {
    if (isForm && isBlank) {
      return "border-[var(--color-ink-2)] text-[var(--color-ink)] bg-[var(--color-paper-2)]";
    }
    switch (severity) {
      case "critical":
        return "border-[var(--color-error)] text-[var(--color-error)] bg-[color-mix(in_oklab,var(--color-error)_8%,var(--color-paper))]";
      case "high":
        return "border-[var(--color-accent-2)] text-[var(--color-accent-2)] bg-[color-mix(in_oklab,var(--color-accent-2)_8%,var(--color-paper))]";
      case "medium":
        return "border-[var(--color-ink-2)] text-[var(--color-ink)] bg-[var(--color-paper-2)]";
      default:
        return "border-[var(--color-success)] text-[var(--color-success)] bg-[color-mix(in_oklab,var(--color-success)_8%,var(--color-paper))]";
    }
  };

  const printedSection = data.notice_section_printed || data.rule_or_section;
  const mappedSection = data.notice_section_mapped;

  return (
    <div className="stationery-sheet p-6 space-y-6">
      {/* Top Bar with Document Name and Status Stamp */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[var(--color-rule)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-muted)]">
              {isTax
                ? "Income Tax"
                : isRent
                ? "Rent Agreement"
                : isForm
                ? isBlank
                  ? "Statutory Form (Template)"
                  : "Statutory Form"
                : isLoan
                ? "Loan Sanction & KFS"
                : isGST
                ? "GST Notice (DRC-01)"
                : isMSME
                ? "MSME Commercial Invoice"
                : "General Document"}
            </span>
            {data.pan_masked && (
              <span className="text-xs text-[var(--color-muted)] font-mono">
                PAN: {data.pan_masked}
              </span>
            )}
            {data.din_number && (
              <span className="text-xs text-[var(--color-muted)] font-mono">
                · DIN: {data.din_number}
              </span>
            )}
            {data.gstin_masked && (
              <span className="text-xs text-[var(--color-muted)] font-mono">
                · GSTIN: {data.gstin_masked}
              </span>
            )}
            {data.supplier_udyam_number && (
              <span className="text-xs text-[var(--color-muted)] font-mono">
                · Udyam: {data.supplier_udyam_number}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-ink)] tracking-tight">
            {isTax
              ? data.notice_type_name || "Income Tax Notice"
              : isRent
              ? "Residential Rental Agreement"
              : isForm
              ? data.form_name || "Statutory Form"
              : isLoan
              ? data.lender_name
                ? `${data.lender_name} Loan Sanction`
                : "Loan Sanction & KFS Letter"
              : isGST
              ? data.notice_title || (data.form_type ? `${data.form_type} Notice` : "GST Show Cause Notice")
              : isMSME
              ? data.invoice_number
                ? `Commercial Invoice #${data.invoice_number}`
                : "MSME Commercial Invoice"
              : data.title || data.notice_type_name || "Document Overview"}
          </h2>
          <p className="text-xs text-[var(--color-muted)]">
            {isTax && data.assessment_year ? `Assessment Year ${data.assessment_year}` : ""}
            {isRent && data.property_address ? `Property: ${data.property_address}` : ""}
            {isForm && (
              <>
                {printedSection ? `Governed under ${printedSection} · ` : ""}
                {data.act_name || "Income-tax Rules"}
                {isBlank ? " · Unfilled blank format" : " · Filled form"}
              </>
            )}
            {isLoan && (
              <>
                {data.sanction_date ? `Sanction Date: ${data.sanction_date} · ` : ""}
                {data.loan_type ? `${String(data.loan_type).replace(/_/g, " ").toUpperCase()} · ` : ""}
                {data.interest_type ? `${String(data.interest_type).toUpperCase()} Rate` : ""}
                {data.application_reference_no ? ` · Ref: ${data.application_reference_no}` : ""}
              </>
            )}
            {isGST && (
              <>
                {data.section ? `Under Section ${data.section} · ` : ""}
                {data.financial_year ? `FY ${data.financial_year} · ` : ""}
                {data.notice_reference_no ? `Ref: ${data.notice_reference_no}` : ""}
              </>
            )}
            {isMSME && (
              <>
                {data.supplier_name ? `Supplier: ${data.supplier_name} · ` : ""}
                {data.buyer_name ? `Buyer: ${data.buyer_name} · ` : ""}
                {data.supplier_enterprise_type ? `Category: ${String(data.supplier_enterprise_type).toUpperCase()}` : ""}
              </>
            )}
            {isGeneral && (data.summary || "General document")}
            {data.issuing_authority ? ` · Authority: ${data.issuing_authority}` : ""}
          </p>
        </div>

        {/* Letterpress Stamp */}
        <div className={`px-3 py-1.5 rounded-[var(--radius-input)] border font-mono font-semibold text-xs tracking-tight shadow-xs ${getStampColor()}`}>
          {getStampText()}
        </div>
      </div>

      {/* Statutory Section Concordance Card (1961 Act ↔ 2025 Act) */}
      {(isTax || isForm) && printedSection && (
        <div className="letterpress-card p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-muted)] pb-1 border-b border-[var(--color-rule)]">
            <span>Statutory section breakdown (Old vs New Law)</span>
            <span>Official ICAI mapping</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Section printed on your document:</span>
              <p className="font-mono font-semibold text-sm text-[var(--color-ink)]">
                u/s {printedSection} (1961 Act / Rules)
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Equivalent section in new 2025 Act:</span>
              <p className="font-mono font-semibold text-sm text-[var(--color-accent-2)]">
                u/s {mappedSection || "Corresponding Provision"} (2025 Act)
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-muted)] leading-relaxed pt-1">
            India introduced the new Income Tax Act 2025 on 1 April 2026, renumbering sections. DastaaVault maps both old and new numbers so you know exactly which section applies to your document.
          </p>
        </div>
      )}

      {/* Banking & Credit Statutory Safeguards Card */}
      {isLoan && (
        <div className="letterpress-card p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-muted)] pb-1 border-b border-[var(--color-rule)]">
            <span>RBI Consumer Protection Safeguards</span>
            <span>Master Directions &amp; Circulars</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Foreclosure Penalty:</span>
              <p className="font-mono font-semibold text-xs text-[var(--color-ink)]">
                0% on Floating Individual Loans (RBI 2014)
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Key Fact Statement (KFS):</span>
              <p className="font-mono font-semibold text-xs text-[var(--color-accent-2)]">
                Mandatory APR disclosure (w.e.f. Oct 2024)
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Title Deed Return:</span>
              <p className="font-mono font-semibold text-xs text-[var(--color-ink)]">
                Within 30 days or ₹5,000/day compensation
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-muted)] leading-relaxed pt-1">
            Under RBI Master Circulars, lenders cannot charge prepayment or foreclosure penalties on floating-rate term loans to individual borrowers, and all fees must appear in the Key Fact Statement.
          </p>
        </div>
      )}

      {/* GST Legal Defense Framework Card */}
      {isGST && (
        <div className="letterpress-card p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-muted)] pb-1 border-b border-[var(--color-rule)]">
            <span>CGST Act Statutory Defense Framework</span>
            <span>Sections 73, 74 &amp; 75(4)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Governing Section:</span>
              <p className="font-mono font-semibold text-xs text-[var(--color-ink)]">
                {data.section === "74" ? "Section 74 (Fraud / Suppression)" : "Section 73 (Non-Fraud / General)"}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Statutory Penalty:</span>
              <p className="font-mono font-semibold text-xs text-[var(--color-accent-2)]">
                {data.section === "74" ? "100% of tax evaded (Severe)" : "10% of tax (Min ₹10,000)"}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Personal Hearing Right:</span>
              <p className="font-mono font-semibold text-xs text-[var(--color-ink)]">
                {data.personal_hearing_offered ? "Offered in SCN" : "Mandatory u/s 75(4) (Missing)"}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-muted)] leading-relaxed pt-1">
            Section 75(4) of the CGST Act mandates that an opportunity of hearing SHALL be granted where an adverse decision is contemplated or where requested in writing by the taxpayer.
          </p>
        </div>
      )}

      {/* MSME & Income Tax Section 43B(h) Protections Card */}
      {isMSME && (
        <div className="letterpress-card p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-muted)] pb-1 border-b border-[var(--color-rule)]">
            <span>MSMED Act 2006 &amp; Section 43B(h) Protections</span>
            <span>Statutory Commercial Moat</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Max Credit Window:</span>
              <p className="font-mono font-semibold text-xs text-[var(--color-ink)]">
                45 Days Statutory Ceiling (Sec 15)
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Penal Interest Rate:</span>
              <p className="font-mono font-semibold text-xs text-[var(--color-accent-2)]">
                3x RBI Bank Rate (19.5% p.a. monthly compound)
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--color-muted)]">Buyer Tax Impact:</span>
              <p className="font-mono font-semibold text-xs text-[var(--color-ink)]">
                Sec 43B(h) Expense Disallowed if unpaid
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-muted)] leading-relaxed pt-1">
            Section 15 of MSMED Act overrides any contractual agreement specifying longer credit. Section 24 provides complete statutory priority over all other general laws.
          </p>
        </div>
      )}

      {/* 4-Metric Key Figures Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Financial Amount */}
        <div className="letterpress-card p-3 space-y-1">
          <span className="text-[11px] text-[var(--color-muted)] font-mono">
            {isLoan
              ? "Sanctioned amount"
              : isGST
              ? "Tax demand due"
              : isMSME
              ? "Total invoice value"
              : isForm
              ? "Tax demand"
              : isTax
              ? data.refund_amount
                ? "Refund amount"
                : "Tax amount due"
              : isRent
              ? "Monthly rent"
              : "Amount recorded"}
          </span>
          <p className="font-mono font-semibold text-base sm:text-lg text-[var(--color-ink)]">
            {isLoan ? (
              data.sanctioned_amount ? (
                `₹${data.sanctioned_amount.toLocaleString("en-IN")}`
              ) : (
                "Not stated"
              )
            ) : isGST ? (
              data.total_demand || data.tax_amount ? (
                `₹${(data.total_demand || data.tax_amount).toLocaleString("en-IN")}`
              ) : (
                "₹0 (Nil)"
              )
            ) : isMSME ? (
              data.total_amount ? (
                `₹${data.total_amount.toLocaleString("en-IN")}`
              ) : (
                "₹0 (Nil)"
              )
            ) : isForm ? (
              isBlank ? "₹0 (Template)" : "₹0"
            ) : isTax ? (
              data.refund_amount ? (
                `₹${data.refund_amount.toLocaleString("en-IN")}`
              ) : data.demand_amount ? (
                `₹${data.demand_amount.toLocaleString("en-IN")}`
              ) : (
                "₹0 (Nil)"
              )
            ) : isRent ? (
              data.monthly_rent ? `₹${data.monthly_rent.toLocaleString("en-IN")}` : "Not stated"
            ) : data.amount_due || data.demand_amount ? (
              `₹${(data.amount_due || data.demand_amount).toLocaleString("en-IN")}`
            ) : (
              "Nil"
            )}
          </p>
          <span className="text-[10px] text-[var(--color-muted)] block truncate">
            {isLoan
              ? data.interest_type
                ? `${String(data.interest_type).toUpperCase()} rate loan`
                : "Principal sanctioned"
              : isGST
              ? data.penalty_amount
                ? `Penalty: ₹${data.penalty_amount.toLocaleString("en-IN")}`
                : "Plus statutory interest"
              : isMSME
              ? data.tax_amount
                ? `Incl. GST ₹${data.tax_amount.toLocaleString("en-IN")}`
                : "Payable to supplier"
              : isForm
              ? isBlank
                ? "No liability assessed"
                : "Statutory format"
              : isTax
              ? data.refund_amount
                ? "Will be refunded to bank"
                : data.demand_amount
                ? "Payable before deadline"
                : "No tax payable"
              : isRent && data.security_deposit
              ? `Security deposit: ₹${data.security_deposit.toLocaleString("en-IN")}`
              : "Check terms"}
          </span>
        </div>

        {/* Metric 2: Deadline / Rate / Term */}
        <div className="letterpress-card p-3 space-y-1">
          <span className="text-[11px] text-[var(--color-muted)] font-mono">
            {isLoan
              ? "Interest & APR"
              : isGST
              ? "Filing window"
              : isMSME
              ? "Payment term"
              : isForm
              ? "Filing window"
              : isTax
              ? "Last date to respond"
              : isRent
              ? "Notice period"
              : "Due date"}
          </span>
          <p className="font-mono font-semibold text-base sm:text-lg text-[var(--color-ink)] truncate">
            {isLoan ? (
              data.annualized_percentage_rate ? (
                `APR ${data.annualized_percentage_rate}%`
              ) : data.interest_rate_percent ? (
                `${data.interest_rate_percent}% p.a.`
              ) : (
                "Check terms"
              )
            ) : isGST ? (
              data.reply_deadline || "Within 30 days"
            ) : isMSME ? (
              data.agreed_credit_days ? (
                `${Math.min(data.agreed_credit_days, 45)} days cap`
              ) : (
                "15 days default"
              )
            ) : isForm ? (
              data.response_deadline || "As per rules"
            ) : isTax ? (
              data.response_deadline || "As per notice"
            ) : isRent ? (
              data.notice_period_months ? `${data.notice_period_months} months` : "Not stated"
            ) : (
              data.due_date || "N/A"
            )}
          </p>
          <span className="text-[10px] text-[var(--color-muted)] block truncate">
            {isLoan
              ? data.emi_amount
                ? `EMI: ₹${data.emi_amount.toLocaleString("en-IN")}/mo`
                : "Monthly repayment"
              : isGST
              ? data.days_remaining !== undefined && data.days_remaining !== null
                ? `${data.days_remaining} days left in IST`
                : "File Form DRC-06"
              : isMSME
              ? data.agreed_credit_days && data.agreed_credit_days > 45
                ? `Clause of ${data.agreed_credit_days}d VOID`
                : "MSMED Sec 15 limit"
              : isForm
              ? isBlank
                ? "Prior to ITR / filing"
                : "Check tax calendar"
              : isTax && data.days_remaining !== undefined && data.days_remaining !== null
              ? `${data.days_remaining} days left in IST`
              : isRent && data.lock_in_months
              ? `Lock-in: ${data.lock_in_months} months`
              : "Statutory schedule"}
          </span>
        </div>

        {/* Metric 3: Authentication / Authority / Tenor */}
        <div className="letterpress-card p-3 space-y-1">
          <span className="text-[11px] text-[var(--color-muted)] font-mono">
            {isLoan
              ? "Tenure & Lender"
              : isGST
              ? "Notice Authority"
              : isMSME
              ? "Overdue & Interest"
              : isForm
              ? "Prescribed authority"
              : isTax
              ? "Issuing office"
              : isRent
              ? "Tenure"
              : "Authority"}
          </span>
          <p className="font-mono font-semibold text-sm sm:text-base text-[var(--color-ink)] truncate">
            {isLoan ? (
              data.tenure_months ? (
                `${data.tenure_months} months`
              ) : (
                data.lender_name || "Lender"
              )
            ) : isGST ? (
              data.issuing_authority || "State/Central GST Dept"
            ) : isMSME ? (
              data.days_overdue && data.days_overdue > 0 ? (
                `${data.days_overdue} days overdue`
              ) : (
                "In terms"
              )
            ) : isForm ? (
              data.issuing_authority || "Income Tax Department"
            ) : isTax ? (
              data.issuing_authority || "Income Tax Department"
            ) : isRent ? (
              data.duration_months ? `${data.duration_months} months` : "Not stated"
            ) : (
              data.issuing_authority || "Issuer"
            )}
          </p>
          <span className="text-[10px] text-[var(--color-muted)] block truncate">
            {isLoan
              ? data.lender_name || "Authorized Lender"
              : isGST
              ? data.personal_hearing_offered
                ? "Hearing scheduled"
                : "No hearing listed (Sec 75(4))"
              : isMSME
              ? data.days_overdue && data.days_overdue > 0
                ? "19.5% p.a. penal interest"
                : "Zero interest accrued"
              : isForm
              ? isBlank
                ? "Blank template"
                : "Statutory record"
              : isTax && data.din_number
              ? "Official DIN verified"
              : isRent && data.duration_months && data.duration_months >= 12
              ? "Registration compulsory"
              : "Official record"}
          </span>
        </div>

        {/* Metric 4: Severity & Risk Rating */}
        <div className="letterpress-card p-3 space-y-1">
          <span className="text-[11px] text-[var(--color-muted)] font-mono">
            Risk rating
          </span>
          <p className="font-mono font-semibold text-base sm:text-lg text-[var(--color-ink)] capitalize">
            {isForm && isBlank
              ? "Informational"
              : severity === "critical"
              ? "Urgent attention"
              : severity === "high"
              ? "High attention"
              : severity === "medium"
              ? "Medium attention"
              : "Low risk"}
          </p>
          <span className="text-[10px] text-[var(--color-muted)] block truncate">
            {flags.length} {flags.length === 1 ? "check flagged" : "checks flagged"}
          </span>
        </div>
      </div>

      {/* Verification Flags Section */}
      {flags && flags.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-[var(--color-ink)]">
            Important checks &amp; warnings
          </h3>

          <div className="space-y-2">
            {flags.map((flag, index) => {
              const isWarning = flag.severity === "warning";
              const flagBg = isWarning
                ? "bg-[color-mix(in_oklab,var(--color-accent-2)_8%,var(--color-paper))] border-[var(--color-accent-2)]"
                : "bg-[var(--color-paper-2)] border-[var(--color-rule)]";

              return (
                <div
                  key={index}
                  className={`p-3 rounded-[var(--radius-input)] border text-xs space-y-1.5 ${flagBg}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-[var(--color-ink)]">
                      {flag.title}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--color-cotton)] border border-[var(--color-rule)] text-[var(--color-muted)] shrink-0">
                      {flag.flag_id}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--color-ink-2)] leading-relaxed">
                    {flag.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
