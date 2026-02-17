export const INDUSTRIES = {
    NURSING: "Nursing",
    CONSTRUCTION: "Construction",
    INDUSTRY: "Industry",
    AGRICULTURE: "Agriculture",
    COMMERCE: "Commerce",
    HOSPITALITY: "Hospitality",
    SERVICES: "Services",
} as const;

export const INDUSTRY_PROFESSIONS: Record<keyof typeof INDUSTRIES, string[]> = {
    NURSING: ["Nurse", "Caregiver"],
    CONSTRUCTION: ["Plasterer", "Mason", "Form Worker", "Floor Layer", "Heavy Equipment Operator"],
    INDUSTRY: ["General Worker"],
    AGRICULTURE: ["General Worker", "Picker"],
    COMMERCE: ["Cashier", "Sales Associate"],
    HOSPITALITY: ["Housekeeper", "Kitchen Worker"],
    SERVICES: ["General Worker"],
};

export const ENGLISH_LEVELS = {
    NONE: "None",
    BASIC: "Basic",
    GOOD: "Good",
    EXCELLENT: "Excellent",
} as const;

export const RECRUITMENT_STATUS = {
    POTENTIAL_CANDIDATE: "Potential Candidate",
    RECRUITMENT_STARTED: "Recruitment Started",
    DOCUMENTS_RECEIVED: "Documents Received",
    SENT_TO_IVS: "Sent to IVS",
    AWAITING_INTERVIEW: "Awaiting Interview",
    VISA_APPROVED: "Visa Approved",
    HEALTH_INSURANCE_PURCHASED: "Health Insurance Purchased",
    FLIGHT_TICKET_PURCHASED: "Flight Ticket Purchased",
    ARRIVED_IN_ISRAEL: "Arrived in Israel",
    CANDIDATE_REJECTED: "Candidate Rejected",
} as const;

export const STATUS_COLORS: Record<keyof typeof RECRUITMENT_STATUS, string> = {
    POTENTIAL_CANDIDATE: "bg-slate-100 text-slate-700 border-slate-200",
    RECRUITMENT_STARTED: "bg-blue-100 text-blue-700 border-blue-200",
    DOCUMENTS_RECEIVED: "bg-indigo-100 text-indigo-700 border-indigo-200",
    SENT_TO_IVS: "bg-purple-100 text-purple-700 border-purple-200",
    AWAITING_INTERVIEW: "bg-amber-100 text-amber-700 border-amber-200",
    VISA_APPROVED: "bg-teal-100 text-teal-700 border-teal-200",
    HEALTH_INSURANCE_PURCHASED: "bg-cyan-100 text-cyan-700 border-cyan-200",
    FLIGHT_TICKET_PURCHASED: "bg-sky-100 text-sky-700 border-sky-200",
    ARRIVED_IN_ISRAEL: "bg-green-100 text-green-700 border-green-200",
    CANDIDATE_REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
};

export const DOCUMENT_TYPES = {
    PASSPORT: "Passport",
    POLICE_CLEARANCE: "Police Clearance",
    HEALTH_DECLARATION: "Health Declaration",
    VISA: "Visa",
} as const;

export const ALERT_TYPES = {
    STALENESS: "Staleness",
    DOCUMENT_EXPIRATION: "Document Expiration",
} as const;
