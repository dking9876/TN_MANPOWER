"use client";

import { useState } from "react";
import {
    useBlacklistedCountries,
    useToggleBlacklist,
} from "@/lib/hooks/use-settings";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function BlacklistedCountriesSection() {
    const { data: countries, isLoading } = useBlacklistedCountries();
    const toggleBlacklist = useToggleBlacklist();
    const [search, setSearch] = useState("");

    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
        );
    }

    const filtered = (countries ?? []).filter((c) =>
        c.country_name.toLowerCase().includes(search.toLowerCase())
    );

    const blacklistedCount = (countries ?? []).filter(
        (c) => c.is_blacklisted
    ).length;

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm text-muted-foreground">
                    Manage which countries are blacklisted. Candidates from
                    blacklisted countries will trigger a warning during creation.
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="destructive" className="text-xs">
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        {blacklistedCount} blacklisted
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {(countries ?? []).length - blacklistedCount} allowed
                    </Badge>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search countries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Country list */}
            <div className="border rounded-md divide-y max-h-[500px] overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No countries found
                    </div>
                ) : (
                    filtered.map((country) => (
                        <div
                            key={country.country_code}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">
                                    {country.country_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    ({country.country_code})
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {country.is_blacklisted && (
                                    <Badge
                                        variant="destructive"
                                        className="text-[10px] h-5"
                                    >
                                        Blacklisted
                                    </Badge>
                                )}
                                <Switch
                                    checked={country.is_blacklisted}
                                    onCheckedChange={(checked) =>
                                        toggleBlacklist.mutate({
                                            countryCode: country.country_code,
                                            isBlacklisted: checked,
                                        })
                                    }
                                    className="data-[state=checked]:bg-destructive"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
