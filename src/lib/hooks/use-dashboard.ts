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

export const dashboardKeys = {
    all: ["dashboard"] as const,
    stats: () => [...dashboardKeys.all, "stats"] as const,
    statusChart: () => [...dashboardKeys.all, "statusChart"] as const,
    industryChart: () => [...dashboardKeys.all, "industryChart"] as const,
    trendChart: () => [...dashboardKeys.all, "trendChart"] as const,
    documents: () => [...dashboardKeys.all, "documents"] as const,
    alerts: () => [...dashboardKeys.all, "alerts"] as const,
    activity: () => [...dashboardKeys.all, "activity"] as const,
    expiring: () => [...dashboardKeys.all, "expiring"] as const,
};

export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: async (): Promise<DashboardStats> => {
            // Total candidates
            const { count: totalCandidates } = await supabase
                .from("candidates")
                .select("*", { count: "exact", head: true });

            // In progress (not terminal)
            const { count: inProgress } = await supabase
                .from("candidates")
                .select("*", { count: "exact", head: true })
                .not("recruitment_status", "in", `(${TERMINAL_STATUSES.join(",")})`);

            // Open alerts
            const { count: openAlerts } = await supabase
                .from("alerts")
                .select("*", { count: "exact", head: true })
                .eq("is_resolved", false);

            // Arrived this month
            const monthStart = startOfMonth(new Date()).toISOString();
            const { count: arrivedThisMonth } = await supabase
                .from("candidates")
                .select("*", { count: "exact", head: true })
                .eq("recruitment_status", "ARRIVED_IN_ISRAEL")
                .gte("last_updated_at", monthStart);

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

export function useStatusBreakdown() {
    return useQuery({
        queryKey: dashboardKeys.statusChart(),
        queryFn: async (): Promise<StatusBreakdown[]> => {
            const { data } = await supabase
                .from("candidates")
                .select("recruitment_status");

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

export function useIndustryBreakdown() {
    return useQuery({
        queryKey: dashboardKeys.industryChart(),
        queryFn: async (): Promise<IndustryBreakdown[]> => {
            const { data } = await supabase
                .from("candidates")
                .select("primary_industry");

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

export function useMonthlyTrend() {
    return useQuery({
        queryKey: dashboardKeys.trendChart(),
        queryFn: async (): Promise<MonthlyTrend[]> => {
            const sixMonthsAgo = subMonths(new Date(), 6).toISOString();
            const { data } = await supabase
                .from("candidates")
                .select("created_at")
                .gte("created_at", sixMonthsAgo);

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

export function useDocumentCompletion() {
    return useQuery({
        queryKey: dashboardKeys.documents(),
        queryFn: async (): Promise<DocumentCompletion[]> => {
            const { data } = await supabase
                .from("documents")
                .select("document_type, is_received");

            if (!data) return [];

            const stats: Record<string, { total: number; received: number }> = {};
            data.forEach((d) => {
                if (!stats[d.document_type]) {
                    stats[d.document_type] = { total: 0, received: 0 };
                }
                stats[d.document_type].total++;
                if (d.is_received) stats[d.document_type].received++;
            });

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

export function useExpiringDocuments() {
    return useQuery({
        queryKey: dashboardKeys.expiring(),
        queryFn: async (): Promise<ExpiringDocument[]> => {
            const now = new Date().toISOString();
            const thirtyDays = new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString();

            const { data } = await supabase
                .from("documents")
                .select(
                    "id, document_type, expiration_date, candidate_id, candidate:candidate_id(first_name, last_name)"
                )
                .eq("is_received", true)
                .gt("expiration_date", now)
                .lt("expiration_date", thirtyDays)
                .order("expiration_date", { ascending: true })
                .limit(10);

            if (!data) return [];

            return data.map((d: any) => ({
                id: d.id,
                documentType: d.document_type,
                expirationDate: d.expiration_date,
                candidateName: d.candidate
                    ? `${d.candidate.first_name} ${d.candidate.last_name}`
                    : "Unknown",
                candidateId: d.candidate_id,
            }));
        },
        staleTime: 60_000,
    });
}

export function useAlertSummary() {
    return useQuery({
        queryKey: dashboardKeys.alerts(),
        queryFn: async (): Promise<AlertSummary> => {
            const { count: open } = await supabase
                .from("alerts")
                .select("*", { count: "exact", head: true })
                .eq("is_resolved", false);

            const { count: resolved } = await supabase
                .from("alerts")
                .select("*", { count: "exact", head: true })
                .eq("is_resolved", true);

            return {
                open: open ?? 0,
                resolved: resolved ?? 0,
            };
        },
        staleTime: 30_000,
    });
}

export function useRecentActivity() {
    return useQuery({
        queryKey: dashboardKeys.activity(),
        queryFn: async (): Promise<ActivityEntry[]> => {
            const { data } = await supabase
                .from("audit_logs")
                .select(
                    "id, action, timestamp, changed_fields, user:user_id(full_name), candidate:candidate_id(first_name, last_name)"
                )
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
