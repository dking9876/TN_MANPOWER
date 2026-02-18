"use client";

import { useState } from "react";
import { useDocumentCompletion, useExpiringDocuments } from "@/lib/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const DOC_LABELS: Record<string, string> = {
    PASSPORT: "Passport",
    POLICE_CLEARANCE: "Police Clearance",
    HEALTH_DECLARATION: "Health Declaration",
    VISA: "Visa",
};

export function DocumentCompletion() {
    const { data: completion, isLoading: loadingCompletion } = useDocumentCompletion();
    const { data: expiring, isLoading: loadingExpiring } = useExpiringDocuments();
    const [filter, setFilter] = useState<string>("all");

    if (loadingCompletion || loadingExpiring) {
        return (
            <div className="border rounded-md p-4 bg-card">
                <Skeleton className="h-5 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        );
    }

    // Overall stats
    const totalDocs = (completion ?? []).reduce((sum, d) => sum + d.total, 0);
    const totalReceived = (completion ?? []).reduce((sum, d) => sum + d.received, 0);
    const overallRate = totalDocs > 0 ? Math.round((totalReceived / totalDocs) * 100) : 0;

    // Filtered view
    const filtered =
        filter === "all"
            ? completion ?? []
            : (completion ?? []).filter((d) => d.documentType === filter);

    return (
        <div className="border rounded-md p-4 bg-card text-card-foreground">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Document Completion</h3>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Documents</SelectItem>
                        {Object.entries(DOC_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Overall progress bar */}
            {filter === "all" && (
                <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Overall Completion</span>
                        <span className="font-semibold">{overallRate}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: `${overallRate}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Per-type breakdown */}
            <div className="space-y-3">
                {filtered.map((doc) => (
                    <div key={doc.documentType}>
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                                {DOC_LABELS[doc.documentType] ?? doc.documentType}
                            </span>
                            <span className="font-medium">
                                {doc.received}/{doc.total} ({doc.rate}%)
                            </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${doc.rate}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Expiring documents */}
            {(expiring ?? []).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <h4 className="text-xs font-semibold text-amber-600 mb-2">
                        ⚠ Expiring Soon ({expiring!.length})
                    </h4>
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                        {expiring!.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between text-xs"
                            >
                                <Link
                                    href={`/candidates/${doc.candidateId}`}
                                    className="text-foreground hover:underline truncate max-w-[120px]"
                                >
                                    {doc.candidateName}
                                </Link>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] h-5">
                                        {DOC_LABELS[doc.documentType] ?? doc.documentType}
                                    </Badge>
                                    <span className="text-amber-600 font-medium whitespace-nowrap">
                                        {format(new Date(doc.expirationDate), "MMM d")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
