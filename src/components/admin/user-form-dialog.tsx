"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateUser, useUpdateUser } from "@/lib/hooks/use-users";
import type { Tables } from "@/lib/supabase/types";

const createSchema = z
    .object({
        fullName: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        role: z.enum(["ADMIN", "RECRUITER"]),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const editSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["ADMIN", "RECRUITER"]),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;

interface UserFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: Tables<"users"> | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
    const isEdit = !!user;
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateFormData>({
        resolver: zodResolver(isEdit ? (editSchema as any) : (createSchema as any)),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "RECRUITER",
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                fullName: user.full_name,
                email: user.email,
                role: user.role as "ADMIN" | "RECRUITER",
                password: "",
                confirmPassword: "",
            });
        } else {
            reset({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "RECRUITER",
            });
        }
    }, [user, reset]);

    const selectedRole = watch("role");

    async function onSubmit(data: CreateFormData) {
        try {
            if (isEdit && user) {
                await updateUser.mutateAsync({
                    userId: user.id,
                    data: { fullName: data.fullName, role: data.role },
                });
            } else {
                await createUser.mutateAsync({
                    fullName: data.fullName,
                    email: data.email,
                    password: data.password,
                    role: data.role,
                });
            }
            onOpenChange(false);
        } catch {
            // Error handled by mutation hooks
        }
    }

    const isPending = createUser.isPending || updateUser.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit User" : "Create New User"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            {...register("fullName")}
                            placeholder="John Doe"
                        />
                        {errors.fullName && (
                            <p className="text-xs text-destructive">{errors.fullName.message}</p>
                        )}
                    </div>

                    {!isEdit && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="user@tnmanpower.com"
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    placeholder="Minimum 8 characters"
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register("confirmPassword")}
                                    placeholder="Re-enter password"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs text-destructive">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={(v) => setValue("role", v as "ADMIN" | "RECRUITER")}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="RECRUITER">Recruiter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending
                                ? isEdit
                                    ? "Saving..."
                                    : "Creating..."
                                : isEdit
                                    ? "Save Changes"
                                    : "Create User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
