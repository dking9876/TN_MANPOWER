"use server";

import { createClient } from "@/lib/supabase/server";
import { CandidateFormValues } from "@/lib/validations/candidate-schema";
import { runEligibilityChecks, EligibilityRulesConfig } from "@/lib/eligibility-rules";

export async function processCandidateEligibility(candidateId: string, values: CandidateFormValues) {
    const supabase = await createClient();

    // Get the config
    const { data: configData } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "eligibility_rules")
        .single();

    const config = (configData?.value || {}) as EligibilityRulesConfig;

    // Get blacklisted countries
    const { data: blacklistData } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "blacklisted_countries")
        .single();

    const blacklistedCountries = (blacklistData?.value || []) as string[];

    // Run rules
    const results = runEligibilityChecks(values, config, blacklistedCountries);

    if (results.length === 0) return;

    // Fetch existing checks to preserve overrides
    const { data: existingChecks } = await supabase
        .from("candidate_eligibility_checks")
        .select("*")
        .eq("candidate_id", candidateId);

    const existingMap = new Map(existingChecks?.map(c => [c.rule_id, c]));

    // Prepare upserts
    const upserts = results.map(r => {
        const existing = existingMap.get(r.rule_id);
        return {
            ...(existing?.id ? { id: existing.id } : {}),
            candidate_id: candidateId,
            rule_id: r.rule_id,
            status: r.status,
            severity: r.severity,
            is_overridden: existing ? existing.is_overridden : false,
            override_notes: existing ? existing.override_notes : null,
        };
    });

    // Delete checks that are no longer relevant (e.g. rule was disabled)
    const currentRuleIds = results.map(r => r.rule_id);
    const rulesToDelete = existingChecks?.filter(c => !currentRuleIds.includes(c.rule_id)).map(c => c.id) || [];
    
    if (rulesToDelete.length > 0) {
        await supabase.from("candidate_eligibility_checks").delete().in("id", rulesToDelete);
    }

    // Upsert the current ones
    const { error } = await supabase
        .from("candidate_eligibility_checks")
        .upsert(upserts, { onConflict: 'id' });

    if (error) {
        console.error("Failed to upsert eligibility checks:", error);
        throw new Error("Failed to process eligibility checks");
    }
}
