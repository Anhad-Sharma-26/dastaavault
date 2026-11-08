/**
 * @module prompts
 * @description All prompt templates for the DastaaVault analysis pipeline.
 *
 * Each function returns a string prompt ready to be sent to the model.
 * The prompts are designed for the BharatCode / Qwen / Gemini models.
 */

import type { Language } from "@/lib/types";

/**
 * Vision OCR prompt — instructs the model to transcribe all visible
 * text from a document image exactly as printed.
 */
export function getTranscriptionPrompt(): string {
  return `You are a precise document OCR system. Your job is to transcribe ALL text visible in this document image exactly as printed.

Rules:
1. Transcribe every word, number, heading, footer, watermark, and stamp text you can see.
2. Preserve the original layout as much as possible using line breaks and spacing.
3. For text you cannot read clearly, write [illegible] in its place.
4. Do NOT interpret, summarise, or rephrase — just transcribe.
5. If the document has tables, reproduce them using plain-text alignment or markdown table syntax.
6. Include dates, reference numbers, addresses, and all other details exactly as printed.
7. If the image contains no readable text, respond with: [no readable text found]

Output the transcribed text and nothing else.`;
}

/**
 * Classification prompt — classifies transcribed text into one of the
 * supported document types and detects if it is an empty template.
 *
 * @param text - The transcribed (and PII-masked) document text.
 */
export function getClassificationPrompt(text: string): string {
  return `You are an expert document classifier for Indian documents. Given the transcribed text of a document, classify it into exactly one of the following categories:

1. "income_tax_notice" — Any notice, intimation, demand notice, penalty order, or assessment communication issued to a taxpayer by the Income Tax Department of India (e.g., sections 139(9), 142(1), 143(1), 144, 147, 148, 154, 156, 221, 231, 245, 271, 276C, or their 2025-Act equivalents) with assessment details or demands.
2. "rent_agreement" — A residential or commercial rent / lease deed or agreement between a landlord and tenant.
3. "statutory_form" — Any Indian statutory form, procedural filing format, declaration, certificate, or rule template (e.g., Form No. 7 application u/s 35(2AA), Form No. 1, Form 10BA, Form 15G/H, Form 16 format, Form 26AS template, ITR templates) — whether it is an empty blank template or filled in.
4. "loan_sanction" — Any bank or NBFC loan sanction letter, loan agreement, or Key Fact Statement (KFS) table (e.g., home loan, personal loan, MSME term loan, car loan sanction letters from SBI, HDFC, ICICI, etc.).
5. "gst_notice" — Any GST notice, summary of show cause notice (Form GST DRC-01), pre-SCN intimation (Form GST DRC-01A), or order (DRC-07) issued under Section 73, 74, or 74A of the CGST/SGST Act.
6. "msme_contract" — Any commercial B2B supplier invoice, purchase order, or vendor supply contract with credit terms governed by the MSMED Act 2006 (Section 15/16) or Income Tax Act Section 43B(h).
7. "unsupported" — Any other general document (e.g., electricity or utility bills, identity cards, corporate reports).

Rules:
- If the document is a blank statutory form with unfilled tables/blanks, classify as "statutory_form" and set "is_empty_or_template" to true.
- Identify the exact form title in "form_name".
- If a section or rule is cited, put it in "section_ref".
- Provide a confidence score between 0 and 1.
- Provide a brief justification in "reason".

Transcribed text:
---
${text}
---

Respond with valid JSON matching this schema:
{
  "doc_type": "income_tax_notice" | "rent_agreement" | "statutory_form" | "loan_sanction" | "gst_notice" | "msme_contract" | "unsupported",
  "is_empty_or_template": boolean,
  "form_name": string | null,
  "section_ref": string | null,
  "confidence": number,
  "reason": string
}`;
}

/**
 * Extraction prompt — extracts structured fields from PII-masked
 * transcribed text according to the document type.
 *
 * @param text - PII-masked transcribed text.
 * @param docType - One of the supported document types.
 * @param sectionMappingContext - Optional context about section mappings.
 */
