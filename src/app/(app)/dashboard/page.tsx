"use client";

import { StatCards } from "@/components/dashboard/stat-cards";
import { StatusChart } from "@/components/dashboard/status-chart";
import { IndustryChart } from "@/components/dashboard/industry-chart";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { DocumentCompletion } from "@/components/dashboard/document-completion";
import { AlertSummaryCard } from "@/components/dashboard/alert-summary";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardPDFExportDialog } from "@/components/dashboard/dashboard-pdf-export-dialog";
import { useState } from "react";
import { DashboardFilters as FilterType } from "@/lib/hooks/use-dashboard";

export default function DashboardPage() {
    const [filters, setFilters] = useState<FilterType>({});

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
                <div className="flex items-center gap-2">
                    <DashboardPDFExportDialog />
                </div>
            </div>

            {/* Filters */}
            <DashboardFilters filters={filters} setFilters={setFilters} />

            {/* Stat cards */}
            <StatCards filters={filters} />

            {/* Charts row: Status + Industry */}
            <div className="grid gap-4 lg:grid-cols-2">
                <div id="export-status-chart">
                    <StatusChart filters={filters} />
                </div>
                <div id="export-industry-chart">
                    <IndustryChart filters={filters} />
                </div>
            </div>

            {/* Trend chart */}
            <div id="export-trend-chart">
                <TrendChart filters={filters} />
            </div>

            {/* Documents + Alerts row */}
            <div className="grid gap-4 lg:grid-cols-2">
                <div id="export-document-completion">
                    <DocumentCompletion filters={filters} />
                </div>
                <div id="export-alert-summary">
                    <AlertSummaryCard filters={filters} />
                </div>
            </div>

            {/* Activity feed */}
            <ActivityFeed filters={filters} />
        </div>
    );
}

