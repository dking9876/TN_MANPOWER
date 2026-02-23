import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CandidateDocumentFormValues } from "@/lib/validations/candidate-document-schema";
import { Database } from "@/lib/supabase/types";

const supabase = createClient();

type CandidateDocumentType = Database["public"]["Enums"]["candidate_document_type"];

export interface UpsertDocumentPayload extends CandidateDocumentFormValues {
    id?: string;
    candidate_id: string;
    type: CandidateDocumentType;
    country?: string | null;
}

export function useCandidateDocumentsData(candidateId: string) {
    return useQuery({
        queryKey: ["candidate_documents", candidateId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("candidate_documents")
                .select("*")
                .eq("candidate_id", candidateId);

            if (error) throw error;
            return data;
        },
    });
}

export function useUpsertCandidateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpsertDocumentPayload) => {
            const { id, ...rest } = payload;

            let query;
            if (id) {
                // Update existing record
                query = supabase
                    .from("candidate_documents")
                    .update({
                        status: rest.status,
                        expiration_date: rest.expiration_date || null,
                        notes: rest.notes || null,
                    })
                    .eq("id", id);
            } else {
                // Insert new record
                query = supabase
                    .from("candidate_documents")
                    .insert({
                        candidate_id: rest.candidate_id,
                        type: rest.type,
                        country: rest.country || null,
                        status: rest.status,
                        expiration_date: rest.expiration_date || null,
                        notes: rest.notes || null,
                    });
            }

            const { data, error } = await query.select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            toast.success("Document updated successfully");
            queryClient.invalidateQueries({ queryKey: ["candidate_documents", variables.candidate_id] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update document");
        },
    });
}
