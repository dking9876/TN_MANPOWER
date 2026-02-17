import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CandidateFormValues } from "@/lib/validations/candidate-schema";

const supabase = createClient();

// Keys for query invalidation
export const candidateKeys = {
    all: ["candidates"] as const,
    lists: () => [...candidateKeys.all, "list"] as const,
    list: (filters: string) => [...candidateKeys.lists(), { filters }] as const,
    details: () => [...candidateKeys.all, "detail"] as const,
    detail: (id: string) => [...candidateKeys.details(), id] as const,
};

export type CandidateFilters = {
    search?: string;
    status?: string[];
    industry?: string[];
    recruiter?: string[];
    is_blacklisted?: boolean;
    page: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

// --- Queries ---

export function useCandidates(filters: CandidateFilters) {
    return useQuery({
        queryKey: candidateKeys.list(JSON.stringify(filters)),
        queryFn: async () => {
            let query = supabase
                .from("candidates")
                .select("*", { count: "exact" });

            // Apply filters
            if (filters.search) {
                const search = `%${filters.search}%`;
                // Search by name (first+last), national_id, or passport_number
                query = query.or(`first_name.ilike.${search},last_name.ilike.${search},national_id.ilike.${search},passport_number.ilike.${search}`);
            }

            if (filters.status && filters.status.length > 0) {
                query = query.in("recruitment_status", filters.status);
            }

            if (filters.industry && filters.industry.length > 0) {
                query = query.in("primary_industry", filters.industry);
            }

            if (filters.recruiter && filters.recruiter.length > 0) {
                query = query.in("created_by", filters.recruiter);
            }

            if (filters.is_blacklisted !== undefined) {
                query = query.eq("is_blacklisted", filters.is_blacklisted);
            }

            // Pagination (25 per page)
            const from = (filters.page - 1) * 25;
            const to = from + 24;
            query = query.range(from, to);

            // Sorting
            if (filters.sortBy) {
                query = query.order(filters.sortBy, { ascending: filters.sortOrder === "asc" });
            } else {
                // Default sort: last updated desc
                query = query.order("last_updated_at", { ascending: false });
            }

            const { data, error, count } = await query;

            if (error) throw error;
            return { data, count };
        },
    });
}

export function useCandidate(id: string) {
    return useQuery({
        queryKey: candidateKeys.detail(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("candidates")
                .select(`
                    *,
                    creator:created_by (full_name),
                    updater:last_updated_by (full_name)
                `)
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        },
    });
}

export function useCandidateAuditAttributes(id: string) {
    return useQuery({
        queryKey: ["candidate_audit", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audit_logs")
                .select("*")
                .eq("candidate_id", id)
                .order("timestamp", { ascending: false });

            if (error) throw error;
            return data;
        },
    });
}

// --- Mutations ---

export function useCreateCandidate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: CandidateFormValues) => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("candidates")
                .insert({
                    ...values,
                    created_by: user.id,
                    last_updated_by: user.id,
                } as any) // Type cast needed for enum compatibility
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success("Candidate created successfully");
            queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create candidate");
        },
    });
}

export function useUpdateCandidate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, values }: { id: string; values: Partial<CandidateFormValues> }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("candidates")
                .update({
                    ...values,
                    last_updated_by: user.id,
                    // last_updated_at is handled by DB trigger
                } as any)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            toast.success("Candidate updated successfully");
            queryClient.invalidateQueries({ queryKey: candidateKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update candidate");
        },
    });
}

export function useDeleteCandidate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("candidates")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Candidate deleted successfully");
            queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete candidate");
        },
    });
}

export function useLogActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Updating last_updated_by triggers the timestamp update via DB trigger
            const { data, error } = await supabase
                .from("candidates")
                .update({ last_updated_by: user.id })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            toast.success("Activity logged");
            queryClient.invalidateQueries({ queryKey: candidateKeys.detail(data.id) });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to log activity");
        },
    });
}
