import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

export const alertKeys = {
    all: ["alerts"] as const,
    lists: () => [...alertKeys.all, "list"] as const,
    list: (filters: string) => [...alertKeys.lists(), { filters }] as const,
    count: () => [...alertKeys.all, "count"] as const,
};

export type AlertFilters = {
    search?: string;
    type?: string;     // STALENESS | DOCUMENT_EXPIRATION
    status?: "unresolved" | "resolved" | "all";
    page: number;
};

export function useAlerts(filters: AlertFilters) {
    return useQuery({
        queryKey: alertKeys.list(JSON.stringify(filters)),
        queryFn: async () => {
            let query = supabase
                .from("alerts")
                .select(`
                    *,
                    candidate:candidate_id(first_name, last_name),
                    assignee:assigned_to(full_name)
                `, { count: "exact" });

            // Apply filters
            if (filters.search) {
                // Search by candidate name via joined table
                // Note: Supabase doesn't support easy joining for search on foreign table properly in one go without raw SQL
                // or embedded filtering.
                // Workaround: We'll filter on alert_message for now or client-side.
                // Given standard implementation of Supabase JS:
                // We'll rely on text search on alert_message if name is included there, or just simple message search
                query = query.ilike("alert_message", `%${filters.search}%`);
            }

            if (filters.type && filters.type !== "all") {
                query = query.eq("alert_type", filters.type);
            }

            if (filters.status === "unresolved") {
                query = query.eq("is_resolved", false);
            } else if (filters.status === "resolved") {
                query = query.eq("is_resolved", true);
            }

            // Pagination (20 per page)
            const from = (filters.page - 1) * 20;
            const to = from + 19;
            query = query.range(from, to);

            query = query.order("created_at", { ascending: false });

            const { data, error, count } = await query;

            if (error) throw error;
            return { data, count };
        },
    });
}

// Global hook for alert badge in sidebar or header
export function useAlertCount(userId: string, role: "ADMIN" | "RECRUITER") {
    return useQuery({
        queryKey: alertKeys.count(),
        queryFn: async () => {
            let query = supabase
                .from("alerts")
                .select("*", { count: "exact", head: true })
                .eq("is_resolved", false);

            if (role !== "ADMIN") {
                query = query.eq("assigned_to", userId);
            }

            const { count, error } = await query;
            if (error) throw error;
            return count || 0;
        },
        refetchInterval: 30000, // Refresh every 30s
    });
}

export function useResolveAlert() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, notes, updateTimestamp }: { id: string; notes: string; updateTimestamp: boolean }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Mark alert as resolved
            const { data: alert, error: alertError } = await supabase
                .from("alerts")
                .update({
                    is_resolved: true,
                    resolution_notes: notes,
                    resolved_at: new Date().toISOString(),
                } as any)
                .eq("id", id)
                .select()
                .single();

            if (alertError) throw alertError;

            // 2. Optionally update candidate timestamp
            if (updateTimestamp && alert) {
                await supabase
                    .from("candidates")
                    .update({ last_updated_by: user.id } as any) // Triggers auto-timestamp
                    .eq("id", alert.candidate_id);
            }

            return alert;
        },
        onSuccess: () => {
            toast.success("Alert resolved");
            queryClient.invalidateQueries({ queryKey: alertKeys.all });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to resolve alert");
        },
    });
}
