"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { handleError } from "@/lib/utils/error-handler";
import {
    createUserAction,
    updateUserAction,
    resetPasswordAction,
    toggleUserActiveAction,
    deleteUserAction,
    getAllUsersForReferrerAction,
} from "@/lib/actions/user-actions";

const supabase = createClient();

export const userKeys = {
    all: ["users"] as const,
    list: () => [...userKeys.all, "list"] as const,
};

export function useUsers() {
    return useQuery({
        queryKey: userKeys.list(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("users")
                .select(`
                    *,
                    recruiter_companies (
                        company_id
                    )
                `)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data;
        },
    });
}

export function useAllReferrers() {
    return useQuery({
        queryKey: [...userKeys.all, "referrers-dropdown"],
        queryFn: async () => {
            const res = await getAllUsersForReferrerAction();
            if ('error' in res && res.error) throw new Error(res.error);
            // Return empty array if res.users is undefined to maintain type safety
            return res.users || [];
        },
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            fullName: string;
            email: string;
            password: string;
            role: "ADMIN" | "RECRUITER" | "REFERRER";
            companyIds?: string[];
        }) => {
            const res = await createUserAction(data);
            if ('error' in res && res.error) throw new Error(res.error);
            return res;
        },
        onSuccess: () => {
            toast.success("User created successfully");
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: any) => {
            toast.error(handleError(error, "Failed to create user"));
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            data,
        }: {
            userId: string;
            data: { fullName: string; role: "ADMIN" | "RECRUITER" | "REFERRER"; companyIds?: string[] };
        }) => {
            const res = await updateUserAction(userId, data);
            if ('error' in res && res.error) throw new Error(res.error);
            return res;
        },
        onSuccess: () => {
            toast.success("User updated successfully");
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: any) => {
            toast.error(handleError(error, "Failed to update user"));
        },
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: async ({
            userId,
            newPassword,
        }: {
            userId: string;
            newPassword: string;
        }) => {
            const res = await resetPasswordAction(userId, newPassword);
            if ('error' in res && res.error) throw new Error(res.error);
            return res;
        },
        onSuccess: () => {
            toast.success("Password reset successfully");
        },
        onError: (error: any) => {
            toast.error(handleError(error, "Failed to reset password"));
        },
    });
}

export function useToggleUserActive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            isActive,
        }: {
            userId: string;
            isActive: boolean;
        }) => {
            const res = await toggleUserActiveAction(userId, isActive);
            if ('error' in res && res.error) throw new Error(res.error);
            return res;
        },
        onSuccess: (_, variables) => {
            toast.success(
                variables.isActive ? "User activated" : "User deactivated"
            );
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: any) => {
            toast.error(handleError(error, "Failed to update user status"));
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const res = await deleteUserAction(userId);
            if ('error' in res && res.error) throw new Error(res.error);
            return res;
        },
        onSuccess: () => {
            toast.success("User deleted successfully");
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: any) => {
            toast.error(handleError(error, "Failed to delete user"));
        },
    });
}
