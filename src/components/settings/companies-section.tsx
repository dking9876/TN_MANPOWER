"use client";

import { useState } from "react";
import { useCompanies, useAddCompany, useDeleteCompany } from "@/lib/hooks/use-settings";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, Building2, Trash2 } from "lucide-react";

export function CompaniesSection() {
    const { data: companies, isLoading } = useCompanies();
    const addCompany = useAddCompany();
    const deleteCompany = useDeleteCompany();

    const [search, setSearch] = useState("");
    const [newCompanyName, setNewCompanyName] = useState("");

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full max-w-sm" />
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    const filtered = (companies ?? []).filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompanyName.trim()) return;

        addCompany.mutate(
            { name: newCompanyName.trim() },
            {
                onSuccess: () => setNewCompanyName(""),
            }
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-muted-foreground">
                    Manage the list of companies available to be assigned to candidates in the system.
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        <Building2 className="h-3 w-3 mr-1" />
                        {(companies ?? []).length} total companies
                    </div>
                </div>
            </div>

            {/* Add New Company */}
            <form onSubmit={handleAdd} className="flex items-center gap-3">
                <Input
                    placeholder="Enter new company name..."
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="max-w-sm"
                    disabled={addCompany.isPending}
                />
                <Button type="submit" disabled={!newCompanyName.trim() || addCompany.isPending}>
                    {addCompany.isPending ? "Adding..." : "Add Company"}
                </Button>
            </form>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Companies list */}
            <div className="border rounded-md divide-y overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        {search ? "No companies found matching your search" : "No companies added yet"}
                    </div>
                ) : (
                    filtered.map((company) => (
                        <div
                            key={company.id}
                            className="flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/50 transition-colors"
                        >
                            <span className="text-sm font-medium">
                                {company.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive h-8 px-2"
                                onClick={() => deleteCompany.mutate(company.id)}
                                disabled={deleteCompany.isPending}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
