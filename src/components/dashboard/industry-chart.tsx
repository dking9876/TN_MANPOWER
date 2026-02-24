"use client";

import { useIndustryBreakdown, DashboardFilters } from "@/lib/hooks/use-dashboard";
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
    "#0369a1", // sky-700 (deep blue)
    "#15803d", // green-700 (deep green)
    "#b45309", // amber-700 (deep gold)
    "#6d28d9", // violet-700 (deep purple)
    "#be123c", // rose-700 (deep red)
    "#0f766e", // teal-700 (deep teal)
    "#475569", // slate-600 (neutral slate)
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

interface IndustryChartProps {
    filters?: DashboardFilters;
}

export function IndustryChart({ filters }: IndustryChartProps) {
    const { data, isLoading } = useIndustryBreakdown(filters);

    if (isLoading) {
        return (
            <div className="relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/50 backdrop-blur-sm">
                <Skeleton className="h-5 w-48 mb-6" />
                <Skeleton className="h-[300px] w-full rounded-full mx-auto max-w-[200px]" />
            </div>
        );
    }

    const chartData = (data ?? []).map((d) => ({
        ...d,
        label: INDUSTRY_LABELS[d.industry] ?? d.industry,
    }));

    return (
        <div className="group relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <h3 className="text-base font-semibold mb-6 tracking-tight">
                Candidates by Industry
            </h3>
            <div className="h-[280px] sm:h-[350px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius="50%"
                            outerRadius="70%"
                            paddingAngle={2}
                            dataKey="count"
                            nameKey="label"
                            stroke="none"
                            className="transition-opacity duration-300 hover:opacity-90 cursor-pointer outline-none"
                            labelLine={false}
                            label={({ cx, cy, midAngle, outerRadius, value, name, percent }: any) => {
                                if (!percent || percent < 0.05) return null;
                                const RADIAN = Math.PI / 180;
                                const radius = outerRadius * 1.25;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                    <text
                                        x={x}
                                        y={y}
                                        fill="currentColor"
                                        textAnchor={x > cx ? 'start' : 'end'}
                                        dominantBaseline="central"
                                        className="text-[11px] font-medium fill-muted-foreground hidden sm:block"
                                    >
                                        {name}: {value}
                                    </text>
                                );
                            }}
                        >
                            {chartData.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={INDUSTRY_COLORS[index % INDUSTRY_COLORS.length]}
                                    stroke="var(--card)"
                                    strokeWidth={2}
                                />
                            ))}
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
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{
                                fontSize: "12px",
                                paddingTop: "10px",
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                gap: "10px"
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
