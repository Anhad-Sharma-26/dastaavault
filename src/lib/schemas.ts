/**
 * @module schemas
 * @description Zod v4 schemas for document extraction and classification.
 *
 * Exports both the Zod schemas (for runtime validation) and their
 * JSON-Schema equivalents (for BharatCode structured-output format).
 */

import { z, toJSONSchema } from "zod";

// ─── Flag sub-schema (shared) ────────────────────────────────────────────────

export const FlagSchema = z.object({
  flag_id: z.string().describe("Unique identifier for this flag"),
  severity: z.enum(["warning", "info"]).describe("Flag severity level"),
  title: z.string().describe("Short human-readable title"),
  detail: z.string().describe("Detailed explanation of the flag"),
});

export type FlagData = z.infer<typeof FlagSchema>;

// ─── Income Tax Notice ───────────────────────────────────────────────────────

export const IncomeTaxNoticeSchema = z.object({
  doc_type: z.literal("income_tax_notice"),

  notice_section_printed: z
    .string()
    .describe("Section number exactly as printed on the notice"),
  notice_section_mapped: z
    .string()
    .nullable()
    .describe(
      "Corresponding section in the other Act (1961↔2025), or null if unknown"
    ),
  act_version: z
    .enum(["1961", "2025", "unknown"])
    .describe("Which Income Tax Act the notice cites"),

  notice_type_name: z
    .string()
    .describe('Human-readable name, e.g. "Intimation under section 143(1)"'),

  assessment_year: z
    .string()
    .nullable()
    .describe("Assessment year, e.g. 2025-26"),
  pan_masked: z
    .string()
    .nullable()
    .describe("PAN as present in masked text (already redacted)"),

  demand_amount: z
    .number()
    .nullable()
    .describe("Total demand amount in INR, or null"),
  demand_currency: z
    .literal("INR")
    .default("INR")
    .describe("Always INR"),
  refund_amount: z
    .number()
    .nullable()
    .describe("Refund amount in INR, or null"),

  issue_date: z
    .string()
    .nullable()
    .describe("Date the notice was issued (ISO 8601)"),
  response_deadline: z
    .string()
    .nullable()
    .describe("Response deadline verbatim from the notice (ISO 8601)"),
  response_deadline_source: z
    .enum(["verbatim", "typical_fallback"])
    .describe("Whether the deadline came from the notice or a typical default"),
  days_remaining: z
    .number()
    .nullable()
    .describe("Days remaining until the deadline (computed in IST)"),

  issuing_authority: z
    .string()
    .nullable()
    .describe("Name / designation of the issuing officer"),
  din_number: z
    .string()
    .nullable()
    .describe("Document Identification Number, if present"),

  key_claims: z
    .array(z.string())
    .describe("Key claims or charges stated in the notice"),
  severity: z
    .enum(["critical", "high", "medium", "low"])
    .describe("Overall severity assessment"),
  high_stakes_flags: z
    .array(z.string())
    .describe("List of high-stakes indicators found"),

  extraction_confidence: z
    .enum(["high", "medium", "low"])
    .describe("Model confidence in the extraction"),
  uncertain_fields: z
    .array(z.string())
    .describe("Field names the model is less confident about"),
});

export type IncomeTaxNoticeData = z.infer<typeof IncomeTaxNoticeSchema>;

// ─── Rent Agreement ──────────────────────────────────────────────────────────

