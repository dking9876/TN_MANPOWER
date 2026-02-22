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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-border/40 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-base text-muted-foreground mt-2 font-medium">
                        Overview of recruitment pipeline and active metrics
                    </p>
                </div>
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
