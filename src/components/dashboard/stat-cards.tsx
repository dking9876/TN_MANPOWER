"use client";

import { useDashboardStats } from "@/lib/hooks/use-dashboard";
import { Users, TrendingUp, AlertTriangle, Plane } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CARDS = [
    {
        key: "totalCandidates" as const,
        label: "Total Candidates",
        icon: Users,
        color: "text-teal-600",
        bg: "bg-teal-50",
    },
    {
        key: "inProgress" as const,
        label: "In Progress",
        icon: TrendingUp,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        key: "openAlerts" as const,
        label: "Open Alerts",
        icon: AlertTriangle,
        color: "text-amber-600",
        bg: "bg-amber-50",
    },
    {
        key: "arrivedThisMonth" as const,
        label: "Arrived This Month",
        icon: Plane,
        color: "text-sky-600",
        bg: "bg-sky-50",
    },
];

export function StatCards() {
    const { data, isLoading } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {CARDS.map((c) => (
                    <div key={c.key} className="border rounded-md p-4 bg-card">
                        <Skeleton className="h-4 w-24 mb-3" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((card) => (
                <div
                    key={card.key}
                    className="border rounded-md p-4 bg-card text-card-foreground hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            {card.label}
                        </p>
                        <div className={`${card.bg} ${card.color} p-1.5 rounded-sm`}>
                            <card.icon className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">{data?.[card.key] ?? 0}</p>
                </div>
            ))}
        </div>
    );
}
