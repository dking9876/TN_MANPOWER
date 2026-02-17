import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DocumentFormValues } from "@/lib/validations/document-schema";

const supabase = createClient();

export function useCandidateDocuments(candidateId: string) {
    return useQuery({
        queryKey: ["documents", candidateId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("documents")
                .select("*")
                .eq("candidate_id", candidateId)
                .order("document_type", { ascending: true }); // Persistent order

            if (error) throw error;
            return data;
        },
    });
}

export function useUpdateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, values }: { id: string; candidateId: string; values: DocumentFormValues }) => {
            const { data, error } = await supabase
                .from("documents")
                .update({
                    // Only update allowed fields
                    is_received: values.is_received,
                    expiration_date: values.expiration_date,
                    received_date: values.received_date,
                    notes: values.notes,
                } as any)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            toast.success("Document updated successfully");
            queryClient.invalidateQueries({ queryKey: ["documents", variables.candidateId] });
            // Also invalidate candidate detail to show updated progress/readiness if applicable
            // (Not strictly needed unless we show doc status in header, but good practice)
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update document");
        },
    });
}
