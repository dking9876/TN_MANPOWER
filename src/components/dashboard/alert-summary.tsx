"use client";

import { useAlertSummary } from "@/lib/hooks/use-dashboard";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

export function AlertSummaryCard() {
    const { data, isLoading } = useAlertSummary();

    if (isLoading) {
        return (
            <div className="border rounded-md p-4 bg-card">
                <Skeleton className="h-5 w-32 mb-4" />
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
        <div className="border rounded-md p-4 bg-card text-card-foreground">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Alert Summary</h3>
                <Link
                    href="/alerts"
                    className="text-xs text-teal-600 hover:underline font-medium"
                >
                    View all →
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {/* Mini donut */}
                <div className="w-[100px] h-[100px] shrink-0">
                    {total > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={28}
                                    outerRadius={45}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill="#f59e0b" />
                                    <Cell fill="#10b981" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-emerald-400" />
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs text-muted-foreground">Open</span>
                        <span className="ml-auto text-lg font-bold text-amber-600">
                            {open}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs text-muted-foreground">Resolved</span>
                        <span className="ml-auto text-lg font-bold text-emerald-600">
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
