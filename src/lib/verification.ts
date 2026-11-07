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
