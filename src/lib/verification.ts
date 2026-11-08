/**
 * @module verification
 * @description Rule-based verification checks that run entirely in code
 * (no model calls). Produces flags and adjusts severity based on
 * deterministic business rules.
 */

import type { IncomeTaxNoticeData, RentAgreementData } from "./schemas.ts";
import type { Flag, VerificationResult, Severity } from "./types.ts";
import { lookupSection } from "./section-mapping.ts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Promote severity to a higher level (critical > high > medium > low). */
function promoteSeverity(current: Severity, candidate: Severity): Severity {
  const order: Record<Severity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return order[candidate] > order[current] ? candidate : current;
}

/** Build a Flag object. */
function flag(
  id: string,
  severity: "warning" | "info",
  title: string,
  detail: string
): Flag {
  return { flag_id: id, severity, title, detail };
}

// ─── Income Tax Notice ───────────────────────────────────────────────────────

/**
 * Run all rule-based checks on an extracted Income Tax Notice.
 *
 * @param notice - Parsed extraction result (matches `IncomeTaxNoticeSchema`).
 * @returns Verification result with flags and final severity.
 */
export function verifyITNotice(notice: IncomeTaxNoticeData): VerificationResult {
  const flags: Flag[] = [];
  let severity: Severity = notice.severity ?? "low";

  // ── Deadline checks ─────────────────────────────────────────────────────

  if (notice.days_remaining !== null && notice.days_remaining <= 3 && notice.days_remaining >= 0) {
    flags.push(
      flag(
        "urgent_deadline",
        "warning",
        "Deadline is imminent",
        `Only ${notice.days_remaining} day(s) remaining to respond. Act immediately.`
      )
    );
    severity = promoteSeverity(severity, "high");
  }

  if (notice.days_remaining !== null && notice.days_remaining < 0) {
    flags.push(
      flag(
        "deadline_passed",
        "warning",
        "Deadline has passed",
        `The response deadline appears to have passed ${Math.abs(notice.days_remaining)} day(s) ago. Consult a tax professional urgently.`
      )
    );
    severity = promoteSeverity(severity, "critical");
  }

  // ── Demand amount checks ────────────────────────────────────────────────

  if (notice.demand_amount !== null && notice.demand_amount > 100_000) {
    flags.push(
      flag(
        "high_demand",
        "warning",
        "High demand amount",
        `Demand of ₹${notice.demand_amount.toLocaleString("en-IN")} exceeds ₹1,00,000. Consider professional assistance.`
      )
    );
    severity = promoteSeverity(severity, "critical");
  } else if (
    notice.demand_amount !== null &&
    notice.demand_amount > 50_000 &&
    notice.demand_amount <= 100_000
  ) {
    flags.push(
      flag(
        "moderate_demand",
        "warning",
        "Significant demand amount",
        `Demand of ₹${notice.demand_amount.toLocaleString("en-IN")} is significant. Review carefully.`
      )
    );
    severity = promoteSeverity(severity, "high");
  }

  // ── Prosecution / criminal language ─────────────────────────────────────

  const prosecutionPattern = /prosecut|criminal|court\s*summon/i;
  const hasProsecutionClaim = notice.key_claims.some((c) =>
    prosecutionPattern.test(c)
  );
  if (hasProsecutionClaim) {
    flags.push(
      flag(
        "prosecution_risk",
        "warning",
        "Prosecution / criminal proceedings mentioned",
        "The notice contains language about prosecution or criminal proceedings. Seek legal counsel immediately."
      )
    );
    severity = promoteSeverity(severity, "critical");
  }

  // ── DIN number check ───────────────────────────────────────────────────

  if (!notice.din_number) {
    flags.push(
      flag(
        "no_din",
        "warning",
        "No DIN number found",
        "A valid Income Tax notice should carry a Document Identification Number (DIN). Verify the authenticity of this notice on the e-filing portal."
      )
    );
  }

  // ── Section mapping enrichment ──────────────────────────────────────────

  const sectionLookup = lookupSection(notice.notice_section_printed);
  if (sectionLookup) {
    const otherAct =
      sectionLookup.matched_act === "1961"
        ? `Section ${sectionLookup.new} (2025 Act)`
        : `Section ${sectionLookup.old} (1961 Act)`;
    flags.push(
      flag(
        "section_mapped",
        "info",
        "Section mapping found",
        `${notice.notice_section_printed} maps to ${otherAct} — "${sectionLookup.name}".`
      )
    );

    // Typical deadline fallback
    if (
      notice.response_deadline === null &&
      sectionLookup.typical_deadline_days !== null
    ) {
      flags.push(
        flag(
          "typical_deadline_fallback",
          "info",
          "Typical deadline applied",
          `No explicit deadline found in the notice. A typical response window for this section is ${sectionLookup.typical_deadline_days} days from the issue date.`
        )
      );
    }
  }

  return { flags, severity };
}