export const RentAgreementSchema = z.object({
  doc_type: z.literal("rent_agreement"),

  duration_months: z.number().nullable().describe("Total lease duration in months"),
  start_date: z.string().nullable().describe("Lease start date (ISO 8601)"),
  end_date: z.string().nullable().describe("Lease end date (ISO 8601)"),
  lock_in_months: z.number().nullable().describe("Lock-in period in months"),
  notice_period_months: z
    .number()
    .nullable()
    .describe("Notice period for termination in months"),

  monthly_rent: z.number().nullable().describe("Monthly rent in INR"),
  security_deposit: z.number().nullable().describe("Security deposit in INR"),
  security_deposit_months: z
    .number()
    .nullable()
    .describe("Security deposit expressed as number of months' rent"),
  escalation_pct: z
    .number()
    .nullable()
    .describe("Annual rent escalation percentage"),

  maintenance_included: z
    .boolean()
    .nullable()
    .describe("Whether maintenance charges are included in rent"),
  registration_required: z
    .boolean()
    .nullable()
    .describe("Whether registration is required / mentioned"),
  stamp_duty_mentioned: z
    .boolean()
    .nullable()
    .describe("Whether stamp duty is mentioned"),

  landlord_name: z.string().nullable().describe("Landlord name"),
  tenant_name: z.string().nullable().describe("Tenant name"),
  property_address: z.string().nullable().describe("Property address"),

  flags: z
    .array(FlagSchema)
    .describe("Model-generated flags about the agreement"),

  extraction_confidence: z
    .enum(["high", "medium", "low"])
    .describe("Model confidence in the extraction"),
  uncertain_fields: z
    .array(z.string())
    .describe("Field names the model is less confident about"),
});

export type RentAgreementData = z.infer<typeof RentAgreementSchema>;

// ─── Statutory Form / Blank Template ─────────────────────────────────────────

export const StatutoryFormSchema = z.object({
  doc_type: z.literal("statutory_form"),
  form_name: z
    .string()
    .describe('Official name or title of the statutory form, e.g. "Form No. 7 — Application for approval of scientific research programme under section 35(2AA)"'),
  rule_or_section: z
    .string()
    .nullable()
    .describe('Rule or section number cited, e.g. "35(2AA)" or "Rule 5F"'),
  notice_section_printed: z
    .string()
    .nullable()
    .describe("Section number printed on the form"),
  notice_section_mapped: z
    .string()
    .nullable()
    .describe("Corresponding section under 2025 Act or related section"),
  act_name: z
    .string()
    .default("Income-tax Act, 1961")
    .describe("Governing Act or legal framework"),
  is_blank_template: z
    .boolean()
    .default(true)
    .describe("Whether this is a blank/unfilled template or a completed submission"),
  purpose: z
    .string()
    .describe("Statutory purpose of this form under Indian law"),
  target_audience: z
    .string()
    .nullable()
    .describe("Who is required or eligible to fill and file this form"),
  key_requirements: z
    .array(z.string())
    .describe("Key fields, certifications, or attachments required by the form"),
  issuing_authority: z
    .string()
    .nullable()
    .describe("Prescribed authority or department where this form is filed"),
  severity: z
    .enum(["critical", "high", "medium", "low"])
    .default("low")
    .describe("Risk severity (templates are typically low)"),
  flags: z.array(FlagSchema).default([]),
  extraction_confidence: z
    .enum(["high", "medium", "low"])
    .default("high")
    .describe("Model confidence in extraction"),
  uncertain_fields: z.array(z.string()).default([]),
});

export type StatutoryFormData = z.infer<typeof StatutoryFormSchema>;

// ─── General / Non-Assessment Document ───────────────────────────────────────

export const GeneralDocSchema = z.object({
  doc_type: z.literal("unsupported"),
  title: z
    .string()
    .describe("Title or descriptive identification of the document"),
  summary: z
    .string()
    .describe("One-sentence summary of the document contents"),
  issuing_authority: z
    .string()
    .nullable()
    .describe("Issuing entity, company, or authority"),
  reference_number: z
    .string()
    .nullable()
    .describe("Consumer number, account number, or reference number if any"),
  amount_due: z
    .number()
    .nullable()
    .describe("Monetary amount mentioned in the document, or null"),
  due_date: z
    .string()
    .nullable()
    .describe("Due date or deadline if specified, or null"),
  is_blank_template: z
    .boolean()
    .default(false)
    .describe("Whether this is an unfilled blank format"),
  severity: z
    .enum(["critical", "high", "medium", "low"])
    .default("low"),
  flags: z.array(FlagSchema).default([]),
  extraction_confidence: z
    .enum(["high", "medium", "low"])
    .default("high"),
  uncertain_fields: z.array(z.string()).default([]),
});

