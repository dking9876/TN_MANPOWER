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
import { Clock, FileWarning, CheckCircle2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { ResolveAlertDialog } from "./resolve-alert-dialog";
import { ALERT_TYPES } from "@/lib/constants";

export function AlertListClient() {
    const router = useRouter();
    const [filters, setFilters] = useState<AlertFilters>({
        page: 1,
        status: "unresolved",
    });

    const { data, isLoading } = useAlerts(filters);
    const alerts = data?.data || [];
    const totalCount = data?.count || 0;

    const [selectedAlert, setSelectedAlert] = useState<any>(null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
                <p className="text-muted-foreground">
                    Monitor candidate staleness and document expirations.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
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
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Type</TableHead>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Loading alerts...</TableCell>
                            </TableRow>
                        ) : alerts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No alerts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            alerts.map((alert: any) => (
                                <TableRow key={alert.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {alert.alert_type === "Staleness" ? (
                                                <Clock className="h-4 w-4 text-amber-500" />
                                            ) : (
                                                <FileWarning className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className="font-medium">{alert.alert_type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto font-normal text-foreground"
                                            onClick={() => router.push(`/candidates/${alert.candidate_id}`)}
                                        >
                                            {alert.candidate?.first_name} {alert.candidate?.last_name}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={alert.alert_message}>
                                        {alert.alert_message}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(alert.created_at), "MMM d, HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        {alert.is_resolved ? (
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                                Resolved
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                                                Unresolved
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!alert.is_resolved && (
                                            <Button
                                                size="sm"
                                                variant="outline"
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
