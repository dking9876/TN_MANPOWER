"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    DASHBOARD_EXPORT_WIDGETS,
    DEFAULT_DASHBOARD_EXPORT_WIDGETS,
    exportDashboardToPDF
} from "@/lib/dashboard-pdf-export";

export function DashboardPDFExportDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedWidgets, setSelectedWidgets] = useState<string[]>(DEFAULT_DASHBOARD_EXPORT_WIDGETS);
    const [isExporting, setIsExporting] = useState(false);

    const handleToggleWidget = (widgetId: string) => {
        setSelectedWidgets(current => {
            if (current.includes(widgetId)) {
                // Prevent unselecting if it's the last widget
                if (current.length === 1) return current;
                return current.filter(id => id !== widgetId);
            } else {
                return [...current, widgetId];
            }
        });
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Briefly wait to ensure all animations (e.g. recharts) have finished and loading skeletons are gone if possible
            // We assume the user hit "Export" when the page is fully loaded, but a slight delay ensures stability.
            await exportDashboardToPDF(selectedWidgets);
            setIsOpen(false);
        } finally {
            setIsExporting(false);
        }
    };

    // Helper to check if all options are selected
    const isAllSelected = selectedWidgets.length === DASHBOARD_EXPORT_WIDGETS.length;

    const toggleAll = () => {
        if (isAllSelected) {
            // Revert back to defaults rather than completely empty since requires 1
            setSelectedWidgets(DEFAULT_DASHBOARD_EXPORT_WIDGETS);
        } else {
            setSelectedWidgets(DASHBOARD_EXPORT_WIDGETS.map(w => w.id));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="shadow-sm hover:shadow">
                    <FileText className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Dashboard Report</DialogTitle>
                    <DialogDescription>
                        Select the dashboard widgets and charts you want to include in the visual PDF report.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b">
                        <Label className="text-sm font-medium">Include Widgets</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleAll}
                            className="h-8 px-2 text-xs"
                        >
                            {isAllSelected ? "Select Default" : "Select All"}
                        </Button>
                    </div>

                    <div className="grid gap-3">
                        {DASHBOARD_EXPORT_WIDGETS.map((widget) => {
                            const isSelected = selectedWidgets.includes(widget.id);
                            return (
                                <div key={widget.id} className="flex items-start space-x-3">
                                    <Checkbox
                                        id={`pdf-widget-${widget.id}`}
                                        checked={isSelected}
                                        onCheckedChange={() => handleToggleWidget(widget.id)}
                                        // Disable unchecking if it's the only one left
                                        disabled={isSelected && selectedWidgets.length === 1}
                                        className="mt-1"
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor={`pdf-widget-${widget.id}`}
                                            className="text-sm font-medium cursor-pointer"
                                        >
                                            {widget.label}
                                        </Label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting || selectedWidgets.length === 0}>
                        {isExporting ? "Generating Snapshot..." : "Generate PDF Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