export type GeneralDocData = z.infer<typeof GeneralDocSchema>;

// ─── Loan Sanction Letter & Key Fact Statement (KFS) ─────────────────────────

export const LoanSanctionSchema = z.object({
  doc_type: z.literal("loan_sanction"),
  lender_name: z.string().describe("Name of the lending bank, NBFC, or HFC"),
  borrower_name: z.string().nullable().describe("Borrower name if visible"),
  borrower_type: z
    .enum(["individual", "non_individual"])
    .default("individual")
    .describe("Whether borrower is an individual or corporate/firm"),
  loan_type: z
    .enum([
      "home_loan",
      "personal_loan",
      "vehicle_loan",
      "business_loan",
      "education_loan",
      "loan_against_property",
      "other",
    ])
    .default("home_loan"),
  sanctioned_amount: z.number().nullable().describe("Total sanctioned loan amount in INR"),
  interest_rate: z.number().nullable().describe("Annual interest rate percentage, e.g. 8.5"),
  interest_type: z
    .enum(["fixed", "floating", "hybrid"])
    .default("floating")
    .describe("Whether interest is fixed or floating"),
  benchmark_type: z.string().nullable().describe("Benchmark, e.g. 'repo_rate', 'mclr', 'base_rate'"),
  spread_or_markup: z.number().nullable().describe("Spread over benchmark percentage"),
  tenor_months: z.number().nullable().describe("Total loan tenure in months"),
  monthly_emi: z.number().nullable().describe("Monthly EMI installment in INR"),
  annual_percentage_rate: z
    .number()
    .nullable()
    .describe("Annual Percentage Rate (APR) from Key Fact Statement"),
  is_kfs_present: z.boolean().default(false).describe("Whether Key Fact Statement table is present"),
  foreclosure_charge_pct: z
    .number()
    .nullable()
    .describe("Foreclosure or prepayment penalty percentage stated"),
  processing_fee: z.number().nullable().describe("Processing or administrative fee in INR"),
  validity_days: z.number().nullable().describe("Validity period of the sanction in days"),
  has_cross_default_lien: z
    .boolean()
    .default(false)
    .describe("Whether banker general lien / cross-default set-off clause is present"),
  severity: z.enum(["critical", "high", "medium", "low"]).default("low"),
  flags: z.array(FlagSchema).default([]),
  extraction_confidence: z.enum(["high", "medium", "low"]).default("high"),
  uncertain_fields: z.array(z.string()).default([]),
});

export type LoanSanctionData = z.infer<typeof LoanSanctionSchema>;

// ─── GST Notice (Form GST DRC-01 / DRC-01A) ──────────────────────────────────

