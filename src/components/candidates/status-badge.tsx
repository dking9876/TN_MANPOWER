import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RECRUITMENT_STATUS, STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
    status: keyof typeof RECRUITMENT_STATUS;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const label = RECRUITMENT_STATUS[status] || status;
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-medium border px-2 py-0.5 whitespace-nowrap",
                colorClass,
                className
            )}
        >
            {label}
        </Badge>
    );
}