// ─── Rent Agreement ──────────────────────────────────────────────────────────

/**
 * Run all rule-based checks on an extracted Rent Agreement.
 *
 * @param agreement - Parsed extraction result (matches `RentAgreementSchema`).
 * @returns Verification result with flags and final severity.
 */
export function verifyRentAgreement(
  agreement: RentAgreementData
): VerificationResult {
  const flags: Flag[] = [];
  let severity: Severity = "low";

  // ── Lock-in vs notice period ────────────────────────────────────────────

  if (
    agreement.lock_in_months !== null &&
    agreement.notice_period_months !== null &&
    agreement.lock_in_months > agreement.notice_period_months
  ) {
    flags.push(
      flag(
        "lock_in_gt_notice",
        "warning",
        "Lock-in exceeds notice period",
        `Lock-in period (${agreement.lock_in_months} months) is longer than the notice period (${agreement.notice_period_months} months). You cannot exit the lease early even with notice during the lock-in.`
      )
    );
    severity = promoteSeverity(severity, "medium");
  }

  // ── Escalation percentage ───────────────────────────────────────────────

  if (agreement.escalation_pct !== null && agreement.escalation_pct > 10) {
    flags.push(
      flag(
        "high_escalation",
        "warning",
        "High rent escalation",
        `Annual escalation of ${agreement.escalation_pct}% is above the typical 5-10% range. Negotiate if possible.`
      )
    );
    severity = promoteSeverity(severity, "medium");
  }

  // ── Registration requirement ────────────────────────────────────────────

  if (
    agreement.duration_months !== null &&
    agreement.duration_months >= 12 &&
    agreement.registration_required !== true
  ) {
    flags.push(
      flag(
        "needs_registration",
        "warning",
        "Registration may be required",
        `Agreements of 12 months or longer generally require registration under the Registration Act. This agreement does not mention registration.`
      )
    );
    severity = promoteSeverity(severity, "high");
  }

  // ── Excessive deposit ──────────────────────────────────────────────────

  if (
    agreement.security_deposit !== null &&
    agreement.monthly_rent !== null &&
    agreement.monthly_rent > 0 &&
    agreement.security_deposit > agreement.monthly_rent * 10
  ) {
    flags.push(
      flag(
        "excessive_deposit",
        "warning",
        "Excessive security deposit",
        `Security deposit (₹${agreement.security_deposit.toLocaleString("en-IN")}) exceeds 10× the monthly rent (₹${agreement.monthly_rent.toLocaleString("en-IN")}). This is unusually high.`
      )
    );
    severity = promoteSeverity(severity, "high");
  }

  // ── No notice period ───────────────────────────────────────────────────

  if (
    agreement.notice_period_months === null ||
    agreement.notice_period_months === 0
  ) {
    flags.push(
      flag(
        "no_notice_period",
        "info",
        "No notice period specified",
        "The agreement does not specify a notice period for termination. This may lead to disputes."
      )
    );
  }

  // ── One-sided termination (check model flags) ──────────────────────────

  if (agreement.flags && agreement.flags.length > 0) {
    const oneSided = agreement.flags.find(
      (f) =>
        f.flag_id === "one_sided_termination" ||
        /one.?sided.*terminat/i.test(f.title) ||
        /one.?sided.*terminat/i.test(f.detail)
    );
    if (oneSided) {
      flags.push(
        flag(
          "one_sided_termination",
          "warning",
          "One-sided termination clause",
          "The agreement appears to allow termination by only one party without equivalent rights for the other. Review carefully."
        )
      );
      severity = promoteSeverity(severity, "medium");
    }
  }

  return { flags, severity };
}