export function getExtractionPrompt(
  text: string,
  docType: string,
  sectionMappingContext: string
): string {
  if (docType === "income_tax_notice") {
    return `You are an expert Indian tax document analyst. Extract structured information from the following Income Tax notice text.

IMPORTANT RULES:
1. Work from the masked text below — do NOT try to reconstruct any redacted PII.
2. Use null for any field you cannot determine from the text.
3. For "notice_section_printed", extract the section number exactly as printed (e.g., "143(1)", "148A").
4. For "act_version", determine if the notice cites the Income Tax Act 1961 or the new 2025 Act based on section numbers and language.
5. For "notice_section_mapped", use the following mapping context to provide the corresponding section in the other Act:
${sectionMappingContext || "No mapping context available."}
6. For dates, use ISO 8601 format (YYYY-MM-DD).
7. For "response_deadline", extract the exact deadline mentioned in the notice. Set "response_deadline_source" to "verbatim".
8. For "days_remaining", compute the difference between the response_deadline and today's date in IST. If no deadline, set to null.
9. For "severity", assess based on the nature of the notice:
   - "critical": prosecution, criminal proceedings, large demands (>₹1,00,000)
   - "high": scrutiny notices, reassessment, demands ₹50,000–₹1,00,000
   - "medium": intimations with adjustments, rectifications
   - "low": routine intimations, refund notices
10. List all key claims or charges in "key_claims".
11. Note any high-stakes indicators (prosecution, penalty, criminal) in "high_stakes_flags".
12. Set "extraction_confidence" based on text clarity and completeness.
13. List field names you are unsure about in "uncertain_fields".

Masked document text:
---
${text}
---

Extract all fields and respond with valid JSON matching the Income Tax Notice schema.`;
  }

  if (docType === "rent_agreement") {
    return `You are an expert Indian real estate document analyst. Extract structured information from the following rent/lease agreement text.

IMPORTANT RULES:
1. Work from the masked text below — do NOT try to reconstruct any redacted PII.
2. Use null for any field you cannot determine from the text.
3. For dates, use ISO 8601 format (YYYY-MM-DD).
4. For monetary values, use numbers without currency symbols (always INR assumed).
5. If "security_deposit_months" is not explicitly stated but you can compute it from security_deposit and monthly_rent, do so.
6. For "escalation_pct", extract the annual rent increase percentage if mentioned.
7. For "maintenance_included", determine if maintenance/common area charges are included in rent or separate.
8. For "registration_required", note if the agreement mentions registration under the Registration Act.
9. For "stamp_duty_mentioned", note if stamp duty is discussed.
10. Generate "flags" for any concerning clauses you notice:
    - One-sided termination clauses
    - Unusual penalty clauses
    - Missing standard protections
    Each flag needs: flag_id (snake_case), severity ("warning" or "info"), title, and detail.
11. Set "extraction_confidence" based on text clarity and completeness.
12. List field names you are unsure about in "uncertain_fields".

Masked document text:
---
${text}
---

Extract all fields and respond with valid JSON matching the Rent Agreement schema.`;
  }

  if (docType === "loan_sanction") {
    return `You are an expert Indian banking & retail credit analyst. Extract structured information from the following loan sanction letter or Key Fact Statement (KFS).

IMPORTANT RULES:
1. Work from the masked text below — do NOT try to reconstruct any redacted PII.
2. Extract "lender_name" (e.g. "State Bank of India", "HDFC Bank Ltd", "ICICI Bank").
3. Determine "borrower_type": "individual" or "non_individual" (firm/company).
4. Determine "loan_type": "home_loan", "personal_loan", "vehicle_loan", "business_loan", etc.
5. Extract "sanctioned_amount" as a pure number in INR.
6. Extract "interest_rate" (e.g. 8.75).
7. Extract "interest_type": "fixed", "floating", or "hybrid". If benchmark/spread is mentioned (Repo rate + spread), it is "floating".
8. Extract "benchmark_type" (e.g. "repo_rate", "mclr", "base_rate").
9. Extract "spread_or_markup" (e.g. 2.25).
10. Extract "tenor_months" (total loan tenure in months).
11. Extract "monthly_emi" in INR.
12. Extract "annual_percentage_rate" (APR) if explicitly stated in the Key Fact Statement table, else null.
13. Set "is_kfs_present" to true if a standardized Key Fact Statement table is included.
14. Extract "foreclosure_charge_pct" (prepayment / foreclosure penalty percentage). If stated as nil / zero, put 0.
15. Extract "processing_fee" in INR.
16. Extract "validity_days" (days before sanction expires).
17. Set "has_cross_default_lien" to true if the agreement mentions banker's general lien, right of set-off, or cross-collateralization under Section 171 Contract Act.
18. Set "severity": "high" if an individual floating loan levies foreclosure penalties, else "low" or "medium".

Masked document text:
---
${text}
---

Extract all fields and respond with valid JSON matching the Loan Sanction schema.`;
  }

  if (docType === "gst_notice") {
    return `You are an expert Indian GST & tax litigation analyst. Extract structured information from the following GST show cause notice or communication.

IMPORTANT RULES:
1. Work from the masked text below.
2. Extract "form_type": "DRC-01", "DRC-01A", "DRC-07", or "other".
3. Extract "notice_section": "73" (determination of tax not paid for reason other than fraud), "74" (fraud, willful misstatement, suppression of facts), or "74A".
4. Extract "financial_year" or tax period (e.g. "2023-24").
5. Extract "gstin" if present.
6. Extract monetary values: "tax_demand", "interest_amount", "penalty_amount", and "total_demand" in INR.
7. Extract "notice_date" (YYYY-MM-DD).
8. Extract "response_deadline" (YYYY-MM-DD). If 30 days is stated from date of notice, compute the date.
9. Compute "days_remaining" in IST until the response deadline.
10. Check if a personal hearing is granted: set "has_personal_hearing" to true/false and extract "hearing_date" if stated.
11. Extract "issuing_gst_office" (Range, Division, Commissionerate).
12. Summarize "allegation_type" (e.g. "Input Tax Credit (ITC) mismatch GSTR-2B vs 3B", "Short payment of outward supplies in GSTR-1").
13. Set "severity": "critical" if Section 74 (fraud), "high" if total demand > ₹1,00,000, else "medium".

Masked document text:
---
${text}
---

Extract all fields and respond with valid JSON matching the GST Notice schema.`;
  }

  if (docType === "msme_contract") {
    return `You are an expert Indian MSME and commercial contract analyst. Extract structured information from the following B2B invoice or supply contract.

IMPORTANT RULES:
1. Work from the masked text below.
2. Extract "invoice_number" and "invoice_date" (YYYY-MM-DD).
3. Extract "invoice_amount" in INR.
4. Extract "supplier_name" and "buyer_name".
5. Extract "supplier_udyam_number" (e.g. UDYAM-XX-00-0000000) if stated.
6. Determine "enterprise_category": "micro", "small", "medium", or "unknown".
7. Extract "agreed_credit_days" (stated payment term, e.g. 30, 45, 60, 90 days).
8. Determine "has_written_agreement": true if part of an agreement/work order, false if plain purchase order/invoice.
9. Extract "days_overdue" if the payment due date has elapsed.
10. Determine "payment_status": "unpaid", "partially_paid", or "paid".
11. Set "severity": "high" if credit days > 45 or bill is overdue, else "low".

Masked document text:
---
${text}
---

Extract all fields and respond with valid JSON matching the MSME Invoice schema.`;
  }

  if (docType === "statutory_form") {
    return `You are an expert Indian statutory & tax document analyst. Extract structured information from the following statutory form text (even if it is a blank or empty template).

Context on Section Mappings (1961 ↔ 2025 Act):
${sectionMappingContext || "No mapping context available."}

IMPORTANT RULES:
1. Extract "form_name" (e.g. "Form No. 7: Application for approval of scientific research programme under section 35(2AA)").
2. Extract "rule_or_section" (e.g. "35(2AA)", "Rule 5F", "10BA").
3. Set "notice_section_printed" to the section number printed (e.g. "35(2AA)").
4. Set "notice_section_mapped" to any related section under the new 2025 Act or related tax code, or null.
5. Set "is_blank_template" to true if the form has blank fields / empty tables / uncompleted rows, false if filled with actual assessee data.
6. In "purpose", explain what this form is officially used for in Indian law.
7. In "target_audience", state who submits it.
8. In "key_requirements", list 3-5 bullet points of required information or attachments.
9. Set "issuing_authority" to the receiving or prescribed authority.
10. Set "severity" to "low" (blank statutory forms carry zero tax liability).

Masked document text:
---
${text}
---

Extract all fields and respond with valid JSON matching the Statutory Form schema.`;
  }

  // Unsupported / General Document
  return `You are a document analyst. Extract structured identification from the following general or non-tax document.

Masked document text:
---
${text}
---

Extract:
1. "title": Exact document name or description (e.g. "Electricity Consumption Bill", "Retail Invoice").
2. "summary": One clear sentence summarizing what the document is.
3. "issuing_authority": Entity or authority that issued it (e.g. "BSES Rajdhani Power Limited").
4. "reference_number": Consumer number, account number, or invoice reference, or null.
5. "amount_due": Any amount payable or recorded in INR, or null.
6. "due_date": Any due date mentioned, or null.
7. "is_blank_template": Whether it is an unfilled template format.
8. "severity": "low".

Extract all fields and respond with valid JSON matching the General Document schema.`;
}

