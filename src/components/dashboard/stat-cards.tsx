"use client";

import { useDashboardStats } from "@/lib/hooks/use-dashboard";
import { Users, TrendingUp, AlertTriangle, Plane } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CARDS = [
    {
        key: "totalCandidates" as const,
        label: "Total Candidates",
        icon: Users,
        color: "text-blue-500 dark:text-blue-400",
        bg: "bg-blue-500/10",
    },
    {
        key: "inProgress" as const,
        label: "In Progress",
        icon: TrendingUp,
        color: "text-emerald-500 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
    },
    {
        key: "openAlerts" as const,
        label: "Open Alerts",
        icon: AlertTriangle,
        color: "text-rose-500 dark:text-rose-400",
        bg: "bg-rose-500/10",
    },
    {
        key: "arrivedThisMonth" as const,
        label: "Arrived This Month",
        icon: Plane,
        color: "text-sky-500 dark:text-sky-400",
        bg: "bg-sky-500/10",
    },
];

export function StatCards() {
    const { data, isLoading } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {CARDS.map((c) => (
                    <div key={c.key} className="relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/50 backdrop-blur-sm">
                        <Skeleton className="h-4 w-24 mb-4" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((card) => (
                <div
                    key={card.key}
                    className="group relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                            {card.label}
                        </p>
                        <div className={`p-2.5 rounded-lg transition-transform duration-300 group-hover:scale-110 ${card.bg} ${card.color}`}>
                            <card.icon className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-4xl font-semibold tracking-tight">{data?.[card.key] ?? 0}</p>

                    {/* Decorative glow effect on hover */}
                    <div className="absolute -inset-x-4 -bottom-4 h-1/2 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
            ))}
        </div>
    );
}
