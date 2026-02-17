import { createClient } from "@/lib/supabase/server";
import { CandidateDetail } from "@/components/candidates/candidate-detail";
import { notFound, redirect } from "next/navigation";

interface CandidateDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function CandidateDetailPage({ params }: CandidateDetailPageProps) {
    const { id } = await params;

    // Quick server-side check mainly for valid ID format or existence if critical, 
    // but the client component fetches data mostly. 
    // However, for SEO/Performance/Auth check, we can verify session here.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // We can just render the client component which handles data fetching with React Query
    return (
        <div className="max-w-5xl mx-auto py-8">
            <CandidateDetail id={id} />
        </div>
    );
}
