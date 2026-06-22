import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface CreateCandidateMediaPayload {
    candidate_id: string;
    storage_path: string;
    file_type: string;
    title: string;
    original_name: string;
    file_size: number;
    [key: string]: any;
}

export function useCandidateMedia(candidateId: string) {
    return useQuery({
        queryKey: ["candidate_media", candidateId],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("candidate_media")
                .select("*")
                .eq("candidate_id", candidateId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!candidateId,
    });
}

export function useCreateCandidateMedia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateCandidateMediaPayload) => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("candidate_media")
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["candidate_media", variables.candidate_id] });
        },
    });
}

export interface DeleteCandidateMediaPayload {
    id: string;
    storage_path: string;
    candidate_id: string;
}

export function useDeleteCandidateMedia() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, storage_path }: DeleteCandidateMediaPayload) => {
            const supabase = createClient();
            
            // Delete file from storage
            const { error: storageError } = await supabase.storage
                .from("candidate-media")
                .remove([storage_path]);

            if (storageError) throw storageError;

            // Delete row from DB
            const { error: dbError } = await supabase
                .from("candidate_media")
                .delete()
                .eq("id", id);

            if (dbError) throw dbError;
            return { id };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["candidate_media", variables.candidate_id] });
        },
    });
}

export const getMediaSignedUrl = async (path: string) => {
    const supabase = createClient();
    const { data } = await supabase.storage.from("candidate-media").createSignedUrl(path, 3600);
    return data?.signedUrl;
};
