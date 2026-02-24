"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, RECRUITMENT_STATUS } from "@/lib/constants";
import { useRecruitmentStatuses } from "@/lib/hooks/use-settings";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const { data: statuses } = useRecruitmentStatuses();

    // Try to find the label and color from DB first, then fallback to constants
    const dbStatus = statuses?.find((s) => s.name === status);
    const label = dbStatus?.label || RECRUITMENT_STATUS[status] || status;
    const colorClass = dbStatus?.color || STATUS_COLORS[status] || "bg-gray-100 text-gray-800";

    // Extract just the text color class (e.g. 'text-blue-700') to use for the dot indicator
    const textColorClass = colorClass.split(" ").find((c) => c.startsWith("text-")) || "text-muted-foreground";

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-medium px-2.5 py-0.5 whitespace-nowrap text-sm gap-2 bg-transparent text-foreground border-border/60 hover:bg-muted/30 transition-colors shadow-none rounded-md",
                className
            )}
        >
            <svg className={cn("w-2 h-2 fill-current", textColorClass)} viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" />
            </svg>
            {label}
        </Badge>
    );
}
