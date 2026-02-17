import { z } from "zod";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { isAfter, parseISO } from "date-fns";

const DocumentTypeEnum = z.enum(Object.keys(DOCUMENT_TYPES) as [string, ...string[]]);

export const documentFormSchema = z.object({
    document_type: DocumentTypeEnum,
    is_received: z.boolean(),
    // Expiration date is a string (ISO date) or null
    expiration_date: z.string().nullable().optional(),
    received_date: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
    // Rule: Expiration required for PASSPORT and VISA if received
    if (data.is_received && (data.document_type === "PASSPORT" || data.document_type === "VISA")) {
        if (!data.expiration_date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Expiration date is required for this document type",
                path: ["expiration_date"],
            });
        }
    }

    // Rule: Expiration date must be in the future
    if (data.expiration_date) {
        const date = parseISO(data.expiration_date);
        if (!isAfter(date, new Date())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Expiration date must be in the future",
                path: ["expiration_date"],
            });
        }
    }
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
