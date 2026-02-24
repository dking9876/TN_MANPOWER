"use client";

import { useStatusBreakdown, DashboardFilters } from "@/lib/hooks/use-dashboard";
import { useRecruitmentStatuses } from "@/lib/hooks/use-settings";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// Fallback hex colors for chart (DB stores Tailwind classes, so we need hex for recharts)
// Using a sophisticated sequence of Muted Jewel/Deep tones
const CHART_COLORS: Record<string, string> = {
    POTENTIAL_CANDIDATE: "#475569", // slate-600
    RECRUITMENT_STARTED: "#0369a1", // sky-700
    DOCUMENTS_RECEIVED: "#4338ca", // indigo-700
    SENT_TO_IVS: "#6d28d9", // violet-700
    AWAITING_INTERVIEW: "#b45309", // amber-700
    VISA_APPROVED: "#0f766e", // teal-700
    HEALTH_INSURANCE_PURCHASED: "#0e7490", // cyan-700
    FLIGHT_TICKET_PURCHASED: "#0369a1", // sky-700
    ARRIVED_IN_ISRAEL: "#15803d", // green-700
    CANDIDATE_REJECTED: "#be123c", // rose-700
};

// Map common Tailwind color classes to hex for the chart, enforcing rich/muted tones
function tailwindToHex(colorClass: string): string {
    if (colorClass.includes("slate") || colorClass.includes("gray")) return "#475569"; // slate-600
    if (colorClass.includes("blue") || colorClass.includes("sky")) return "#0369a1"; // sky-700
    if (colorClass.includes("indigo")) return "#4338ca"; // indigo-700
    if (colorClass.includes("purple") || colorClass.includes("violet")) return "#6d28d9"; // violet-700
    if (colorClass.includes("amber") || colorClass.includes("yellow") || colorClass.includes("orange")) return "#b45309"; // amber-700
    if (colorClass.includes("teal") || colorClass.includes("cyan")) return "#0f766e"; // teal-700
    if (colorClass.includes("green") || colorClass.includes("emerald")) return "#15803d"; // green-700
    if (colorClass.includes("rose") || colorClass.includes("red") || colorClass.includes("destructive")) return "#be123c"; // rose-700
    return "#475569"; // fallback slate
}

interface StatusChartProps {
    filters?: DashboardFilters;
}

export function StatusChart({ filters }: StatusChartProps) {
    const { data, isLoading } = useStatusBreakdown(filters);
    const { data: statuses } = useRecruitmentStatuses();

    if (isLoading) {
        return (
            <div className="relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/50 backdrop-blur-sm">
                <Skeleton className="h-5 w-48 mb-6" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    // Build label/color maps from DB statuses
    const statusMap = new Map(statuses?.map((s) => [s.name, s]) ?? []);

    const chartData = (data ?? []).map((d) => {
        const dbStatus = statusMap.get(d.status);
        return {
            ...d,
            label: dbStatus?.label ?? d.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            color: dbStatus ? tailwindToHex(dbStatus.color) : CHART_COLORS[d.status] ?? "#94a3b8",
        };
    });

    return (
        <div className="group relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <h3 className="text-base font-semibold mb-6 tracking-tight">
                Candidates by Status
            </h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 80, right: 20, top: 5, bottom: 5 }}
                    >
                        <XAxis type="number" allowDecimals={false} fontSize={12} stroke="currentColor" opacity={0.5} />
                        <YAxis
                            type="category"
                            dataKey="label"
                            width={100}
                            fontSize={12}
                            tickLine={false}
                            stroke="currentColor"
                            opacity={0.8}
                        />
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
                            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                            <LabelList dataKey="count" position="right" fill="currentColor" fontSize={12} fontWeight={600} />
                            {chartData.map((entry) => (
                                <Cell
                                    key={entry.status}
                                    fill={entry.color}
                                    className="transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
