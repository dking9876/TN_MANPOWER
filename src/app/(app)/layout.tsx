import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

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
        <div className="min-h-dvh flex flex-col lg:flex-row">
            <Sidebar user={profile} alertCount={alertCount} />

            {/* Mobile Header Top Bar (visible only on small screens) */}
            <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary via-accent to-blue-900 text-primary-foreground flex items-center justify-center rounded-md shadow-sm shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="font-semibold tracking-tight text-foreground">T.N Manpower</span>
                </div>

                <div className="flex items-center mr-10">
                    <ThemeToggle />
                </div>
            </div>

            <main className="flex-1 lg:pl-[260px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-x-hidden">
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">{children}</div>
            </main>
        </div>
    );
}
