import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  maskPAN,
  maskAadhaar,
  maskPhone,
  maskEmail,
  maskAll,
} from "../src/lib/pii-masker.ts";

import {
  verifyITNotice,
  verifyRentAgreement,
  verifyStatutoryForm,
  verifyGeneralDoc,
  verifyLoanSanction,
  verifyGSTNotice,
  verifyMSMEContract,
  verifyPropertyContract,
  verifyInsurancePolicy,
} from "../src/lib/verification.ts";

import { lookupSection } from "../src/lib/section-mapping.ts";
import {
  LoanSanctionSchema,
  GSTNoticeSchema,
  MSMEInvoiceSchema,
  PropertyContractSchema,
  InsurancePolicySchema,
} from "../src/lib/schemas.ts";
import { DEMO_SIMULATIONS } from "../src/lib/demo-simulator.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── 1. PII Masking Tests (Testing real src/lib/pii-masker.ts) ───────────────

test("PII Masker: should mask PAN correctly while preserving format", () => {
  const input = "Assessee PAN is ABCPD1234K for year 2025.";
  const expected = "Assessee PAN is ABCP****K for year 2025.";
  assert.equal(maskPAN(input), expected);
});

test("PII Masker: should mask Aadhaar number", () => {
  const input = "Aadhaar Card: 1234 5678 9012 registered.";
  const expected = "Aadhaar Card: XXXX XXXX 9012 registered.";
  assert.equal(maskAadhaar(input), expected);
});

test("PII Masker: should mask Phone number", () => {
  const input = "Contact +91 9876543210 for inquiries.";
  assert.match(maskPhone(input), /XXXXX43210/);
});

test("PII Masker: should preserve 10-digit financial amounts", () => {
  const input = "Total value of transaction: 1000000000 INR";
  assert.equal(maskPhone(input), input);
});

test("PII Masker: should mask Email address", () => {
  const input = "Please write to taxpayer.help@incometax.gov.in";
  assert.match(maskEmail(input), /ta\*\*\*@incometax\.gov\.in/);
});

test("PII Masker: should mask all in combined text", () => {
  const text = "Mr Sharma (PAN: ABCPD1234K, Aadhaar: 1234 5678 9012, phone: 9876543210, email: sharma@gmail.com)";
  const masked = maskAll(text);
  assert.ok(!masked.includes("ABCPD1234K"));
  assert.ok(!masked.includes("1234 5678 9012"));
  assert.ok(!masked.includes("9876543210"));
  assert.ok(!masked.includes("sharma@gmail.com"));
  assert.ok(masked.includes("ABCP****K"));
});

// ─── 2. Section Mapping Tests (Testing real src/lib/section-mapping.ts) ──────

const mappingPath = path.join(__dirname, "..", "src", "data", "section-mapping.json");
const mappingData = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));

test("Section Mapping: dataset should be valid and well-formed", () => {
  assert.ok(mappingData.mapping_version);
  assert.ok(Array.isArray(mappingData.sections));
  assert.ok(mappingData.sections.length >= 10);
});

test("Section Mapping: cross-mapping old 143(1) to new 221(1)", () => {
  const res = lookupSection("143(1)");
  assert.ok(res, "143(1) lookup succeeded");
  assert.equal(res.new, "221(1)");
  assert.equal(res.typical_deadline_days, 30);
});

test("Section Mapping: cross-mapping old 148 to new 231 (reassessment)", () => {
  const res = lookupSection("148");
  assert.ok(res, "148 entry exists");
  assert.equal(res.new, "231");
});

test("Section Mapping: cross-mapping new 220 to old 142(1)", () => {
  const res = lookupSection("220");
  assert.ok(res, "220 entry exists");
  assert.equal(res.old, "142(1)");
});

// ─── 2b. Wave 1 & 2 Schemas (Loan Sanction, GST Notice, MSME Invoice) ────────

