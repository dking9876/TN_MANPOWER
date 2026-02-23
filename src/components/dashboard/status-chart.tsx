"use client";

import { useStatusBreakdown } from "@/lib/hooks/use-dashboard";
import { useRecruitmentStatuses } from "@/lib/hooks/use-settings";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// Fallback hex colors for chart (DB stores Tailwind classes, so we need hex for recharts)
const CHART_COLORS: Record<string, string> = {
    POTENTIAL_CANDIDATE: "#94a3b8",
    RECRUITMENT_STARTED: "#38bdf8",
    DOCUMENTS_RECEIVED: "#818cf8",
    SENT_TO_IVS: "#a78bfa",
    AWAITING_INTERVIEW: "#f59e0b",
    VISA_APPROVED: "#2dd4bf",
    HEALTH_INSURANCE_PURCHASED: "#22d3ee",
    FLIGHT_TICKET_PURCHASED: "#38bdf8",
    ARRIVED_IN_ISRAEL: "#10b981",
    CANDIDATE_REJECTED: "#f87171",
};

// Map common Tailwind color classes to hex for the chart
function tailwindToHex(colorClass: string): string {
    if (colorClass.includes("slate")) return "#94a3b8";
    if (colorClass.includes("blue")) return "#38bdf8";
    if (colorClass.includes("indigo")) return "#818cf8";
    if (colorClass.includes("purple")) return "#a78bfa";
    if (colorClass.includes("amber")) return "#f59e0b";
    if (colorClass.includes("teal")) return "#2dd4bf";
    if (colorClass.includes("cyan")) return "#22d3ee";
    if (colorClass.includes("sky")) return "#38bdf8";
    if (colorClass.includes("green") || colorClass.includes("emerald")) return "#10b981";
    if (colorClass.includes("rose") || colorClass.includes("destructive") || colorClass.includes("red")) return "#f87171";
    if (colorClass.includes("orange")) return "#fb923c";
    return "#94a3b8"; // fallback gray
}

export function StatusChart() {
    const { data, isLoading } = useStatusBreakdown();
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
                            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
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
