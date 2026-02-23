"use client";

import { useState, useEffect } from "react";
import { useSystemConfig, useUpdateConfig } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";

// Re-use the master list, but simplify to just types and labels
const DOCUMENT_TYPES = [
    { type: 'PASSPORT_COPIES', label: 'Passport Copies' },
    { type: 'IMMIGRATION_LETTER_COPIES', label: 'Immigration Letter Copies' },
    { type: 'ORIGINAL_IMMIGRATION_LETTER', label: 'Original Immigration Letter' },
    { type: 'RED_RIBBON_DOCUMENT', label: 'Red Ribbon Document' },
    { type: 'VISA_APPLICATION_FORM', label: 'Visa Application Form' },
    { type: 'MEDICAL_REPORT', label: 'Medical Report' },
    { type: 'POLICE_REPORT', label: 'Police Report' },
    { type: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
    { type: 'GS_CERTIFICATE', label: 'GS Certificate' },
    { type: 'PERSONAL_AFFIDAVIT', label: 'Personal Affidavit' },
    { type: 'NIC_COPY_APPLICANT_AND_SPOUSE', label: 'NIC Copy (Applicant & Spouse)' },
    { type: 'ENGLISH_AGREEMENT', label: 'English Agreement' },
    { type: 'LETTER_FROM_TRANSLATOR', label: 'Letter From Translator' },
    { type: 'SINHALA_AGREEMENT', label: 'Sinhala Agreement' },
    { type: 'NIC_APPLICANT_AND_CANDIDATE', label: 'NIC Applicant & Candidate' },
];

export function DocumentThresholdsSection() {
    const { data: config, isLoading } = useSystemConfig();
    const updateConfig = useUpdateConfig();

    const [values, setValues] = useState<Record<string, string>>({});

    useEffect(() => {
        if (config) {
            const newValues: Record<string, string> = {};
            DOCUMENT_TYPES.forEach((doc) => {
                const key = `${doc.type}_warning_days`;
                const found = config.find((c) => c.key === key);
                newValues[key] = found ? String(found.value) : "90";
            });
            setValues(newValues);
        }
    }, [config]);

    function handleSave() {
        updateConfig.mutate(
            DOCUMENT_TYPES.map((doc) => {
                const key = `${doc.type}_warning_days`;
                const val = parseInt(values[key]);
                return {
                    key,
                    value: isNaN(val) ? 90 : val,
                };
            })
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full max-w-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <p className="text-sm text-muted-foreground">
                    Configure the timeframe (in days) before a document is considered "Expiring Soon".
                    Set to <span className="font-bold text-foreground">0</span> if the document never expires.
                </p>
            </div>

            <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                {DOCUMENT_TYPES.map((doc) => {
                    const key = `${doc.type}_warning_days`;
                    return (
                        <div key={key} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor={key}>{doc.label}</Label>
                                {values[key] === "0" && (
                                    <span className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                        NEVER EXPIRES
                                    </span>
                                )}
                            </div>
                            <Input
                                id={key}
                                type="number"
                                min={0}
                                max={3650}
                                value={values[key] ?? "90"}
                                onChange={(e) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        [key]: e.target.value,
                                    }))
                                }
                                className={cn(
                                    "w-full",
                                    values[key] === "0" && "opacity-50"
                                )}
                                placeholder="Days (0 for never)"
                            />
                        </div>
                    );
                })}
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

