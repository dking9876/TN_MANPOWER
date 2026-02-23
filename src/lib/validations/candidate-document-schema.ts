import { z } from "zod";

export const candidateDocumentFormSchema = z.object({
    status: z.enum(["PENDING", "SUBMITTED"]),
    expiration_date: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

export type CandidateDocumentFormValues = z.infer<typeof candidateDocumentFormSchema>;
