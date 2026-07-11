import { CandidateFormValues } from "@/lib/validations/candidate-schema";
import { parseISO, differenceInYears, differenceInMonths } from "date-fns";

export type RuleSeverity = "BLOCK" | "WARNING" | "INFO";

export interface EligibilityRuleConfig {
    is_active: boolean;
    severity: RuleSeverity;
}

export interface EligibilityRulesConfig {
    under_18: EligibilityRuleConfig;
    blacklisted_country: EligibilityRuleConfig;
    construction_age: EligibilityRuleConfig;
}

export interface RuleCheckResult {
    rule_id: string;
    status: "PASSED" | "FAILED";
    severity: RuleSeverity;
}

// Helper to calculate exact age in months for the construction rule
const getAgeInMonths = (dateStr: string) => {
    const dob = parseISO(dateStr);
    return differenceInMonths(new Date(), dob);
};

export const runEligibilityChecks = (
    candidate: CandidateFormValues,
    config: EligibilityRulesConfig,
    blacklistedCountries: string[]
): RuleCheckResult[] => {
    const results: RuleCheckResult[] = [];

    // Rule 1: Under 18
    if (config.under_18?.is_active) {
        const dob = parseISO(candidate.date_of_birth);
        const age = differenceInYears(new Date(), dob);
        results.push({
            rule_id: "under_18",
            status: age >= 18 ? "PASSED" : "FAILED",
            severity: config.under_18.severity,
        });
    }

    // Rule 2: Blacklisted Country
    if (config.blacklisted_country?.is_active) {
        let hasBlacklisted = false;
        if (candidate.has_visited_other && candidate.countries_visited) {
            hasBlacklisted = candidate.countries_visited.some(cv => 
                blacklistedCountries.includes(cv)
            );
        }
        results.push({
            rule_id: "blacklisted_country",
            status: hasBlacklisted ? "FAILED" : "PASSED",
            severity: config.blacklisted_country.severity,
        });
    }

    // Rule 3: Construction Age
    if (config.construction_age?.is_active) {
        if (candidate.primary_industry === "CONSTRUCTION") {
            const ageMonths = getAgeInMonths(candidate.date_of_birth);
            // 25 years = 300 months
            // 44 years 2 months = 530 months
            const passed = ageMonths >= 300 && ageMonths <= 530;
            results.push({
                rule_id: "construction_age",
                status: passed ? "PASSED" : "FAILED",
                severity: config.construction_age.severity,
            });
        }
    }

    return results;
};
