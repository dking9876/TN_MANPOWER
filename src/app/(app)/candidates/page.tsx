import { createClient } from "@/lib/supabase/server";
import { CandidateListClient } from "@/components/candidates/candidate-list-client";
import { redirect } from "next/navigation";

export default async function CandidateListPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check role for admin features
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    const isAdmin = userData?.role === "ADMIN";

    return <CandidateListClient isAdmin={isAdmin} />;
}
