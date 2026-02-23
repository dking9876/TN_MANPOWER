import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import { toast } from "sonner";
import { format } from "date-fns";

export interface DashboardWidgetExport {
    id: string; // The DOM element ID to capture
    label: string; // Display name in the export dialog
}

export const DASHBOARD_EXPORT_WIDGETS: DashboardWidgetExport[] = [
    { id: "export-stat-totalCandidates", label: "Total Candidates" },
    { id: "export-stat-inProgress", label: "In Progress" },
    { id: "export-stat-arrivedThisMonth", label: "Arrived This Month" },
    { id: "export-status-chart", label: "Candidates by Status Chart" },
    { id: "export-industry-chart", label: "Candidates by Industry Chart" },
    { id: "export-stat-openAlerts", label: "Open Alerts" },
    { id: "export-trend-chart", label: "Applications Trend Chart" },
    { id: "export-document-completion", label: "Document Completion" },
    { id: "export-alert-summary", label: "Alert Summary" },
];

export const DEFAULT_DASHBOARD_EXPORT_WIDGETS = [
    "export-stat-totalCandidates",
    "export-stat-inProgress",
    "export-stat-arrivedThisMonth",
    "export-status-chart",
    "export-industry-chart"
];

// Wait for a short duration to ensure charts have rendered animations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function exportDashboardToPDF(selectedWidgetIds: string[]) {
    try {
        if (selectedWidgetIds.length === 0) {
            toast.error("No widgets selected for export");
            return;
        }

        // Initialize PDF (A4 Portrait)
        // Usually dashboards are better in portrait to stack widgets vertically.
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const printWidth = pageWidth - (margin * 2);

        // Fill background for the entire page (Dark Theme)
        doc.setFillColor(2, 6, 23); // Slate 950
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        // Header
        doc.setFontSize(18);
        doc.setTextColor(248, 250, 252); // Slate 50
        doc.text("Dashboard Summary Report", margin, 22);

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // Slate 400
        const now = new Date();
        doc.text(`Generated on: ${format(now, "PPpp")}`, margin, 30);

        let currentY = 38;
        let currentX = margin;
        let maxRowHeight = 0;

        // Process each widget sequentially to avoid memory spikes
        for (let i = 0; i < selectedWidgetIds.length; i++) {
            const widgetId = selectedWidgetIds[i];
            const element = document.getElementById(widgetId);

            if (!element) {
                console.warn(`Widget with ID ${widgetId} not found in the DOM.`);
                continue;
            }

            // Temporarily modify styles to ensure good capture (e.g., remove rounding/shadows for clean borders if desired,
            // though keeping them often looks fine. We ensure backgrounds are captured.)

            // html-to-image capture
            // Force dark mode for capture by temporarily adding 'dark' class and dark background
            const wasDark = element.classList.contains('dark');
            const originalBackground = element.style.background;

            if (!wasDark) element.classList.add('dark');
            // We force a dark background that matches the theme's card color to ensure clear visibility
            element.style.background = '#020617'; // slate-950 or similar dark bg

            const imgData = await htmlToImage.toPng(element, {
                pixelRatio: 2,
                cacheBust: true,
                skipFonts: false,
            });

            // Revert changes
            if (!wasDark) element.classList.remove('dark');
            element.style.background = originalBackground;

            // Calculate scaled dimensions to fit the page width
            const imgProps = doc.getImageProperties(imgData);
            const ratio = imgProps.height / imgProps.width;

            // Map CSS pixels to mm (approx 1px = 0.264583 mm).
            // We use the element's actual width to avoid stretching small widgets (like individual stat cards) across the whole A4 page.
            const elementWidthMm = element.offsetWidth * 0.264583;
            let renderWidth = Math.min(printWidth, elementWidthMm);
            let renderHeight = renderWidth * ratio;

            // Check if it fits on the current row
            if (currentX > margin && currentX + renderWidth > margin + printWidth) {
                currentY += maxRowHeight + 15;
                currentX = margin;
                maxRowHeight = 0;
            }

            // Check if we need to add a new page
            // If the image is taller than the remaining space on the page
            if (currentY + renderHeight > pageHeight - margin) {
                doc.addPage();

                // Fill background for New Page
                doc.setFillColor(2, 6, 23); // Slate 950
                doc.rect(0, 0, pageWidth, pageHeight, "F");

                currentY = margin;
                currentX = margin;
                maxRowHeight = 0;

                // If it's a huge widget that exceeds a full page height, scale it down
                if (renderHeight > pageHeight - (margin * 2)) {
                    renderHeight = pageHeight - (margin * 2);
                    renderWidth = renderHeight / ratio;
                    doc.addImage(imgData, 'PNG', margin + ((printWidth - renderWidth) / 2), currentY, renderWidth, renderHeight);
                    currentY += renderHeight + 15;
                    continue;
                }
            }

            // Draw image
            doc.addImage(imgData, 'PNG', currentX, currentY, renderWidth, renderHeight, undefined, 'FAST');

            // Advance X and update maxRowHeight
            currentX += renderWidth + 10; // 10mm gap between elements on the same row
            maxRowHeight = Math.max(maxRowHeight, renderHeight);
        }

        // Save PDF
        const dateStr = format(now, "yyyy-MM-dd_HH-mm");
        doc.save(`TN_Manpower_Dashboard_${dateStr}.pdf`);
        toast.success("Dashboard exported successfully");

    } catch (error: any) {
        console.error("Dashboard PDF generation failed:", error);
        toast.error("Failed to generate PDF document");
    }
}