// ─── Statutory Form / Blank Template Verification ─────────────────────────────

/**
 * Run verification checks on an Indian statutory form or blank template.
 *
 * @param formData - Extracted statutory form information.
 * @returns Verification result with informational flags and low severity.
 */
export function verifyStatutoryForm(formData: Record<string, any>): VerificationResult {
  const flags: Flag[] = [];
  const isBlank = formData.is_blank_template ?? true;

  if (isBlank) {
    flags.push(
      flag(
        "blank_template",
        "info",
        "Empty / blank statutory template detected",
        "This document is an unfilled statutory form format. It carries no pending personal tax demand, penalty, or tax liability."
      )
    );
  }

  const sec = formData.rule_or_section || formData.notice_section_printed;
  if (sec) {
    flags.push(
      flag(
        "statutory_basis",
        "info",
        `Governed under ${sec}`,
        formData.purpose || "Official statutory filing format under Indian tax and corporate law."
      )
    );

    const lookup = lookupSection(sec);
    if (lookup) {
      const otherAct =
        lookup.matched_act === "1961"
          ? `Section ${lookup.new} (2025 Act)`
          : `Section ${lookup.old} (1961 Act)`;
      flags.push(
        flag(
          "section_mapped",
          "info",
          "Section cross-mapping identified",
          `${sec} maps to ${otherAct} — "${lookup.name}".`
        )
      );
    }
  }

  if (
    formData.key_requirements &&
    Array.isArray(formData.key_requirements) &&
    formData.key_requirements.length > 0
  ) {
    flags.push(
      flag(
        "completion_requirements",
        "info",
        "Filing prerequisites",
        `Key components required: ${formData.key_requirements.slice(0, 3).join("; ")}.`
      )
    );
  }

  return { flags, severity: "low" };
}

// ─── General / Non-Assessment Document Verification ───────────────────────────

/**
 * Run verification checks on a general or non-assessment document.
 *
 * @param docData - Extracted document details.
 * @returns Verification result with informational flags.
 */
export function verifyGeneralDoc(docData: Record<string, any>): VerificationResult {
  const flags: Flag[] = [
    flag(
      "general_overview",
      "info",
      "General document overview",
      docData.summary ||
        "This document is outside income tax notice or rent agreement jurisdiction. Informational summary generated."
    ),
  ];

  if (docData.amount_due) {
    flags.push(
      flag(
        "amount_recorded",
        "info",
        "Amount mentioned",
        `Document references an amount of ₹${docData.amount_due.toLocaleString("en-IN")}.`
      )
    );
  }

  return { flags, severity: "low" };
}

// ─── Banking: Loan Sanction & Key Fact Statement (KFS) Verification ───────────

/**
 * Run deterministic verification checks on a Loan Sanction Letter or KFS.
 *
 * @param loan - Extracted loan details.
 * @returns Verification result with flags and risk severity.
 */