test("Schema Validation: LoanSanctionSchema parses valid loan data", () => {
  const data = {
    doc_type: "loan_sanction",
    lender_name: "State Bank of India",
    borrower_name: "Rahul Verma",
    borrower_type: "individual",
    loan_type: "home_loan",
    sanctioned_amount: 4500000,
    interest_rate: 8.4,
    interest_type: "floating",
    benchmark_type: "repo_rate",
    spread_or_markup: 1.9,
    tenor_months: 240,
    monthly_emi: 38760,
    annual_percentage_rate: 8.85,
    is_kfs_present: true,
    foreclosure_charge_pct: 0,
    processing_fee: 10000,
    validity_days: 90,
    has_cross_default_lien: false,
    severity: "low",
    flags: [],
    extraction_confidence: "high",
    uncertain_fields: [],
  };
  const parsed = LoanSanctionSchema.parse(data);
  assert.equal(parsed.lender_name, "State Bank of India");
  assert.equal(parsed.interest_type, "floating");
});

test("Schema Validation: GSTNoticeSchema parses valid DRC-01 data", () => {
  const data = {
    doc_type: "gst_notice",
    form_type: "DRC-01",
    notice_section: "74",
    financial_year: "2023-24",
    gstin: "07AAAAA0000A1Z5",
    tax_demand: 185000,
    interest_amount: 32000,
    penalty_amount: 185000,
    total_demand: 402000,
    notice_date: "2026-10-01",
    response_deadline: "2026-10-31",
    days_remaining: 10,
    has_personal_hearing: false,
    hearing_date: null,
    issuing_gst_office: "Delhi North Ward 12",
    allegation_type: "ITC mismatch GSTR-2B vs 3B",
    severity: "critical",
    flags: [],
    extraction_confidence: "high",
    uncertain_fields: [],
  };
  const parsed = GSTNoticeSchema.parse(data);
  assert.equal(parsed.notice_section, "74");
  assert.equal(parsed.total_demand, 402000);
});

test("Schema Validation: MSMEInvoiceSchema parses valid MSME invoice data", () => {
  const data = {
    doc_type: "msme_contract",
    invoice_number: "INV/2026/042",
    invoice_date: "2026-08-15",
    invoice_amount: 325000,
    supplier_name: "Apex Precision Tools",
    supplier_udyam_number: "UDYAM-MH-01-0012345",
    enterprise_category: "micro",
    buyer_name: "Mega Corp India Ltd",
    agreed_credit_days: 90,
    has_written_agreement: true,
    days_overdue: 45,
    payment_status: "unpaid",
    severity: "high",
    flags: [],
    extraction_confidence: "high",
    uncertain_fields: [],
  };
  const parsed = MSMEInvoiceSchema.parse(data);
  assert.equal(parsed.agreed_credit_days, 90);
  assert.equal(parsed.enterprise_category, "micro");
});

// ─── 3. Verification Rules Tests (Testing real src/lib/verification.ts) ───────

test("Verification: Rent agreement lock-in exceeding notice period flags warning", () => {
  const res = verifyRentAgreement({
    monthly_rent: 25000,
    security_deposit: 50000,
    lock_in_months: 6,
    notice_period_months: 1,
    duration_months: 11,
    escalation_pct: 5,
    registration_required: false,
    parties: { landlord: "A", tenant: "B" },
    flags: [],
  });
  const flag = res.flags.find((f) => f.flag_id === "lock_in_gt_notice");
  assert.ok(flag, "Flag lock_in_gt_notice should be raised");
  assert.equal(res.severity, "medium");
});

test("Verification: Rent agreement escalation > 10% flags high escalation", () => {
  const res = verifyRentAgreement({
    monthly_rent: 25000,
    security_deposit: 50000,
    lock_in_months: 1,
    notice_period_months: 1,
    duration_months: 11,
    escalation_pct: 15,
    registration_required: false,
    parties: { landlord: "A", tenant: "B" },
    flags: [],
  });
  const flag = res.flags.find((f) => f.flag_id === "high_escalation");
  assert.ok(flag, "Flag high_escalation should be raised");
});

