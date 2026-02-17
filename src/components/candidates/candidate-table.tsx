"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { StatusBadge } from "./status-badge";
import { INDUSTRIES } from "@/lib/constants";
import { Ban, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // We need to install tooltip

interface CandidateTableProps {
    candidates: any[];
    loading: boolean;
    onDelete: (id: string) => void;
}

export function CandidateTable({ candidates, loading, onDelete }: CandidateTableProps) {
    const router = useRouter();

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading candidates...</div>;
    }

    if (candidates.length === 0) {
        return (
            <div className="border rounded-md p-12 text-center bg-muted/10">
                <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or create a new candidate.
                </p>
                <Button onClick={() => router.push("/candidates/new")}>
                    Add Candidate
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Full Name</TableHead>
                        <TableHead>National ID</TableHead>
                        <TableHead>Passport</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((candidate) => (
                        <TableRow
                            key={candidate.id}
                            className="cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => router.push(`/candidates/${candidate.id}`)}
                        >
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {candidate.is_blacklisted && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Ban className="h-4 w-4 text-destructive" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Blacklisted Candidate</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    {candidate.first_name} {candidate.last_name}
                                </div>
                            </TableCell>
                            <TableCell>{candidate.national_id}</TableCell>
                            <TableCell>{candidate.passport_number}</TableCell>
                            <TableCell>
                                {candidate.date_of_birth
                                    ? new Date().getFullYear() - new Date(candidate.date_of_birth).getFullYear()
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                {INDUSTRIES[candidate.primary_industry as keyof typeof INDUSTRIES] || candidate.primary_industry}
                            </TableCell>
                            <TableCell>{candidate.profession}</TableCell>
                            <TableCell>
                                <StatusBadge status={candidate.recruitment_status} />
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => router.push(`/candidates/${candidate.id}`)}
                                        title="View"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => router.push(`/candidates/${candidate.id}/edit`)}
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    {/* Delete is handled in detail view usually, but good to have here too with confirm */}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
