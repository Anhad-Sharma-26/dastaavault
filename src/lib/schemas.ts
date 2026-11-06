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

// ─── Classification ──────────────────────────────────────────────────────────

export const ClassificationSchema = z.object({
  doc_type: z
    .enum(["income_tax_notice", "rent_agreement", "unsupported"])
    .describe("Detected document type"),
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

/** JSON Schema representation of the Classification schema. */
export const ClassificationJSONSchema = toJSONSchema(ClassificationSchema, {
  target: "draft-2020-12",
});

// ─── Aliases for convenience ────────────────────────────────────────────────
export {
  ClassificationJSONSchema as classificationJsonSchema,
  IncomeTaxNoticeJSONSchema as itNoticeJsonSchema,
  RentAgreementJSONSchema as rentAgreementJsonSchema,
};

export type IncomeTaxNotice = IncomeTaxNoticeData;
export type RentAgreement = RentAgreementData;
export type Classification = ClassificationData;
