"use client";

import { useAlertSummary, DashboardFilters } from "@/lib/hooks/use-dashboard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface AlertSummaryCardProps {
    filters?: DashboardFilters;
}

export function AlertSummaryCard({ filters }: AlertSummaryCardProps) {
    const { data, isLoading } = useAlertSummary(filters);

    if (isLoading) {
        return (
            <div className="relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/50 backdrop-blur-sm">
                <Skeleton className="h-5 w-32 mb-6" />
                <Skeleton className="h-[150px] w-full" />
            </div>
        );
    }

    const open = data?.open ?? 0;
    const resolved = data?.resolved ?? 0;
    const total = open + resolved;
    const chartData = [
        { name: "Open", value: open },
        { name: "Resolved", value: resolved },
    ];

    return (
        <div className="group relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold tracking-tight">Alert Summary</h3>
                <Link
                    href="/alerts"
                    className="text-xs text-primary hover:text-accent hover:underline font-medium transition-colors"
                >
                    View all &rarr;
                </Link>
            </div>

            <div className="flex items-center gap-6">
                {/* Mini donut */}
                <div className="w-[120px] h-[120px] shrink-0">
                    {total > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={55}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="var(--card)"
                                    strokeWidth={2}
                                >
                                    <Cell fill="#E11D48" className="transition-opacity duration-300 hover:opacity-80 cursor-pointer outline-none" />
                                    <Cell fill="#10B981" className="transition-opacity duration-300 hover:opacity-80 cursor-pointer outline-none" />
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        backgroundColor: "var(--card)",
                                        color: "var(--card-foreground)",
                                        fontSize: "13px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                                    }}
                                    itemStyle={{ color: "var(--foreground)" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-emerald-400" />
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                        <span className="text-sm text-muted-foreground font-medium">Open</span>
                        <span className="ml-auto text-xl font-bold text-rose-600 dark:text-rose-400">
                            {open}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-muted-foreground font-medium">Resolved</span>
                        <span className="ml-auto text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {resolved}
                        </span>
                    </div>
                    {total > 0 && (
                        <div className="pt-1 border-t">
                            <span className="text-[10px] text-muted-foreground">
                                Resolution rate:{" "}
                                <span className="font-semibold text-foreground">
                                    {Math.round((resolved / total) * 100)}%
                                </span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
