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

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-medium border px-2 py-0.5 whitespace-nowrap text-sm",
                colorClass,
                className
            )}
        >
            {label}
        </Badge>
    );
}
