import { getCandidatesForExport } from "@/app/actions/candidate-export";
import { toast } from "sonner";

export async function exportCandidatesToCSV(filters: any) {
    let data;
    try {
        data = await getCandidatesForExport(filters);
    } catch (error: any) {
        console.error("Export failed:", error);
        toast.error(error.message || "Failed to export candidates");
        return;
    }

    if (!data || data.length === 0) {
        toast.warning("No candidates found to export");
        return;
    }

    // 2. Format data for CSV
    const csvRows = [
        // Header
        [
            "First Name", "Last Name", "National ID", "Passport Number",
            "Date of Birth", "Primary Phone", "Emergency Phone", "Email",
            "Height", "Weight", "Shoe Size", "Pants Size", "Allergies",
            "English Level", "Industry", "Profession", "Recruitment Status",
            "Has Visited Other Countries", "Countries Visited", "Is Blacklisted",
            "Passport Received", "Passport Expiration",
            "Police Clearance Received", "Police Clearance Expiration",
            "Health Declaration Received", "Health Declaration Expiration",
            "Visa Received", "Visa Expiration",
            "Created By", "Created At", "Last Updated By", "Last Updated At"
        ]
    ];

    data.forEach((c: any) => {
        // Find documents
        const passport = c.documents.find((d: any) => d.document_type === "PASSPORT");
        const police = c.documents.find((d: any) => d.document_type === "POLICE_CLEARANCE");
        const health = c.documents.find((d: any) => d.document_type === "HEALTH_DECLARATION");
        const visa = c.documents.find((d: any) => d.document_type === "VISA");

        csvRows.push([
            c.first_name,
            c.last_name,
            c.national_id,
            c.passport_number,
            c.date_of_birth,
            c.primary_phone,
            c.emergency_phone,
            c.email || "",
            c.height || "",
            c.weight || "",
            c.shoe_size || "",
            c.pants_size || "",
            c.allergies || "",
            c.english_level,
            c.primary_industry,
            c.profession,
            c.recruitment_status,
            c.has_visited_other ? "Yes" : "No",
            c.countries_visited ? c.countries_visited.join(", ") : "",
            c.is_blacklisted ? "YES" : "No",
            // Documents
            passport?.is_received ? "Yes" : "No", passport?.expiration_date || "",
            police?.is_received ? "Yes" : "No", police?.expiration_date || "",
            health?.is_received ? "Yes" : "No", health?.expiration_date || "",
            visa?.is_received ? "Yes" : "No", visa?.expiration_date || "",
            // Metadata
            c.creator?.full_name || "",
            new Date(c.created_at).toLocaleString(),
            c.updater?.full_name || "",
            new Date(c.last_updated_at).toLocaleString()
        ]);
    });

    // 3. Generate CSV string with BOM for Excel
    const csvContent = "\uFEFF" + csvRows.map(e => e.map(field => {
        // Escape quotes and wrap in quotes if contains comma
        const stringField = String(field || "");
        if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    }).join(",")).join("\n");

    // 4. Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Filename: TN_Manpower_Export_YYYY-MM-DD_HH-mm.csv
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0].slice(0, 5).replace(":", "-");

    link.setAttribute("href", url);
    link.setAttribute("download", `TN_Manpower_Export_${dateStr}_${timeStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
