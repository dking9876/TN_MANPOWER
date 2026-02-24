import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getCandidatesForExport } from "@/app/actions/candidate-export";
import { toast } from "sonner";
import { format } from "date-fns";
import { handleError } from "@/lib/utils/error-handler";

export interface PDFExportField {
    id: string;
    label: string;
    getValue: (candidate: any) => string;
}

export const PDF_EXPORT_FIELDS: PDFExportField[] = [
    { id: "first_name", label: "First Name", getValue: (c) => c.first_name || "" },
    { id: "last_name", label: "Last Name", getValue: (c) => c.last_name || "" },
    { id: "passport_number", label: "Passport", getValue: (c) => c.passport_number || "" },
    { id: "primary_phone", label: "Phone", getValue: (c) => c.primary_phone || "" },
    { id: "profession", label: "Profession", getValue: (c) => c.profession || "" },
    {
        id: "recruitment_status",
        label: "Status",
        getValue: (c) => c.recruitment_status ? c.recruitment_status.replace(/_/g, ' ') : ""
    },
    { id: "national_id", label: "National ID", getValue: (c) => c.national_id || "" },
    { id: "email", label: "Email", getValue: (c) => c.email || "" },
    { id: "primary_industry", label: "Industry", getValue: (c) => c.primary_industry || "" },
    { id: "interview_date", label: "Interview Date", getValue: (c) => c.interview_date ? format(new Date(c.interview_date), "PP") : "" },
    { id: "visa_number", label: "Visa Number", getValue: (c) => c.visa_number || "" },
    { id: "flight_date", label: "Flight Date", getValue: (c) => c.flight_date ? format(new Date(c.flight_date), "PP") : "" },
    { id: "arrival_date", label: "Arrival Date", getValue: (c) => c.arrival_date ? format(new Date(c.arrival_date), "PP") : "" },
    {
        id: "documents_received",
        label: "Docs Received",
        getValue: (c) => {
            const docs = c.documents || [];
            const received = docs.filter((d: any) => d.is_received).length;
            return `${received}/${docs.length}`;
        }
    }
];

export const DEFAULT_PDF_FIELDS = [
    "first_name",
    "last_name",
    "passport_number",
    "primary_phone",
    "profession",
    "recruitment_status",
];

export async function exportCandidatesToPDF(filters: any, selectedFieldIds: string[]) {
    let data;
    try {
        data = await getCandidatesForExport(filters);
    } catch (error: any) {
        console.error("Export failed:", error);
        toast.error(handleError(error, "Failed to fetch candidates for export"));
        return;
    }

    if (!data || data.length === 0) {
        toast.warning("No candidates found to export");
        return;
    }

    try {
        // Map selected IDs back to the field definitions to guarantee ordering and existence
        const fieldsToExport = selectedFieldIds
            .map(id => PDF_EXPORT_FIELDS.find(f => f.id === id))
            .filter((f): f is PDFExportField => f !== undefined);

        if (fieldsToExport.length === 0) {
            toast.error("No fields selected for export.");
            return;
        }

        // Initialize PDF in landscape mode for better table fitting
        // Use standard A4 size
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        // Add Title
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("Candidate Export Report", 14, 22);

        // Add Timestamp and Metadata
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        const now = new Date();
        doc.text(`Generated on: ${format(now, "PPpp")}`, 14, 30);
        doc.text(`Total Candidates: ${data.length}`, 14, 36);

        // Prepare table data
        const tableHeaders = fieldsToExport.map(f => f.label);
        const tableRows = data.map((candidate: any) =>
            fieldsToExport.map(f => f.getValue(candidate))
        );

        // Generate Table
        autoTable(doc, {
            head: [tableHeaders],
            body: tableRows,
            startY: 42,
            theme: "grid",
            headStyles: {
                fillColor: [15, 23, 42], // slate-900
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [51, 65, 85] // slate-700
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252] // slate-50 
            },
            margin: { top: 14, right: 14, bottom: 14, left: 14 },
            styles: {
                overflow: 'linebreak',
                cellPadding: 3
            },
        });

        // Save PDF
        const dateStr = format(now, "yyyy-MM-dd_HH-mm");
        doc.save(`TN_Manpower_Candidates_${dateStr}.pdf`);
        toast.success("PDF exported successfully");

    } catch (error: any) {
        console.error("PDF generation failed:", error);
        toast.error(handleError(error, "Failed to generate PDF document"));
    }
}
