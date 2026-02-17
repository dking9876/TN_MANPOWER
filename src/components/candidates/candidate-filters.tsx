"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
    INDUSTRIES,
    RECRUITMENT_STATUS,
} from "@/lib/constants";
import { Check, Filter, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce"; // We need to create this hook or use external lib. 
// Actually, let's implement debounce inside here to avoid extra file if simple.

interface CandidateFiltersProps {
    filters: any;
    setFilters: (filters: any) => void;
    isAdmin: boolean;
}

export function CandidateFilters({ filters, setFilters, isAdmin }: CandidateFiltersProps) {
    const [searchValue, setSearchValue] = useState(filters.search || "");

    // Simple debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev: any) => ({ ...prev, search: searchValue, page: 1 }));
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue, setFilters]);

    const handleBlacklistChange = (checked: boolean) => {
        setFilters((prev: any) => ({
            ...prev,
            is_blacklisted: checked ? true : undefined,
            page: 1,
        }));
    };

    const toggleStatus = (status: string) => {
        const current = filters.status || [];
        const next = current.includes(status)
            ? current.filter((s: string) => s !== status)
            : [...current, status];
        setFilters((prev: any) => ({ ...prev, status: next, page: 1 }));
    };

    const toggleIndustry = (industry: string) => {
        const current = filters.industry || [];
        const next = current.includes(industry)
            ? current.filter((i: string) => i !== industry)
            : [...current, industry];
        setFilters((prev: any) => ({ ...prev, industry: next, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ page: 1 });
        setSearchValue("");
    };

    const activeFilterCount =
        (filters.status?.length || 0) +
        (filters.industry?.length || 0) +
        (filters.is_blacklisted ? 1 : 0);

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Search */}
                <div className="w-full md:w-[300px]">
                    <Input
                        placeholder="Search name, passport, ID..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="h-9"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Status Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 border-dashed">
                                <Plus className="mr-2 h-4 w-4" />
                                Status
                                {filters.status?.length > 0 && (
                                    <>
                                        <Separator orientation="vertical" className="mx-2 h-4" />
                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                            {filters.status.length}
                                        </Badge>
                                        <div className="hidden space-x-1 lg:flex">
                                            {filters.status.length > 2 ? (
                                                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                                    {filters.status.length} selected
                                                </Badge>
                                            ) : (
                                                filters.status.map((status: string) => (
                                                    <Badge
                                                        variant="secondary"
                                                        key={status}
                                                        className="rounded-sm px-1 font-normal"
                                                    >
                                                        {RECRUITMENT_STATUS[status as keyof typeof RECRUITMENT_STATUS]}
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[240px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Status" />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup>
                                        {Object.entries(RECRUITMENT_STATUS).map(([key, label]) => {
                                            const isSelected = filters.status?.includes(key);
                                            return (
                                                <CommandItem
                                                    key={key}
                                                    onSelect={() => toggleStatus(key)}
                                                >
                                                    <div
                                                        className={cn(
                                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                            isSelected
                                                                ? "bg-primary text-primary-foreground"
                                                                : "opacity-50 [&_svg]:invisible"
                                                        )}
                                                    >
                                                        <Check className={cn("h-4 w-4")} />
                                                    </div>
                                                    <span>{label}</span>
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                    {filters.status?.length > 0 && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup>
                                                <CommandItem
                                                    onSelect={() => setFilters((prev: any) => ({ ...prev, status: [], page: 1 }))}
                                                    className="justify-center text-center"
                                                >
                                                    Clear filters
                                                </CommandItem>
                                            </CommandGroup>
                                        </>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {/* Industry Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 border-dashed">
                                <Plus className="mr-2 h-4 w-4" />
                                Industry
                                {filters.industry?.length > 0 && (
                                    <>
                                        <Separator orientation="vertical" className="mx-2 h-4" />
                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                            {filters.industry.length}
                                        </Badge>
                                        <div className="hidden space-x-1 lg:flex">
                                            {filters.industry.length > 2 ? (
                                                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                                    {filters.industry.length} selected
                                                </Badge>
                                            ) : (
                                                filters.industry.map((ind: string) => (
                                                    <Badge
                                                        variant="secondary"
                                                        key={ind}
                                                        className="rounded-sm px-1 font-normal"
                                                    >
                                                        {INDUSTRIES[ind as keyof typeof INDUSTRIES]}
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Industry" />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup>
                                        {Object.entries(INDUSTRIES).map(([key, label]) => {
                                            const isSelected = filters.industry?.includes(key);
                                            return (
                                                <CommandItem
                                                    key={key}
                                                    onSelect={() => toggleIndustry(key)}
                                                >
                                                    <div
                                                        className={cn(
                                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                            isSelected
                                                                ? "bg-primary text-primary-foreground"
                                                                : "opacity-50 [&_svg]:invisible"
                                                        )}
                                                    >
                                                        <Check className={cn("h-4 w-4")} />
                                                    </div>
                                                    <span>{label}</span>
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                    {filters.industry?.length > 0 && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup>
                                                <CommandItem
                                                    onSelect={() => setFilters((prev: any) => ({ ...prev, industry: [], page: 1 }))}
                                                    className="justify-center text-center"
                                                >
                                                    Clear filters
                                                </CommandItem>
                                            </CommandGroup>
                                        </>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {/* Blacklist Filter */}
                    <div className="flex items-center space-x-2 border rounded-md px-3 h-9 bg-background/50 hover:bg-muted/50 transition-colors">
                        <Checkbox
                            id="blacklist"
                            checked={!!filters.is_blacklisted}
                            onCheckedChange={handleBlacklistChange}
                        />
                        <label
                            htmlFor="blacklist"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Blacklisted
                        </label>
                    </div>

                    {/* Clear Button */}
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
                        >
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Separator({ orientation, className }: { orientation: "horizontal" | "vertical", className?: string }) {
    return (
        <div className={cn(
            "bg-border",
            orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
            className
        )} />
    );
}
