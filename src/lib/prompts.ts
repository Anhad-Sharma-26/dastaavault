/**
 * @module prompts
 * @description All prompt templates for the DastaaVault analysis pipeline.
 *
 * Each function returns a string prompt ready to be sent to the model.
 * The prompts are designed for the BharatCode / Qwen model.
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
 * supported document types.
 *
 * @param text - The transcribed (and PII-masked) document text.
 */
export function getClassificationPrompt(text: string): string {
  return `You are a document classifier for Indian documents. Given the transcribed text of a document, classify it into exactly one of the following categories:

1. "income_tax_notice" — Any notice, intimation, demand notice, penalty order, or assessment communication issued by the Income Tax Department of India (e.g., sections 139(9), 142(1), 143(1), 144, 147, 148, 154, 156, 221, 231, 245, 271, 276C, or their 2025-Act equivalents). Note: blank statutory application templates or routine stock broker statements (such as Form 1 or Form 7) are not notices issued to a taxpayer with a tax demand.
2. "rent_agreement" — A residential or commercial rent / lease deed or agreement between a landlord and tenant.
3. "unsupported" — Any other document type (e.g., blank procedural forms, invoices, utility bills, identity cards, corporate reports).

Rules:
- Be confident. Only classify as "income_tax_notice" or "rent_agreement" if you are reasonably sure.
- If classifying as "unsupported", specify what document it appears to be in the "reason" field (e.g., "Statutory filing form: Form No. 7 application for scientific research", "Form No. 1 stock exchange statement", "Electricity utility bill").
- Provide a confidence score between 0 and 1.

Transcribed text:
---
${text}
---

Respond with valid JSON matching this schema: { "doc_type": string, "confidence": number, "reason": string }`;
}

/**
 * Extraction prompt — extracts structured fields from PII-masked
 * transcribed text according to the document type.
 *
 * @param text - PII-masked transcribed text.
 * @param docType - One of "income_tax_notice" or "rent_agreement".
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

  // Rent Agreement
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

  const docTypeGuidance =
    docType === "income_tax_notice"
      ? `This is an Income Tax notice. If both old (1961 Act) and new (2025 Act) section numbers are available, mention BOTH so the reader understands regardless of which Act they know.`
      : `This is a Rent Agreement. Focus on tenant rights and obligations, financial commitments, and any clauses that may be unfavourable.`;

  return `You are a helpful document advisor explaining an Indian legal/financial document to a common person who may not have legal or tax knowledge.

${languageInstruction}

${docTypeGuidance}

Rules:
1. Start with a ONE-LINE summary of what this document is and what it means for the reader.
2. Then explain each important finding in 2-3 simple sentences. Use bullet points.
3. When quoting amounts, dates, or specific text from the document, put them in **bold**.
4. If there are any warnings or red flags, highlight them clearly with ⚠️ emoji.
5. At the end, provide a NUMBERED ACTION CHECKLIST — specific steps the reader should take, in order of urgency.
6. End with this exact disclaimer: "⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal or tax advice. Please consult a qualified professional for decisions."
7. Quote relevant text from the document to support your explanations where helpful.
8. Keep the total explanation under 800 words.

Structured data:
\`\`\`json
${structuredJson}
\`\`\`

Write the explanation now.`;
}
