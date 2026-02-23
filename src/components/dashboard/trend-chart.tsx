"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    LabelList,
} from "recharts";
import { useMonthlyTrend, DashboardFilters } from "@/lib/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendChartProps {
    filters?: DashboardFilters;
}

export function TrendChart({ filters }: TrendChartProps) {
    const { data, isLoading } = useMonthlyTrend(filters);

    if (isLoading) {
        return (
            <div className="relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/50 backdrop-blur-sm">
                <Skeleton className="h-5 w-48 mb-6" />
                <Skeleton className="h-[250px] w-full" />
            </div>
        );
    }

    return (
        <div className="group relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <h3 className="text-base font-semibold mb-6 tracking-tight">
                Candidates Added (Last 6 Months)
            </h3>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data ?? []}
                        margin={{ left: 0, right: 10, top: 5, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0369A1" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#0369A1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                        <XAxis
                            dataKey="month"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            stroke="currentColor"
                            opacity={0.6}
                            dy={10}
                        />
                        <YAxis
                            allowDecimals={false}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            width={30}
                            stroke="currentColor"
                            opacity={0.6}
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
                            itemStyle={{ color: "var(--foreground)", fontWeight: 500 }}
                            cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '3 3' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#0369A1"
                            strokeWidth={3}
                            fill="url(#trendGradient)"
                            name="Candidates"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#0EA5E9' }}
                        >
                            <LabelList dataKey="count" position="top" offset={10} fill="currentColor" fontSize={12} fontWeight={600} />
                        </Area>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
