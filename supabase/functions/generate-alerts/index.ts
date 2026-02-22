import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 1. Fetch system config for thresholds
        const { data: config, error: configError } = await supabase
            .from("system_config")
            .select("key, value")
            .in("key", ["alert_staleness_threshold_days", "alert_document_expiration_threshold_days"]);

        if (configError) throw configError;

        const stalenessDays = parseInt(config.find((c) => c.key === "alert_staleness_threshold_days")?.value ?? "14");
        const expirationDays = parseInt(config.find((c) => c.key === "alert_document_expiration_threshold_days")?.value ?? "30");

        const now = new Date();
        const stalenessDate = new Date(now.getTime() - stalenessDays * 24 * 60 * 60 * 1000);
        const expirationDate = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);

        const newAlerts = [];

        // 2. STALENESS ALERTS
        // Logic: Last updated < threshold AND status not arrived/reject AND no unresolved staleness alert
        const { data: staleCandidates, error: staleError } = await supabase
            .from("candidates")
            .select("id, first_name, last_name, recruitment_status, last_updated_at, created_by")
            .lt("last_updated_at", stalenessDate.toISOString())
            .not("recruitment_status", "in", `("ARRIVED_IN_ISRAEL","CANDIDATE_REJECTED")`);

        if (staleError) throw staleError;

        // Check for existing unresolved alerts to avoid duplicates
        // Fetch all unresolved staleness alerts separately or one-by-one? 
        // Optimization: Fetch IDs of candidates with unresolved staleness alerts
        const { data: existingStaleAlerts } = await supabase
            .from("alerts")
            .select("candidate_id")
            .eq("alert_type", "STALENESS")
            .eq("is_resolved", false);

        const existingStaleIds = new Set(existingStaleAlerts?.map((a) => a.candidate_id));

        for (const candidate of staleCandidates || []) {
            if (!existingStaleIds.has(candidate.id)) {
                newAlerts.push({
                    candidate_id: candidate.id,
                    assigned_to: candidate.created_by,
                    alert_type: "STALENESS",
                    alert_message: `Candidate has not been updated in over ${stalenessDays} days. Status: ${candidate.recruitment_status}`,
                });
            }
        }

        // 3. Bulk Insert
        if (newAlerts.length > 0) {
            const { error: insertError } = await supabase
                .from("alerts")
                .insert(newAlerts);

            if (insertError) throw insertError;
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Generated ${newAlerts.length} new alerts`,
                alerts: newAlerts.length
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