export const GSTNoticeSchema = z.object({
  doc_type: z.literal("gst_notice"),
  form_type: z
    .enum(["DRC-01", "DRC-01A", "DRC-07", "other"])
    .default("DRC-01")
    .describe("GST form type"),
  notice_section: z
    .enum(["73", "74", "74A", "unknown"])
    .default("73")
    .describe("Governing CGST/SGST section (73 = non-fraud, 74 = fraud/willful suppression)"),
  financial_year: z.string().nullable().describe("Financial Year or Tax Period"),
  gstin: z.string().nullable().describe("GSTIN of the taxpayer"),
  tax_demand: z.number().nullable().describe("Tax amount demanded in INR"),
  interest_amount: z.number().nullable().describe("Interest computed or demanded in INR"),
  penalty_amount: z.number().nullable().describe("Penalty demanded in INR"),
  total_demand: z.number().nullable().describe("Total demand payable in INR"),
  notice_date: z.string().nullable().describe("Date of issue of notice (YYYY-MM-DD)"),
  response_deadline: z.string().nullable().describe("Deadline to respond or file DRC-06 (YYYY-MM-DD)"),
  days_remaining: z.number().nullable().describe("Days remaining in IST to respond"),
  has_personal_hearing: z.boolean().default(false).describe("Whether personal hearing date/time is granted"),
  hearing_date: z.string().nullable().describe("Date of personal hearing if specified"),
  issuing_gst_office: z.string().nullable().describe("Issuing GST Ward / Range / Commissionerate"),
  allegation_type: z
    .string()
    .describe(
      "Nature of allegation (e.g. 'ITC mismatch GSTR-2B vs 3B', 'Short payment of outward tax', 'Non-reversal of ineligible credit')"
    ),
  severity: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  flags: z.array(FlagSchema).default([]),
  extraction_confidence: z.enum(["high", "medium", "low"]).default("high"),
  uncertain_fields: z.array(z.string()).default([]),
});

export type GSTNoticeData = z.infer<typeof GSTNoticeSchema>;

// ─── MSME B2B Contract & Invoices (Section 15/16 MSMED + 43B(h)) ─────────────

export const MSMEInvoiceSchema = z.object({
  doc_type: z.literal("msme_contract"),
  invoice_number: z.string().nullable().describe("Invoice or bill number"),
  invoice_date: z.string().nullable().describe("Date of invoice (YYYY-MM-DD)"),
  invoice_amount: z.number().nullable().describe("Total invoice amount in INR"),
  supplier_name: z.string().nullable().describe("Supplier / vendor business name"),
  supplier_udyam_number: z.string().nullable().describe("Udyam registration number of the supplier"),
  enterprise_category: z
    .enum(["micro", "small", "medium", "unknown"])
    .default("micro")
    .describe("Enterprise classification"),
  buyer_name: z.string().nullable().describe("Buyer / customer company name"),
  agreed_credit_days: z.number().nullable().describe("Agreed credit or payment window in days"),
  has_written_agreement: z.boolean().default(true).describe("Whether a written agreement exists between parties"),
  days_overdue: z.number().nullable().describe("Days elapsed beyond the statutory payment window"),
  payment_status: z.enum(["unpaid", "partially_paid", "paid"]).default("unpaid"),
  severity: z.enum(["critical", "high", "medium", "low"]).default("low"),
  flags: z.array(FlagSchema).default([]),
  extraction_confidence: z.enum(["high", "medium", "low"]).default("high"),
  uncertain_fields: z.array(z.string()).default([]),
});

export type MSMEInvoiceData = z.infer<typeof MSMEInvoiceSchema>;

// ─── Real Estate & Property Conveyance (RERA & Suraj Lamp) ───────────────────

export const PropertyContractSchema = z.object({
  doc_type: z.literal("property_contract"),
  agreement_type: z
    .enum([
      "builder_buyer_agreement",
      "sale_deed",
      "agreement_to_sell",
      "gpa_transfer",
      "tripartite_agreement",
      "allotment_letter",
      "other",
    ])
    .default("builder_buyer_agreement")
    .describe("Type of property agreement or conveyance"),
  project_name: z.string().nullish().describe("Name of the real estate project or building"),
  promoter_or_builder_name: z.string().nullish().describe("Developer, builder, or seller name"),
  buyer_or_allottee_name: z.string().nullish().describe("Buyer or allottee name"),
  rera_registration_number: z.string().nullish().describe("RERA project registration number if stated"),
  total_consideration_inr: z.number().nullish().describe("Total purchase price or consideration in INR"),
  super_built_up_area_sqft: z.number().nullish().describe("Super built-up area in square feet"),
  rera_carpet_area_sqft: z.number().nullish().describe("RERA net usable carpet area in square feet"),
  possession_date: z.string().nullish().describe("Scheduled possession date (YYYY-MM-DD)"),
  delay_interest_rate_buyer_pct: z
    .number()
    .nullish()
    .describe("Interest rate charged to buyer for installment delay (percent p.a.)"),
  delay_compensation_rate_promoter_pct: z
    .number()
    .nullish()
    .describe("Compensation or penalty rate payable by builder for possession delay (percent p.a. or per sqft converted)"),
  is_gpa_or_power_of_attorney_sale: z
    .boolean()
    .default(false)
    .describe("Whether title is transferred via General Power of Attorney (GPA) instead of registered conveyance"),
  is_tripartite: z
    .boolean()
    .default(false)
    .describe("Whether agreement involves bank, builder, and buyer with subvention indemnity"),
  has_subvention_indemnity: z
    .boolean()
    .default(false)
    .describe("Whether buyer unconditionally indemnifies bank for loan even if builder halts construction"),
  severity: z.enum(["critical", "high", "medium", "low"]).default("low"),
  flags: z.array(FlagSchema).default([]),
  extraction_confidence: z.enum(["high", "medium", "low"]).default("high"),
  uncertain_fields: z.array(z.string()).default([]),
});

