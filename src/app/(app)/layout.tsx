import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user profile from public.users
    const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile || !profile.is_active) {
        await supabase.auth.signOut();
        redirect("/login");
    }

    // Get unresolved alert count for badge
    let alertCount = 0;
    if (profile.role === "ADMIN") {
        const { count } = await supabase
            .from("alerts")
            .select("*", { count: "exact", head: true })
            .eq("is_resolved", false);
        alertCount = count || 0;
    } else {
        const { count } = await supabase
            .from("alerts")
            .select("*", { count: "exact", head: true })
            .eq("assigned_to", user.id)
            .eq("is_resolved", false);
        alertCount = count || 0;
    }

    return (
        <div className="min-h-dvh">
            <Sidebar user={profile} alertCount={alertCount} />
            <main className="lg:pl-[240px] transition-all duration-200">
                <div className="p-6 max-w-[1400px] mx-auto">{children}</div>
            </main>
        </div>
    );
}
