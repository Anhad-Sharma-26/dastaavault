/**
 * @module pii-masker
 * @description PII masking utilities applied to transcribed text
 * before sending it onward for extraction / explanation.
 *
 * Each function is idempotent — running it twice on the same text
 * produces the same result.
 */

/**
 * Mask PAN numbers.
 *
 * Pattern: `[A-Z]{5}\d{4}[A-Z]`
 * Output : first 4 chars + "****" + last char
 *
 * @example maskPAN("ABCDE1234F") → "ABCD****F"
 */
export function maskPAN(text: string): string {
  return text.replace(/[A-Z]{5}\d{4}[A-Z]/g, (match) => {
    return match.slice(0, 4) + "****" + match.slice(-1);
  });
}

/**
 * Mask Aadhaar numbers.
 *
 * Pattern: `\d{4}\s?\d{4}\s?\d{4}`
 * Output : "XXXX XXXX " + last 4 digits
 */
export function maskAadhaar(text: string): string {
  return text.replace(/\d{4}\s?\d{4}\s?\d{4}/g, (match) => {
    const digits = match.replace(/\s/g, "");
    return "XXXX XXXX " + digits.slice(-4);
  });
}

/**
 * Mask phone numbers.
 *
 * Pattern: optional `+91` prefix followed by 10 digits.
 * Output : "XXXXX" + last 5 digits
 */
export function maskPhone(text: string): string {
  return text.replace(/(?:\+91[\s-]?)?\d{10}/g, (match) => {
    const digits = match.replace(/\D/g, "");
    return "XXXXX" + digits.slice(-5);
  });
}

/**
 * Mask email addresses.
 *
 * Pattern: standard email regex.
 * Output : first 2 chars + "***@" + domain
 */
export function maskEmail(text: string): string {
  return text.replace(/[\w.-]+@[\w.-]+\.\w+/g, (match) => {
    const [local, domain] = match.split("@");
    return local.slice(0, 2) + "***@" + domain;
  });
}

/**
 * Run all PII masks in sequence.
 *
 * Order matters: PAN before Aadhaar (both contain digit runs),
 * then phone, then email.
 */
export function maskAll(text: string): string {
  let masked = text;
  masked = maskPAN(masked);
  masked = maskAadhaar(masked);
  masked = maskPhone(masked);
  masked = maskEmail(masked);
  return masked;
}
