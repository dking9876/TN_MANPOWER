// ================================================================
// T.N MANPOWER — PRD-Accurate Mock Data
// Every value here maps to a real feature from the requirements doc
// ================================================================

// --- Dashboard Stats (PRD §Dashboard) ---
export const dashboardStats = {
  totalCandidates: 847,
  inProgress: 234,
  openAlerts: 23,
  arrivedThisMonth: 12,
};

// --- 10-Stage Recruitment Pipeline (PRD §candidates.recruitment_status) ---
// These are the exact 10 statuses from the PRD, in pipeline order
export const statusBreakdown = [
  { status: "POTENTIAL_CANDIDATE", label: "Potential Candidate", count: 89 },
  { status: "RECRUITMENT_STARTED", label: "Recruitment Started", count: 134 },
  { status: "DOCUMENTS_RECEIVED", label: "Documents Received", count: 112 },
  { status: "SENT_TO_IVS", label: "Sent to IVS", count: 45 },
  { status: "AWAITING_INTERVIEW", label: "Awaiting Interview", count: 67 },
  { status: "VISA_APPROVED", label: "Visa Approved", count: 156 },
  { status: "HEALTH_INSURANCE_PURCHASED", label: "Health Insurance", count: 18 },
  { status: "FLIGHT_TICKET_PURCHASED", label: "Flight Ticket", count: 34 },
  { status: "ARRIVED_IN_ISRAEL", label: "Arrived in Israel", count: 187 },
  { status: "CANDIDATE_REJECTED", label: "Candidate Rejected", count: 5 },
];

// --- 7 Industries (PRD §candidates.primary_industry) ---
export const industryBreakdown = [
  { industry: "CONSTRUCTION", label: "Construction", count: 312 },
  { industry: "NURSING", label: "Nursing", count: 198 },
  { industry: "AGRICULTURE", label: "Agriculture", count: 124 },
  { industry: "INDUSTRY", label: "Industry", count: 89 },
  { industry: "HOSPITALITY", label: "Hospitality", count: 67 },
  { industry: "SERVICES", label: "Services", count: 34 },
  { industry: "COMMERCE", label: "Commerce", count: 23 },
];

// --- Industry → Profession Mapping (PRD §Industry → Profession Mapping) ---
export const industryProfessions: Record<string, string[]> = {
  NURSING: ["Nurse", "Caregiver"],
  CONSTRUCTION: ["Plasterer", "Mason", "Form Worker", "Floor Layer", "Heavy Equipment Operator"],
  INDUSTRY: ["General Worker"],
  AGRICULTURE: ["General Worker", "Picker"],
  COMMERCE: ["Cashier", "Sales Associate"],
  HOSPITALITY: ["Housekeeper", "Kitchen Worker"],
  SERVICES: ["General Worker"],
};

// --- Activity Feed (PRD §Audit Logging: all changes logged) ---
export const monthlyTrend = [
  { month: "Nov", count: 42 },
  { month: "Dec", count: 58 },
  { month: "Jan", count: 71 },
  { month: "Feb", count: 63 },
  { month: "Mar", count: 89 },
  { month: "Apr", count: 96 },
];

// --- Candidate Table (PRD §Candidate Management - Table columns) ---
// Columns: Name, National ID, Passport, Age, Industry, Profession, Company, Status, Updated, Actions
export const mockCandidates = [
  { id: "1", first_name: "Sunil", last_name: "Kumar", national_id: "NIC201054321", passport_number: "N8834521", age: 29, industry: "Construction", profession: "Mason", company: "Shapir Engineering", status: "VISA_APPROVED", updated: "25 Apr 26, 14:30", is_blacklisted: false },
  { id: "2", first_name: "Priya", last_name: "Sharma", national_id: "NIC201054322", passport_number: "N8834522", age: 31, industry: "Nursing", profession: "Nurse", company: "Assuta Medical", status: "ARRIVED_IN_ISRAEL", updated: "24 Apr 26, 09:15", is_blacklisted: false },
  { id: "3", first_name: "Rajesh", last_name: "Patel", national_id: "NIC201054323", passport_number: "N8834523", age: 27, industry: "Construction", profession: "Plasterer", company: "Danya Cebus", status: "DOCUMENTS_RECEIVED", updated: "23 Apr 26, 16:42", is_blacklisted: false },
  { id: "4", first_name: "Aman", last_name: "Singh", national_id: "NIC201054324", passport_number: "N8834524", age: 34, industry: "Construction", profession: "Form Worker", company: "Shapir Engineering", status: "RECRUITMENT_STARTED", updated: "22 Apr 26, 11:20", is_blacklisted: false },
  { id: "5", first_name: "Kavitha", last_name: "Perera", national_id: "NIC201054325", passport_number: "N8834525", age: 28, industry: "Nursing", profession: "Caregiver", company: "Sheba Medical", status: "AWAITING_INTERVIEW", updated: "21 Apr 26, 08:55", is_blacklisted: false },
  { id: "6", first_name: "Dinesh", last_name: "Fernando", national_id: "NIC201054326", passport_number: "N8834526", age: 32, industry: "Agriculture", profession: "Picker", company: "Mehadrin", status: "FLIGHT_TICKET_PURCHASED", updated: "20 Apr 26, 13:10", is_blacklisted: false },
  { id: "7", first_name: "Nimal", last_name: "Jayawardena", national_id: "NIC201054327", passport_number: "N8834527", age: 26, industry: "Construction", profession: "Heavy Equip. Op.", company: "Ashtrom Group", status: "SENT_TO_IVS", updated: "19 Apr 26, 10:33", is_blacklisted: false },
  { id: "8", first_name: "Samanthi", last_name: "Wickrama", national_id: "NIC201054328", passport_number: "N8834528", age: 30, industry: "Hospitality", profession: "Housekeeper", company: "Dan Hotels", status: "POTENTIAL_CANDIDATE", updated: "18 Apr 26, 15:45", is_blacklisted: false },
  { id: "9", first_name: "Kasun", last_name: "Bandara", national_id: "NIC201054329", passport_number: "N8834529", age: 25, industry: "Construction", profession: "Floor Layer", company: "Shapir Engineering", status: "HEALTH_INSURANCE_PURCHASED", updated: "17 Apr 26, 09:28", is_blacklisted: false },
  { id: "10", first_name: "Lakshmi", last_name: "Ranasinghe", national_id: "NIC201054330", passport_number: "N8834530", age: 33, industry: "Nursing", profession: "Nurse", company: "Hadassah Medical", status: "VISA_APPROVED", updated: "16 Apr 26, 12:00", is_blacklisted: false },
];

