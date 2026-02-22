"use client";

import { useStatusBreakdown } from "@/lib/hooks/use-dashboard";
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

const STATUS_LABELS: Record<string, string> = {
    POTENTIAL_CANDIDATE: "Potential",
    RECRUITMENT_STARTED: "Recruiting",
    DOCUMENTS_RECEIVED: "Docs Received",
    SENT_TO_IVS: "Sent to IVS",
    AWAITING_INTERVIEW: "Interview",
    VISA_APPROVED: "Visa Approved",
    HEALTH_INSURANCE_PURCHASED: "Health Ins.",
    FLIGHT_TICKET_PURCHASED: "Flight Ticket",
    ARRIVED_IN_ISRAEL: "Arrived",
    CANDIDATE_REJECTED: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
    POTENTIAL_CANDIDATE: "#94a3b8",
    RECRUITMENT_STARTED: "#38bdf8",
    DOCUMENTS_RECEIVED: "#2dd4bf",
    SENT_TO_IVS: "#34d399",
    AWAITING_INTERVIEW: "#a78bfa",
    VISA_APPROVED: "#22d3ee",
    HEALTH_INSURANCE_PURCHASED: "#4ade80",
    FLIGHT_TICKET_PURCHASED: "#facc15",
    ARRIVED_IN_ISRAEL: "#10b981",
    CANDIDATE_REJECTED: "#f87171",
};

export function StatusChart() {
    const { data, isLoading } = useStatusBreakdown();

    if (isLoading) {
        return (
            <div className="relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/50 backdrop-blur-sm">
                <Skeleton className="h-5 w-48 mb-6" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    const chartData = (data ?? []).map((d) => ({
        ...d,
        label: STATUS_LABELS[d.status] ?? d.status,
    }));

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
                                    fill={STATUS_COLORS[entry.status] ?? "var(--border)"}
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