export function verifyLoanSanction(loan: Record<string, any>): VerificationResult {
  const flags: Flag[] = [];
  let severity: Severity = loan.severity ?? "low";

  // Normalize aliases
  const foreclosurePct = loan.foreclosure_charge_pct ?? loan.foreclosure_fee_percent;
  const isKfs = loan.is_kfs_present ?? (loan.annual_percentage_rate !== undefined || loan.annualized_percentage_rate !== undefined);
  const apr = loan.annual_percentage_rate !== undefined ? loan.annual_percentage_rate : loan.annualized_percentage_rate;
  const interestRate = loan.interest_rate ?? loan.interest_rate_percent;
  const lien = loan.has_cross_default_lien ?? loan.has_general_lien_clause;

  // 1. Prohibited Foreclosure / Prepayment Penalty (RBI Circular DBOD.No.Dir.BC.107/13.03.00/2011-12)
  const isIndividual = loan.borrower_type !== "non_individual";
  const isFloating = loan.interest_type === "floating" || !loan.interest_type;

  const numForeclosurePct = typeof foreclosurePct === "string" ? parseFloat(foreclosurePct) : Number(foreclosurePct);
  if (isIndividual && isFloating && !isNaN(numForeclosurePct) && numForeclosurePct > 0) {
    flags.push(
      flag(
        "prohibited_foreclosure_fee",
        "warning",
        "Prohibited foreclosure fee detected",
        `Agreement specifies a ${numForeclosurePct}% foreclosure/prepayment charge. Under binding RBI Master Directions (DBOD.No.Dir.BC.107/2011-12), lenders are STRICTLY FORBIDDEN from levying foreclosure or prepayment penalties on floating-rate loans to individual borrowers.`
      )
    );
    severity = promoteSeverity(severity, "high");
  }

  // 2. Mandatory APR Disclosure in KFS (RBI Circular DOR.STR.REC.12/21.04.048/2024-25)
  if (isKfs && (apr === null || apr === undefined)) {
    flags.push(
      flag(
        "missing_apr_kfs_violation",
        "warning",
        "Mandatory APR missing from Key Fact Statement",
        "RBI's April 2024 Harmonized KFS directions mandate explicit disclosure of the Annual Percentage Rate (APR), which accounts for all interest, processing fees, and documentation costs. Any unlisted charge cannot be legally collected."
      )
    );
    severity = promoteSeverity(severity, "medium");
  } else if (apr && interestRate && apr > interestRate) {
    const diff = (apr - interestRate).toFixed(2);
    flags.push(
      flag(
        "apr_spread_cost",
        "info",
        `True APR is ${apr}% (+${diff}% effective spread)`,
        `While the headline interest rate is ${interestRate}%, your actual Annual Percentage Rate factoring in processing and bundled fees is ${apr}%.`
      )
    );
  }

  // 3. Banker's General Lien & Account Set-Off (Section 171 Indian Contract Act 1872)
  if (lien) {
    flags.push(
      flag(
        "cross_default_lien_trap",
        "warning",
        "Banker's general lien & set-off clause detected",
        "Under Section 171 of the Indian Contract Act, the lender retains a right to freeze or debit funds from your other accounts (savings, fixed deposits) with the same institution in the event of any disputed default."
      )
    );
    severity = promoteSeverity(severity, "medium");
  }

  // 4. Statutory 30-Day Collateral Return & ₹5,000/day compensation (RBI Circular DoR.MCS.REC.38/2023-24)
  flags.push(
    flag(
      "rbi_30_day_document_return_rule",
      "info",
      "Statutory 30-day original document return right",
      "Upon full repayment of this loan, the lender is legally required to return all original title deeds and release CERSAI charges within 30 calendar days. Any delay attributable to the lender entitles you to compensation of ₹5,000 for each day of delay."
    )
  );

  return { flags, severity };
}

// ─── Business: GST Show Cause Notice (Form GST DRC-01) Verification ───────────

/**
 * Run deterministic verification checks on a GST Notice (DRC-01 / DRC-01A).
 *
 * @param notice - Extracted GST notice details.
 * @returns Verification result with flags and risk severity.
 */
