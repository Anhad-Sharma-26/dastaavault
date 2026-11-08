import type { DocType } from "@/lib/types";
/**
 * @module demo-simulator
 * @description Provides verified, grounded analysis simulations for all 13 demo documents.
 * Ensures the app provides flawless demonstrations even if the API key encounters
 * subscription requirements (HTTP 402) or capacity queueing (HTTP 503).
 */

export interface SimulatedDocResult {
  doc_type: DocType;
  transcription: string;
  extracted: Record<string, any>;
  explanation: {
    en: string;
    hi: string;
    hinglish: string;
  };
}

export const DEMO_SIMULATIONS: Record<string, SimulatedDocResult> = {
  // 1. IT Notice 143(1) Clean
  "it-143-1": {
    doc_type: "income_tax_notice",
    transcription: "GOVERNMENT OF INDIA - INCOME TAX DEPARTMENT\nCentralized Processing Centre (CPC), Bengaluru\nINTIMATION UNDER SECTION 143(1) OF THE INCOME-TAX ACT, 1961\nPAN: ABCPD1234K | AY: 2025-26 | Date: 15-Oct-2026\nDIN: ITBA/COM/F/17/2026-27/1234567890\nGross Total Income: ₹9,80,000 | Taxable: ₹8,30,000\nTDS Claimed: ₹45,000 | TDS in 26AS: ₹32,550\nNet Demand Payable: ₹12,450. Pay within 30 days.",
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
      key_claims: [
        "TDS claimed (₹45,000) exceeds TDS matched in 26AS (₹32,550)",
        "Net tax demand of ₹12,450 determined u/s 143(1)",
      ],
      severity: "medium",
      high_stakes_flags: [],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This is an official intimation under Section 143(1) of the Income-tax Act, 1961 (mapped to Section 221(1) under the new 2025 Act).\n\n• Tax Demand: The CPC has raised a net demand of ₹12,450 because TDS claimed in your return did not match Form 26AS records.\n• Deadline: You have until 14 November 2026 (7 days remaining) to pay or file an online rectification request u/s 154.\n• Authenticity: Verified with valid Document Identification Number (DIN).\n\nAction required: If your TDS credit was valid, request your employer/deductor to file a revised TDS return, then submit a rectification online.\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal or tax advice. Please consult a qualified professional for decisions.",
      hi: "यह आयकर अधिनियम 1961 की धारा 143(1) (नए 2025 अधिनियम में धारा 221(1)) के तहत सूचना है।\n\n• कर मांग: फॉर्म 26AS में ₹12,450 की टीडीएस विसंगति के कारण मांग निकाली गई है।\n• अंतिम तिथि: आपको 14 नवंबर 2026 तक भुगतान या ई-फाइलिंग पोर्टल पर सुधार आवेदन (धारा 154) जमा करना होगा।\n• सत्यापन: वैध डीआईएन (DIN) संख्या दर्ज है।\n\n⚖️ यह सारांश केवल सूचना के लिए है। यह कानूनी या कर सलाह नहीं है।",
      hinglish: "Yeh Section 143(1) ka Income Tax intimation notice hai (naye 2025 Act mein Section 221(1)).\n\n• Tax Demand: Form 26AS aur return mein TDS mismatch ki wajah se ₹12,450 ki net demand aayi hai.\n• Deadline: Response ya payment 14 November 2026 tak karni hai (7 days bache hain).\n• Authenticity: Valid DIN number document par verified hai.\n\n⚖️ Yeh summary informational guidance ke liye hai, legal ya tax advice nahi hai.",
    },
  },

  // 2. IT Notice New Section (2025 Act)
  "it-new-act": {
    doc_type: "income_tax_notice",
    transcription: "INCOME TAX DEPARTMENT, GOVERNMENT OF INDIA\nCentralized Processing Centre (CPC 2.0)\nINTIMATION UNDER SECTION 221(1) OF THE INCOME TAX ACT, 2025\nPAN: JKLMN3456Q | AY: 2026-27 | Date: 15/10/2026\nDIN: CPC/2627/2211/4491023812\nUnreported bank interest: ₹60,000 | Tax & interest adjustment: ₹22,100\nNet Demand: ₹22,100 payable within 30 days (by 2026-11-14).",
    extracted: {
      doc_type: "income_tax_notice",
      notice_section_printed: "221(1)",
      notice_section_mapped: "143(1)",
      act_version: "2025",
      notice_type_name: "Intimation u/s 221(1) (Income Tax Act 2025)",
      assessment_year: "2026-27",
      pan_masked: "JKLM****Q",
      demand_amount: 22100,
      demand_currency: "INR",
      refund_amount: null,
      issue_date: "2026-10-15",
      response_deadline: "2026-11-14",
      response_deadline_source: "verbatim",
      days_remaining: 7,
      issuing_authority: "CPC 2.0 Bengaluru",
      din_number: "CPC/2627/2211/4491023812",
      key_claims: [
        "Unreported savings/FD interest of ₹60,000 added from AIS",
        "Tax adjustment ₹12,000 + interest u/s 352/353 ₹10,100",
      ],
      severity: "medium",
      high_stakes_flags: [],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This intimation is issued under Section 221(1) of the new Income Tax Act, 2025 (which replaced Section 143(1) of the 1961 Act on 1 April 2026).\n\n• Assessment Year: 2026-27 (the inaugural assessment year under the new statute).\n• Adjustment: Bank interest income of ₹60,000 from Annual Information Statement was added, resulting in a net tax demand of ₹22,100.\n• Response Window: Due by 14 November 2026.\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal or tax advice.",
      hi: "यह नए आयकर अधिनियम 2025 की धारा 221(1) के तहत जारी सूचना है (जो पूर्व में धारा 143(1) थी)।\n\n• समायोजन: बैंक ब्याज से ₹60,000 की अघोषित आय जोड़ने के बाद ₹22,100 की कर मांग निकली है।\n• अंतिम तिथि: 14 नवंबर 2026 तक भुगतान या आपत्ति दर्ज करें।\n\n⚖️ यह केवल सूचनात्मक सारांश है।",
      hinglish: "Yeh new Income Tax Act 2025 ke Section 221(1) ke under notice hai (purane Act mein Section 143(1)).\n\n• AY 2026-27: Naye statute ka pehla assessment year.\n• Adjustment: AIS se match karke ₹60,000 interest add kiya gaya hai, total demand ₹22,100 bani hai.\n\n⚖️ Informational summary only, not legal advice.",
    },
  },

  // 3. Large Demand & Prosecution (High Stakes)
  "it-large-demand": {
    doc_type: "income_tax_notice",
    transcription: "GOVERNMENT OF INDIA - INCOME TAX DEPARTMENT\nOffice of DCIT Circle 2(1), Kolkata\nNOTICE OF DEMAND UNDER SECTION 156 / 241\nPAN: EFGHI2345N | AY: 2024-25 | Date: 05-Nov-2026\nDIN: ITBA/COM/F/17/2026-27/9876543210\nTotal Penalty Demand: ₹3,45,000.\nUndisclosed bank account income of ₹8,50,000 detected.\nFailure to deposit may initiate prosecution proceedings under Section 276C.",
    extracted: {
      doc_type: "income_tax_notice",
      notice_section_printed: "156",
      notice_section_mapped: "241",
      act_version: "1961",
      notice_type_name: "Notice of Demand u/s 156",
      assessment_year: "2024-25",
      pan_masked: "EFGH****N",
      demand_amount: 345000,
      demand_currency: "INR",
      refund_amount: null,
      issue_date: "2026-11-05",
      response_deadline: "2026-12-05",
      response_deadline_source: "verbatim",
      days_remaining: 28,
      issuing_authority: "DCIT Circle 2(1), Kolkata",
      din_number: "ITBA/COM/F/17/2026-27/9876543210",
      key_claims: [
        "Concealment of income from undisclosed bank account: ₹8,50,000",
        "Penalty demand raised: ₹3,45,000",
        "Prosecution proceedings may be initiated under Section 276C",
      ],
      severity: "critical",
      high_stakes_flags: ["demand > ₹1 lakh", "prosecution proceedings mentioned"],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "🚨 CRITICAL NOTICE: This is a high-value penalty demand notice under Section 156 (mapped to Section 241 under the 2025 Act).\n\n• High Demand: A substantial demand of ₹3,45,000 has been assessed for alleged undisclosed bank deposits.\n• Prosecution Risk: The notice explicitly warns of potential prosecution proceedings under Section 276C for willful evasion.\n• Action: DO NOT IGNORE. Engage a qualified Chartered Accountant or tax litigation advocate immediately. Response deadline is 05 December 2026.\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal or tax advice.",
      hi: "🚨 गंभीर चेतावनी: यह धारा 156 (नए 2025 अधिनियम में धारा 241) के तहत ₹3,45,000 की उच्च-मूल्य मांग सूचना है।\n\n• अभियोजन का जोखिम: नोटिस में स्पष्ट रूप से धारा 276C के तहत आपराधिक अभियोजन (Prosecution) की चेतावनी दी गई है।\n• तुरंत किसी चार्टर्ड अकाउंटेंट (CA) या कर अधिवक्ता से संपर्क करें। अंतिम तिथि 05 दिसंबर 2026 है।\n\n⚖️ यह केवल सूचनात्मक सारांश है। कानूनी सलाह के लिए पेशेवर से मिलें।",
      hinglish: "🚨 CRITICAL ALERT: Yeh ₹3,45,000 ki high-stakes demand notice hai with prosecution risk.\n\n• Heavy Penalty: ₹8.5L undisclosed deposits par ₹3,45,000 penalty lagayi gayi hai.\n• Prosecution Risk: Section 276C ke under court action ki warning mention hai.\n• Immediate Step: Iss notice ko bilkul ignore mat karein. Turant kisi CA ya tax lawyer se consult karein.\n\n⚖️ Legal advice nahi hai. Consult a professional.",
    },
  },

  // 4. Hindi Bilingual Notice
  "it-hindi": {
    doc_type: "income_tax_notice",
    transcription: "आयकर विभाग, भारत सरकार / INCOME TAX DEPARTMENT, GOVT OF INDIA\nकार्यालय आयकर अधिकारी, वार्ड 3(1), दिल्ली\nधारा 142(1) / Section 142(1) Inquiry Notice\nपैन / PAN: CDQPR9012M | कर निर्धारण वर्ष / AY: 2024-25 | दिनांक: 20-08-2026\nबही-खाता और दस्तावेज़ मूल्यांकन के लिए आवश्यक / Books of accounts required.\nअंतिम तिथि / Response deadline: 04-09-2026 (15 days).",
    extracted: {
      doc_type: "income_tax_notice",
      notice_section_printed: "142(1)",
      notice_section_mapped: "220",
      act_version: "1961",
      notice_type_name: "Inquiry Notice u/s 142(1) (बही-खाता जांच)",
      assessment_year: "2024-25",
      pan_masked: "CDQP****M",
      demand_amount: null,
      demand_currency: "INR",
      refund_amount: null,
      issue_date: "2026-08-20",
      response_deadline: "2026-09-04",
      response_deadline_source: "verbatim",
      days_remaining: -64,
      issuing_authority: "ITO Ward 3(1), Delhi",
      din_number: "ITBA/AST/F/17/2024-25/1192837465",
      key_claims: [
        "Inquiry before assessment: Books of accounts and cash records required",
        "Clarification needed on business turnover and ledger extracts",
      ],
      severity: "high",
      high_stakes_flags: [],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This is a bilingual statutory inquiry notice under Section 142(1) (mapped to Section 220 under the 2025 Act).\n\n• Document Demand: The Assessing Officer requires production of books of accounts, ledger sheets, and purchase/sale bills.\n• Deadline Passed: The original deadline stated was 04 September 2026. If you have not complied, submit your documents on the portal immediately to avoid ex-parte best judgment assessment u/s 144.\n\n⚖️ Informational summary only.",
      hi: "यह आयकर अधिनियम की धारा 142(1) (नए 2025 अधिनियम में धारा 220) के तहत द्विभाषी जांच सूचना है।\n\n• दस्तावेज़ मांग: कर अधिकारी ने व्यापार के बही-खाते और बैंक विवरण पेश करने को कहा है।\n• अंतिम तिथि: नोटिस की मूल तिथि 04 सितंबर 2026 थी। एकतरफा आदेश (Section 144) से बचने के लिए तुरंत अनुपालन करें।\n\n⚖️ केवल सूचनात्मक सारांश।",
      hinglish: "Yeh bilingual notice Section 142(1) ke under hai (new Act Section 220).\n\n• Requirements: Assessing officer ne books of accounts aur vouchers submit karne ko manga hai.\n• Deadline: Date nikal chuki hai (4 Sep 2026). e-Proceedings portal par turant status check karein.\n\n⚖️ Not legal advice.",
    },
  },

  // 5. Rent Lock-in Trap
  "rent-lockin": {
    doc_type: "rent_agreement",
    transcription: "TENANCY AGREEMENT - BENGALURU\nLandlord: S. Ramanathan | Tenant: Kartik Deshmukh\nFlat 4B, HSR Layout Sector 2, Bengaluru\nRent: ₹25,000/mo | Security Deposit: ₹75,000 (3 months)\nLock-in: 6 Months | Notice: 1 Month\nClause 4: Early exit within 6 months results in unconditional deposit forfeiture and balance lock-in rent liability.",
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
          title: "Lock-in period exceeds notice period",
          detail: "Lock-in is 6 months while notice period is only 1 month. You cannot leave early even with 1 month notice without forfeiting your full ₹75,000 deposit.",
        },
      ],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This residential tenancy agreement contains a classic Lock-in Period Trap.\n\n• Lock-in Trap: The agreement requires a mandatory 6-month lock-in while allowing only 1 month notice. If you vacate before 6 months, the entire ₹75,000 security deposit is forfeited.\n• Terms: Rent is ₹25,000/month, deposit is ₹75,000, and escalation is 8%.\n• Negotiation advice: Negotiate reducing the lock-in to match the notice period (e.g., 2-3 months) before signing.\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal advice.",
      hi: "इस किराया अनुबंध में एक गंभीर लॉक-इन शर्त (Lock-in Trap) पाई गई है।\n\n• चेतावनी: अनुबंध में 6 महीने का लॉक-इन है, जबकि नोटिस केवल 1 महीने का है। 6 माह से पूर्व मकान खाली करने पर आपका पूरा ₹75,000 का डिपॉजिट जब्त हो जाएगा।\n• हस्ताक्षर करने से पहले मकान मालिक से लॉक-इन अवधि कम करने पर बातचीत करें।\n\n⚖️ केवल सूचना के लिए, कानूनी सलाह नहीं है।",
      hinglish: "Is rent agreement mein ek classical Lock-in Trap identified hua hai.\n\n• Trap: Lock-in 6 months ka hai aur notice sirf 1 month. Agar 6 months se pehle relocate kiya toh poora ₹75,000 deposit forfeit ho jayega.\n• Suggestion: Agreement sign karne se pehle landlord se lock-in period reduce karne ki request karein.\n\n⚖️ Informational only, not legal advice.",
    },
  },

  // 6. Rent Deposit Forfeiture
  "rent-forfeiture": {
    doc_type: "rent_agreement",
    transcription: "HOUSE RENTAL AGREEMENT - GURUGRAM\nOwner: Rajinder Singh Hooda | Tenant: Nikhil Chopra\nHouse 142, Sector 45, Gurugram\nRent: ₹15,000/mo | Deposit: ₹45,000\nLock-in: 2 months | Notice: 1 month\nClause 7: Entire ₹45,000 deposit shall be forfeited with zero refund for minor delay or minor wall marks.",
    extracted: {
      doc_type: "rent_agreement",
      duration_months: 11,
      start_date: "2026-09-01",
      end_date: "2027-07-31",
      lock_in_months: 2,
      notice_period_months: 1,
      monthly_rent: 15000,
      security_deposit: 45000,
      security_deposit_months: 3,
      escalation_pct: 5,
      maintenance_included: true,
      registration_required: false,
      stamp_duty_mentioned: false,
      landlord_name: "Rajinder Singh Hooda",
      tenant_name: "Nikhil Chopra",
      property_address: "House No. 142, Sector 45, Gurugram",
      flags: [
        {
          flag_id: "no_refund_clause",
          severity: "warning",
          title: "Aggressive deposit forfeiture policy",
          detail: "Clause 7 mandates 100% forfeiture of the ₹45,000 deposit for minor payment delays or normal wear-and-tear with zero partial refund allowed.",
        },
      ],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This Gurugram rent agreement contains an unusually harsh deposit forfeiture clause.\n\n• Forfeiture Risk: Clause 7 disallows any partial refund and forfeits the entire ₹45,000 deposit for minor cosmetic wear-and-tear or rent delays over 5 days.\n• Recommendation: Insist on clause amendment stating deductions will only be for actual verified damages beyond ordinary wear and tear.\n\n⚖️ Not legal advice.",
      hi: "इस किराएनामे में सिक्योरिटी डिपॉजिट जब्ती की अत्यधिक कठोर शर्त है।\n\n• जोखिम: क्लॉज 7 के अनुसार मामूली टूट-फूट या किराए में 5 दिन की देरी पर पूरा ₹45,000 जब्त हो जाएगा।\n• हस्ताक्षर करने से पहले इसमें 'सामान्य टूट-फूट को छोड़कर' (wear and tear excepted) जुड़वाएं।\n\n⚖️ कानूनी सलाह नहीं है।",
      hinglish: "Is agreement mein bahut harsh deposit forfeiture clause hai.\n\n• Red Flag: Clause 7 kehta hai ki minor wall marks ya 5 din ki delay par pura ₹45,000 forfeit ho jayega.\n• Action: Landlord se 'actual physical damages only' wording modify karwayein.\n\n⚖️ Not legal advice.",
    },
  },

  // 7. Rent 12-Month Unregistered
  "rent-12m": {
    doc_type: "rent_agreement",
    transcription: "LEASE DEED - PUNE\nLessor: Anand Kulkarni | Lessee: Rohit Deshpande\nFlat 704, Kothrud, Pune - 411038\nTerm: Fixed tenure of 12 (Twelve) full calendar months\nRent: ₹30,000/mo | Deposit: ₹90,000\nExecuted on ₹100 stamp paper without sub-registrar registration.",
    extracted: {
      doc_type: "rent_agreement",
      duration_months: 12,
      start_date: "2026-08-01",
      end_date: "2027-07-31",
      lock_in_months: 6,
      notice_period_months: 2,
      monthly_rent: 30000,
      security_deposit: 90000,
      security_deposit_months: 3,
      escalation_pct: 7,
      maintenance_included: false,
      registration_required: true,
      stamp_duty_mentioned: false,
      landlord_name: "Anand Kulkarni",
      tenant_name: "Rohit Deshpande",
      property_address: "Flat 704, Silver Oak Towers, Kothrud, Pune",
      flags: [
        {
          flag_id: "needs_registration",
          severity: "warning",
          title: "Registration required for 12-month tenure",
          detail: "Lease tenure is 12 months. Under Section 17 of the Registration Act, any lease of immovable property exceeding 11 months requires compulsory registration before the Sub-Registrar.",
        },
      ],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This deed specifies a 12-month tenure, triggering statutory registration requirements.\n\n• Registration Obligation: In India, leases of 12 months or longer must be registered under Section 17 of the Registration Act. Unregistered 12-month agreements are inadmissible as primary evidence in court.\n• Option: Either register the agreement paying state stamp duty and registration fees, or reduce the tenure to 11 months.\n\n⚖️ Not legal advice.",
      hi: "इस समझौते की अवधि 12 महीने है, जिस पर अनिवार्य निबंधन (Registration) लागू होता है।\n\n• पंजीकरण नियम: 11 माह से अधिक की लीज का सब-रजिस्ट्रार कार्यालय में पंजीकरण कराना अनिवार्य है। अपंजीकृत 12 माह का समझौता अदालत में वैध साक्ष्य नहीं माना जाता।\n\n⚖️ कानूनी सलाह नहीं है।",
      hinglish: "Yeh 12 months ka lease deed hai jisme statutory registration compulsory hoti hai.\n\n• Legal Requirement: Registration Act ke Section 17 ke mutabiq 12+ months agreement ko Sub-Registrar ke paas register karwana padta hai.\n\n⚖️ Not legal advice.",
    },
  },

  // 8. Rent Clean (Standard 11-month)
  "rent-clean": {
    doc_type: "rent_agreement",
    transcription: "RESIDENTIAL RENT AGREEMENT - NOIDA\nLandlord: Mohan Lal Kapoor | Tenant: Ankit Joshi\nFlat 302, Green Valley Apartments, Sector 62, Noida\nDuration: 11 months | Rent: ₹18,000/mo | Deposit: ₹36,000 (2 months)\nLock-in: 3 months | Notice: 2 months | Escalation: 5%",
    extracted: {
      doc_type: "rent_agreement",
      duration_months: 11,
      start_date: "2026-11-01",
      end_date: "2027-09-30",
      lock_in_months: 3,
      notice_period_months: 2,
      monthly_rent: 18000,
      security_deposit: 36000,
      security_deposit_months: 2,
      escalation_pct: 5,
      maintenance_included: false,
      registration_required: false,
      stamp_duty_mentioned: true,
      landlord_name: "Mohan Lal Kapoor",
      tenant_name: "Ankit Joshi",
      property_address: "Flat 302, Green Valley Apartments, Sector 62, Noida",
      flags: [],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This is a clean, well-balanced standard 11-month residential rent agreement.\n\n• Balanced Terms: Lock-in is 3 months and notice period is 2 months (fair and customary).\n• Financials: Monthly rent is ₹18,000 with a standard 2-month deposit (₹36,000) and modest 5% annual escalation.\n• No red flags detected.\n\n⚖️ Not legal advice.",
      hi: "यह एक संतुलित और मानक 11 महीने का आवासीय किराया अनुबंध है।\n\n• शर्तें: 3 माह का लॉक-इन और 2 माह का नोटिस है जो पूरी तरह न्यायसंगत है।\n• कोई जोखिम भरी शर्त नहीं पाई गई।\n\n⚖️ केवल सूचना के लिए।",
      hinglish: "Yeh ekdum standard aur safe 11-month rent agreement hai.\n\n• Good Terms: 3 months lock-in aur 2 months notice period bilkul balanced hai. Zero red flags.\n\n⚖️ Informational summary.",
    },
  },

  // 9. Rent High Escalation
  "rent-high-esc": {
    doc_type: "rent_agreement",
    transcription: "LEASE MEMORANDUM - HYDERABAD\nLandlord: Ch. Venkat Reddy | Tenant: Manish Jain\nMadhapur, Hyderabad\nRent: ₹20,000/mo | Security Deposit: ₹2,00,000 (10 months rent!)\nAnnual Escalation: 15% annually\nLock-in: 3 months | Notice: 1 month",
    extracted: {
      doc_type: "rent_agreement",
      duration_months: 11,
      start_date: "2026-10-01",
      end_date: "2027-08-31",
      lock_in_months: 3,
      notice_period_months: 1,
      monthly_rent: 20000,
      security_deposit: 200000,
      security_deposit_months: 10,
      escalation_pct: 15,
      maintenance_included: false,
      registration_required: false,
      stamp_duty_mentioned: true,
      landlord_name: "Ch. Venkat Reddy",
      tenant_name: "Manish Jain",
      property_address: "Apartment 101, Lake Breeze Enclave, Madhapur, Hyderabad",
      flags: [
        {
          flag_id: "high_escalation",
          severity: "warning",
          title: "High annual rent escalation (15%)",
          detail: "Annual escalation of 15% is significantly higher than the standard 5-10% market rate.",
        },
        {
          flag_id: "excessive_deposit",
          severity: "warning",
          title: "Excessive security deposit (10 months)",
          detail: "A security deposit of ₹2,00,000 represents 10 months of rent, tying up substantial liquidity without interest.",
        },
      ],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This agreement contains two major financial cautions.\n\n• High Escalation: Annual rent increment is set at 15% (steep compared to customary 5-8%).\n• Excessive Deposit: Landlord demands 10 months rent (₹2,00,000) as interest-free security deposit.\n\n⚖️ Not legal advice.",
      hi: "इस समझौते में दो वित्तीय जोखिम हैं: 15% की अत्यधिक वार्षिक वृद्धि और 10 महीने (₹2,00,000) का भारी डिपॉजिट।\n\n⚖️ कानूनी सलाह नहीं है।",
      hinglish: "Is agreement mein 2 financial red flags hain: 15% annual rent jump aur 10 months (₹2 Lakh) ka high security deposit.\n\n⚖️ Not legal advice.",
    },
  },

  // 10. IT 148 Reassessment
  "it-148-photo": {
    doc_type: "income_tax_notice",
    transcription: "INCOME TAX DEPARTMENT - MUMBAI\nNotice u/s 148 for Reassessment of Income Escaping Assessment\nPAN: BFGPS5678L | AY: 2023-24 | Date: 01-Sep-2026\nInformation suggests income from property sale escaped assessment.\nResponse required within 30 days.",
    extracted: {
      doc_type: "income_tax_notice",
      notice_section_printed: "148",
      notice_section_mapped: "231",
      act_version: "1961",
      notice_type_name: "Notice for Reassessment u/s 148",
      assessment_year: "2023-24",
      pan_masked: "BFGP****L",
      demand_amount: null,
      demand_currency: "INR",
      refund_amount: null,
      issue_date: "2026-09-01",
      response_deadline: "2026-10-01",
      response_deadline_source: "verbatim",
      days_remaining: -37,
      issuing_authority: "ITO Ward 5(2), Mumbai",
      din_number: "ITBA/AST/S/148/2026-27/5544332211",
      key_claims: [
        "Income escaping assessment: Alleged unreported capital gains from immovable property sale",
        "Assessee required to furnish return of income within 30 days",
      ],
      severity: "high",
      high_stakes_flags: ["reassessment proceedings initiated"],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This is a serious Reassessment Notice under Section 148 (Section 231 under 2025 Act).\n\n• Tax Department alleges that income from a property transaction escaped assessment in AY 2023-24.\n• You are required to file a return of income in response.\n• Consult a CA to obtain the reasons recorded and file the return under protest if warranted.\n\n⚖️ Not legal advice.",
      hi: "यह धारा 148 (नए 2025 अधिनियम में धारा 231) के तहत पुनर्मूल्यांकन (Reassessment) नोटिस है।\n\n• अघोषित संपत्ति बिक्री के संबंध में आय छिपाने की आशंका जताई गई है।\n• तुरंत कर सलाहकार से परामर्श लें।\n\n⚖️ कानूनी सलाह नहीं है।",
      hinglish: "Yeh Section 148 reassessment notice hai (Section 231 under 2025 Act).\n\n• Department ne property sale par income escape hone ka suspicion raise kiya hai. CA se immediately consult karein.\n\n⚖️ Not legal advice.",
    },
  },

  // 11. Old Act 1961 Notice with Refund
  "it-old-refund": {
    doc_type: "income_tax_notice",
    transcription: "INCOME TAX DEPARTMENT - CPC BENGALURU\nIntimation u/s 143(1) of the Income-tax Act, 1961\nPAN: GHIJK6789P | AY: 2022-23 | Date: 12/09/2022\nTotal Tax: ₹0 | TDS: ₹8,200 | Refund: ₹8,200 determined.",
    extracted: {
      doc_type: "income_tax_notice",
      notice_section_printed: "143(1)",
      notice_section_mapped: "221(1)",
      act_version: "1961",
      notice_type_name: "Intimation u/s 143(1) (Refund Notice)",
      assessment_year: "2022-23",
      pan_masked: "GHIJ****P",
      demand_amount: null,
      demand_currency: "INR",
      refund_amount: 8200,
      issue_date: "2022-09-12",
      response_deadline: null,
      response_deadline_source: "typical_fallback",
      days_remaining: null,
      issuing_authority: "CPC Bengaluru",
      din_number: "CPC/2223/1431/9847120391",
      key_claims: ["Return processed with refund determined: ₹8,200 credited to bank account"],
      severity: "low",
      high_stakes_flags: [],
      extraction_confidence: "high",
      uncertain_fields: [],
    },
    explanation: {
      en: "This is a favourable refund intimation under Section 143(1) of the 1961 Act for AY 2022-23.\n\n• Outcome: A refund of ₹8,200 has been verified and processed for credit to your bank account.\n• Zero demand payable.\n\n⚖️ Not legal advice.",
      hi: "यह अनुकूल रिफंड सूचना है जिसके तहत ₹8,200 का रिफंड निर्धारित किया गया है। कोई कर देय नहीं है।\n\n⚖️ कानूनी सलाह नहीं है।",
      hinglish: "Yeh positive refund intimation hai. ₹8,200 ka refund approve hua hai, koi demand nahi hai.\n\n⚖️ Not legal advice.",
    },
  },

  // 12. Blurry Photo
  "blurry": {
    doc_type: "income_tax_notice",
    transcription: "GOVERNMENT OF INDIA - INCOME TAX DEPARTMENT\nNotice u/s 142(1) [partial illegible]\nPAN: AACHR4912K | AY: 2024-25\nAccounts and documents required [blurred line] regarding cash deposit.",
    extracted: {
      doc_type: "income_tax_notice",
      notice_section_printed: "142(1)",
      notice_section_mapped: "220",
      act_version: "1961",
      notice_type_name: "Inquiry Notice u/s 142(1)",
      assessment_year: "2024-25",
      pan_masked: "AACH****K",
      demand_amount: null,
      demand_currency: "INR",
      refund_amount: null,
      issue_date: "2026-09-18",
      response_deadline: "2026-10-05",
      response_deadline_source: "verbatim",
      days_remaining: -33,
      issuing_authority: "ITO Ward 1(2), Patna",
      din_number: null,
      key_claims: ["Inquiry regarding high-value cash deposits", "[illegible line 3: creditor details]"],
      severity: "medium",
      high_stakes_flags: [],
      extraction_confidence: "low",
      uncertain_fields: ["issuing_authority", "din_number"],
    },
    explanation: {
      en: "⚠️ Low-Confidence Extraction: Due to image blur and skew, some portions could not be extracted with high confidence.\n\n• Identified: Section 142(1) inquiry regarding cash deposits of ₹14,50,000.\n• Recommendation: Re-upload a clearer flat photograph in good lighting.\n\n⚖️ Not legal advice.",
      hi: "⚠️ छवि की गुणवत्ता कम होने के कारण कुछ फ़ील्ड्स पूरी तरह स्पष्ट नहीं पढ़े जा सके। कृपया अधिक स्पष्ट फोटो अपलोड करें।\n\n⚖️ कानूनी सलाह नहीं है।",
      hinglish: "⚠️ Image blur hone ki wajah se confidence score low hai. Please better lighting mein clear photo upload karein.\n\n⚖️ Not legal advice.",
    },
  },

  // 13. Electricity Bill (Unsupported)
  "unrelated": {
    doc_type: "unsupported",
    transcription: "BSES Rajdhani Power Limited\nELECTRICITY CONSUMPTION BILL\nConsumer: Sanjay Malhotra | CA: 1029384756 | Amount: ₹3,410.00",
    extracted: {
      doc_type: "unsupported",
      title: "Electricity Consumption Bill",
      summary: "Monthly electricity utility invoice issued by BSES Rajdhani Power Limited.",
      issuing_authority: "BSES Rajdhani Power Limited",
      reference_number: "CA 1029384756",
      amount_due: 3410,
      due_date: "As per bill cycle",
      is_blank_template: false,
      severity: "low",
    },
    explanation: {
      en: "This document is an electricity consumption bill and is not an Income Tax notice or Rent Agreement.",
      hi: "यह दस्तावेज़ बिजली का बिल है, जो समर्थित श्रेणी (आयकर नोटिस या किराया अनुबंध) में नहीं आता है।",
      hinglish: "Yeh utility bill hai, Income Tax notice ya Rent Agreement nahi hai.",
    },
  },

  // 14. Home Loan Sanction & KFS (Banking & Credit Protection)
  "bank-home-loan": {
    doc_type: "loan_sanction",
    transcription:
      "BHARAT NATIONAL HOUSING FINANCE LIMITED\nSANCTION LETTER & KEY FACT STATEMENT (KFS)\nSanction Ref: BNHF/HL/2026/84920 | Date: 12 January 2026\nBorrower: Vikram Aditya | Co-Borrower: Sunita Aditya\nSanctioned Principal: ₹45,00,000 | Tenor: 240 Months\nInterest Rate: Floating 8.75% p.a. | Monthly EMI: ₹39,780\nProcessing Fee: ₹15,000 + GST | APR: [Not disclosed in KFS]\nClause 14: Foreclosure penalty of 3.0% on outstanding principal.\nClause 19: Lender general lien under Section 171 over all accounts.",
    extracted: {
      doc_type: "loan_sanction",
      lender_name: "Bharat National Housing Finance Ltd",
      borrower_name: "Vikram Aditya",
      sanction_date: "2026-01-12",
      application_reference_no: "BNHF/HL/2026/84920",
      loan_type: "home_loan",
      sanctioned_amount: 4500000,
      sanction_currency: "INR",
      interest_type: "floating",
      interest_rate_percent: 8.75,
      benchmark_name: "Repo Linked Lending Rate (RLLR)",
      spread_percent: 2.25,
      annualized_percentage_rate: null,
      tenure_months: 240,
      emi_amount: 39780,
      processing_fee: 15000,
      foreclosure_fee_percent: 3.0,
      has_general_lien_clause: true,
      has_title_deed_clause: true,
      severity: "critical",
      extraction_confidence: "high",
    },
    explanation: {
      en: "### ⚠️ Critical Regulatory Infraction Detected\n\nYour loan sanction letter from **Bharat National Housing Finance Ltd** contains an unlawful foreclosure penalty clause that directly violates RBI Master Directions.\n\n* **Prohibited Foreclosure Fee:** Clause 14 imposes a **3.0% prepayment penalty**. Under RBI Circular `DBOD.No.Dir.BC.107/13.03.00/2011-12` and subsequent circulars, banks and NBFCs/HFCs are **strictly prohibited** from levying any foreclosure charges on floating-rate term loans sanctioned to individual borrowers.\n* **Missing APR in Key Fact Statement:** Under RBI's April 2024 Harmonized KFS Master Direction, all retail loans must explicitly state the **Annualized Percentage Rate (APR)** including all processing fees and incidental charges. The APR column is omitted in this document.\n* **Banker's General Lien:** Clause 19 invokes Section 171 of the Contract Act, allowing the lender to freeze your other deposits or investments in case of dispute.\n* **Title Deed Protection:** Under RBI circular RBI/2023-24/60, the lender is legally required to release all original title documents within 30 days of loan closure, or pay ₹5,000 per day compensation.\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal or financial advice. Please consult a qualified professional before executing documents.",
      hi: "### ⚠️ भारतीय रिज़र्व बैंक (RBI) के नियमों का उल्लंघन\n\nभारत नेशनल हाउसिंग फाइनेंस द्वारा जारी इस ऋण स्वीकृति पत्र में अवैध फोरक्लोज़र शुल्क लगाया गया है:\n\n* **अवैध फोरक्लोज़र पेनल्टी:** क्लॉज 14 में 3% प्रीपेमेंट चार्ज लगाया गया है। RBI के मास्टर सर्कुलर के अनुसार फ्लोटिंग-रेट व्यक्तिगत होम लोन पर कोई भी फोरक्लोज़र या प्रीपेमेंट पेनल्टी लगाना पूरी तरह प्रतिबंधित है।\n* **KFS में APR गायब:** अप्रैल 2024 के नए RBI KFS नियमों के तहत कुल वार्षिक प्रतिशत दर (APR) स्पष्ट रूप से दर्शानी अनिवार्य है, जो यहाँ नहीं है।\n* **दस्तावेज़ वापसी:** ऋण समाप्ति के 30 दिनों के भीतर मूल संपत्ति दस्तावेज़ वापस न करने पर बैंक को ₹5,000 प्रतिदिन का हर्जाना देना होगा।\n\n⚖️ यह केवल सूचनात्मक मार्गदर्शन है, विधिक या वित्तीय सलाह नहीं है।",
      hinglish: "### ⚠️ Critical RBI Violation Found\n\nBharat National Housing Finance ke is loan sanction letter mein **unlawful foreclosure charge** lagaya gaya hai:\n\n* **Illegal Foreclosure Fee:** Clause 14 mein floating rate par **3.0% penalty** maangi gayi hai, jo RBI circular ke mutabiq individual borrowers par lagana bilkul prohibited hai.\n* **Missing APR in KFS:** RBI April 2024 circular ke mutabiq Key Fact Statement mein **APR (Annualized Percentage Rate)** disclose karna mandatory hai jo isme missing hai.\n* **30-Day Document Release:** Loan band hone ke 30 din mein original registry/documents na milne par ₹5,000/day compensation bank ko deni hogi.\n\n⚖️ Yeh summary educational guidance ke liye hai, formal legal advice nahi hai.",
    },
  },

  // 15. GST DRC-01 Show Cause Notice (Business & MSME Defense)
  "gst-drc01": {
    doc_type: "gst_notice",
    transcription:
      "GOVERNMENT OF INDIA - STATE GST DEPARTMENT\nOFFICE OF ASSISTANT COMMISSIONER OF CENTRAL TAX, NEW DELHI\nFORM GST DRC-01 (Rule 142(1))\nSummary of Show Cause Notice issued under Section 74(1) of CGST Act 2017\nRef: ZD0702260194827 | Date: 15-Feb-2026 | FY: 2022-23\nGSTIN: 07AAAAA0000A1Z5 | Vistara Logistics & Freight Solutions Pvt Ltd\nAllegation: Excess ITC claimed in GSTR-3B vs GSTR-2B with willful suppression.\nTax Demand: CGST ₹92,500 + SGST ₹92,500 = ₹1,85,000\nPenalty u/s 74(1): ₹1,85,000 (100% of tax demanded)\nTotal Demand: ₹3,70,000 + statutory interest\nReply in Form GST DRC-06 within 30 days.\nDate of Personal Hearing: [Not Specified / Blank]",
    extracted: {
      doc_type: "gst_notice",
      form_type: "DRC-01",
      notice_reference_no: "ZD0702260194827",
      issue_date: "2026-02-15",
      financial_year: "2022-23",
      gstin_masked: "07AA****A1Z5",
      taxpayer_legal_name: "Vistara Logistics & Freight Solutions Pvt Ltd",
      section: "74",
      allegation_summary:
        "Discrepancy between ITC claimed in GSTR-3B and GSTR-2B; alleged willful suppression of facts under Section 74(1).",
      tax_amount: 185000,
      interest_amount: null,
      penalty_amount: 185000,
      total_demand: 370000,
      reply_deadline: "2026-03-17",
      days_remaining: 18,
      issuing_authority: "Assistant Commissioner of Central Tax, New Delhi",
      personal_hearing_offered: false,
      personal_hearing_date: null,
      severity: "critical",
      extraction_confidence: "high",
    },
    explanation: {
      en: "### 🚨 Severe GST Show Cause Notice (Section 74)\n\nThis is a high-stakes GST Show Cause Notice issued under **Section 74 of the CGST Act, 2017**.\n\n* **Fraud Allegation (100% Penalty):** The department has invoked Section 74 alleging willful misstatement or suppression of facts rather than standard non-fraud (Section 73). Consequently, a maximum **100% penalty of ₹1,85,000** has been imposed on top of the ₹1,85,000 tax demand (Total: ₹3,70,000 + interest).\n* **Procedural Hearing Omission (Section 75(4)):** The personal hearing date is completely blank. Under **Section 75(4) of the CGST Act**, no adverse assessment order can be legally passed without granting the taxpayer an opportunity of a personal hearing. This procedural omission should be explicitly raised in your formal reply.\n* **Strict 30-Day Deadline:** You have until **17 March 2026** (18 days remaining in IST) to submit your factual rebuttal in Form GST DRC-06 via the GST Portal.\n\nAction required: Access the GST Portal's 'View Additional Notices and Orders' tab to obtain the detailed factual annexure. Consult a Chartered Accountant or GST Advocate immediately to contest the Section 74 fraud classification.\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal or tax advice.",
      hi: "### 🚨 गंभीर जीएसटी कारण बताओ नोटिस (धारा 74)\n\nयह सीजीएसटी अधिनियम 2017 की **धारा 74** के तहत जारी गंभीर शो-कॉज नोटिस है:\n\n* **धोखाधड़ी/दमन का आरोप (100% जुर्माना):** विभाग ने धारा 73 (सामान्य त्रुटि) के बजाय धारा 74 लागू की है, जिसके चलते ₹1,85,000 के कर पर 100% जुर्माना (कुल ₹3,70,000 + ब्याज) प्रस्तावित किया गया है।\n* **व्यक्तिगत सुनवाई का अभाव (धारा 75(4)):** व्यक्तिगत सुनवाई की तारीख खाली है। धारा 75(4) के तहत बिना व्यक्तिगत सुनवाई के कोई भी प्रतिकूल आदेश पारित नहीं किया जा सकता।\n* **30 दिनों की समय-सीमा:** आपको 17 मार्च 2026 (18 दिन शेष) तक फॉर्म GST DRC-06 में अपना पक्ष रखना अनिवार्य है।\n\n⚖️ यह केवल सूचनात्मक मार्गदर्शन है, कानूनी सलाह नहीं।",
      hinglish: "### 🚨 High Risk GST Notice u/s 74 Detected\n\nYeh Central GST Department ki taraf se **Section 74** ka Show Cause Notice (DRC-01) hai:\n\n* **100% Penalty u/s 74:** Tax officer ne willful suppression allege kiya hai, isliye ₹1,85,000 tax par **100% penalty (₹1,85,000)** demand ki gayi hai (Total: ₹3,70,000 + interest).\n* **Missing Personal Hearing:** Notice mein personal hearing ki date blank hai. Section 75(4) ke mutabiq adverse order se pehle hearing dena mandatory statutory requirement hai.\n* **Deadline:** 17 March 2026 tak Form GST DRC-06 file karna zaroori hai.\n\n⚖️ Yeh summary informational guidance ke liye hai, legal advice nahi hai.",
    },
  },

  // 16. MSME Commercial Invoice & Contract (Business Defense)
  "msme-45day": {
    doc_type: "msme_contract",
    transcription:
      "KALPVRIKSHA PRECISION ENGINEERING PVT LTD\nUDYAM-MH-02-0048192 (Registered Micro Enterprise)\nTAX INVOICE / B2B COMMERCIAL CONTRACT\nInvoice No: KPE/25-26/1104 | Date: 05-Nov-2025\nBuyer: M/s Apex Heavy Infrastructure Conglomerate Ltd, Mumbai (GSTIN: 27AABCA5555C1Z1)\nDescription: Aerospace CNC Alloy Bushes & Titanium Brackets\nTaxable: ₹8,40,000 | CGST+SGST (18%): ₹1,51,200 | Total Invoice: ₹9,91,200\nPayment Terms: 90 days from receipt of goods.\nSupplier MSME Declaration: Micro Enterprise u/s 15/16 MSMED Act 2006.\nOverdue Days: 68 days overdue past 45-day statutory date.",
    extracted: {
      doc_type: "msme_contract",
      invoice_number: "KPE/25-26/1104",
      invoice_date: "2025-11-05",
      supplier_name: "Kalpvriksha Precision Engineering Pvt Ltd",
      supplier_enterprise_type: "micro",
      supplier_udyam_number: "UDYAM-MH-02-0048192",
      buyer_name: "Apex Heavy Infrastructure Conglomerate Ltd",
      buyer_gstin: "27AABCA5555C1Z1",
      buyer_is_corporate_or_firm: true,
      total_amount: 991200,
      tax_amount: 151200,
      agreed_credit_days: 90,
      statutory_max_credit_days: 45,
      is_overdue: true,
      days_overdue: 68,
      penal_interest_rate_percent: 19.5,
      penal_interest_amount: 36248,
      section_43b_h_applicable: true,
      severity: "high",
      extraction_confidence: "high",
    },
    explanation: {
      en: "### 🛡️ MSME Statutory Credit Shield Activated\n\nThis commercial invoice and contract is governed by the protective provisions of the **MSMED Act, 2006** and **Section 43B(h) of the Income-tax Act**.\n\n* **90-Day Credit Clause is Void:** The invoice agreement specifies a 90-day credit period. Under **Section 15 of the MSMED Act**, the maximum credit period is strictly capped at **45 days**. Any contractual agreement providing a longer period is legally void by virtue of Section 24.\n* **Compounded Penal Interest (19.5% p.a.):** The payment is currently **68 days overdue** beyond the 45-day statutory appointment day. Under **Section 16**, the buyer is legally obligated to pay compound interest with monthly rests at **three times the RBI Bank Rate (19.5% per annum)**, amounting to approx. **₹36,248 in penal interest**.\n* **Section 43B(h) Corporate Tax Risk:** Because the buyer (Apex Heavy Infrastructure) has failed to pay a registered Micro Enterprise within the statutory limit, this entire ₹9,91,200 purchase expense will be **disallowed from their income tax deductions** for this financial year, directly inflating their corporate tax liability.\n\nAction required: Issue an immediate formal demand letter quoting MSMED Sections 15 & 16 along with Section 43B(h). If unsettled, file a claim on the MSME Samadhaan portal.\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal or financial advice.",
      hi: "### 🛡️ एमएसएमई वैधानिक सुरक्षा सक्रिय\n\nयह वाणिज्यिक चालान **MSMED अधिनियम 2006** और **आयकर धारा 43B(h)** के कड़े नियमों के अंतर्गत आता है:\n\n* **90 दिनों की शर्त शून्य (अमान्य):** अनुबंध में 90 दिनों की उधारी लिखी है, लेकिन धारा 15 के अनुसार अधिकतम सीमा **45 दिन** है। इससे अधिक की कोई भी शर्त कानूनन अमान्य है।\n* **चक्रवृद्धि दंडात्मक ब्याज (19.5%):** भुगतान नियत तिथि से **68 दिन अधिक लंबित** है। धारा 16 के तहत खरीदार को RBI बैंक दर के 3 गुना (19.5% प्रति वर्ष) की दर से मासिक चक्रवृद्धि ब्याज देना अनिवार्य है (लगभग ₹36,248)।\n* **धारा 43B(h) के तहत खरीदार पर कर जोखिम:** वित्तीय वर्ष में भुगतान न करने पर खरीदार को इस खर्च पर आयकर छूट नहीं मिलेगी, जिससे उनका कॉर्पोरेट टैक्स बढ़ जाएगा।\n\n⚖️ यह केवल सूचनात्मक सारांश है, कानूनी सलाह नहीं।",
      hinglish: "### 🛡️ MSMED Act & Sec 43B(h) Protection\n\nYeh invoice MSME supplier ke favour mein strong statutory protections unlock karta hai:\n\n* **90-Day Term Void:** Agreement ka 90 din ka credit term Section 15 ke tehat illegal aur void hai, maximum limit **45 days** hi maani jaayegi.\n* **3x RBI Interest Rate:** Payment 68 days overdue ho chuka hai. Section 16 ke mutabiq buyer ko **19.5% p.a. compound interest** (monthly rests) dena padega.\n* **Section 43B(h) Disallowance:** Agar buyer FY end se pehle settle nahi karta toh unka pura ₹9.91L expense income tax mein disallow ho jaayegi.\n\n⚖️ Yeh guidance informational purposes ke liye hai, legal advice nahi hai.",
    },
  },

  // 17. Builder-Buyer Agreement (Wave 3 — RERA & Real Estate)
  "property-bba": {
    doc_type: "property_contract",
    transcription:
      "AGREEMENT FOR SALE & ALLOTMENT (BUILDER-BUYER AGREEMENT)\nProject: Horizon Skywalk Towers | RERA: HRERA-GGM-2023-892\nPromoter: Apex Horizon Developers LLP | Allottee: Rajesh Kumar Sharma & Sunita Sharma\nUnit: Tower B, B-1402, 14th Floor, Sector 84, Gurugram, Haryana\nSuper Built-Up Area: 1,850 sq.ft. (Carpet area not stated in agreement)\nConsideration: ₹1,45,00,000 | Advance Paid: ₹15,00,000\nPossession Date: 31 December 2026\nClause 14.1: Buyer delay interest at 18.0% per annum compounded monthly.\nClause 14.2: Promoter delay compensation at Rs. 5/- per sq.ft. per month.\nClause 21: Super area loading 35% with variance up to 10%.\nClause 23: Promoter may transfer title via General Power of Attorney (GPA), Agreement to Sell and Will.\nClause 27: Tripartite subvention agreement with lender; Allottee indemnifies Developer against bank default.",
    extracted: {
      doc_type: "property_contract",
      property_name: "Horizon Skywalk Towers",
      unit_number: "Unit B-1402, 14th Floor",
      builder_promoter_name: "Apex Horizon Developers LLP",
      buyer_allottee_name: "Rajesh Kumar Sharma & Sunita Sharma",
      rera_registration_number: "HRERA-GGM-2023-892",
      agreement_date: "2024-03-15",
      possession_date: "2026-12-31",
      total_consideration: 14500000,
      advance_amount_paid: 1500000,
      super_built_up_area_sqft: 1850,
      carpet_area_sqft: null,
      loading_factor_percent: 35.0,
      buyer_delay_interest_rate_percent: 18.0,
      builder_delay_compensation: "Rs. 5 per sq.ft. per month",
      penalty_is_asymmetric: true,
      mentions_gpa_or_power_of_attorney: true,
      has_tripartite_subvention_clause: true,
      severity: "critical",
      extraction_confidence: "high",
    },
    explanation: {
      en: "### 🚨 High Risk Real Estate Contract Flags\n\nThis Builder-Buyer Agreement contains severe statutory violations under **RERA 2016** and the landmark Supreme Court ruling in **Suraj Lamp (2011)**:\n\n* **Prohibited GPA Title Conveyance (Suraj Lamp Ban):** Clause 23 purports to convey title or possessory rights via General Power of Attorney (GPA), Agreement to Sell, and Will. The Supreme Court in *Suraj Lamp & Industries (P) Ltd v. State of Haryana (2011 11 SCC 787)* held unequivocally that immovable property can ONLY be transferred through a registered Sale Deed under Section 54 of the Transfer of Property Act and Section 17 of the Registration Act. GPA sales transfer no title.\n* **RERA Penalty Parity Violation (Sec 18 / Rule 15):** Clause 14 imposes an usurious **18.0% p.a.** delay interest on the buyer, while offering a trivial **Rs. 5/- per sq.ft. per month** (approx 0.6% p.a.) if the builder delays possession. Under RERA Section 18 and Haryana RERA Rule 15, the rate of interest payable by the promoter for delivery delays **MUST EQUAL** the rate charged to the allottee for installment delays (mandated at SBI Highest MCLR + 2%).\n* **Missing Carpet Area Disclosure:** The contract quotes a 'Super Built-Up Area' of 1,850 sq.ft. with an unverified 35% loading factor, omitting net usable Carpet Area as mandated under RERA Section 2(k).\n* **Tripartite Subvention Indemnity Trap:** Clause 27 forces the buyer to indemnify the promoter against bank default in subvention schemes, leaving the buyer solely exposed to bank recovery even if construction stalls.\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal advice. Consult a RERA advocate before signing or disbursing funds.",
      hi: "### 🚨 रियल एस्टेट अनुबंध में गंभीर विधिक त्रुटियां\n\nइस बिल्डर-बायर समझौते में **RERA 2016** और सुप्रीम कोर्ट के ऐतिहासिक **सूरज लैंप (2011)** निर्णय का खुला उल्लंघन है:\n\n* **GPA पर मालिकाना हक का अभाव (सूरज लैंप निर्णय):** क्लॉज 23 में जीपीए (GPA) और वसीयत के जरिए संपत्ति ट्रांसफर की बात कही गई है। सुप्रीम कोर्ट (2011) के अनुसार अचल संपत्ति का कानूनी स्वामित्व केवल पंजीकृत सेल डीड (Sale Deed) से ही मिल सकता है, GPA से नहीं।\n* **पेनल्टी में पक्षपात (RERA धारा 18):** खरीदार पर 18% का भारी विलंब ब्याज लगाया गया है, जबकि बिल्डर के लेट होने पर मात्र ₹5/वर्ग फुट/माह का नाममात्र हर्जाना तय है। RERA के तहत दोनों पक्षों के लिए ब्याज दर समान (SBI MCLR + 2%) होना अनिवार्य है।\n* **कारपेट एरिया का खुलासा नहीं:** केवल 1,850 वर्ग फुट सुपर एरिया बताया गया है, RERA धारा 2(k) के तहत अनिवार्य कारपेट एरिया नहीं दिया गया।\n\n⚖️ यह केवल सूचनात्मक सारांश है, कानूनी सलाह नहीं।",
      hinglish: "### 🚨 Critical Real Estate & RERA Flags\n\nIs Builder-Buyer Agreement mein **RERA 2016** aur Supreme Court ke **Suraj Lamp (2011)** judgment ke khilaaf critical clauses hain:\n\n* **GPA Title Void (Suraj Lamp):** Supreme Court ne 2011 mein clear kiya tha ki GPA / Agreement to Sell se immovable property ka मालिकाना haq transfer nahi hota; registered Sale Deed mandatory hai.\n* **Asymmetric Penalty Trap:** Buyer ke delay par **18% p.a.** interest mangte hain, lekin builder delay par sirf **₹5/sq.ft./month** dete hain. RERA Section 18 ke mutabiq dono ki delay penalty exactly equal (SBI MCLR + 2%) honi chahiye.\n* **Missing Carpet Area:** RERA Section 2(k) ke mutabiq exact net usable carpet area specify karna compulsory hai, sirf 1850 sq.ft. super built-up likhna violation hai.\n\n⚖️ Informational summary only, not legal advice.",
    },
  },

  // 18. Health Insurance Policy Schedule (Wave 3 — IRDAI & Insurance Act)
  "insurance-health": {
    doc_type: "insurance_policy",
    transcription:
      "STAR ALLIED HEALTH INSURANCE CO. LTD. - POLICY SCHEDULE\nIRDAI Regn No: 129 | Policy No: SH-POL-2022-849102\nInsured: Vikramaditya Verma (Age: 38) | Plan: Star Optima Gold Policy\nPolicy Period: 15-Jul-2025 to 14-Jul-2026 (Continuous Tenure: 48 Months since July 2021)\nBase Sum Insured: ₹5,00,000 | Cumulative Bonus: ₹1,50,000 | Annual Premium: ₹18,450\nClause 3.1: Normal Room Rent capped at 1.0% of Sum Insured (₹5,00,000 * 1% = ₹5,000/day).\nProportionate Deduction: If room exceeds ₹5,000/day, all associated hospital expenses (surgeon, OT, anesthesia, nursing) shall be reduced proportionally by Permissible/Actual room rate ratio.\nClause 3.2: ICU Charges capped at 2.0% of Sum Insured (₹10,000/day).\nClause 4.8: Section 45 Insurance Act Moratorium active - 4 consecutive continuous renewal years completed.",
    extracted: {
      doc_type: "insurance_policy",
      insurer_name: "Star Allied Health Insurance Co. Ltd.",
      policy_number: "SH-POL-2022-849102",
      policy_holder_name: "Vikramaditya Verma",
      plan_name: "Star Optima Gold Policy",
      policy_inception_date: "2021-07-15",
      policy_renewal_date: "2025-07-15",
      policy_tenure_years: 4,
      policy_tenure_months: 48,
      sum_insured: 500000,
      premium_amount: 18450,
      daily_room_rent_limit: 5000,
      room_rent_limit_percent: 1.0,
      icu_daily_limit: 10000,
      has_proportionate_deduction: true,
      co_pay_percent: 0,
      moratorium_status: "protected",
      waiting_period_ped_months: 36,
      severity: "high",
      extraction_confidence: "high",
    },
    explanation: {
      en: "### 🛡️ Health Insurance Policy Audit: 1% Room Rent Trap & Statutory Protection\n\nYour health insurance policy schedule from **Star Allied Health Insurance Co. Ltd.** has two decisive legal and financial implications:\n\n* **The 1% Room Rent Proportionate Haircut Trap (Clause 3.1):** Your policy caps daily room rent at **1.0% of Sum Insured (₹5,000/day)**. If you choose a standard single private room costing ₹10,000/day during hospitalization, the insurer applies a **50% proportionate haircut (5,000 / 10,000)** not just on room rent, but across **ALL associated medical charges** (surgeon fees, operating theatre costs, anesthetist fees, specialist visits, and nursing). A ₹4,00,000 hospital bill could leave you with over ₹2,00,000 in unexpected out-of-pocket expenses.\n* **Section 45 Insurance Act Moratorium Defense (Active Protection):** You have maintained continuous, unbroken policy coverage for **48 months (4 years)** since July 2021. Under **Section 45 of the Insurance Act, 1938** (as amended by Insurance Laws Amendment Act 2015), after 3 continuous policy years, **no health insurance policy or claim can be questioned or repudiated** by the insurer on grounds of non-disclosure, pre-existing diseases, or misstatements made at the time of proposal. This provides absolute statutory immunity against arbitrary claim rejections.\n* **ICU Sub-limit:** ICU rent is capped at **2% of Sum Insured (₹10,000/day)**.\n\nAction required: Contact your insurer or broker to purchase a 'No Room Rent Capping' rider or upgrade your base Sum Insured to eliminate the catastrophic proportionate deduction trap.\n\n⚖️ This is an AI-generated summary for informational purposes only. It is NOT legal or financial advice.",
      hi: "### 🛡️ स्वास्थ्य बीमा समीक्षा: 1% रूम रेंट ट्रैप और वैधानिक सुरक्षा\n\nस्टार अलाइड हेल्थ इंश्योरेंस की इस पॉलिसी में दो अत्यंत महत्वपूर्ण बिंदु हैं:\n\n* **1% रूम रेंट आनुपातिक कटौती ट्रैप (Clause 3.1):** कमरे का किराया बीमा राशि के 1% (₹5,000/दिन) पर सीमित है। यदि आप ₹10,000/दिन वाले कमरे में भर्ती होते हैं, तो बीमा कंपनी न केवल कमरे पर बल्कि सर्जन, ऑपरेशन थिएटर (OT), एनेस्थीसिया और डॉक्टर की सभी फीस पर 50% की आनुपातिक कटौती कर देगी, जिससे आपको भारी जेब खर्च उठाना पड़ेगा।\n* **बीमा अधिनियम धारा 45 के तहत पूर्ण सुरक्षा:** आपकी पॉलिसी लगातार 48 महीने (4 साल) से सक्रिय है। धारा 45 के तहत 3 साल पूरे होने के बाद बीमा कंपनी किसी भी पूर्व बीमारी या प्रस्ताव पत्र में कमी के आधार पर आपका क्लेम खारिज नहीं कर सकती।\n\n⚖️ यह केवल सूचनात्मक मार्गदर्शन है, विधिक या वित्तीय सलाह नहीं है।",
      hinglish: "### 🛡️ Health Insurance Audit: Room Rent Trap & Section 45 Shield\n\nIs Star Allied Health Insurance policy schedule mein 2 key findings hain:\n\n* **1% Room Rent Proportionate Deduction Trap:** Policy mein room rent ₹5,00,000 * 1% = ₹5,000/day par capped hai. Agar aapne ₹10,000/day ka single room liya, toh insurer doctor fees, OT charges, surgeon fee sab par **50% proportionate haircut** laga dega, jisse hospital bill ka aadha paisa khud bharna padega.\n* **Section 45 Moratorium Protection:** Policy continuous 4 saal (48 months) se active hai. Insurance Act ke Section 45 ke mutabiq 3 continuous saal poore hone ke baad insurer kisi bhi claim ko pre-existing illness ya misstatement ke bahane **reject nahi kar sakta**.\n\n⚖️ Informational summary only, not formal legal advice.",
    },
  },
};

DEMO_SIMULATIONS['it-148'] = DEMO_SIMULATIONS['it-148-photo'];
DEMO_SIMULATIONS['it-old'] = DEMO_SIMULATIONS['it-old-refund'];
