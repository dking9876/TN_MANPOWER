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
            <div className="border rounded-md p-4 bg-card">
                <Skeleton className="h-5 w-48 mb-4" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    const chartData = (data ?? []).map((d) => ({
        ...d,
        label: STATUS_LABELS[d.status] ?? d.status,
    }));

    return (
        <div className="border rounded-md p-4 bg-card text-card-foreground">
            <h3 className="text-sm font-semibold mb-4">
                Candidates by Status
            </h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 80, right: 20, top: 5, bottom: 5 }}
                    >
                        <XAxis type="number" allowDecimals={false} fontSize={12} />
                        <YAxis
                            type="category"
                            dataKey="label"
                            width={80}
                            fontSize={11}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                fontSize: "12px",
                            }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                            {chartData.map((entry) => (
                                <Cell
                                    key={entry.status}
                                    fill={STATUS_COLORS[entry.status] ?? "#64748b"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
