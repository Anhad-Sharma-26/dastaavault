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

// ─── Classification ──────────────────────────────────────────────────────────

export const ClassificationSchema = z.object({
  doc_type: z
    .enum(["income_tax_notice", "rent_agreement", "statutory_form", "unsupported"])
    .describe("Detected document type. Use 'statutory_form' for blank or filled statutory tax forms, applications, or rule templates like Form 7, Form 1, Form 10, Form 16 blank, Form 26AS, etc."),
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
  GeneralDocJSONSchema as generalDocJsonSchema,
};

export type IncomeTaxNotice = IncomeTaxNoticeData;
export type RentAgreement = RentAgreementData;
export type StatutoryForm = StatutoryFormData;
export type GeneralDoc = GeneralDocData;
export type Classification = ClassificationData;
