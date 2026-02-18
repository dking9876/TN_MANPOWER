"use client";

import { useState } from "react";
import {
    useProfessions,
    useAddProfession,
    useDeleteProfession,
} from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";

const INDUSTRIES = [
    "NURSING",
    "CONSTRUCTION",
    "INDUSTRY",
    "AGRICULTURE",
    "COMMERCE",
    "HOSPITALITY",
    "SERVICES",
] as const;

const INDUSTRY_LABELS: Record<string, string> = {
    NURSING: "Nursing",
    CONSTRUCTION: "Construction",
    INDUSTRY: "Industry",
    AGRICULTURE: "Agriculture",
    COMMERCE: "Commerce",
    HOSPITALITY: "Hospitality",
    SERVICES: "Services",
};

export function ProfessionsSection() {
    const { data: professions, isLoading } = useProfessions();
    const addProfession = useAddProfession();
    const deleteProfession = useDeleteProfession();

    const [newProfession, setNewProfession] = useState("");
    const [newIndustry, setNewIndustry] = useState<string>("");

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
        );
    }

    // Group by industry
    const grouped = INDUSTRIES.reduce(
        (acc, industry) => {
            acc[industry] = (professions ?? []).filter(
                (p) => p.industry === industry
            );
            return acc;
        },
        {} as Record<string, typeof professions>
    );

    function handleAdd() {
        if (!newProfession.trim() || !newIndustry) return;
        addProfession.mutate(
            { industry: newIndustry, profession: newProfession.trim() },
            {
                onSuccess: () => {
                    setNewProfession("");
                },
            }
        );
    }

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Manage the list of professions available for each industry.
                These appear in the candidate creation form.
            </p>

            {/* Add new profession */}
            <div className="flex items-end gap-2 max-w-lg">
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                        Profession Name
                    </label>
                    <Input
                        value={newProfession}
                        onChange={(e) => setNewProfession(e.target.value)}
                        placeholder="e.g. Crane Operator"
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                </div>
                <div className="w-[160px] space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                        Industry
                    </label>
                    <Select value={newIndustry} onValueChange={setNewIndustry}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                            {INDUSTRIES.map((ind) => (
                                <SelectItem key={ind} value={ind}>
                                    {INDUSTRY_LABELS[ind]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    onClick={handleAdd}
                    size="sm"
                    disabled={
                        !newProfession.trim() ||
                        !newIndustry ||
                        addProfession.isPending
                    }
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            </div>

            {/* Grouped professions */}
            <div className="space-y-4">
                {INDUSTRIES.map((industry) => {
                    const items = grouped[industry] ?? [];
                    if (items.length === 0) return null;

                    return (
                        <div key={industry} className="border rounded-md p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <h4 className="text-sm font-semibold">
                                    {INDUSTRY_LABELS[industry]}
                                </h4>
                                <Badge variant="secondary" className="text-[10px] h-5">
                                    {items.length}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {items.map((p) => (
                                    <Badge
                                        key={p.id}
                                        variant="outline"
                                        className="text-xs py-1 px-2 gap-1 group hover:border-destructive transition-colors"
                                    >
                                        {p.profession}
                                        <button
                                            onClick={() => deleteProfession.mutate(p.id)}
                                            className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove profession"
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
