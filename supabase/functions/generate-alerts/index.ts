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

        const stalenessDays = parseInt(config.find((c) => c.key === "alert_staleness_threshold_days")?.value || "14");
        const expirationDays = parseInt(config.find((c) => c.key === "alert_document_expiration_threshold_days")?.value || "30");

        const now = new Date();
        const stalenessDate = new Date(now.getTime() - stalenessDays * 24 * 60 * 60 * 1000);
        const expirationDate = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);

        const newAlerts = [];

        // 2. STALENESS ALERTS
        // Logic: Last updated < threshold AND status not arrived/reject AND no unresolved staleness alert
        const { data: staleCandidates, error: staleError } = await supabase
            .from("candidates")
            .select("id, first_name, last_name, recruitment_status, last_updated_at")
            .lt("last_updated_at", stalenessDate.toISOString())
            .not("recruitment_status", "in", `("Arrived in Israel","Candidate Rejected")`)
            .is("deleted_at", null);

        if (staleError) throw staleError;

        // Check for existing unresolved alerts to avoid duplicates
        // Fetch all unresolved staleness alerts separately or one-by-one? 
        // Optimization: Fetch IDs of candidates with unresolved staleness alerts
        const { data: existingStaleAlerts } = await supabase
            .from("alerts")
            .select("candidate_id")
            .eq("alert_type", "Staleness")
            .eq("is_resolved", false);

        const existingStaleIds = new Set(existingStaleAlerts?.map((a) => a.candidate_id));

        for (const candidate of staleCandidates || []) {
            if (!existingStaleIds.has(candidate.id)) {
                newAlerts.push({
                    candidate_id: candidate.id,
                    alert_type: "Staleness",
                    alert_severity: "MEDIUM",
                    alert_message: `Candidate has not been updated in over ${stalenessDays} days. Status: ${candidate.recruitment_status}`,
                });
            }
        }

        // 3. DOCUMENT EXPIRATION ALERTS
        // Logic: Expiration date < threshold (future but soon) AND > now AND no unresolved expiration alert for this doc type?
        // Simplified: Check documents expiring soon.
        // Note: We need to link document -> candidate.
        const { data: expiringDocs, error: docError } = await supabase
            .from("documents")
            .select("id, document_type, expiration_date, candidate_id, candidates(first_name, last_name)")
            .lt("expiration_date", expirationDate.toISOString())
            .gt("expiration_date", now.toISOString())
            .eq("is_received", true);

        if (docError) throw docError;

        // Check existing alerts for document expiration
        // We might need a way to distinguish which document caused the alert if multiple exist?
        // For now, simplify: if candidate has ANY unresolved Document Expiration alert, skip? 
        // Or better: include document type in message and allow multiple?
        // Let's check if candidate has unresolved alert matching this document type message.
        const { data: existingDocAlerts } = await supabase
            .from("alerts")
            .select("candidate_id, alert_message")
            .eq("alert_type", "Document Expiration")
            .eq("is_resolved", false);

        const existingDocAlertMap = new Set(existingDocAlerts?.map(a => `${a.candidate_id}:${a.alert_message}`));

        for (const doc of expiringDocs || []) {
            const message = `${doc.document_type} is expiring on ${doc.expiration_date?.split("T")[0]}`;
            // Check duplicate by message text key
            if (!existingDocAlertMap.has(`${doc.candidate_id}:${message}`)) {
                // Also check if candidate is deleted? Document query joins candidates?
                if (doc.candidates) { // Ensure candidate exists
                    newAlerts.push({
                        candidate_id: doc.candidate_id,
                        alert_type: "Document Expiration",
                        alert_severity: "HIGH",
                        alert_message: message,
                    });
                }
            }
        }

        // 4. Bulk Insert
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
