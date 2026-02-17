"use client";

import { useCandidates, type CandidateFilters } from "@/lib/hooks/use-candidates";
import { useState } from "react";
import { CandidateFilters as Filters } from "./candidate-filters";
import { CandidateTable } from "./candidate-table";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { exportCandidatesToCSV } from "@/lib/csv-export";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export function CandidateListClient({ isAdmin }: { isAdmin: boolean }) {
    const router = useRouter();
    const [filters, setFilters] = useState<CandidateFilters>({
        page: 1,
    });

    const { data, isLoading } = useCandidates(filters);

    const candidates = data?.data || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / 25);

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Candidates</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage recruitment candidates and track their status.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => exportCandidatesToCSV(filters)}
                        disabled={isLoading || candidates.length === 0}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button onClick={() => router.push("/candidates/new")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Candidate
                    </Button>
                </div>
            </div>

            <Filters filters={filters} setFilters={setFilters} isAdmin={isAdmin} />

            <CandidateTable
                candidates={candidates}
                loading={isLoading}
                onDelete={() => { }} // Not implemented in list view for safety
            />

            {totalCount > 25 && (
                <div className="flex justify-center mt-6">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (filters.page > 1) handlePageChange(filters.page - 1);
                                    }}
                                    className={filters.page <= 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>

                            {/* Simple pagination: showing current page */}
                            <PaginationItem>
                                <PaginationLink isActive>{filters.page}</PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (filters.page < totalPages) handlePageChange(filters.page + 1);
                                    }}
                                    className={filters.page >= totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
            {/* Quick stats footer */}
            <div className="text-xs text-muted-foreground text-center">
                Showing {candidates.length} of {totalCount} candidates
            </div>
        </div>
    );
}
