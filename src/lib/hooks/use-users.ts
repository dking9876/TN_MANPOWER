"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
    createUserAction,
    updateUserAction,
    resetPasswordAction,
    toggleUserActiveAction,
    deleteUserAction,
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
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data;
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
            role: "ADMIN" | "RECRUITER";
        }) => {
            return await createUserAction(data);
        },
        onSuccess: () => {
            toast.success("User created successfully");
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create user");
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
            data: { fullName: string; role: "ADMIN" | "RECRUITER" };
        }) => {
            return await updateUserAction(userId, data);
        },
        onSuccess: () => {
            toast.success("User updated successfully");
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update user");
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
            return await resetPasswordAction(userId, newPassword);
        },
        onSuccess: () => {
            toast.success("Password reset successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to reset password");
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
            return await toggleUserActiveAction(userId, isActive);
        },
        onSuccess: (_, variables) => {
            toast.success(
                variables.isActive ? "User activated" : "User deactivated"
            );
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update user status");
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            return await deleteUserAction(userId);
        },
        onSuccess: () => {
            toast.success("User deleted successfully");
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete user");
        },
    });
}