export function verifyGSTNotice(notice: Record<string, any>): VerificationResult {
  const flags: Flag[] = [];
  let severity: Severity = notice.severity ?? "medium";

  // Normalize aliases
  const section = notice.notice_section ?? notice.section;
  const hasHearing = Boolean(notice.has_personal_hearing || notice.personal_hearing_offered);
  const hearingDate = notice.hearing_date ?? notice.personal_hearing_date;

  // 1. Section 74 Fraud / Willful Suppression vs Section 73 Non-Fraud
  const isSection74 = section ? String(section).includes("74") : false;
  if (isSection74) {
    flags.push(
      flag(
        "high_penalty_fraud_allegation",
        "warning",
        "Issued u/s 74 (Allegation of fraud / willful suppression)",
        "Section 74 notices carry a mandatory 100% penalty on the tax amount demanded, unlike Section 73 which caps penalties at 10%. Immediate professional representation by a GST practitioner or Advocate is strongly advised."
      )
    );
    severity = promoteSeverity(severity, "critical");
  } else {
    flags.push(
      flag(
        "section_73_regular_demand",
        "info",
        "Issued u/s 73 (Non-fraud determination)",
        "Determination of tax short paid or ITC wrongly availed for reasons other than fraud or willful misstatement. Maximum penalty is typically 10% of tax demanded."
      )
    );
  }

  // 2. Mandatory Personal Hearing Check (Section 75(4) CGST Act 2017)
  if (!hasHearing && !hearingDate) {
    flags.push(
      flag(
        "procedural_hearing_omission",
        "warning",
        "No personal hearing scheduled (Section 75(4) violation)",
        "Under Section 75(4) of the CGST Act, an adverse demand order cannot be passed without granting an opportunity of a personal hearing. Failure by the department to schedule a hearing makes subsequent orders procedurally vulnerable in High Courts."
      )
    );
    severity = promoteSeverity(severity, "medium");
  } else if (hearingDate) {
    flags.push(
      flag(
        "personal_hearing_scheduled",
        "info",
        `Personal hearing scheduled on ${hearingDate}`,
        "Attend or file a written submission in Form GST DRC-06 prior to this date."
      )
    );
  }

  // 3. Response Deadline & Countdown
  if (notice.days_remaining !== null && notice.days_remaining !== undefined) {
    if (notice.days_remaining <= 5 && notice.days_remaining >= 0) {
      flags.push(
        flag(
          "urgent_gst_deadline",
          "warning",
          "GST response deadline is imminent",
          `Only ${notice.days_remaining} day(s) remaining to file reply in Form GST DRC-06 before an adverse order in Form GST DRC-07 is issued.`
        )
      );
      severity = promoteSeverity(severity, "critical");
    } else if (notice.days_remaining < 0) {
      flags.push(
        flag(
          "gst_deadline_passed",
          "warning",
          "GST response window has elapsed",
          `The 30-day response window expired ${Math.abs(notice.days_remaining)} day(s) ago. Check portal immediately for Form GST DRC-07 demand order.`
        )
      );
      severity = promoteSeverity(severity, "critical");
    } else {
      flags.push(
        flag(
          "gst_response_window",
          "info",
          "30-day statutory response window",
          `You have ${notice.days_remaining} days remaining to submit your reply in Form GST DRC-06.`
        )
      );
    }
  }

  // 4. Portal Summary vs Detailed SCN Annexure Trap
  flags.push(
    flag(
      "drc01_summary_trap",
      "info",
      "Crucial: Request detailed factual SCN Annexure",
      "Form GST DRC-01 on the portal is merely an automated electronic summary. Ensure your legal reply addresses the full factual Show Cause Notice and reconciliation tables attached as PDF annexures."
    )
  );

  return { flags, severity };
}

// ─── Business: MSME Invoice & Contract Verification ───────────────────────────

/**
 * Run deterministic verification checks on an MSME B2B Contract / Invoice.
 *
 * @param invoice - Extracted invoice details.
 * @returns Verification result with flags and risk severity.
 */
export function verifyMSMEContract(invoice: Record<string, any>): VerificationResult {
  const flags: Flag[] = [];
  let severity: Severity = invoice.severity ?? "low";

  // 1. Section 15 MSMED Act 45-Day Statutory Override
  const maxAllowed = invoice.has_written_agreement !== false ? 45 : 15;
  if (invoice.agreed_credit_days && invoice.agreed_credit_days > maxAllowed) {
    flags.push(
      flag(
        "msme_statutory_credit_cap_exceeded",
        "warning",
        `Credit period overrides contract (Capped to ${maxAllowed} days)`,
        `Your agreement/invoice states ${invoice.agreed_credit_days} credit days. Under Section 15 of the MSMED Act 2006, payment terms to Micro and Small enterprises cannot exceed ${maxAllowed} days under any circumstance. Any contractual clause exceeding this limit is void ab initio.`
      )
    );
    severity = promoteSeverity(severity, "high");
  }

  // 2. Section 16 Penal Compound Interest @ 3x RBI Bank Rate
  if (invoice.days_overdue && invoice.days_overdue > 0) {
    const rbiRate = 6.5; // current RBI bank rate
    const penalRate = (rbiRate * 3).toFixed(1); // 19.5%
    flags.push(
      flag(
        "msme_penal_interest_entitlement",
        "info",
        `Compound penal interest @ ${penalRate}% p.a. due`,
        `Under Section 16 of the MSMED Act, the buyer is legally obligated to pay compound interest with monthly rests at 3× the RBI bank rate (${penalRate}% p.a.) for ${invoice.days_overdue} overdue days. This interest cannot be claimed as a tax deduction by the buyer under Section 23.`
      )
    );
    severity = promoteSeverity(severity, "high");
  }

  // 3. Income Tax Section 43B(h) Disallowance Risk
  const category = invoice.enterprise_category ?? invoice.supplier_enterprise_type;
  const isMSE = category !== "medium";
  if (isMSE && (invoice.payment_status === "unpaid" || (invoice.days_overdue && invoice.days_overdue > 0))) {
    flags.push(
      flag(
        "section_43b_h_tax_disallowance_risk",
        "warning",
        "Section 43B(h) Income Tax expense disallowance alert",
        "Under Section 43B(h) of the Income Tax Act (effective AY 2024-25), if a buyer fails to clear an MSE vendor bill within statutory timelines, the expense is completely DISALLOWED from the buyer's tax deductions at financial year-end, directly increasing their taxable income."
      )
    );
    severity = promoteSeverity(severity, "high");
  }

  return { flags, severity };
}


