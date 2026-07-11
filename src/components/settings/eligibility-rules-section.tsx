"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const RULE_META: Record<string, { name: string, description: string }> = {
    under_18: { name: 'Under 18 Years Old', description: 'Candidate is under 18 years of age.' },
    blacklisted_country: { name: 'Visited Blacklisted Country', description: 'Candidate has visited a high-risk blacklisted country.' },
    construction_age: { name: 'Construction Age Limit', description: 'Candidate is between 25 and 44 years and 2 months old (Construction industry only).' }
};

export function EligibilityRulesSection() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    const { data: configRows, isLoading } = useQuery({
        queryKey: ["system_config", "eligibility_rules"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("system_config")
                .select("value")
                .eq("key", "eligibility_rules")
                .single();
            if (error) throw error;
            return data.value;
        }
    });

    const updateConfig = useMutation({
        mutationFn: async (newConfig: any) => {
            const { error } = await supabase
                .from("system_config")
                .update({ value: newConfig })
                .eq("key", "eligibility_rules");
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system_config", "eligibility_rules"] });
            toast.success("Rules updated successfully");
        },
        onError: () => {
            toast.error("Failed to update rules");
        }
    });

    const rules = configRows ? Object.keys(configRows).map(key => ({
        id: key,
        ...RULE_META[key] || { name: key, description: '' },
        ...configRows[key]
    })) : [];

    const handleSeverityChange = (id: string, newSeverity: string) => {
        if (!configRows) return;
        const newConfig = { ...configRows, [id]: { ...configRows[id], severity: newSeverity } };
        updateConfig.mutate(newConfig);
    };

    const handleActiveChange = (id: string, newActive: boolean) => {
        if (!configRows) return;
        const newConfig = { ...configRows, [id]: { ...configRows[id], is_active: newActive } };
        updateConfig.mutate(newConfig);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Eligibility Rules</CardTitle>
                <CardDescription>
                    Configure the severity of eligibility rules. A rule can be Critical (requires override), Warning, or Info.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Active</TableHead>
                                <TableHead>Rule Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[200px]">Severity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell>
                                        <Switch 
                                            checked={rule.is_active} 
                                            onCheckedChange={(val) => handleActiveChange(rule.id, val)}
                                            disabled={updateConfig.isPending}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{rule.name}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{rule.description}</TableCell>
                                    <TableCell>
                                        <Select 
                                            defaultValue={rule.severity} 
                                            onValueChange={(val) => handleSeverityChange(rule.id, val)}
                                            disabled={updateConfig.isPending}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BLOCK">Critical</SelectItem>
                                                <SelectItem value="WARNING">Warning</SelectItem>
                                                <SelectItem value="INFO">Info</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
