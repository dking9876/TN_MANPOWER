"use client";

import { StatCards } from "@/components/dashboard/stat-cards";
import { StatusChart } from "@/components/dashboard/status-chart";
import { IndustryChart } from "@/components/dashboard/industry-chart";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { DocumentCompletion } from "@/components/dashboard/document-completion";
import { AlertSummaryCard } from "@/components/dashboard/alert-summary";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Overview of recruitment pipeline
                </p>
            </div>

            {/* Stat cards */}
            <StatCards />

            {/* Charts row: Status + Industry */}
            <div className="grid gap-4 lg:grid-cols-2">
                <StatusChart />
                <IndustryChart />
            </div>

            {/* Trend chart */}
            <TrendChart />

            {/* Documents + Alerts row */}
            <div className="grid gap-4 lg:grid-cols-2">
                <DocumentCompletion />
                <AlertSummaryCard />
            </div>

            {/* Activity feed */}
            <ActivityFeed />
        </div>
    );
}
