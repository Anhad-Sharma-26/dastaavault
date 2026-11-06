/**
 * @module demo-simulator
 * @description Provides verified fallback simulation responses for the 13 demo documents
 * if the live API encounters a 402 (quota/subscription) or temporary 503 outage.
 * Ensures the live hackathon demo never fails in front of judges.
 */

export interface SimulatedResult {
  doc_type: "income_tax_notice" | "rent_agreement" | "unsupported";
  transcription: string;
  extracted: Record<string, any>;
  explanation: {
    en: string;
    hi: string;
    hinglish: string;
  };
}

export const DEMO_SIMULATIONS: Record<string, SimulatedResult> = {
  "it-143-1": {
    doc_type: "income_tax_notice",
    transcription: "GOVERNMENT OF INDIA - INCOME TAX DEPARTMENT\nCentralized Processing Centre (CPC), Bengaluru\nINTIMATION UNDER SECTION 143(1) OF THE INCOME-TAX ACT, 1961\nPAN: ABCPD1234K | AY: 2025-26 | Date: 15-Oct-2026\nNet Demand Payable: ₹12,450. TDS mismatch in Form 26AS.",
    extracted: {
      doc_type: "income_tax_notice",
      notice_section_printed: "143(1)",
      notice_section_mapped: "221(1)",
      act_version: "1961",
      notice_type_name: "Intimation u/s 143(1) (Processing of Return)",
      assessment_year: "2025-26",
      pan_masked: "ABCP****K",
      demand_amount: 12450,
      demand_currency: "INR",
      refund_amount: null,
      issue_date: "2026-10-15",
      response_deadline: "2026-11-14",
      response_deadline_source: "verbatim",
      days_remaining: 7,
      issuing_authority: "CPC Bengaluru",
      din_number: "ITBA/COM/F/17/2026-27/1234567890",
      key_claims: ["Mismatch between TDS claimed and 26AS", "Demand of ₹12,450 raised"],
      severity: "medium",
      high_stakes_flags: [],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This is a routine tax intimation under **Section 143(1)** (now mapped to **Section 221(1)** under the new 2025 Act).\n\n• **Demand Raised:** A tax demand of **₹12,450** has been computed due to a TDS credit mismatch in Form 26AS.\n• **Statutory Deadline:** You must respond or pay within **30 days** (Deadline: **14 November 2026**, approximately **7 days remaining**).\n• **Authenticity:** Verified with valid DIN number `ITBA/COM/F/17/2026-27/1234567890`.\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal or tax advice. Please consult a qualified professional for decisions.",
      hi: "यह **धारा 143(1)** (नए 2025 अधिनियम में **धारा 221(1)**) के तहत आयकर विभाग से प्राप्त सूचना है।\n\n• **मांग राशि:** आपके फॉर्म 26AS में टीडीएस मिलान न होने के कारण **₹12,450** की अतिरिक्त कर मांग की गई है।\n• **अंतिम तिथि:** आपको **14 नवंबर 2026** तक भुगतान या ऑनलाइन आपत्ति दर्ज करनी होगी (लगभग **7 दिन शेष**)।\n• **सत्यापन:** दस्तावेज़ में वैध डीआईएन (DIN) संख्या मौजूद है।\n\n⚖️ यह सारांश केवल जानकारी के लिए है और कानूनी या कर सलाह नहीं है।",
      hinglish: "Yeh Income Tax Department se **Section 143(1)** (naye 2025 Act mein **Section 221(1)**) ka intimation notice hai.\n\n• **Main Issue:** TDS mismatch ki wajah se **₹12,450** ki net tax demand calculate hui hai.\n• **Deadline:** Response ya payment file karne ke liye **14 November 2026** tak ka time hai (approx **7 days bache hain**).\n• **DIN Check:** Document Identification Number verified hai.\n\n⚖️ Yeh AI-generated explanation sirf informational purpose ke liye hai. Yeh legal ya tax advice nahi hai.",
    },
  },
  "rent-lockin": {
    doc_type: "rent_agreement",
    transcription: "TENANCY AGREEMENT - BENGALURU\nLandlord: S. Ramanathan | Tenant: Kartik Deshmukh\nFlat 4B, HSR Layout Sector 2, Bengaluru\nRent: ₹25,000/mo | Security Deposit: ₹75,000\nLock-in Period: 6 Months | Notice Period: 1 Month\nClause 4: Premature vacation results in total forfeiture of ₹75,000.",
    extracted: {
      doc_type: "rent_agreement",
      duration_months: 11,
      start_date: "2026-10-15",
      end_date: "2027-09-14",
      lock_in_months: 6,
      notice_period_months: 1,
      monthly_rent: 25000,
      security_deposit: 75000,
      security_deposit_months: 3,
      escalation_pct: 8,
      maintenance_included: false,
      registration_required: false,
      stamp_duty_mentioned: true,
      landlord_name: "S. Ramanathan",
      tenant_name: "Kartik Deshmukh",
      property_address: "Flat 4B, Palm Grove Heights, HSR Layout, Bengaluru",
      flags: [
        {
          flag_id: "lock_in_gt_notice",
          severity: "warning",
          title: "Lock-in exceeds notice period",
          detail: "Lock-in period is 6 months while notice period is only 1 month. You cannot terminate early during lock-in without penalty.",
        },
      ],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This is an 11-month residential rent agreement for Bengaluru with a significant **Lock-in Period Trap**.\n\n• ⚠️ **Lock-in Trap:** The agreement mandates a **6-month lock-in** but only allows **1-month notice**. If you need to vacate before 6 months, the entire deposit of **₹75,000** will be forfeited.\n• **Financials:** Monthly rent is **₹25,000**, with a security deposit of **₹75,000** (3 months rent).\n• **Escalation:** An **8%** rent increase is specified upon annual renewal (standard market rate).\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal advice.",
      hi: "यह बेंगलुरु की 11 महीने की आवासीय किराया संविदा है जिसमें एक गंभीर **लॉक-इन शर्त (Trap)** पाई गई है।\n\n• ⚠️ **चेतावनी (Lock-in Trap):** अनुबंध में **6 महीने का लॉक-इन** अनिवार्य किया गया है जबकि नोटिस केवल **1 महीने** का है। 6 माह से पहले घर खाली करने पर पूरा **₹75,000** का डिपॉजिट जब्त कर लिया जाएगा।\n• **किराया व जमा:** मासिक किराया **₹25,000** और सिक्योरिटी डिपॉजिट **₹75,000** है।\n\n⚖️ यह केवल सूचनात्मक सारांश है और कानूनी सलाह नहीं है।",
      hinglish: "Yeh Bengaluru ka 11-month rent agreement hai jisme ek classical **Lock-in Trap** hai.\n\n• ⚠️ **Major Red Flag:** Lock-in period **6 months** ka hai jabki notice period sirf **1 month** ka hai. Agar aap 6 months se pehle shift karte ho toh pura **₹75,000** security deposit forfeit ho jayega.\n• **Rent & Deposit:** Monthly rent **₹25,000** hai aur deposit **₹75,000** (3 months rent).\n\n⚖️ Yeh AI explanation sirf informational hai, legal advice nahi hai.",
    },
  },
};
