"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    FileText,
    Bell,
    Settings,
    UserCog,
    LogOut,
    ChevronLeft,
    Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import type { Tables } from "@/lib/supabase/types";

type UserProfile = Tables<"users">;

interface SidebarProps {
    user: UserProfile;
    alertCount?: number;
}

const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Candidates",
        href: "/candidates",
        icon: Users,
    },
    {
        label: "Documents",
        href: "/documents",
        icon: FileText,
    },
    {
        label: "Alerts",
        href: "/alerts",
        icon: Bell,
        showBadge: true,
    },
];

const ADMIN_ITEMS = [
    {
        label: "User Management",
        href: "/admin/users",
        icon: UserCog,
    },
    {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function Sidebar({ user, alertCount = 0 }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [collapsed, setCollapsed] = useState(false);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    const isAdmin = user.role === "ADMIN";

    return (
        <>
            {/* Mobile toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-3 left-3 z-50 lg:hidden"
                onClick={() => setCollapsed(!collapsed)}
                aria-label="Toggle menu"
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-dvh flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 ease-out",
                    collapsed ? "w-[60px]" : "w-[240px]",
                    "max-lg:translate-x-[-100%] lg:translate-x-0",
                    !collapsed && "max-lg:translate-x-0"
                )}
            >
                {/* Brand */}
                <div className={cn(
                    "flex items-center h-14 px-4 border-b border-sidebar-border shrink-0",
                    collapsed ? "justify-center" : "gap-3"
                )}>
                    <div className="w-8 h-8 bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center rounded-sm text-sm font-bold shrink-0">
                        TN
                    </div>
                    {!collapsed && (
                        <span className="font-semibold text-sm tracking-tight truncate">
                            T.N Manpower
                        </span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2 px-2">
                    <div className="space-y-0.5">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-sm transition-colors",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                                        collapsed && "justify-center px-0"
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    {!collapsed && (
                                        <>
                                            <span className="truncate">{item.label}</span>
                                            {item.showBadge && alertCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] font-bold"
                                                >
                                                    {alertCount > 99 ? "99+" : alertCount}
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                    {collapsed && item.showBadge && alertCount > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Admin section */}
                    {isAdmin && (
                        <>
                            <Separator className="my-3 bg-sidebar-border" />
                            <p className={cn(
                                "text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-medium mb-1",
                                collapsed ? "text-center" : "px-3"
                            )}>
                                {collapsed ? "•" : "Admin"}
                            </p>
                            <div className="space-y-0.5">
                                {ADMIN_ITEMS.map((item) => {
                                    const isActive = pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-sm transition-colors",
                                                isActive
                                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                                                collapsed && "justify-center px-0"
                                            )}
                                            title={collapsed ? item.label : undefined}
                                        >
                                            <item.icon className="h-4 w-4 shrink-0" />
                                            {!collapsed && <span className="truncate">{item.label}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </nav>

                {/* Footer: user + collapse */}
                <div className="border-t border-sidebar-border px-2 py-2 space-y-1">
                    {/* User info */}
                    <div className={cn(
                        "flex items-center gap-2 px-2 py-1.5",
                        collapsed && "justify-center"
                    )}>
                        <div className="w-7 h-7 bg-sidebar-accent text-sidebar-accent-foreground flex items-center justify-center rounded-sm text-xs font-semibold shrink-0">
                            {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{user.full_name}</p>
                                <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.role}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className={cn("flex gap-1", collapsed ? "flex-col" : "")}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className={cn(
                                "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 h-8",
                                collapsed ? "w-full justify-center px-0" : "flex-1"
                            )}
                            title="Sign out"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            {!collapsed && <span className="ml-2 text-xs">Sign out</span>}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCollapsed(!collapsed)}
                            className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 h-8 max-lg:hidden"
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {!collapsed && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setCollapsed(true)}
                />
            )}
        </>
    );
}
