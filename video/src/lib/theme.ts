// Exact color palette from TN_MANPOWER globals.css
export const theme = {
  background: "#F8FAFC",
  foreground: "#020617",
  card: "#FFFFFF",
  cardForeground: "#020617",
  primary: "#0F172A",
  primaryForeground: "#F8FAFC",
  secondary: "#334155",
  secondaryForeground: "#F8FAFC",
  muted: "#E2E8F0",
  mutedForeground: "#475569",
  accent: "#0369A1",
  accentForeground: "#FFFFFF",
  destructive: "#DC2626",
  destructiveForeground: "#FFFFFF",
  border: "#E2E8F0",
  sidebarBorder: "#CBD5E1",
} as const;

// Chart status colors from status-chart.tsx
export const statusColors: Record<string, string> = {
  POTENTIAL_CANDIDATE: "#475569",
  RECRUITMENT_STARTED: "#0369a1",
  DOCUMENTS_RECEIVED: "#4338ca",
  SENT_TO_IVS: "#6d28d9",
  AWAITING_INTERVIEW: "#b45309",
  VISA_APPROVED: "#0f766e",
  HEALTH_INSURANCE_PURCHASED: "#0e7490",
  FLIGHT_TICKET_PURCHASED: "#0369a1",
  ARRIVED_IN_ISRAEL: "#15803d",
  CANDIDATE_REJECTED: "#be123c",
};

// Status badge Tailwind-equivalent colors
export const statusBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
  POTENTIAL_CANDIDATE: { bg: "#f1f5f9", text: "#334155", border: "#e2e8f0" },
  RECRUITMENT_STARTED: { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" },
  DOCUMENTS_RECEIVED: { bg: "#e0e7ff", text: "#4338ca", border: "#c7d2fe" },
  SENT_TO_IVS: { bg: "#f3e8ff", text: "#7c3aed", border: "#e9d5ff" },
  AWAITING_INTERVIEW: { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
  VISA_APPROVED: { bg: "#ccfbf1", text: "#0f766e", border: "#99f6e4" },
  HEALTH_INSURANCE_PURCHASED: { bg: "#cffafe", text: "#0e7490", border: "#a5f3fc" },
  FLIGHT_TICKET_PURCHASED: { bg: "#e0f2fe", text: "#0369a1", border: "#bae6fd" },
  ARRIVED_IN_ISRAEL: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  CANDIDATE_REJECTED: { bg: "#fee2e2", text: "#dc2626", border: "#fecaca" },
};

// Industry chart colors
export const industryColors: Record<string, string> = {
  NURSING: "#0ea5e9",
  CONSTRUCTION: "#22c55e",
  INDUSTRY: "#f59e0b",
  AGRICULTURE: "#8b5cf6",
  COMMERCE: "#f43f5e",
  HOSPITALITY: "#14b8a6",
  SERVICES: "#64748b",
};
