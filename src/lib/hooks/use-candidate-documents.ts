import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CandidateDocumentFormValues } from "@/lib/validations/candidate-document-schema";
import { handleError } from "@/lib/utils/error-handler";
import { Database } from "@/lib/supabase/types";

const supabase = createClient();

type CandidateDocumentType = Database["public"]["Enums"]["candidate_document_type"];

export interface UpsertDocumentPayload extends CandidateDocumentFormValues {
    id?: string;
    candidate_id: string;
    type: CandidateDocumentType;
    country?: string | null;
    file_path?: string | null;
    file_name?: string | null;
    file_type?: string | null;
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
                        ...(rest.file_path !== undefined ? { file_path: rest.file_path, file_name: rest.file_name, file_type: rest.file_type } : {})
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
                        ...(rest.file_path !== undefined ? { file_path: rest.file_path, file_name: rest.file_name, file_type: rest.file_type } : {})
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
            toast.error(handleError(error, "Failed to update document"));
        },
    });
}

export function useDeleteCandidateDocumentFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, file_path, candidate_id }: { id: string; file_path: string; candidate_id: string }) => {
            // Delete the file from storage
            const { error: storageError } = await supabase.storage
                .from('candidate-documents')
                .remove([file_path]);

            if (storageError) throw storageError;

            // Remove file metadata from the database record
            const { error: dbError } = await supabase
                .from("candidate_documents")
                .update({
                    file_path: null,
                    file_name: null,
                    file_type: null,
                })
                .eq("id", id);

            if (dbError) throw dbError;
        },
        onSuccess: (_, variables) => {
            toast.success("Document file deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["candidate_documents", variables.candidate_id] });
        },
        onError: (error: any) => {
            toast.error(handleError(error, "Failed to delete document file"));
        },
    });
}