test("Verification: Rent agreement duration >= 12 months requires registration", () => {
  const res = verifyRentAgreement({
    monthly_rent: 25000,
    security_deposit: 50000,
    lock_in_months: 1,
    notice_period_months: 1,
    duration_months: 12,
    escalation_pct: 5,
    registration_required: false,
    parties: { landlord: "A", tenant: "B" },
    flags: [],
  });
  const flag = res.flags.find((f) => f.flag_id === "needs_registration");
  assert.ok(flag, "Flag needs_registration should be raised");
  assert.equal(res.severity, "high");
});

test("Verification: Income Tax notice demand > 1 lakh triggers critical severity", () => {
  const res = verifyITNotice({
    din_number: "ITBA/COM/F/17/2026-27/123",
    notice_section_printed: "143(1)",
    assessment_year: "2025-26",
    demand_amount: 345000,
    refund_amount: null,
    response_deadline: "2026-11-30",
    days_remaining: 20,
    key_claims: [],
    severity: "low",
  });
  const flag = res.flags.find((f) => f.flag_id === "high_demand");
  assert.ok(flag, "Flag high_demand should be raised");
  assert.equal(res.severity, "critical");
});

test("Verification: Income Tax notice prosecution language triggers critical severity", () => {
  const res = verifyITNotice({
    din_number: "ITBA/COM/F/17/2026-27/123",
    notice_section_printed: "148",
    assessment_year: "2025-26",
    demand_amount: null,
    refund_amount: null,
    response_deadline: "2026-11-30",
    days_remaining: 10,
    key_claims: ["prosecution proceedings may be initiated u/s 276C"],
    severity: "low",
  });
  const flag = res.flags.find((f) => f.flag_id === "prosecution_risk");
  assert.ok(flag, "Flag prosecution_risk should be raised");
  assert.equal(res.severity, "critical");
});

test("Verification: Blank statutory form template flags zero liability info", () => {
  const res = verifyStatutoryForm({
    doc_type: "statutory_form",
    form_name: "Form No. 7: Scientific Research Application u/s 35(2AA)",
    rule_or_section: "35(2AA)",
    is_blank_template: true,
    purpose: "Application for approval of scientific research programme",
    key_requirements: ["Sponsor details", "University certification"],
  });
  const blankFlag = res.flags.find((f) => f.flag_id === "blank_template");
  assert.ok(blankFlag, "Flag blank_template should be present");
  assert.equal(res.severity, "low");
});

test("Verification: General document flags informational summary", () => {
  const res = verifyGeneralDoc({
    doc_type: "unsupported",
    title: "Electricity Bill",
    summary: "Monthly electricity invoice",
    amount_due: 3410,
  });
  const overviewFlag = res.flags.find((f) => f.flag_id === "general_overview");
  assert.ok(overviewFlag, "Flag general_overview should be present");
  const amountFlag = res.flags.find((f) => f.flag_id === "amount_recorded");
  assert.ok(amountFlag, "Flag amount_recorded should be present");
  assert.equal(res.severity, "low");
});

// ─── Wave 1 Verification Tests (Banking & Loan Sanctions) ────────────────────

test("Verification: Loan sanction floating rate with foreclosure fee flags prohibited fee", () => {
  const res = verifyLoanSanction({
    doc_type: "loan_sanction",
    lender_name: "HDFC Bank",
    borrower_type: "individual",
    interest_type: "floating",
    interest_rate: 8.75,
    foreclosure_charge_pct: 3.0,
    is_kfs_present: true,
    annual_percentage_rate: null, // missing APR
    has_cross_default_lien: true,
  });

  const foreclosureFlag = res.flags.find((f) => f.flag_id === "prohibited_foreclosure_fee");
  assert.ok(foreclosureFlag, "Should flag prohibited foreclosure fee on floating individual loan");
  assert.equal(res.severity, "high");

  const aprFlag = res.flags.find((f) => f.flag_id === "missing_apr_kfs_violation");
  assert.ok(aprFlag, "Should flag missing APR under April 2024 KFS circular");

  const lienFlag = res.flags.find((f) => f.flag_id === "cross_default_lien_trap");
  assert.ok(lienFlag, "Should flag Section 171 banker general lien");

  const returnRuleFlag = res.flags.find((f) => f.flag_id === "rbi_30_day_document_return_rule");
  assert.ok(returnRuleFlag, "Should remind borrower of 30-day original document return right");
});

