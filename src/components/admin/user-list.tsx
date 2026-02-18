"use client";

import { useState } from "react";
import { useUsers, useToggleUserActive } from "@/lib/hooks/use-users";
import { UserFormDialog } from "./user-form-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    MoreHorizontal,
    Pencil,
    KeyRound,
    ShieldOff,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/lib/supabase/types";

type UserRow = Tables<"users">;

export function UserList() {
    const { data: users, isLoading } = useUsers();
    const toggleActive = useToggleUserActive();

    const [formOpen, setFormOpen] = useState(false);
    const [editUser, setEditUser] = useState<UserRow | null>(null);
    const [resetUser, setResetUser] = useState<UserRow | null>(null);
    const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);

    function handleEdit(user: UserRow) {
        setEditUser(user);
        setFormOpen(true);
    }

    function handleCreate() {
        setEditUser(null);
        setFormOpen(true);
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        User Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage system users and permissions
                    </p>
                </div>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add User
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[50px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(users ?? []).length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            (users ?? []).map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.full_name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.email}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.role === "ADMIN" ? "default" : "secondary"
                                            }
                                            className="text-xs"
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.is_active ? "outline" : "destructive"}
                                            className="text-xs"
                                        >
                                            {user.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.last_login
                                            ? format(new Date(user.last_login), "MMM d, yyyy")
                                            : "Never"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(user.created_at), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setResetUser(user)}
                                                >
                                                    <KeyRound className="h-3.5 w-3.5 mr-2" />
                                                    Reset Password
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        toggleActive.mutate({
                                                            userId: user.id,
                                                            isActive: !user.is_active,
                                                        })
                                                    }
                                                >
                                                    {user.is_active ? (
                                                        <>
                                                            <ShieldOff className="h-3.5 w-3.5 mr-2" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setDeleteUser(user)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialogs */}
            <UserFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditUser(null);
                }}
                user={editUser}
            />

            {resetUser && (
                <ResetPasswordDialog
                    open={!!resetUser}
                    onOpenChange={(open) => !open && setResetUser(null)}
                    userId={resetUser.id}
                    userName={resetUser.full_name}
                />
            )}

            {deleteUser && (
                <DeleteUserDialog
                    open={!!deleteUser}
                    onOpenChange={(open) => !open && setDeleteUser(null)}
                    userId={deleteUser.id}
                    userName={deleteUser.full_name}
                />
            )}
        </>
    );
}
