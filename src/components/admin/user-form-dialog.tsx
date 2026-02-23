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
import { useCompanies } from "@/lib/hooks/use-settings";
import { Checkbox } from "@/components/ui/checkbox";
import type { Tables } from "@/lib/supabase/types";

const createSchema = z
    .object({
        fullName: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        role: z.enum(["ADMIN", "RECRUITER", "REFERRER"]),
        companyIds: z.array(z.string()).optional(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const editSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["ADMIN", "RECRUITER", "REFERRER"]),
    companyIds: z.array(z.string()).optional(),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;

interface UserFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: (Tables<"users"> & { recruiter_companies?: { company_id: string }[] }) | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
    const isEdit = !!user;
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const { data: companies } = useCompanies();

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
                role: user.role as "ADMIN" | "RECRUITER" | "REFERRER",
                password: "",
                confirmPassword: "",
                companyIds: user.recruiter_companies?.map(rc => rc.company_id) || [],
            });
        } else {
            reset({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "RECRUITER",
                companyIds: [],
            });
        }
    }, [user, reset]);

    const selectedRole = watch("role");
    const selectedCompanies = watch("companyIds") || [];

    const handleCompanyChange = (companyId: string, checked: boolean) => {
        if (checked) {
            setValue("companyIds", [...selectedCompanies, companyId], { shouldDirty: true });
        } else {
            setValue("companyIds", selectedCompanies.filter(id => id !== companyId), { shouldDirty: true });
        }
    };

    async function onSubmit(data: CreateFormData) {
        try {
            if (isEdit && user) {
                await updateUser.mutateAsync({
                    userId: user.id,
                    data: { fullName: data.fullName, role: data.role, companyIds: data.companyIds },
                });
            } else {
                await createUser.mutateAsync({
                    fullName: data.fullName,
                    email: data.email,
                    password: data.password,
                    role: data.role,
                    companyIds: data.companyIds,
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
                            onValueChange={(v) => setValue("role", v as "ADMIN" | "RECRUITER" | "REFERRER")}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="RECRUITER">Recruiter</SelectItem>
                                <SelectItem value="REFERRER">Referrer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedRole === "RECRUITER" && companies && companies.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <Label>Linked Companies</Label>
                            <div className="grid grid-cols-2 gap-3 p-3 border rounded-md max-h-48 overflow-y-auto">
                                {companies.map((company) => (
                                    <div key={company.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`company-${company.id}`}
                                            checked={selectedCompanies.includes(company.id)}
                                            onCheckedChange={(checked) => handleCompanyChange(company.id, checked as boolean)}
                                        />
                                        <label
                                            htmlFor={`company-${company.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {company.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