// ─── Wave 2 Verification Tests (GST Notices & MSME Invoices) ─────────────────

test("Verification: GST notice under Section 74 flags critical fraud penalty and hearing omission", () => {
  const res = verifyGSTNotice({
    doc_type: "gst_notice",
    notice_section: "74",
    total_demand: 402000,
    has_personal_hearing: false,
    hearing_date: null,
    days_remaining: 4,
  });

  const fraudFlag = res.flags.find((f) => f.flag_id === "high_penalty_fraud_allegation");
  assert.ok(fraudFlag, "Section 74 notice must flag critical 100% fraud penalty");
  assert.equal(res.severity, "critical");

  const hearingFlag = res.flags.find((f) => f.flag_id === "procedural_hearing_omission");
  assert.ok(hearingFlag, "Must flag missing personal hearing under Section 75(4)");

  const deadlineFlag = res.flags.find((f) => f.flag_id === "urgent_gst_deadline");
  assert.ok(deadlineFlag, "Must flag urgent response window under 5 days");
});

test("Verification: MSME invoice exceeding 45 days flags statutory cap override and Section 43B(h) risk", () => {
  const res = verifyMSMEContract({
    doc_type: "msme_contract",
    agreed_credit_days: 90,
    has_written_agreement: true,
    days_overdue: 30,
    payment_status: "unpaid",
  });

  const capFlag = res.flags.find((f) => f.flag_id === "msme_statutory_credit_cap_exceeded");
  assert.ok(capFlag, "90-day term must flag Section 15 45-day statutory override");
  assert.equal(res.severity, "high");

  const interestFlag = res.flags.find((f) => f.flag_id === "msme_penal_interest_entitlement");
  assert.ok(interestFlag, "Overdue bill must flag 3x RBI bank rate interest entitlement");

  const taxFlag = res.flags.find((f) => f.flag_id === "section_43b_h_tax_disallowance_risk");
  assert.ok(taxFlag, "Unpaid MSME bill must flag Section 43B(h) tax disallowance risk");
});

test("Verification: MSME invoice from Medium Enterprise exempt from Section 43B(h) tax disallowance", () => {
  const res = verifyMSMEContract({
    doc_type: "msme_contract",
    enterprise_category: "medium",
    agreed_credit_days: 30,
    has_written_agreement: true,
    days_overdue: 15,
    payment_status: "unpaid",
  });

  const taxFlag = res.flags.find((f) => f.flag_id === "section_43b_h_tax_disallowance_risk");
  assert.equal(taxFlag, undefined, "Medium enterprises must NOT be flagged for Section 43B(h) disallowance");
});

test("Verification: GST Notice with section variants like 74(1) flags fraud penalty", () => {
  const res = verifyGSTNotice({
    doc_type: "gst_notice",
    section: "Section 74(1)",
    has_personal_hearing: false,
    days_remaining: 10,
  });

  const fraudFlag = res.flags.find((f) => f.flag_id === "high_penalty_fraud_allegation");
  assert.ok(fraudFlag, "Section 74(1) variant must flag Section 74 fraud penalty");
});

test("Verification: Loan sanction with string percentage foreclosure fee flags correctly", () => {
  const res = verifyLoanSanction({
    doc_type: "loan_sanction",
    interest_type: "floating",
    borrower_type: "individual",
    foreclosure_charge_pct: "3.5%",
    is_kfs_present: true,
    annual_percentage_rate: null,
  });

  const feeFlag = res.flags.find((f) => f.flag_id === "prohibited_foreclosure_fee");
  assert.ok(feeFlag, "String-formatted foreclosure fee must be parsed and flagged");
});

// ─── Wave 3: RERA Property Contracts & Health Insurance Policies ─────────────

