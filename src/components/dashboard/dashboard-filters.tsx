"use client";

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
import { Plus, X, Building2, User, Check } from "lucide-react";
import { useCompanies } from "@/lib/hooks/use-settings";
import { useUsers } from "@/lib/hooks/use-users";
import { cn } from "@/lib/utils";
import { DashboardFilters as FilterType } from "@/lib/hooks/use-dashboard";

interface DashboardFiltersProps {
    filters: FilterType;
    setFilters: (filters: FilterType | ((prev: FilterType) => FilterType)) => void;
}

export function DashboardFilters({ filters, setFilters }: DashboardFiltersProps) {
    const { data: companies } = useCompanies();
    const { data: users } = useUsers();

    const referrers = users?.filter(u => ["ADMIN", "RECRUITER", "REFERRER"].includes(u.role)) || [];

    const toggleCompany = (companyId: string) => {
        const current = filters.company_id || [];
        const next = current.includes(companyId)
            ? current.filter((id: string) => id !== companyId)
            : [...current, companyId];
        setFilters((prev) => ({ ...prev, company_id: next }));
    };

    const toggleReferrer = (referrerId: string) => {
        const current = filters.referrer || [];
        const next = current.includes(referrerId)
            ? current.filter((id: string) => id !== referrerId)
            : [...current, referrerId];
        setFilters((prev) => ({ ...prev, referrer: next }));
    };

    const clearFilters = () => {
        setFilters({});
    };

    const activeFilterCount =
        (filters.company_id?.length || 0) +
        (filters.referrer?.length || 0);

    return (
        <div className="flex flex-wrap gap-2 items-center mb-6">
            {/* Company Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 border-dashed">
                        <Plus className="mr-2 h-4 w-4" />
                        <Building2 className="mr-2 h-4 w-4 hidden md:block" />
                        Company
                        {filters.company_id && filters.company_id.length > 0 && (
                            <>
                                <Separator orientation="vertical" className="mx-2 h-4" />
                                <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                    {filters.company_id.length}
                                </Badge>
                                <div className="hidden space-x-1 lg:flex">
                                    {filters.company_id.length > 2 ? (
                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                            {filters.company_id.length} selected
                                        </Badge>
                                    ) : (
                                        filters.company_id.map((compId: string) => {
                                            const comp = companies?.find(c => c.id === compId);
                                            return (
                                                <Badge
                                                    variant="secondary"
                                                    key={compId}
                                                    className="rounded-sm px-1 font-normal"
                                                >
                                                    {comp ? comp.name : "Unknown"}
                                                </Badge>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Company" />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {companies?.map((company) => {
                                    const isSelected = filters.company_id?.includes(company.id);
                                    return (
                                        <CommandItem
                                            key={company.id}
                                            onSelect={() => toggleCompany(company.id)}
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
                                            <span>{company.name}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                            {filters.company_id && filters.company_id.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => setFilters((prev) => ({ ...prev, company_id: [] }))}
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

            {/* Referrer Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 border-dashed">
                        <Plus className="mr-2 h-4 w-4" />
                        <User className="mr-2 h-4 w-4 hidden md:block" />
                        Referrer
                        {filters.referrer && filters.referrer.length > 0 && (
                            <>
                                <Separator orientation="vertical" className="mx-2 h-4" />
                                <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                    {filters.referrer.length}
                                </Badge>
                                <div className="hidden space-x-1 lg:flex">
                                    {filters.referrer.length > 2 ? (
                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                            {filters.referrer.length} selected
                                        </Badge>
                                    ) : (
                                        filters.referrer.map((refId: string) => {
                                            const ref = referrers?.find(r => r.id === refId);
                                            return (
                                                <Badge
                                                    variant="secondary"
                                                    key={refId}
                                                    className="rounded-sm px-1 font-normal"
                                                >
                                                    {ref ? ref.full_name : "Unknown"}
                                                </Badge>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Referrer" />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {referrers?.map((referrer) => {
                                    const isSelected = filters.referrer?.includes(referrer.id);
                                    return (
                                        <CommandItem
                                            key={referrer.id}
                                            onSelect={() => toggleReferrer(referrer.id)}
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
                                            <span>{referrer.full_name}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                            {filters.referrer && filters.referrer.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => setFilters((prev) => ({ ...prev, referrer: [] }))}
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

            {/* Clear Button */}
            {activeFilterCount > 0 && (
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-foreground hover:bg-rose-500/10 hover:text-rose-500"
                >
                    Reset
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
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