export type PropertyContractData = z.infer<typeof PropertyContractSchema>;

// ─── Consumer Finance: Health Insurance Policy Schedules ────────────────────

export const InsurancePolicySchema = z.object({
  doc_type: z.literal("insurance_policy"),
  insurer_name: z.string().describe("Name of the health insurance company (e.g. Star Health, HDFC ERGO, Care, Niva Bupa)"),
  policy_number: z.string().nullish().describe("Insurance policy number"),
  policy_holder_name: z.string().nullish().describe("Primary insured or proposer name"),
  policy_type: z
    .enum(["individual_health", "family_floater", "critical_illness", "group_health", "top_up", "other"])
    .default("family_floater")
    .describe("Health insurance plan type"),
  sum_insured_inr: z.number().nullish().describe("Base sum insured coverage in INR"),
  policy_start_date: z.string().nullish().describe("Original inception or policy start date (YYYY-MM-DD)"),
  continuous_coverage_months: z
    .number()
    .nullish()
    .describe("Number of continuous active coverage months without break"),
  room_rent_cap_pct: z
    .number()
    .nullish()
    .describe("Daily room rent cap percentage of sum insured (e.g. 1.0 for 1%)"),
  daily_room_rent_limit_inr: z.number().nullish().describe("Fixed daily room rent limit in INR if specified"),
  icu_rent_cap_pct: z
    .number()
    .nullish()
    .describe("ICU daily room rent cap percentage of sum insured (e.g. 2.0 for 2%)"),
  has_proportionate_deduction_clause: z
    .boolean()
    .default(false)
    .describe("Whether policy applies proportionate deduction on all associate medical charges if room limit is exceeded"),
  co_payment_pct: z.number().nullish().describe("Co-payment percentage payable by insured"),
  claim_repudiated: z
    .boolean()
    .default(false)
    .describe("Whether this document is a claim repudiation / rejection letter"),
  repudiation_ground: z
    .string()
    .nullish()
    .describe("Reason cited for claim denial (e.g. non-disclosure of pre-existing condition)"),
  severity: z.enum(["critical", "high", "medium", "low"]).default("low"),
  flags: z.array(FlagSchema).default([]),
  extraction_confidence: z.enum(["high", "medium", "low"]).default("high"),
  uncertain_fields: z.array(z.string()).default([]),
});

export type InsurancePolicyData = z.infer<typeof InsurancePolicySchema>;

// ─── Classification ──────────────────────────────────────────────────────────