test("Schema Validation: PropertyContractSchema validates real estate contract", () => {
  const sample = {
    doc_type: "property_contract",
    project_name: "Horizon Skywalk Towers",
    promoter_or_builder_name: "Apex Horizon Developers LLP",
    buyer_or_allottee_name: "Rajesh Kumar Sharma",
    rera_registration_number: "HRERA-GGM-2023-892",
    total_consideration_inr: 14500000,
    super_built_up_area_sqft: 1850,
    delay_interest_rate_buyer_pct: 18.0,
    delay_compensation_rate_promoter_pct: 2.0,
    is_gpa_or_power_of_attorney_sale: true,
    is_tripartite: true,
    has_subvention_indemnity: true,
  };

  const parsed = PropertyContractSchema.parse(sample);
  assert.equal(parsed.project_name, "Horizon Skywalk Towers");
  assert.equal(parsed.delay_interest_rate_buyer_pct, 18.0);
  assert.equal(parsed.is_gpa_or_power_of_attorney_sale, true);
});

test("Schema Validation: InsurancePolicySchema validates health policy schedule", () => {
  const sample = {
    doc_type: "insurance_policy",
    insurer_name: "Star Allied Health Insurance Co. Ltd.",
    policy_number: "SH-POL-2022-849102",
    policy_holder_name: "Vikramaditya Verma",
    policy_type: "individual_health",
    continuous_coverage_months: 48,
    sum_insured_inr: 500000,
    daily_room_rent_limit_inr: 5000,
    room_rent_cap_pct: 1.0,
    icu_rent_cap_pct: 2.0,
    has_proportionate_deduction_clause: true,
  };

  const parsed = InsurancePolicySchema.parse(sample);
  assert.equal(parsed.insurer_name, "Star Allied Health Insurance Co. Ltd.");
  assert.equal(parsed.daily_room_rent_limit_inr, 5000);
  assert.equal(parsed.has_proportionate_deduction_clause, true);
  assert.equal(parsed.continuous_coverage_months, 48);
});

test("Verification: Property Contract flags Suraj Lamp GPA title violation as critical", () => {
  const res = verifyPropertyContract({
    doc_type: "property_contract",
    property_name: "Skywalk Towers",
    mentions_gpa_or_power_of_attorney: true,
    conveyance_type: "General Power of Attorney (GPA)",
    buyer_delay_interest_rate_percent: 12.0,
    builder_delay_compensation_percent: 12.0,
  });

  const gpaFlag = res.flags.find((f) => f.flag_id === "suraj_lamp_gpa_ownership_ban");
  assert.ok(gpaFlag, "GPA conveyance must trigger Suraj Lamp violation");
  assert.equal(gpaFlag.severity, "warning");
  assert.equal(res.severity, "critical");
});

test("Verification: Property Contract flags RERA asymmetric delay penalty", () => {
  const res = verifyPropertyContract({
    doc_type: "property_contract",
    property_name: "Skywalk Towers",
    buyer_delay_interest_rate_percent: 18.0,
    builder_delay_compensation: "Rs. 5 per sq.ft. per month",
  });

  const penaltyFlag = res.flags.find((f) => f.flag_id === "rera_asymmetric_delay_penalty");
  assert.ok(penaltyFlag, "Asymmetric delay penalty (18% buyer vs Rs 5 builder) must be flagged");
});

test("Verification: Property Contract flags missing RERA carpet area and calculates loading", () => {
  const res = verifyPropertyContract({
    doc_type: "property_contract",
    super_built_up_area_sqft: 1850,
    carpet_area_sqft: null,
  });

  const carpetFlag = res.flags.find((f) => f.flag_id === "rera_missing_carpet_area");
  assert.ok(carpetFlag, "Missing carpet area must be flagged under RERA Sec 2(k)");
});

test("Verification: Property Contract flags tripartite subvention indemnity trap", () => {
  const res = verifyPropertyContract({
    doc_type: "property_contract",
    has_tripartite_subvention_clause: true,
    subvention_scheme_type: "10:90",
  });

  const subventionFlag = res.flags.find((f) => f.flag_id === "subvention_tripartite_indemnity_trap");
  assert.ok(subventionFlag, "Tripartite subvention indemnity clause must be flagged");
});

