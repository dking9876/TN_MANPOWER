"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CandidateEligibilityTabProps {
    candidate: any;
}

const RULE_NAMES: Record<string, string> = {
    under_18: "Under 18 Years Old",
    blacklisted_country: "Visited Blacklisted Country",
    construction_age: "Construction Age Limit (25-44 years)",
};

export function CandidateEligibilityTab({ candidate }: CandidateEligibilityTabProps) {
    const router = useRouter();
    const checks = candidate.candidate_eligibility_checks || [];

    if (checks.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Eligibility Checks Passed
                    </CardTitle>
                    <CardDescription>
                        This candidate has no active eligibility flags.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                    Eligibility Flags
                </CardTitle>
                <CardDescription>
                    Review eligibility flags. A Critical (red) flag means a major rule was triggered, but the candidate was still saved. You can override these flags if needed.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {checks.map((check: any) => (
                        <div key={check.id || check.rule_id} className="flex items-center justify-between p-4 border rounded-md">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant={check.severity === 'BLOCK' ? 'destructive' : 'secondary'}>
                                        {check.severity === 'BLOCK' ? 'Critical' : check.severity === 'WARNING' ? 'Warning' : 'Info'}
                                    </Badge>
                                    <span className="font-semibold">{RULE_NAMES[check.rule_id] || check.rule_id}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    Status: <strong className={check.status === 'FAILED' ? "text-destructive" : "text-green-600"}>{check.status === 'FAILED' ? 'Failed Check' : 'Passed'}</strong> {check.is_overridden && '(Overridden by Admin)'}
                                </span>
                            </div>
                            {!check.is_overridden && check.status === 'FAILED' && (
                                <Button variant="outline" size="sm" onClick={async () => {
                                    const supabase = createClient();
                                    const { error } = await supabase
                                        .from('candidate_eligibility_checks')
                                        .update({ is_overridden: true, override_notes: 'Overridden by user' })
                                        .eq('id', check.id);
                                    
                                    if (error) {
                                        toast.error("Failed to override rule");
                                    } else {
                                        toast.success("Rule overridden successfully");
                                        router.refresh();
                                    }
                                }}>
                                    Override
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
