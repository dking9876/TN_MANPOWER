"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { startOfMonth, subMonths, format } from "date-fns";

const supabase = createClient();

export type DashboardStats = {
    totalCandidates: number;
    inProgress: number;
    openAlerts: number;
    arrivedThisMonth: number;
};

export type StatusBreakdown = {
    status: string;
    count: number;
};

export type IndustryBreakdown = {
    industry: string;
    count: number;
};

export type MonthlyTrend = {
    month: string;
    count: number;
};

export type DocumentCompletion = {
    documentType: string;
    total: number;
    received: number;
    rate: number;
};

export type ActivityEntry = {
    id: string;
    action: string;
    timestamp: string;
    userName: string;
    candidateName: string | null;
    changedFields: string[] | null;
};

export type AlertSummary = {
    open: number;
    resolved: number;
};

export type ExpiringDocument = {
    id: string;
    documentType: string;
    expirationDate: string;
    candidateName: string;
    candidateId: string;
};

const TERMINAL_STATUSES = ["ARRIVED_IN_ISRAEL", "CANDIDATE_REJECTED"];

export type DashboardFilters = {
    company_id?: string[];
    referrer?: string[];
};

export const dashboardKeys = {
    all: ["dashboard"] as const,
    stats: (filters?: DashboardFilters) => [...dashboardKeys.all, "stats", filters] as const,
    statusChart: (filters?: DashboardFilters) => [...dashboardKeys.all, "statusChart", filters] as const,
    industryChart: (filters?: DashboardFilters) => [...dashboardKeys.all, "industryChart", filters] as const,
    trendChart: (filters?: DashboardFilters) => [...dashboardKeys.all, "trendChart", filters] as const,
    documents: (filters?: DashboardFilters) => [...dashboardKeys.all, "documents", filters] as const,
    alerts: (filters?: DashboardFilters) => [...dashboardKeys.all, "alerts", filters] as const,
    activity: (filters?: DashboardFilters) => [...dashboardKeys.all, "activity", filters] as const,
    expiring: (filters?: DashboardFilters) => [...dashboardKeys.all, "expiring", filters] as const,
};

function applyCandidateFilters(query: any, filters?: DashboardFilters) {
    if (!filters) return query;
    if (filters.company_id && filters.company_id.length > 0) {
        query = query.in("company_id", filters.company_id);
    }
    if (filters.referrer && filters.referrer.length > 0) {
        query = query.in("referrer_id", filters.referrer);
    }
    return query;
}

export function useDashboardStats(filters?: DashboardFilters) {
    return useQuery({
        queryKey: dashboardKeys.stats(filters),
        queryFn: async (): Promise<DashboardStats> => {
            // Total candidates
            let totalQuery = supabase
                .from("candidates")
                .select("*", { count: "exact", head: true });
            totalQuery = applyCandidateFilters(totalQuery, filters);
            const { count: totalCandidates } = await totalQuery;

            // In progress (not terminal)
            let inProgressQuery = supabase
                .from("candidates")
                .select("*", { count: "exact", head: true })
                .not("recruitment_status", "in", `(${TERMINAL_STATUSES.join(",")})`);
            inProgressQuery = applyCandidateFilters(inProgressQuery, filters);
            const { count: inProgress } = await inProgressQuery;

            // Open alerts
            let alertsQuery = supabase
                .from("alerts")
                .select("*, candidate:candidate_id!inner(company_id, referrer_id)", { count: "exact", head: true })
                .eq("is_resolved", false);

            if (filters?.company_id && filters.company_id.length > 0) {
                alertsQuery = alertsQuery.in("candidate.company_id", filters.company_id);
            }
            if (filters?.referrer && filters.referrer.length > 0) {
                alertsQuery = alertsQuery.in("candidate.referrer_id", filters.referrer);
            }
            const { count: openAlerts } = await alertsQuery;

            // Arrived this month
            const monthStart = startOfMonth(new Date()).toISOString();
            let arrivedQuery = supabase
                .from("candidates")
                .select("*", { count: "exact", head: true })
                .eq("recruitment_status", "ARRIVED_IN_ISRAEL")
                .gte("last_updated_at", monthStart);
            arrivedQuery = applyCandidateFilters(arrivedQuery, filters);
            const { count: arrivedThisMonth } = await arrivedQuery;

            return {
                totalCandidates: totalCandidates ?? 0,
                inProgress: inProgress ?? 0,
                openAlerts: openAlerts ?? 0,
                arrivedThisMonth: arrivedThisMonth ?? 0,
            };
        },
        staleTime: 30_000,
    });
}