export const constructionCandidates = mockCandidates.filter(
  (c) => c.industry === "Construction"
);

// --- 4 Document Types per Candidate (PRD §documents) ---
// "Each candidate must have exactly 4 document records (one for each type)"
export const documentTypes = [
  { key: "PASSPORT", label: "Passport", expirationRequired: true, warningDays: 90 },
  { key: "POLICE_CLEARANCE", label: "Police Clearance", expirationRequired: false, warningDays: 60 },
  { key: "HEALTH_DECLARATION", label: "Health Declaration", expirationRequired: false, warningDays: 60 },
  { key: "VISA", label: "Visa", expirationRequired: true, warningDays: 30 },
] as const;

// Document statuses for Sunil Kumar's 4 auto-created documents
export const candidateDocuments = [
  { type: "Passport", received: true, expiration: "2026-06-10", status: "expiring", daysLeft: 45 },
  { type: "Police Clearance", received: true, expiration: "2026-08-15", status: "valid", daysLeft: 111 },
  { type: "Health Declaration", received: true, expiration: null, status: "received", daysLeft: null },
  { type: "Visa", received: false, expiration: null, status: "missing", daysLeft: null },
];

// Document completion across all candidates
export const documentCompletionData = [
  { type: "Passport", total: 847, received: 780, rate: 92, expiring: 3 },
  { type: "Police Clearance", total: 847, received: 712, rate: 84, expiring: 1 },
  { type: "Health Declaration", total: 847, received: 654, rate: 77, expiring: 0 },
  { type: "Visa", total: 847, received: 445, rate: 53, expiring: 2 },
];

export const expiringDocuments = [
  { candidateName: "Sunil Kumar", documentType: "Passport", expirationDate: "2026-06-10", daysLeft: 45 },
  { candidateName: "Kavitha Perera", documentType: "Visa", expirationDate: "2026-05-23", daysLeft: 28 },
  { candidateName: "Rajesh Patel", documentType: "Police Clearance", expirationDate: "2026-06-25", daysLeft: 60 },
];

// --- Alert System (PRD §alerts: STALENESS + DOCUMENT_EXPIRATION) ---
// "Staleness threshold: 7 days (configurable)" "Passport: 90 days, Visa: 30 days"
export const mockAlerts = [
  { id: "a1", type: "DOCUMENT_EXPIRATION" as const, candidateName: "Sunil Kumar", message: "Passport for Sunil Kumar expires in 45 days", createdAt: "25 Apr, 09:30", resolved: false },
  { id: "a2", type: "STALENESS" as const, candidateName: "Aman Singh", message: "Candidate Aman Singh has not been updated in 12 days", createdAt: "24 Apr, 14:15", resolved: false },
  { id: "a3", type: "DOCUMENT_EXPIRATION" as const, candidateName: "Kavitha Perera", message: "Visa for Kavitha Perera expires in 28 days", createdAt: "23 Apr, 11:00", resolved: false },
  { id: "a4", type: "STALENESS" as const, candidateName: "Samanthi Wickrama", message: "Candidate Samanthi Wickrama has not been updated in 14 days", createdAt: "22 Apr, 08:45", resolved: false },
  { id: "a5", type: "DOCUMENT_EXPIRATION" as const, candidateName: "Rajesh Patel", message: "Police Clearance for Rajesh Patel expires in 60 days", createdAt: "20 Apr, 10:30", resolved: true },
  { id: "a6", type: "STALENESS" as const, candidateName: "Dinesh Fernando", message: "Candidate Dinesh Fernando has not been updated in 9 days", createdAt: "19 Apr, 13:55", resolved: false },
];