test("Verification: Health Insurance flags 1% room rent proportionate deduction haircut", () => {
  const res = verifyInsurancePolicy({
    doc_type: "insurance_policy",
    sum_insured: 500000,
    daily_room_rent_limit: 5000,
    room_rent_limit_percent: 1.0,
    has_proportionate_deduction: true,
  });

  const roomFlag = res.flags.find((f) => f.flag_id === "room_rent_proportionate_deduction_trap");
  assert.ok(roomFlag, "1% room rent cap with proportionate deduction must be flagged");
  assert.ok(roomFlag.detail.includes("50%"), "Detail should explain 50% proportionate deduction haircut math");
});

test("Verification: Health Insurance identifies Section 45 3-year incontestability moratorium defense", () => {
  const res = verifyInsurancePolicy({
    doc_type: "insurance_policy",
    sum_insured: 500000,
    policy_tenure_years: 4,
    policy_tenure_months: 48,
  });

  const sec45Flag = res.flags.find((f) => f.flag_id === "section_45_moratorium_defense");
  assert.ok(sec45Flag, "4-year active tenure must trigger Section 45 incontestability defense");
  assert.equal(sec45Flag.severity, "info");
});

test("Verification: Health Insurance flags illegal claim repudiation if policy over 3 years old", () => {
  const res = verifyInsurancePolicy({
    doc_type: "insurance_policy",
    policy_tenure_years: 4,
    claim_repudiation_threatened: true,
  });

  const repudiationFlag = res.flags.find((f) => f.flag_id === "section_45_illegal_repudiation_risk");
  assert.ok(repudiationFlag, "Repudiation after 3 years must be flagged as critical statutory violation");
  assert.equal(res.severity, "critical");
});

// ─── 4. Demo Documents Integrity Tests ──────────────────────────────────────

const demoDocsDir = path.join(__dirname, "..", "public", "demo-docs");
const expectedDocs = [
  "it-notice-143-1-clean.html",
  "it-notice-148-photo.html",
  "it-notice-hindi-bilingual.html",
  "it-notice-large-demand.html",
  "it-notice-old-section.html",
  "it-notice-new-section.html",
  "rent-11-month-clean.html",
  "rent-lockin-trap.html",
  "rent-forfeiture.html",
  "rent-12-month.html",
  "rent-high-escalation.html",
  "blurry-photo.html",
  "unrelated-doc.html",
  "banking-home-loan-sanction.html",
  "gst-drc01-notice.html",
  "msme-overdue-invoice.html",
  "property-builder-buyer-agreement.html",
  "health-insurance-policy-schedule.html",
];

test("Demo Documents: all 18 synthetic test documents exist and have non-empty content", () => {
  for (const docName of expectedDocs) {
    const fullPath = path.join(demoDocsDir, docName);
    assert.ok(fs.existsSync(fullPath), `Document ${docName} must exist`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 200, `Document ${docName} must have realistic content`);
  }
});

test("Demo Simulator: contains verified ground-truth simulations for all 18 preset documents", () => {
  const requiredKeys = [
    "it-143-1",
    "it-new-act",
    "it-large-demand",
    "it-hindi",
    "it-old-refund",
    "it-148-photo",
    "rent-clean",
    "rent-lockin",
    "rent-forfeiture",
    "rent-12m",
    "rent-high-esc",
    "blurry",
    "unrelated",
    "bank-home-loan",
    "gst-drc01",
    "msme-45day",
    "property-bba",
    "insurance-health",
  ];

  for (const key of requiredKeys) {
    const sim = DEMO_SIMULATIONS[key];
    assert.ok(sim, `Simulation for ${key} must exist`);
    assert.ok(sim.transcription && sim.transcription.length > 20, `${key} must have transcription`);
    assert.ok(sim.extracted && sim.extracted.doc_type, `${key} must have structured extraction`);
    assert.ok(sim.explanation && sim.explanation.en, `${key} must have English explanation`);
    assert.ok(sim.explanation.hi, `${key} must have Hindi explanation`);
    assert.ok(sim.explanation.hinglish, `${key} must have Hinglish explanation`);
  }
});