// ─── Real Estate: Property Conveyance & Builder-Buyer Agreement (RERA) ────────

/**
 * Run deterministic verification checks on a Real Estate Conveyance / Builder-Buyer Agreement.
 *
 * @param contract - Extracted property agreement details.
 * @returns Verification result with flags and risk severity.
 */
export function verifyPropertyContract(contract: Record<string, any>): VerificationResult {
  const flags: Flag[] = [];
  let severity: Severity = contract.severity ?? "low";

  // 1. Supreme Court Suraj Lamp Judgment (2011 11 SCC 787) — GPA Ownership Ban
  const isGpaSale =
    contract.is_gpa_or_power_of_attorney_sale === true ||
    contract.mentions_gpa_or_power_of_attorney === true ||
    contract.agreement_type === "gpa_transfer" ||
    (contract.transfer_mode && String(contract.transfer_mode).toLowerCase().includes("power of attorney")) ||
    (contract.conveyance_type && String(contract.conveyance_type).toLowerCase().includes("gpa"));

  if (isGpaSale) {
    flags.push(
      flag(
        "suraj_lamp_gpa_ownership_ban",
        "warning",
        "GPA / Power of Attorney Sale Void (Suraj Lamp Violation)",
        "In Suraj Lamp & Industries (2011 11 SCC 787), the Supreme Court ruled that immovable property can ONLY be legally transferred through a registered Deed of Conveyance under Section 54 of Transfer of Property Act and Section 17 of Registration Act. Transactions via GPA, Agreement to Sell, or Will do NOT confer legal ownership or marketable title."
      )
    );
    severity = promoteSeverity(severity, "critical");
  }

  // 2. RERA Section 18 / Rule 15 Penalty Parity Mandate
  const buyerDelayRate =
    contract.delay_interest_rate_buyer_pct ??
    contract.buyer_interest_penalty_rate ??
    contract.buyer_delay_interest_rate_percent;
  const promoterDelayRate =
    contract.delay_compensation_rate_promoter_pct ??
    contract.promoter_compensation_rate ??
    contract.builder_delay_compensation_percent;
  const builderCompensationStr = contract.builder_delay_compensation;

  const isAsymmetric =
    contract.penalty_is_asymmetric === true ||
    (buyerDelayRate !== null &&
      buyerDelayRate !== undefined &&
      builderCompensationStr &&
      typeof builderCompensationStr === "string") ||
    (buyerDelayRate !== null &&
      buyerDelayRate !== undefined &&
      promoterDelayRate !== null &&
      promoterDelayRate !== undefined &&
      Number(buyerDelayRate) > Number(promoterDelayRate));

  if (isAsymmetric) {
    const numBuyer = buyerDelayRate ? Number(buyerDelayRate) : 18;
    const promoterDesc = builderCompensationStr || `${promoterDelayRate ?? 0}% p.a.`;
    flags.push(
      flag(
        "rera_asymmetric_delay_penalty",
        "warning",
        "Asymmetric delay penalty violates RERA Section 18",
        `Builder charges you ${numBuyer}% p.a. for payment delay but compensates only ${promoterDesc} for construction delay. Under Section 18 of RERA 2016 and State RERA rules, interest payable by the promoter MUST EQUAL interest charged to the allottee (SBI highest MCLR + 2%). Any lower developer compensation clause is statutorily invalid.`
      )
    );
    severity = promoteSeverity(severity, "high");
  }

  // 3. RERA Section 2(k) Carpet Area vs Super Built-up Loading
  const carpetArea = contract.rera_carpet_area_sqft ?? contract.carpet_area_sqft;
  const superArea = contract.super_built_up_area_sqft ?? contract.super_area;

  if (superArea && (!carpetArea || carpetArea === null)) {
    flags.push(
      flag(
        "rera_missing_carpet_area",
        "warning",
        "Missing mandatory RERA carpet area disclosure",
        "Under Section 2(k) of RERA 2016, real estate must be sold strictly on Net Usable Carpet Area. Selling by super built-up area without explicit RERA carpet area disclosure violates statutory disclosure rules and conceals non-usable common space loading."
      )
    );
    severity = promoteSeverity(severity, "medium");
  } else if (superArea && carpetArea && superArea > carpetArea) {
    const loadingPct = ((superArea - carpetArea) / carpetArea) * 100;
    if (loadingPct > 30 || contract.loading_factor_percent > 30) {
      const displayPct = contract.loading_factor_percent ?? loadingPct.toFixed(1);
      flags.push(
        flag(
          "high_super_area_loading",
          "info",
          `High common area loading (${displayPct}%)`,
          `Your usable RERA carpet area is ${carpetArea} sq.ft. vs super built-up ${superArea} sq.ft. You are paying a ${displayPct}% loading factor for common amenities, corridors, and utility shafts.`
        )
      );
    }
  }

  // 4. Tripartite Subvention Indemnity Trap
  const isTripartite =
    contract.is_tripartite === true ||
    contract.has_tripartite_subvention_clause === true ||
    Boolean(contract.subvention_scheme_type);
  const hasIndemnity =
    contract.has_subvention_indemnity === true ||
    contract.has_tripartite_subvention_clause === true ||
    Boolean(contract.subvention_scheme_type);

  if (isTripartite && hasIndemnity) {
    flags.push(
      flag(
        "subvention_tripartite_indemnity_trap",
        "warning",
        "Tripartite bank-builder subvention trap",
        "You have signed an unconditional borrower indemnity making you solely liable to service bank loan EMIs even if the developer defaults, halts construction work, or enters insolvency proceedings before the NCLT."
      )
    );
    severity = promoteSeverity(severity, "high");
  }

  return { flags, severity };
}

