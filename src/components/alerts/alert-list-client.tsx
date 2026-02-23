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
import { Clock, FileWarning, Search, BellOff, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertCandidateSheet } from "./alert-candidate-sheet";
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

    const [sheetAlert, setSheetAlert] = useState<any>(null);

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

            {/* Brutalist Ledger Container */}
            <div className="space-y-6">
                {/* Filters Header - Stark and separated */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-4 border-b-2 border-foreground">
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
                                <SelectItem value="STALENESS">Staleness</SelectItem>
                                <SelectItem value="REFERRER_BONUS">Referrer Bonus</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table className="border-collapse">
                        <TableHeader>
                            <TableRow className="border-b-4 border-foreground hover:bg-transparent">
                                <TableHead className="text-sm font-medium text-foreground h-14">Type</TableHead>
                                <TableHead className="text-sm font-medium text-foreground h-14">Candidate</TableHead>
                                <TableHead className="text-sm font-medium text-foreground h-14">Message</TableHead>
                                <TableHead className="text-sm font-medium text-foreground h-14">Created At</TableHead>
                                <TableHead className="text-sm font-medium text-foreground h-14">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                                            <p>Loading alerts...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : alerts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground max-w-sm mx-auto">
                                            <div className="h-12 w-12 rounded-sm bg-muted flex items-center justify-center mb-4">
                                                <BellOff className="h-6 w-6 text-foreground" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground mb-1 uppercase tracking-tight">No alerts found</h3>
                                            <p className="text-sm font-medium">We couldn't find any alerts matching your current filters. You're all caught up!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                alerts.map((alert: any, index: number) => (
                                    <TableRow
                                        key={alert.id}
                                        className="group transition-all duration-300 border-b-2 border-border/50 hover:border-foreground hover:bg-muted/10 cursor-pointer relative z-0 hover:z-10 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.05)]"
                                        style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                                        onClick={() => setSheetAlert(alert)}
                                    >
                                        <TableCell className="py-5">
                                            <div className="flex items-center gap-2.5">
                                                {alert.alert_type === "STALENESS" ? (
                                                    <div className="p-2 rounded-none bg-amber-500 text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] group-hover:-rotate-3 transition-transform">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                ) : alert.alert_type === "REFERRER_BONUS" ? (
                                                    <div className="p-2 rounded-none bg-emerald-500 text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] group-hover:-rotate-3 transition-transform">
                                                        <Gift className="h-4 w-4" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 rounded-none bg-red-600 text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] group-hover:-rotate-3 transition-transform">
                                                        <FileWarning className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <span className="font-medium text-foreground text-sm pl-2">
                                                    {alert.alert_type === "REFERRER_BONUS" ? "Referrer Bonus" : alert.alert_type}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <div
                                                className="font-medium text-sm text-foreground transition-colors cursor-pointer inline-flex items-center group-hover:underline decoration-2 underline-offset-4"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/candidates/${alert.candidate_id}`);
                                                }}
                                            >
                                                {alert.candidate?.first_name} {alert.candidate?.last_name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 max-w-[300px] truncate font-medium text-foreground text-sm" title={alert.alert_message}>
                                            {alert.alert_message}
                                        </TableCell>
                                        <TableCell className="py-5 text-sm font-medium text-foreground">
                                            {format(new Date(alert.created_at), "MMM d, HH:mm")}
                                        </TableCell>
                                        <TableCell className="py-5">
                                            {alert.is_resolved ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-none border-0 font-medium text-sm py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.3)]">
                                                    Resolved
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-600 hover:bg-red-700 text-white rounded-none border-0 font-medium text-sm py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.3)]">
                                                    Unresolved
                                                </Badge>
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

            <AlertCandidateSheet
                alert={sheetAlert}
                open={!!sheetAlert}
                onOpenChange={(open) => !open && setSheetAlert(null)}
            />
        </div>
    );
}