export function useStatusBreakdown(filters?: DashboardFilters) {
    return useQuery({
        queryKey: dashboardKeys.statusChart(filters),
        queryFn: async (): Promise<StatusBreakdown[]> => {
            let query = supabase
                .from("candidates")
                .select("recruitment_status");
            query = applyCandidateFilters(query, filters);
            const { data } = await query;

            if (!data) return [];

            const counts: Record<string, number> = {};
            data.forEach((c) => {
                const s = c.recruitment_status;
                counts[s] = (counts[s] || 0) + 1;
            });

            return Object.entries(counts)
                .map(([status, count]) => ({ status, count }))
                .sort((a, b) => b.count - a.count);
        },
        staleTime: 60_000,
    });
}

export function useIndustryBreakdown(filters?: DashboardFilters) {
    return useQuery({
        queryKey: dashboardKeys.industryChart(filters),
        queryFn: async (): Promise<IndustryBreakdown[]> => {
            let query = supabase
                .from("candidates")
                .select("primary_industry");
            query = applyCandidateFilters(query, filters);
            const { data } = await query;

            if (!data) return [];

            const counts: Record<string, number> = {};
            data.forEach((c) => {
                const i = c.primary_industry;
                counts[i] = (counts[i] || 0) + 1;
            });

            return Object.entries(counts)
                .map(([industry, count]) => ({ industry, count }))
                .sort((a, b) => b.count - a.count);
        },
        staleTime: 60_000,
    });
}

export function useMonthlyTrend(filters?: DashboardFilters) {
    return useQuery({
        queryKey: dashboardKeys.trendChart(filters),
        queryFn: async (): Promise<MonthlyTrend[]> => {
            const sixMonthsAgo = subMonths(new Date(), 6).toISOString();
            let query = supabase
                .from("candidates")
                .select("created_at")
                .gte("created_at", sixMonthsAgo);
            query = applyCandidateFilters(query, filters);
            const { data } = await query;

            if (!data) return [];

            const counts: Record<string, number> = {};
            // Initialize last 6 months
            for (let i = 5; i >= 0; i--) {
                const m = format(subMonths(new Date(), i), "yyyy-MM");
                counts[m] = 0;
            }

            data.forEach((c) => {
                const m = format(new Date(c.created_at), "yyyy-MM");
                if (counts[m] !== undefined) {
                    counts[m]++;
                }
            });

            return Object.entries(counts).map(([month, count]) => ({
                month: format(new Date(month + "-01"), "MMM yyyy"),
                count,
            }));
        },
        staleTime: 60_000,
    });
}

export function useDocumentCompletion(filters?: DashboardFilters) {
    return useQuery({
        queryKey: dashboardKeys.documents(filters),
        queryFn: async (): Promise<DocumentCompletion[]> => {
            // 1. Get total number of active candidates for the denominator
            let candidatesQuery = supabase
                .from("candidates")
                .select("*", { count: "exact", head: true })
                .not("recruitment_status", "in", `(${TERMINAL_STATUSES.join(",")})`);
            candidatesQuery = applyCandidateFilters(candidatesQuery, filters);
            const { count: totalCandidates } = await candidatesQuery;

            const baseTotal = totalCandidates || 0;

            // 2. Get the existing documents
            let query = supabase
                .from("candidate_documents")
                .select("type, status, candidate:candidate_id!inner(company_id, referrer_id, recruitment_status)")
                .not("candidate.recruitment_status", "in", `(${TERMINAL_STATUSES.join(",")})`);

            if (filters?.company_id && filters.company_id.length > 0) {
                query = query.in("candidate.company_id", filters.company_id);
            }
            if (filters?.referrer && filters.referrer.length > 0) {
                query = query.in("candidate.referrer_id", filters.referrer);
            }

            const { data } = await query;

            const stats: Record<string, { total: number; received: number }> = {};

            // 3. Initialize all 15 expected document types with 0% completion
            const ALL_DOC_TYPES = [
                "PASSPORT_COPIES",
                "IMMIGRATION_LETTER_COPIES",
                "ORIGINAL_IMMIGRATION_LETTER",
                "RED_RIBBON_DOCUMENT",
                "VISA_APPLICATION_FORM",
                "MEDICAL_REPORT",
                "POLICE_REPORT",
                "BIRTH_CERTIFICATE",
                "GS_CERTIFICATE",
                "PERSONAL_AFFIDAVIT",
                "NIC_COPY_APPLICANT_AND_SPOUSE",
                "ENGLISH_AGREEMENT",
                "LETTER_FROM_TRANSLATOR",
                "SINHALA_AGREEMENT",
                "NIC_APPLICANT_AND_CANDIDATE",
            ];

            ALL_DOC_TYPES.forEach((type) => {
                stats[type] = { total: baseTotal, received: 0 };
            });

            if (data) {
                data.forEach((d) => {
                    // Only count known expected types, skipping deleted/legacy ones
                    if (stats[d.type]) {
                        if (d.status === 'SUBMITTED') stats[d.type].received++;
                    }
                });
            }

            return Object.entries(stats).map(([documentType, s]) => ({
                documentType,
                total: s.total,
                received: s.received,
                rate: s.total > 0 ? Math.round((s.received / s.total) * 100) : 0,
            }));
        },
        staleTime: 60_000,
    });
}

