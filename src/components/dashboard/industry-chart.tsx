"use client";

import { useIndustryBreakdown } from "@/lib/hooks/use-dashboard";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const INDUSTRY_COLORS = [
    "#14b8a6", // teal
    "#10b981", // emerald
    "#0ea5e9", // sky
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // indigo
    "#ec4899", // pink
];

const INDUSTRY_LABELS: Record<string, string> = {
    NURSING: "Nursing",
    CONSTRUCTION: "Construction",
    INDUSTRY: "Industry",
    AGRICULTURE: "Agriculture",
    COMMERCE: "Commerce",
    HOSPITALITY: "Hospitality",
    SERVICES: "Services",
};

export function IndustryChart() {
    const { data, isLoading } = useIndustryBreakdown();

    if (isLoading) {
        return (
            <div className="border rounded-md p-4 bg-card">
                <Skeleton className="h-5 w-48 mb-4" />
                <Skeleton className="h-[300px] w-full rounded-full mx-auto max-w-[200px]" />
            </div>
        );
    }

    const chartData = (data ?? []).map((d) => ({
        ...d,
        label: INDUSTRY_LABELS[d.industry] ?? d.industry,
    }));

    return (
        <div className="border rounded-md p-4 bg-card text-card-foreground">
            <h3 className="text-sm font-semibold mb-4">
                Candidates by Industry
            </h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="count"
                            nameKey="label"
                            stroke="none"
                        >
                            {chartData.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={INDUSTRY_COLORS[index % INDUSTRY_COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                fontSize: "12px",
                            }}
                        />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: "11px" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
