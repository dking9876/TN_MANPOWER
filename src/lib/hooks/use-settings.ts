"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

export const settingsKeys = {
    all: ["settings"] as const,
    config: () => [...settingsKeys.all, "config"] as const,
    countries: () => [...settingsKeys.all, "countries"] as const,
    professions: () => [...settingsKeys.all, "professions"] as const,
    companies: () => [...settingsKeys.all, "companies"] as const,
    statuses: () => [...settingsKeys.all, "statuses"] as const,
};

// --- System Config ---

export function useSystemConfig() {
    return useQuery({
        queryKey: settingsKeys.config(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("system_config")
                .select("*")
                .order("key");

            if (error) throw error;
            return data;
        },
    });
}

export function useUpdateConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (configs: { key: string; value: string | number }[]) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            for (const config of configs) {
                const { error } = await supabase
                    .from("system_config")
                    .upsert(
                        {
                            key: config.key,
                            value: config.value,
                            updated_by: user.id,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: "key" }
                    );

                if (error) throw error;
            }
        },
        onSuccess: () => {
            toast.success("Settings saved");
            queryClient.invalidateQueries({ queryKey: settingsKeys.config() });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to save settings");
        },
    });
}

// --- Blacklisted Countries ---

export function useBlacklistedCountries() {
    return useQuery({
        queryKey: settingsKeys.countries(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("blacklisted_countries")
                .select("*")
                .order("country_name");

            if (error) throw error;
            return data;
        },
    });
}

export function useToggleBlacklist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            countryCode,
            isBlacklisted,
        }: {
            countryCode: string;
            isBlacklisted: boolean;
        }) => {
            const { error } = await supabase
                .from("blacklisted_countries")
                .update({
                    is_blacklisted: isBlacklisted,
                    updated_at: new Date().toISOString(),
                })
                .eq("country_code", countryCode);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.countries() });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update country");
        },
    });
}

// --- Industry Professions ---

export function useProfessions() {
    return useQuery({
        queryKey: settingsKeys.professions(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("industry_professions")
                .select("*")
                .order("industry")
                .order("profession");

            if (error) throw error;
            return data;
        },
    });
}

export function useAddProfession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            industry,
            profession,
        }: {
            industry: string;
            profession: string;
        }) => {
            const { error } = await supabase
                .from("industry_professions")
                .insert({ industry, profession });

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Profession added");
            queryClient.invalidateQueries({ queryKey: settingsKeys.professions() });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to add profession");
        },
    });
}

export function useDeleteProfession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("industry_professions")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Profession removed");
            queryClient.invalidateQueries({ queryKey: settingsKeys.professions() });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to remove profession");
        },
    });
}

// --- Companies ---

export function useCompanies() {
    return useQuery({
        queryKey: settingsKeys.companies(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("companies")
                .select("*")
                .order("name");

            if (error) throw error;
            return data;
        },
    });
}

export function useAddCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name }: { name: string }) => {
            const { error } = await supabase
                .from("companies")
                .insert({ name });

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Company added successfully");
            queryClient.invalidateQueries({ queryKey: settingsKeys.companies() });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to add company");
        },
    });
}

export function useDeleteCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("companies")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Company deleted successfully");
            queryClient.invalidateQueries({ queryKey: settingsKeys.companies() });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete company");
        },
    });
}

// --- Recruitment Statuses ---

export function useRecruitmentStatuses() {
    return useQuery({
        queryKey: settingsKeys.statuses(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("recruitment_statuses")
                .select("*")
                .order("display_order");

            if (error) throw error;
            return data;
        },
    });
}

export function useAddStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            name,
            label,
            color,
            display_order,
        }: {
            name: string;
            label: string;
            color: string;
            display_order: number;
        }) => {
            const { error } = await supabase
                .from("recruitment_statuses")
                .insert({ name, label, color, display_order });

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Status added successfully");
            queryClient.invalidateQueries({ queryKey: settingsKeys.statuses() });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to add status");
        },
    });
}

export function useUpdateStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            updates,
        }: {
            id: string;
            updates: { label?: string; color?: string; display_order?: number; is_default?: boolean };
        }) => {
            const { error } = await supabase
                .from("recruitment_statuses")
                .update(updates)
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Status updated");
            queryClient.invalidateQueries({ queryKey: settingsKeys.statuses() });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update status");
        },
    });
}

export function useUpdateStatusesOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderedStatuses: { id: string; display_order: number }[]) => {
            const promises = orderedStatuses.map((status) =>
                supabase
                    .from("recruitment_statuses")
                    .update({ display_order: status.display_order })
                    .eq("id", status.id)
            );

            const results = await Promise.all(promises);
            const error = results.find((r) => r.error)?.error;
            if (error) throw error;
        },
        onSuccess: () => {
            // Optimistically update or invalidate. Since they drag and drop, we just invalidate to ensure DB consistency.
            queryClient.invalidateQueries({ queryKey: settingsKeys.statuses() });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to save new status order");
        },
    });
}

export function useDeleteStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("recruitment_statuses")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Status deleted successfully");
            queryClient.invalidateQueries({ queryKey: settingsKeys.statuses() });
        },
        onError: (error: Error) => {
            if (error.message?.includes("foreign key")) {
                toast.error("Cannot delete: this status is currently assigned to candidates");
            } else {
                toast.error(error.message || "Failed to delete status");
            }
        },
    });
}

