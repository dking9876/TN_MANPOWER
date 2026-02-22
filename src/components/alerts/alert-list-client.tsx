"use client";

import { useResolveAlert, useAlerts, type AlertFilters } from "@/lib/hooks/use-alerts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, FileWarning, Search, BellOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { ResolveAlertDialog } from "./resolve-alert-dialog";
import { ALERT_TYPES } from "@/lib/constants";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export function AlertListClient() {
    const router = useRouter();
    const [filters, setFilters] = useState<AlertFilters>({
        page: 1,
        status: "unresolved",
    });

    const { data, isLoading } = useAlerts(filters);
    const alerts = data?.data || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / 25);

    const [selectedAlert, setSelectedAlert] = useState<any>(null);

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row md:items-end justify-between gap-4 py-2 border-b border-border/40 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                        Alerts
                    </h1>
                    <p className="text-base text-muted-foreground mt-2 font-medium">
                        Monitor system alerts and document notifications.
                    </p>
                </div>
            </div>

            {/* Unified Table Container */}
            <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                {/* Filters Header built into the table card */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-5 border-b border-border/40 bg-card/20">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-8"
                                value={filters.search || ""}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                            />
                        </div>
                        <Select
                            value={filters.status || "all"}
                            onValueChange={(val: any) => setFilters(prev => ({ ...prev, status: val, page: 1 }))}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unresolved">Unresolved</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.type || "all"}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, type: val === "all" ? undefined : val, page: 1 }))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Alert Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Staleness">Staleness</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground h-12">Type</TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground h-12">Candidate</TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground h-12">Message</TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground h-12">Created At</TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground h-12">Status</TableHead>
                                <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground h-12 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                                            <p>Loading alerts...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : alerts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground max-w-sm mx-auto">
                                            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                                <BellOff className="h-6 w-6 text-muted-foreground/50" />
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground mb-1">No alerts found</h3>
                                            <p className="text-sm">We couldn't find any alerts matching your current filters. You're all caught up!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                alerts.map((alert: any) => (
                                    <TableRow key={alert.id} className="group hover:bg-muted/20 transition-colors border-b border-border/30">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2.5">
                                                {alert.alert_type === "Staleness" ? (
                                                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1.5 rounded-md bg-red-500/10 text-red-500">
                                                        <FileWarning className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <span className="font-medium text-foreground text-sm">{alert.alert_type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div
                                                className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center group-hover:underline underline-offset-4"
                                                onClick={() => router.push(`/candidates/${alert.candidate_id}`)}
                                            >
                                                {alert.candidate?.first_name} {alert.candidate?.last_name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 max-w-[300px] truncate text-muted-foreground text-sm" title={alert.alert_message}>
                                            {alert.alert_message}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm text-foreground/80">
                                            {format(new Date(alert.created_at), "MMM d, HH:mm")}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {alert.is_resolved ? (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-none font-medium">
                                                    Resolved
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-none font-medium">
                                                    Unresolved
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            {!alert.is_resolved && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="shadow-sm hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors"
                                                    onClick={() => setSelectedAlert(alert)}
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                            {alert.is_resolved && (
                                                <span className="text-xs text-muted-foreground mr-2">
                                                    by {alert.assignee?.full_name}
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalCount > 25 && (
                    <div className="flex justify-center mt-8">
                        <Pagination>
                            <PaginationContent className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-full px-2 py-1 shadow-sm">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (filters.page && filters.page > 1) handlePageChange(filters.page - 1);
                                        }}
                                        className={(!filters.page || filters.page <= 1) ? "pointer-events-none opacity-50" : "hover:bg-muted/50 rounded-full"}
                                    />
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationLink isActive className="rounded-full shadow-sm">{filters.page || 1}</PaginationLink>
                                </PaginationItem>

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if ((filters.page || 1) < totalPages) handlePageChange((filters.page || 1) + 1);
                                        }}
                                        className={(filters.page || 1) >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-muted/50 rounded-full"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
                {/* Quick stats footer */}
                <div className="text-xs text-muted-foreground text-center font-medium my-4">
                    Showing <span className="text-foreground">{alerts.length}</span> of <span className="text-foreground">{totalCount}</span> alerts
                </div>
            </div>

            {selectedAlert && (
                <ResolveAlertDialog
                    open={!!selectedAlert}
                    onOpenChange={(open) => !open && setSelectedAlert(null)}
                    alert={selectedAlert}
                />
            )}
        </div>
    );
}