export const alertSummary = { open: 23, resolved: 156 };

// --- Alert Thresholds (PRD §system_config) ---
export const alertThresholds = {
  stalenessThreshold: 7,
  passportExpiration: 90,
  visaExpiration: 30,
  policeClearanceExpiration: 60,
  healthDeclarationExpiration: 60,
};

// --- Resolve Alert Flow (PRD §Resolve alert flow) ---
export const resolveAlertFlow = {
  resolutionNotes: "Contacted candidate — documents renewed and re-submitted.",
  updateTimestamp: true,
};

// --- Audit Log Entries (PRD §audit_logs: tracks ALL changes) ---
export const auditLogEntries = [
  { action: "STATUS_CHANGE", user: "Daniel Admin", candidate: "Sunil Kumar", detail: "Visa Approved → Flight Ticket", time: "2 min ago" },
  { action: "UPDATE", user: "Sarah Recruiter", candidate: "Priya Sharma", detail: "Updated: phone, email", time: "15 min ago" },
  { action: "CREATE", user: "Daniel Admin", candidate: "Kasun Bandara", detail: "New candidate created", time: "1 hour ago" },
  { action: "STATUS_CHANGE", user: "Sarah Recruiter", candidate: "Rajesh Patel", detail: "Documents Received → Sent to IVS", time: "2 hours ago" },
  { action: "UPDATE", user: "Daniel Admin", candidate: "Kavitha Perera", detail: "Log Activity — timestamp updated", time: "3 hours ago" },
];

// --- Admin: User Management (PRD §Admin: User Management) ---
export const mockUsers = [
  { name: "Daniel Admin", email: "admin@tnmanpower.com", role: "ADMIN", active: true, lastLogin: "27 Apr 26, 15:30" },
  { name: "Sarah Recruiter", email: "sarah@tnmanpower.com", role: "RECRUITER", active: true, lastLogin: "27 Apr 26, 14:45" },
  { name: "Michael R.", email: "michael@tnmanpower.com", role: "RECRUITER", active: true, lastLogin: "26 Apr 26, 09:00" },
  { name: "Nishantha P.", email: "nishantha@ref.com", role: "REFERRER", active: true, lastLogin: "25 Apr 26, 11:20" },
  { name: "Old User", email: "old@tnmanpower.com", role: "RECRUITER", active: false, lastLogin: "01 Jan 26, 08:00" },
];

// --- Admin: 7 Settings Tabs (PRD §Admin: System Settings) ---
export const settingsTabs = [
  "Alert Thresholds",
  "Document Alerts",
  "Blacklisted Countries",
  "Professions",
  "Companies",
  "Statuses",
  "Referrer Bonus",
];

// --- Blacklisted Countries (PRD §Blacklist Check ⚠️ CRITICAL) ---
export const blacklistedCountries = ["Iran", "Syria", "North Korea", "Yemen", "Libya"];

// --- Role Permissions (PRD §User Roles & Permissions) ---
export const rolePermissions = {
  ADMIN: ["View ALL data", "Manage users", "Configure settings", "Manage blacklist", "View audit logs", "System-wide analytics"],
  RECRUITER: ["Create candidates", "Edit ANY candidate", "Manage documents", "View own alerts", "Export CSV", "Change status"],
  REFERRER: ["Add candidates", "View own candidates"],
};

// --- 9 Critical Business Rules (PRD §Critical Rules) ---
export const criticalRules = [
  "Blacklist auto-rejects candidates",
  "4 documents auto-created per candidate",
  "Age validation enforces 18+",
  "National ID & Passport must be unique",
  "All changes are audit-logged",
  "last_updated_at always updates",
  "Recruiters can edit ANY candidate",
  "Admins have full visibility",
  "Alerts assigned to candidate creator",
];

// --- Growth Data (PRD §Reports & Analytics) ---
export const growthData = [
  { month: "May '25", candidates: 310 },
  { month: "Jun '25", candidates: 365 },
  { month: "Jul '25", candidates: 420 },
  { month: "Aug '25", candidates: 478 },
  { month: "Sep '25", candidates: 540 },
  { month: "Oct '25", candidates: 612 },
  { month: "Nov '25", candidates: 668 },
  { month: "Dec '25", candidates: 710 },
  { month: "Jan '26", candidates: 745 },
  { month: "Feb '26", candidates: 776 },
  { month: "Mar '26", candidates: 812 },
  { month: "Apr '26", candidates: 847 },
];
