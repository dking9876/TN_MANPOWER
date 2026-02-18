"use client";

import { useMonthlyTrend } from "@/lib/hooks/use-dashboard";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function TrendChart() {
    const { data, isLoading } = useMonthlyTrend();

    if (isLoading) {
        return (
            <div className="border rounded-md p-4 bg-card">
                <Skeleton className="h-5 w-48 mb-4" />
                <Skeleton className="h-[250px] w-full" />
            </div>
        );
    }

    return (
        <div className="border rounded-md p-4 bg-card text-card-foreground">
            <h3 className="text-sm font-semibold mb-4">
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
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="month"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            width={30}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                fontSize: "12px",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#14b8a6"
                            strokeWidth={2}
                            fill="url(#trendGradient)"
                            name="Candidates"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