/**
 * Explanation prompt — generates a plain-language summary with an
 * action checklist.
 *
 * @param structuredJson - Stringified extraction result.
 * @param language - Target language for the explanation.
 * @param docType - Document type for context-specific guidance.
 */
export function getExplanationPrompt(
  structuredJson: string,
  language: Language,
  docType: string
): string {
  const languageInstruction = {
    en: "Write the explanation in clear, simple English.",
    hi: "पूरा विवरण सरल हिन्दी में लिखें। तकनीकी शब्दों का हिन्दी अनुवाद दें और कोष्ठक में अंग्रेज़ी शब्द रखें।",
    hinglish:
      "Explanation Hinglish mein likho — Hindi aur English mix karo, jaise log normally baat karte hain. Technical terms English mein rakh sakte ho.",
  }[language];

  let docTypeGuidance = "";
  if (docType === "income_tax_notice") {
    docTypeGuidance = `This is an Income Tax notice. If both old (1961 Act) and new (2025 Act) section numbers are available, mention BOTH so the reader understands regardless of which Act they know.`;
  } else if (docType === "rent_agreement") {
    docTypeGuidance = `This is a Rent Agreement. Focus on tenant rights and obligations, financial commitments, and any clauses that may be unfavourable.`;
  } else if (docType === "loan_sanction") {
    docTypeGuidance = `This is a Bank / NBFC Loan Sanction Letter or Key Fact Statement (KFS).
IMPORTANT:
- Compare the headline interest rate with the Annual Percentage Rate (APR).
- CRITICAL CHECK: If this is an individual borrower on a floating interest rate, check if the lender has illegally levied foreclosure or prepayment charges. Quote RBI Circular DBOD.No.Dir.BC.107/13.03.00/2011-12 which strictly bans prepayment penalties on floating loans to individuals.
- Check for banker's general lien / right of set-off under Section 171 of the Contract Act.
- Remind the borrower of their statutory right to have all original property title deeds returned and CERSAI charges cleared within 30 days of loan repayment, subject to ₹5,000 per day compensation from the bank for any delay.`;
  } else if (docType === "gst_notice") {
    docTypeGuidance = `This is a GST Show Cause Notice (Form GST DRC-01 / DRC-01A).
IMPORTANT:
- State whether it is issued under Section 73 (non-fraud, 10% penalty) or Section 74 (fraud / suppression of facts, 100% penalty).
- Highlight the 30-day response window to file Form GST DRC-06.
- Check whether the officer scheduled a mandatory personal hearing as required under Section 75(4) of the CGST Act.
- Warn the taxpayer not to rely solely on the brief portal summary table, but to examine the full factual SCN Annexure before filing a reply.`;
  } else if (docType === "msme_contract") {
    docTypeGuidance = `This is an MSME B2B Supply Contract or Invoice governed by the MSMED Act 2006 and Income Tax Section 43B(h).
IMPORTANT:
- Check the credit period. Under Section 15 of the MSMED Act, payment terms cannot exceed 45 days (or 15 days without written agreement). Any contract clause allowing 60, 90, or 120 days is VOID.
- Calculate statutory compound interest with monthly rests at 3× the RBI bank rate (19.5% p.a.) under Section 16 if overdue.
- Alert the buyer regarding Section 43B(h) of the Income Tax Act: overdue MSME bills at financial year-end are completely disallowed as tax deductions, inflating their taxable profit.`;
  } else if (docType === "statutory_form") {
    docTypeGuidance = `This is an Indian Statutory Form or Template (e.g. Form No. 7 under Section 35(2AA), Form No. 1, etc.).
IMPORTANT:
- If this is a blank template, reassure the reader right away: "This is an UNFILLED STATUTORY TEMPLATE. It does NOT contain any tax demand, penalty, or adverse proceeding against you."
- Explain clearly what the form is used for in Indian tax law, who needs to file it, and what key information or attachments are required to fill it.
- Explain the statutory section context.
- Provide practical next steps if they intend to complete or submit this form.`;
  } else {
    docTypeGuidance = `This is a general or non-assessment document (such as a utility bill, invoice, or certificate). Explain what it is in simple terms, note any financial amounts or dates mentioned, and clarify that it is outside tax notice or rent lease scope.`;
  }

  return `You are a helpful document advisor explaining an Indian legal/financial document to a common person who may not have legal or tax knowledge.

${languageInstruction}

${docTypeGuidance}

Rules:
1. Start with a ONE-LINE summary of what this document is and what it means for the reader.
2. Then explain each important finding in 2-3 simple sentences. Use bullet points.
3. When quoting amounts, dates, or specific text from the document, put them in **bold**.
4. If there are any warnings or red flags, highlight them clearly with ⚠️ emoji. If it is an empty statutory template, clearly note that there is zero demand or penalty.
5. At the end, provide a NUMBERED ACTION CHECKLIST — specific steps the reader should take, in order of urgency.
6. End with this exact disclaimer: "⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal or tax advice. Please consult a qualified professional for decisions."
7. Keep the total explanation under 800 words.

Structured data:
\`\`\`json
${structuredJson}
\`\`\`

Write the explanation now.`;
}
