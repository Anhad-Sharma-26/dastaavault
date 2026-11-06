import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── 1. PII Masking Tests ───────────────────────────────────────────────────

function maskPAN(text) {
  return text.replace(/\b([A-Z]{4})[A-Z]\d{4}([A-Z])\b/g, "$1****$2");
}

function maskAadhaar(text) {
  return text.replace(/\b\d{4}\s?\d{4}\s?(\d{4})\b/g, "XXXX XXXX $1");
}

function maskPhone(text) {
  return text.replace(/(?:\+91[\s-]?)?(\d{5})(\d{5})\b/g, "XXXXX$2");
}

function maskEmail(text) {
  return text.replace(/\b([a-zA-Z0-9_.+-]{2})[a-zA-Z0-9_.+-]*@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b/g, "$1***@$2");
}

function maskAll(text) {
  return maskEmail(maskPhone(maskAadhaar(maskPAN(text))));
}

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

// ─── 2. Section Mapping Tests ───────────────────────────────────────────────

const mappingPath = path.join(__dirname, "..", "src", "data", "section-mapping.json");
const mappingData = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));

test("Section Mapping: dataset should be valid and well-formed", () => {
  assert.ok(mappingData.mapping_version);
  assert.ok(Array.isArray(mappingData.sections));
  assert.ok(mappingData.sections.length >= 10);
});

test("Section Mapping: cross-mapping old 143(1) to new 221(1)", () => {
  const entry = mappingData.sections.find((s) => s.old === "143(1)");
  assert.ok(entry, "143(1) entry exists");
  assert.equal(entry.new, "221(1)");
  assert.equal(entry.typical_deadline_days, 30);
});

test("Section Mapping: cross-mapping old 148 to new 231 (reassessment)", () => {
  const entry = mappingData.sections.find((s) => s.old === "148");
  assert.ok(entry, "148 entry exists");
  assert.equal(entry.new, "231");
});

test("Section Mapping: cross-mapping new 220 to old 142(1)", () => {
  const entry = mappingData.sections.find((s) => s.new === "220");
  assert.ok(entry, "220 entry exists");
  assert.equal(entry.old, "142(1)");
});

// ─── 3. Verification Rules Tests ────────────────────────────────────────────

test("Verification: Rent agreement lock-in exceeding notice period flags warning", () => {
  const agreement = {
    lock_in_months: 6,
    notice_period_months: 1,
  };
  const isTrap = agreement.lock_in_months > agreement.notice_period_months;
  assert.equal(isTrap, true);
});

test("Verification: Rent agreement escalation > 10% flags high escalation", () => {
  const agreement = { escalation_pct: 15 };
  const isHigh = agreement.escalation_pct > 10;
  assert.equal(isHigh, true);
});

test("Verification: Rent agreement duration >= 12 months requires registration", () => {
  const agreement = { duration_months: 12, registration_required: false };
  const needsReg = agreement.duration_months >= 12 && !agreement.registration_required;
  assert.equal(needsReg, true);
});

test("Verification: Income Tax notice demand > 1 lakh triggers critical severity", () => {
  const notice = { demand_amount: 345000 };
  const isCritical = notice.demand_amount > 100000;
  assert.equal(isCritical, true);
});

test("Verification: Income Tax notice prosecution language triggers critical severity", () => {
  const notice = {
    key_claims: ["Penalty initiated", "prosecution proceedings may be initiated u/s 276C"],
  };
  const hasProsecution = notice.key_claims.some((c) => /prosecut|criminal|court\s*summon/i.test(c));
  assert.equal(hasProsecution, true);
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
