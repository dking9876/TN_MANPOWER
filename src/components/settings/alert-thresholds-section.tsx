"use client";

import { useState, useEffect } from "react";
import { useSystemConfig, useUpdateConfig } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Save } from "lucide-react";

const THRESHOLD_FIELDS = [
    {
        key: "staleness_threshold_days",
        label: "Staleness Threshold (days)",
        description:
            "Generate an alert if a candidate hasn't been updated in this many days",
        defaultValue: "7",
    },
    {
        key: "passport_expiration_warning_days",
        label: "Passport Expiration Warning (days)",
        description:
            "Generate an alert when a passport is expiring within this many days",
        defaultValue: "90",
    },
    {
        key: "visa_expiration_warning_days",
        label: "Visa Expiration Warning (days)",
        description:
            "Generate an alert when a visa is expiring within this many days",
        defaultValue: "30",
    },
    {
        key: "police_clearance_expiration_warning_days",
        label: "Police Clearance Expiration Warning (days)",
        description:
            "Generate an alert when police clearance is expiring within this many days",
        defaultValue: "60",
    },
    {
        key: "health_declaration_expiration_warning_days",
        label: "Health Declaration Expiration Warning (days)",
        description:
            "Generate an alert when a health declaration is expiring within this many days",
        defaultValue: "60",
    },
];

export function AlertThresholdsSection() {
    const { data: config, isLoading } = useSystemConfig();
    const updateConfig = useUpdateConfig();

    const [values, setValues] = useState<Record<string, string>>({});

    useEffect(() => {
        if (config) {
            const newValues: Record<string, string> = {};
            THRESHOLD_FIELDS.forEach((field) => {
                const found = config.find((c) => c.key === field.key);
                newValues[field.key] = found
                    ? String(found.value)
                    : field.defaultValue;
            });
            setValues(newValues);
        }
    }, [config]);

    function handleSave() {
        updateConfig.mutate(
            THRESHOLD_FIELDS.map((field) => ({
                key: field.key,
                value: parseInt(values[field.key]) || parseInt(field.defaultValue),
            }))
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <p className="text-sm text-muted-foreground">
                    Configure how the alert generation system triggers notifications.
                    These thresholds are used by the daily alert job.
                </p>
            </div>

            <div className="space-y-5">
                {THRESHOLD_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <p className="text-xs text-muted-foreground">
                            {field.description}
                        </p>
                        <Input
                            id={field.key}
                            type="number"
                            min={1}
                            max={365}
                            value={values[field.key] ?? field.defaultValue}
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                }))
                            }
                            className="max-w-[200px]"
                        />
                    </div>
                ))}
            </div>

            <Button
                onClick={handleSave}
                disabled={updateConfig.isPending}
                size="sm"
            >
                <Save className="h-4 w-4 mr-1.5" />
                {updateConfig.isPending ? "Saving..." : "Save Thresholds"}
            </Button>
        </div>
    );
}
