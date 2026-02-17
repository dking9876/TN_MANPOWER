import { createClient } from "@/lib/supabase/server";
import { AlertListClient } from "@/components/alerts/alert-list-client";
import { redirect } from "next/navigation";

export default async function AlertsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <AlertListClient />
        </div>
    );
}
