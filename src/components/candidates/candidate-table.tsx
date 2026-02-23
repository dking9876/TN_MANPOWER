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
        <div className="overflow-x-auto pb-6">
            <Table className="border-collapse w-full min-w-[1000px]">
                <TableHeader>
                    <TableRow className="border-b-4 border-foreground hover:bg-transparent">
                        <TableHead className="text-sm font-medium text-foreground h-14">Full Name</TableHead>
                        <TableHead className="text-sm font-medium text-foreground h-14">National ID</TableHead>
                        <TableHead className="text-sm font-medium text-foreground h-14">Passport</TableHead>
                        <TableHead className="text-sm font-medium text-foreground h-14">Age</TableHead>
                        <TableHead className="text-sm font-medium text-foreground h-14">Industry</TableHead>
                        <TableHead className="text-sm font-medium text-foreground h-14">Profession</TableHead>
                        <TableHead className="text-sm font-medium text-foreground h-14">Company</TableHead>
                        <TableHead className="text-sm font-medium text-foreground h-14">Status</TableHead>
                        <TableHead className="text-sm font-medium text-foreground h-14">Last Updated</TableHead>
                        <TableHead className="text-sm font-medium text-foreground h-14 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="animate-in fade-in duration-500">
                    {candidates.map((candidate, index) => (
                        <TableRow
                            key={candidate.id}
                            className="group transition-all duration-300 border-b-2 border-border/50 hover:border-foreground hover:bg-muted/10 cursor-pointer relative z-0 hover:z-10 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.05)]"
                            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                            onClick={() => router.push(`/candidates/${candidate.id}`)}
                        >
                            <TableCell className="py-5 font-medium text-foreground text-sm group-hover:underline decoration-2 underline-offset-4">
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
                            <TableCell className="py-5 font-medium text-foreground text-sm">{candidate.national_id}</TableCell>
                            <TableCell className="py-5 font-medium text-foreground text-sm">{candidate.passport_number}</TableCell>
                            <TableCell className="py-5 font-medium text-foreground text-sm">
                                {candidate.date_of_birth
                                    ? new Date().getFullYear() - new Date(candidate.date_of_birth).getFullYear()
                                    : "-"}
                            </TableCell>
                            <TableCell className="py-5 font-medium text-foreground text-sm">
                                {INDUSTRIES[candidate.primary_industry as keyof typeof INDUSTRIES] || candidate.primary_industry}
                            </TableCell>
                            <TableCell className="py-5 font-medium text-foreground text-sm">{candidate.profession}</TableCell>
                            <TableCell className="py-5 font-medium text-foreground text-sm">
                                {candidate.companies?.name || <span>-</span>}
                            </TableCell>
                            <TableCell className="py-5">
                                <StatusBadge status={candidate.recruitment_status} />
                            </TableCell>
                            <TableCell className="py-5 text-foreground font-medium text-sm whitespace-nowrap">
                                {candidate.last_updated_at ? format(new Date(candidate.last_updated_at), "dd MMM yy, HH:mm") : "-"}
                            </TableCell>
                            <TableCell className="py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                        onClick={() => router.push(`/candidates/${candidate.id}`)}
                                        title="View"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                        onClick={() => router.push(`/candidates/${candidate.id}/edit`)}
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
