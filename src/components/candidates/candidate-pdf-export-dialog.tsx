"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
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
import { PDF_EXPORT_FIELDS, DEFAULT_PDF_FIELDS, exportCandidatesToPDF } from "@/lib/pdf-export";
import { CandidateFilters } from "@/lib/hooks/use-candidates";

interface CandidatePDFExportDialogProps {
    filters: CandidateFilters;
    disabled?: boolean;
}

export function CandidatePDFExportDialog({ filters, disabled }: CandidatePDFExportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_PDF_FIELDS);
    const [isExporting, setIsExporting] = useState(false);

    // Maximum safe columns for a readable A4 landscape PDF
    const MAX_FIELDS = 8;

    const handleToggleField = (fieldId: string) => {
        setSelectedFields(current => {
            if (current.includes(fieldId)) {
                // Prevent unselecting if it's the last field (need at least 1)
                if (current.length === 1) return current;
                return current.filter(id => id !== fieldId);
            } else {
                // Prevent selecting more than MAX_FIELDS
                if (current.length >= MAX_FIELDS) return current;
                return [...current, fieldId];
            }
        });
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportCandidatesToPDF(filters, selectedFields);
            setIsOpen(false);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={disabled} className="shadow-sm hover:shadow">
                    <FileText className="mr-2 h-4 w-4" />
                    Export PDF
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Candidates to PDF</DialogTitle>
                    <DialogDescription>
                        Select up to {MAX_FIELDS} columns to include in your PDF report. The export will reflect your currently active filters.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Fields to Include</Label>
                        <span className="text-xs text-muted-foreground">
                            {selectedFields.length} / {MAX_FIELDS} selected
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 max-h-[300px] overflow-y-auto pr-2">
                        {PDF_EXPORT_FIELDS.map((field) => (
                            <div key={field.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`pdf-field-${field.id}`}
                                    checked={selectedFields.includes(field.id)}
                                    onCheckedChange={() => handleToggleField(field.id)}
                                    disabled={!selectedFields.includes(field.id) && selectedFields.length >= MAX_FIELDS}
                                />
                                <Label
                                    htmlFor={`pdf-field-${field.id}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {field.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting || selectedFields.length === 0}>
                        {isExporting ? "Generating..." : "Generate PDF"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
