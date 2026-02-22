"use client";

import { useRecentActivity } from "@/lib/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { UserCircle, Plus, Pencil, Trash2, ArrowRightLeft } from "lucide-react";

const ACTION_CONFIG: Record<
    string,
    { label: string; icon: typeof Plus; color: string }
> = {
    CREATE: { label: "Created", icon: Plus, color: "text-emerald-600 bg-emerald-50" },
    UPDATE: { label: "Updated", icon: Pencil, color: "text-sky-600 bg-sky-50" },
    DELETE: { label: "Deleted", icon: Trash2, color: "text-red-600 bg-red-50" },
    STATUS_CHANGE: {
        label: "Status Changed",
        icon: ArrowRightLeft,
        color: "text-amber-600 bg-amber-50",
    },
};

export function ActivityFeed() {
    const { data, isLoading } = useRecentActivity();

    if (isLoading) {
        return (
            <div className="relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/50 backdrop-blur-sm">
                <Skeleton className="h-5 w-32 mb-6" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 py-3">
                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2 mt-1">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const entries = data ?? [];

    return (
        <div className="group relative overflow-hidden border border-border/40 rounded-xl p-6 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <h3 className="text-base font-semibold tracking-tight mb-6">Recent Activity</h3>

            {entries.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                    No recent activity
                </p>
            ) : (
                <div className="space-y-0 max-h-[400px] overflow-y-auto">
                    {entries.map((entry, index) => {
                        const config = ACTION_CONFIG[entry.action] ?? ACTION_CONFIG.UPDATE;
                        const Icon = config.icon;
                        return (
                            <div
                                key={entry.id}
                                className="group/item flex gap-4 py-3 border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2"
                            >
                                {/* Icon */}
                                <div
                                    className={`w-9 h-9 mt-0.5 rounded-full shadow-sm flex items-center justify-center shrink-0 ${config.color}`}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] leading-relaxed">
                                        <span className="font-semibold tracking-tight">{entry.userName}</span>
                                        {" "}
                                        <span className="text-muted-foreground font-medium">
                                            {config.label.toLowerCase()}
                                        </span>
                                        {entry.candidateName && (
                                            <>
                                                {" "}
                                                <span className="font-medium">
                                                    {entry.candidateName}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                    {entry.changedFields && entry.changedFields.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {entry.changedFields.slice(0, 3).map((field) => (
                                                <Badge
                                                    key={field}
                                                    variant="outline"
                                                    className="text-[9px] h-4 px-1"
                                                >
                                                    {field.replace(/_/g, " ")}
                                                </Badge>
                                            ))}
                                            {entry.changedFields.length > 3 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[9px] h-4 px-1"
                                                >
                                                    +{entry.changedFields.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {formatDistanceToNow(new Date(entry.timestamp), {
                                            addSuffix: true,
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
