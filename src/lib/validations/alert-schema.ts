import { z } from "zod";

export const alertResolutionSchema = z.object({
    resolution_notes: z.string().min(1, "Resolution notes are required"),
    update_last_updated_at: z.boolean(),
});

export type AlertResolutionValues = z.infer<typeof alertResolutionSchema>;