// ─── Consumer Finance: Health Insurance Policy Schedules ────────────────────

/**
 * Run deterministic verification checks on a Health Insurance Policy Schedule.
 *
 * @param policy - Extracted health policy details.
 * @returns Verification result with flags and risk severity.
 */
export function verifyInsurancePolicy(policy: Record<string, any>): VerificationResult {
  const flags: Flag[] = [];
  let severity: Severity = policy.severity ?? "low";

  const sumInsured = Number(policy.sum_insured_inr ?? policy.sum_insured) || 500000;
  const roomRentCapPct =
    policy.room_rent_cap_pct !== null && policy.room_rent_cap_pct !== undefined
      ? Number(policy.room_rent_cap_pct)
      : policy.room_rent_limit_percent !== null && policy.room_rent_limit_percent !== undefined
      ? Number(policy.room_rent_limit_percent)
      : null;
  const fixedRoomLimit =
    policy.daily_room_rent_limit_inr !== null && policy.daily_room_rent_limit_inr !== undefined
      ? Number(policy.daily_room_rent_limit_inr)
      : policy.daily_room_rent_limit !== null && policy.daily_room_rent_limit !== undefined
      ? Number(policy.daily_room_rent_limit)
      : null;

  // 1. 1% Room Rent Proportionate Deduction Trap
  const dailyCap = fixedRoomLimit ?? (roomRentCapPct ? (sumInsured * roomRentCapPct) / 100 : null);
  const isOnePercentOrLess =
    (roomRentCapPct !== null && roomRentCapPct <= 1.0) ||
    (dailyCap !== null && dailyCap <= sumInsured * 0.01) ||
    policy.has_proportionate_deduction === true ||
    policy.has_proportionate_deduction_clause === true;

  if (isOnePercentOrLess && dailyCap !== null) {
    const exampleActualRent = Math.round(dailyCap * 2.0); // e.g. 5,000 / 10,000 = 50%
    const deductionHaircutPct = Math.round((1 - dailyCap / exampleActualRent) * 100);

    flags.push(
      flag(
        "room_rent_proportionate_deduction_trap",
        "warning",
        `1% Room Rent Proportionate Deduction Trap (₹${dailyCap.toLocaleString("en-IN")}/day cap)`,
        `Your policy caps daily room rent to 1% of Sum Insured (₹${dailyCap.toLocaleString("en-IN")}/day). If you occupy a room above this limit (e.g. ₹${exampleActualRent.toLocaleString("en-IN")}/day), the insurer applies proportionate deduction: slashing not just the room rent difference, but cutting surgeon fees, operation theatre (OT) charges, anesthetist fees, and nursing charges across the ENTIRE hospital bill by ${deductionHaircutPct}%.`
      )
    );
    severity = promoteSeverity(severity, "critical");
  }

  // 2. Section 45 Insurance Act: 3-Year Incontestability Moratorium
  const coverageMonths =
    policy.continuous_coverage_months !== null && policy.continuous_coverage_months !== undefined
      ? Number(policy.continuous_coverage_months)
      : policy.policy_tenure_years
      ? Number(policy.policy_tenure_years) * 12
      : policy.policy_tenure_months
      ? Number(policy.policy_tenure_months)
      : null;

  const isRepudiated =
    policy.claim_repudiated === true ||
    policy.claim_repudiation_threatened === true ||
    Boolean(policy.repudiation_ground);

  if (coverageMonths !== null && coverageMonths >= 36) {
    if (isRepudiated) {
      flags.push(
        flag(
          "section_45_illegal_repudiation_risk",
          "warning",
          "Illegal claim repudiation under Section 45 Insurance Act",
          `Your policy has been active continuously for ${coverageMonths} months (over 3 years). Under Section 45 of the Insurance Act 1938, no life or health insurance policy can be repudiated or questioned on any ground including misstatement or non-disclosure after 3 continuous years. This denial is legally challengeable before the Insurance Ombudsman.`
        )
      );
      severity = promoteSeverity(severity, "critical");
    } else {
      flags.push(
        flag(
          "section_45_moratorium_defense",
          "info",
          "Section 45 3-Year Incontestability Protection Active",
          `With ${coverageMonths} months of continuous coverage, your policy has crossed the statutory 3-year moratorium. Under Section 45 of the Insurance Act 1938, the insurer is legally prohibited from repudiating claims or cancelling coverage on allegations of pre-existing disease non-disclosure.`
        )
      );
    }
  }

  // 3. ICU Sub-Limit Warning
  const icuCapPct =
    policy.icu_rent_cap_pct !== null && policy.icu_rent_cap_pct !== undefined
      ? Number(policy.icu_rent_cap_pct)
      : policy.icu_daily_limit && sumInsured
      ? (Number(policy.icu_daily_limit) / sumInsured) * 100
      : null;

  if (icuCapPct !== null && icuCapPct <= 2.0) {
    const dailyIcuCap = policy.icu_daily_limit ? Number(policy.icu_daily_limit) : (sumInsured * icuCapPct) / 100;
    flags.push(
      flag(
        "icu_sublimit_warning",
        "warning",
        `ICU daily stay capped to ${icuCapPct}% (₹${dailyIcuCap.toLocaleString("en-IN")}/day)`,
        `Intensive Care Unit (ICU) expenses are restricted to ₹${dailyIcuCap.toLocaleString("en-IN")} per day. Serious medical emergencies exceeding this cap will trigger out-of-pocket expenses.`
      )
    );
    severity = promoteSeverity(severity, "medium");
  }

  return { flags, severity };
}
