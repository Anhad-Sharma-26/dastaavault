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
} from "../src/lib/verification.ts";

import { lookupSection } from "../src/lib/section-mapping.ts";

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
];

test("Demo Documents: all 13 synthetic test documents exist and have non-empty content", () => {
  for (const docName of expectedDocs) {
    const fullPath = path.join(demoDocsDir, docName);
    assert.ok(fs.existsSync(fullPath), `Document ${docName} must exist`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 200, `Document ${docName} must have realistic content`);
  }
});
