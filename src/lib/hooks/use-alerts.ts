import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { handleError } from "@/lib/utils/error-handler";

const supabase = createClient();

export const alertKeys = {
    all: ["alerts"] as const,
    lists: () => [...alertKeys.all, "list"] as const,
    list: (filters: string) => [...alertKeys.lists(), { filters }] as const,
    count: () => [...alertKeys.all, "count"] as const,
};

export type AlertFilters = {
    search?: string;
    type?: string;     // STALENESS | REFERRER_BONUS
    status?: "unresolved" | "resolved" | "all";
    page: number;
};

export function useAlerts(filters: AlertFilters) {
    return useQuery({
        queryKey: alertKeys.list(JSON.stringify(filters)),
        queryFn: async () => {
            // Get current user for targeted alert filtering
            const { data: { user } } = await supabase.auth.getUser();

            let query = supabase
                .from("alerts")
                .select(`
                    *,
                    candidate:candidate_id(first_name, last_name, primary_phone, emergency_phone, email, recruitment_status),
                    company:company_id(name)
                `, { count: "exact" });

            // Filter: show alerts where target_user_id is null (global) OR matches the current user
            if (user) {
                query = query.or(`target_user_id.is.null,target_user_id.eq.${user.id}`);
            }

            // Apply filters
            if (filters.search) {
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
    const queryClient = useQueryClient();

    // Set up real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel("realtime:alerts_count")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "alerts",
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: alertKeys.all });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return useQuery({
        queryKey: alertKeys.count(),
        queryFn: async () => {
            if (role === "ADMIN") {
                // Admins see global alerts + their own targeted alerts
                const { count, error } = await supabase
                    .from("alerts")
                    .select("*", { count: "exact", head: true })
                    .eq("is_resolved", false)
                    .or(`target_user_id.is.null,target_user_id.eq.${userId}`);
                if (error) throw error;
                return count || 0;
            }

            // For recruiters: get their linked company IDs, then count alerts
            const { data: linkedCompanies, error: rcError } = await supabase
                .from("recruiter_companies")
                .select("company_id")
                .eq("recruiter_id", userId);

            if (rcError) throw rcError;

            const companyIds = linkedCompanies?.map(rc => rc.company_id) || [];
            if (companyIds.length === 0) return 0;

            const { count, error } = await supabase
                .from("alerts")
                .select("*", { count: "exact", head: true })
                .eq("is_resolved", false)
                .in("company_id", companyIds)
                .or(`target_user_id.is.null,target_user_id.eq.${userId}`);

            if (error) throw error;
            return count || 0;
        },
        refetchInterval: 60000, // Still keep a backup poll just in case, but increased to reduce load
    });
}

export function useResolveAlert() {
    const queryClient = useQueryClient();
    const router = useRouter();

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

            // 2. For REFERRER_BONUS alerts, mark referrer as paid
            if (alert && (alert as any).alert_type === "REFERRER_BONUS") {
                const { error: paidError } = await supabase
                    .from("candidates")
                    .update({ referrer_got_paid: true } as any)
                    .eq("id", alert.candidate_id);

                if (paidError) throw paidError;
            }

            // 3. Optionally update candidate timestamp
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
            router.refresh();
        },
        onError: (error: any) => {
            toast.error(handleError(error, "Failed to resolve alert"));
        },
    });
}
