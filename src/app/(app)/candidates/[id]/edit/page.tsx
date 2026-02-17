import { CandidateForm } from "@/components/candidates/candidate-form";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface EditCandidatePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditCandidatePage({ params }: EditCandidatePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: candidate, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !candidate) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Edit Candidate</h1>
            <CandidateForm initialData={candidate} isEditMode={true} />
        </div>
    );
}