export const ClassificationSchema = z.object({
  doc_type: z
    .enum([
      "income_tax_notice",
      "rent_agreement",
      "statutory_form",
      "loan_sanction",
      "gst_notice",
      "msme_contract",
      "property_contract",
      "insurance_policy",
      "unsupported",
    ])
    .describe("Detected document type across Tax, Rent, Banking, MSME, Property, and Insurance domains"),
  is_empty_or_template: z
    .boolean()
    .default(false)
    .describe("True if this is an empty template, blank format, or unfilled form; false if it is a completed document"),
  form_name: z
    .string()
    .nullable()
    .describe("Form name or document title if identifiable"),
  section_ref: z
    .string()
    .nullable()
    .describe("Section or rule number cited if identifiable"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Classification confidence 0-1"),
  reason: z.string().describe("Brief justification for the classification"),
});

export type ClassificationData = z.infer<typeof ClassificationSchema>;

// ─── JSON Schema exports (for BharatCode structured output) ──────────────────

/** JSON Schema representation of the Income Tax Notice extraction schema. */
export const IncomeTaxNoticeJSONSchema = toJSONSchema(IncomeTaxNoticeSchema, {
  target: "draft-2020-12",
});

/** JSON Schema representation of the Rent Agreement extraction schema. */
export const RentAgreementJSONSchema = toJSONSchema(RentAgreementSchema, {
  target: "draft-2020-12",
});

/** JSON Schema representation of the Statutory Form extraction schema. */
export const StatutoryFormJSONSchema = toJSONSchema(StatutoryFormSchema, {
  target: "draft-2020-12",
});

/** JSON Schema representation of the Loan Sanction extraction schema. */
export const LoanSanctionJSONSchema = toJSONSchema(LoanSanctionSchema, {
  target: "draft-2020-12",
});

/** JSON Schema representation of the GST Notice extraction schema. */
export const GSTNoticeJSONSchema = toJSONSchema(GSTNoticeSchema, {
  target: "draft-2020-12",
});

/** JSON Schema representation of the MSME Invoice extraction schema. */
export const MSMEInvoiceJSONSchema = toJSONSchema(MSMEInvoiceSchema, {
  target: "draft-2020-12",
});

/** JSON Schema representation of the Property Contract extraction schema. */
export const PropertyContractJSONSchema = toJSONSchema(PropertyContractSchema, {
  target: "draft-2020-12",
});

/** JSON Schema representation of the Insurance Policy extraction schema. */
export const InsurancePolicyJSONSchema = toJSONSchema(InsurancePolicySchema, {
  target: "draft-2020-12",
});

/** JSON Schema representation of the General Document extraction schema. */
export const GeneralDocJSONSchema = toJSONSchema(GeneralDocSchema, {
  target: "draft-2020-12",
});

/** JSON Schema representation of the Classification schema. */
export const ClassificationJSONSchema = toJSONSchema(ClassificationSchema, {
  target: "draft-2020-12",
});

// ─── Aliases for convenience ────────────────────────────────────────────────
export {
  ClassificationJSONSchema as classificationJsonSchema,
  IncomeTaxNoticeJSONSchema as itNoticeJsonSchema,
  RentAgreementJSONSchema as rentAgreementJsonSchema,
  StatutoryFormJSONSchema as statutoryFormJsonSchema,
  LoanSanctionJSONSchema as loanSanctionJsonSchema,
  GSTNoticeJSONSchema as gstNoticeJsonSchema,
  MSMEInvoiceJSONSchema as msmeInvoiceJsonSchema,
  PropertyContractJSONSchema as propertyContractJsonSchema,
  InsurancePolicyJSONSchema as insurancePolicyJsonSchema,
  GeneralDocJSONSchema as generalDocJsonSchema,
};

export type IncomeTaxNotice = IncomeTaxNoticeData;
export type RentAgreement = RentAgreementData;
export type StatutoryForm = StatutoryFormData;
export type LoanSanction = LoanSanctionData;
export type GSTNotice = GSTNoticeData;
export type MSMEInvoice = MSMEInvoiceData;
export type PropertyContract = PropertyContractData;
export type InsurancePolicy = InsurancePolicyData;
export type GeneralDoc = GeneralDocData;
export type Classification = ClassificationData;