export function useExpiringDocuments(filters?: DashboardFilters) {
    return useQuery({
        queryKey: dashboardKeys.expiring(filters),
        queryFn: async (): Promise<ExpiringDocument[]> => {
            const now = new Date().toISOString();
            const thirtyDays = new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString();

            let query = supabase
                .from("candidate_documents")
                .select(
                    "id, type, expiration_date, candidate_id, candidate:candidate_id!inner(first_name, last_name, company_id, referrer_id)"
                )
                .eq("status", "SUBMITTED")
                .gt("expiration_date", now)
                .lt("expiration_date", thirtyDays);

            if (filters?.company_id && filters.company_id.length > 0) {
                query = query.in("candidate.company_id", filters.company_id);
            }
            if (filters?.referrer && filters.referrer.length > 0) {
                query = query.in("candidate.referrer_id", filters.referrer);
            }

            const { data } = await query
                .order("expiration_date", { ascending: true })
                .limit(10);

            if (!data) return [];

            return data.map((d: any) => ({
                id: d.id,
                documentType: d.type,
                expirationDate: d.expiration_date!,
                candidateName: `${d.candidate.first_name} ${d.candidate.last_name}`,
                candidateId: d.candidate_id,
            }));
        },
        staleTime: 60_000,
    });
}

export function useAlertSummary(filters?: DashboardFilters) {
    return useQuery({
        queryKey: dashboardKeys.alerts(filters),
        queryFn: async (): Promise<AlertSummary> => {
            let openQuery = supabase
                .from("alerts")
                .select("*, candidate:candidate_id!inner(company_id, referrer_id)", { count: "exact", head: true })
                .eq("is_resolved", false);

            if (filters?.company_id && filters.company_id.length > 0) {
                openQuery = openQuery.in("candidate.company_id", filters.company_id);
            }
            if (filters?.referrer && filters.referrer.length > 0) {
                openQuery = openQuery.in("candidate.referrer_id", filters.referrer);
            }
            const { count: open } = await openQuery;

            let resolvedQuery = supabase
                .from("alerts")
                .select("*, candidate:candidate_id!inner(company_id, referrer_id)", { count: "exact", head: true })
                .eq("is_resolved", true);

            if (filters?.company_id && filters.company_id.length > 0) {
                resolvedQuery = resolvedQuery.in("candidate.company_id", filters.company_id);
            }
            if (filters?.referrer && filters.referrer.length > 0) {
                resolvedQuery = resolvedQuery.in("candidate.referrer_id", filters.referrer);
            }
            const { count: resolved } = await resolvedQuery;

            return {
                open: open ?? 0,
                resolved: resolved ?? 0,
            };
        },
        staleTime: 30_000,
    });
}

export function useRecentActivity(filters?: DashboardFilters) {
    return useQuery({
        queryKey: dashboardKeys.activity(filters),
        queryFn: async (): Promise<ActivityEntry[]> => {
            let query = supabase
                .from("audit_logs")
                .select(
                    "id, action, timestamp, changed_fields, user:user_id(full_name), candidate:candidate_id!inner(first_name, last_name, company_id, referrer_id)"
                );

            if (filters?.company_id && filters.company_id.length > 0) {
                query = query.in("candidate.company_id", filters.company_id);
            }
            if (filters?.referrer && filters.referrer.length > 0) {
                query = query.in("candidate.referrer_id", filters.referrer);
            }

            const { data } = await query
                .order("timestamp", { ascending: false })
                .limit(15);

            if (!data) return [];

            return data.map((entry: any) => ({
                id: entry.id,
                action: entry.action,
                timestamp: entry.timestamp,
                userName: entry.user?.full_name ?? "System",
                candidateName: entry.candidate
                    ? `${entry.candidate.first_name} ${entry.candidate.last_name}`
                    : null,
                changedFields: entry.changed_fields,
            }));
        },
        staleTime: 15_000,
    });
}

