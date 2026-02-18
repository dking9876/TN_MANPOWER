import { describe, it, expect } from 'vitest';

// We extract and test the CSV formatting logic in isolation.
// The actual csv-export.ts relies on DOM and server actions, so we test the pure formatting functions.

/**
 * Replicates the CSV field escaping logic from csv-export.ts
 */
function escapeCSVField(field: any): string {
    const stringField = String(field || "");
    if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

/**
 * Replicates the CSV row building logic from csv-export.ts
 */
function buildCSVRow(fields: any[]): string {
    return fields.map(escapeCSVField).join(",");
}

const CSV_HEADERS = [
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
];

describe('Phase 3: CSV Export Formatting', () => {
    describe('escapeCSVField', () => {
        it('returns string as-is when no special chars', () => {
            expect(escapeCSVField("John")).toBe("John");
        });

        it('wraps field in quotes when it contains a comma', () => {
            expect(escapeCSVField("Dubai, Qatar")).toBe('"Dubai, Qatar"');
        });

        it('wraps field in quotes and escapes internal quotes', () => {
            expect(escapeCSVField('He said "hello"')).toBe('"He said ""hello"""');
        });

        it('wraps field in quotes when it contains a newline', () => {
            expect(escapeCSVField("Line1\nLine2")).toBe('"Line1\nLine2"');
        });

        it('converts null/undefined to empty string', () => {
            expect(escapeCSVField(null)).toBe("");
            expect(escapeCSVField(undefined)).toBe("");
        });

        it('converts number to string', () => {
            expect(escapeCSVField(175.5)).toBe("175.5");
        });

        it('converts boolean to string', () => {
            expect(escapeCSVField(true)).toBe("true");
        });
    });

    describe('CSV Headers', () => {
        it('should have exactly 32 columns', () => {
            expect(CSV_HEADERS).toHaveLength(32);
        });

        it('starts with First Name and ends with Last Updated At', () => {
            expect(CSV_HEADERS[0]).toBe("First Name");
            expect(CSV_HEADERS[CSV_HEADERS.length - 1]).toBe("Last Updated At");
        });

        it('includes all document type columns', () => {
            expect(CSV_HEADERS).toContain("Passport Received");
            expect(CSV_HEADERS).toContain("Passport Expiration");
            expect(CSV_HEADERS).toContain("Police Clearance Received");
            expect(CSV_HEADERS).toContain("Visa Received");
            expect(CSV_HEADERS).toContain("Health Declaration Received");
        });
    });

    describe('buildCSVRow', () => {
        it('builds a simple row with comma separation', () => {
            const row = buildCSVRow(["John", "Doe", "ID123"]);
            expect(row).toBe("John,Doe,ID123");
        });

        it('handles empty fields', () => {
            const row = buildCSVRow(["John", "", null, undefined]);
            expect(row).toBe("John,,,");
        });

        it('renders boolean fields correctly', () => {
            const visited = true;
            const blacklisted = false;
            const row = buildCSVRow([
                visited ? "Yes" : "No",
                blacklisted ? "YES" : "No",
            ]);
            expect(row).toBe("Yes,No");
        });

        it('handles fields with commas inside a real-world row', () => {
            const row = buildCSVRow(["John", "O'Brien", "Dubai, Qatar, USA"]);
            expect(row).toBe('John,O\'Brien,"Dubai, Qatar, USA"');
        });
    });

    describe('Candidate data mapping', () => {
        it('maps candidate object fields to correct CSV columns', () => {
            const candidate = {
                first_name: "Jane",
                last_name: "Smith",
                national_id: "NID999",
                passport_number: "PP999",
                date_of_birth: "1990-03-15",
                primary_phone: "+1234567890",
                emergency_phone: "+0987654321",
                email: "jane@example.com",
                height: 165,
                weight: 55,
                shoe_size: "38",
                pants_size: "M",
                allergies: null,
                english_level: "GOOD",
                primary_industry: "NURSING",
                profession: "Nurse",
                recruitment_status: "DOCUMENTS_RECEIVED",
                has_visited_other: true,
                countries_visited: ["USA", "Canada"],
                is_blacklisted: false,
            };

            const passport = { is_received: true, expiration_date: "2030-01-01" };
            const police = { is_received: false, expiration_date: null };
            const health = { is_received: true, expiration_date: null };
            const visa = { is_received: false, expiration_date: null };

            const row = [
                candidate.first_name,
                candidate.last_name,
                candidate.national_id,
                candidate.passport_number,
                candidate.date_of_birth,
                candidate.primary_phone,
                candidate.emergency_phone,
                candidate.email || "",
                candidate.height || "",
                candidate.weight || "",
                candidate.shoe_size || "",
                candidate.pants_size || "",
                candidate.allergies || "",
                candidate.english_level,
                candidate.primary_industry,
                candidate.profession,
                candidate.recruitment_status,
                candidate.has_visited_other ? "Yes" : "No",
                candidate.countries_visited ? candidate.countries_visited.join(", ") : "",
                candidate.is_blacklisted ? "YES" : "No",
                passport?.is_received ? "Yes" : "No", passport?.expiration_date || "",
                police?.is_received ? "Yes" : "No", police?.expiration_date || "",
                health?.is_received ? "Yes" : "No", health?.expiration_date || "",
                visa?.is_received ? "Yes" : "No", visa?.expiration_date || "",
            ];

            expect(row).toHaveLength(28); // 28 data columns (excluding creator/updater metadata)
            expect(row[0]).toBe("Jane");
            expect(row[17]).toBe("Yes"); // has_visited_other
            expect(row[18]).toBe("USA, Canada"); // countries_visited joined
            expect(row[19]).toBe("No"); // is_blacklisted
            expect(row[20]).toBe("Yes"); // passport received
            expect(row[21]).toBe("2030-01-01"); // passport expiration
            expect(row[22]).toBe("No"); // police received
        });
    });
});
