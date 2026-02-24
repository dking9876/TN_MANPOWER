"use client";

import { useCandidate } from "@/lib/hooks/use-candidates";
import { useCandidateDocumentsData, useUpsertCandidateDocument, UpsertDocumentPayload } from "@/lib/hooks/use-candidate-documents";
import { useCurrentUser } from "@/lib/hooks/use-users";
import { useSystemConfig } from "@/lib/hooks/use-settings";
import { Database } from "@/lib/supabase/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Pencil, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateDocumentFormSchema, CandidateDocumentFormValues } from "@/lib/validations/candidate-document-schema";
import { cn } from "@/lib/utils";
import { format, isBefore, addDays } from "date-fns";

type CandidateDocumentType = Database["public"]["Enums"]["candidate_document_type"];

const STANDARD_DOCUMENTS: { type: CandidateDocumentType; label: string }[] = [
    { type: 'PASSPORT_COPIES', label: 'Passport Copies' },
    { type: 'IMMIGRATION_LETTER_COPIES', label: 'Immigration Letter Copies' },
    { type: 'ORIGINAL_IMMIGRATION_LETTER', label: 'Original Immigration Letter' },
    { type: 'RED_RIBBON_DOCUMENT', label: 'Red Ribbon Document' },
    { type: 'VISA_APPLICATION_FORM', label: 'Visa Application Form' },
    { type: 'MEDICAL_REPORT', label: 'Medical Report' },
    { type: 'POLICE_REPORT', label: 'Police Report (Home)' },
    { type: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
    { type: 'GS_CERTIFICATE', label: 'GS Certificate' },
    { type: 'PERSONAL_AFFIDAVIT', label: 'Personal Affidavit' },
    { type: 'NIC_COPY_APPLICANT_AND_SPOUSE', label: 'NIC Copy (Applicant & Spouse)' },
    { type: 'ENGLISH_AGREEMENT', label: 'English Agreement' },
    { type: 'LETTER_FROM_TRANSLATOR', label: 'Letter From Translator' },
    { type: 'SINHALA_AGREEMENT', label: 'Sinhala Agreement' },
    { type: 'NIC_APPLICANT_AND_CANDIDATE', label: 'NIC Applicant & Candidate' },
];

interface CandidateDocumentsTabProps {
    candidateId: string;
}

export function CandidateDocumentsTab({ candidateId }: CandidateDocumentsTabProps) {
    const { data: candidate, isLoading: isLoadingCandidate } = useCandidate(candidateId);
    const { data: existingDocuments, isLoading: isLoadingDocs } = useCandidateDocumentsData(candidateId);
    const { data: config, isLoading: isLoadingConfig } = useSystemConfig();
    const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
    const upsertMutation = useUpsertCandidateDocument();

    const isReferrer = currentUser?.role === "REFERRER";

    if (isLoadingCandidate || isLoadingDocs || isLoadingConfig || isLoadingUser) {
        return <div className="text-muted-foreground p-8 text-center">Loading documents...</div>;
    }

    if (!candidate) {
        return <div className="text-destructive p-8 text-center">Candidate not found.</div>;
    }

    // Compute required documents list
    const requiredDocs: { type: CandidateDocumentType; label: string; country?: string }[] = [];

    STANDARD_DOCUMENTS.forEach(docDef => {
        requiredDocs.push(docDef);

        // Dynamic police reports for visited countries
        if (docDef.type === 'POLICE_REPORT' && candidate.has_visited_other && candidate.countries_visited) {
            candidate.countries_visited.forEach((country: string) => {
                requiredDocs.push({
                    type: 'POLICE_REPORT',
                    label: `Police Report (${country})`,
                    country: country
                });
            });
        }
    });

    // Merge required documents with existing database records
    const mergedDocuments = requiredDocs.map(reqDoc => {
        const existing = existingDocuments?.find(d =>
            d.type === reqDoc.type &&
            (d.country === reqDoc.country || (!d.country && !reqDoc.country))
        );

        return {
            ...reqDoc,
            id: existing?.id,
            status: existing?.status || 'PENDING',
            expiration_date: existing?.expiration_date,
            notes: existing?.notes,
        };
    });

    const total = mergedDocuments.length;
    const submittedOrVerified = mergedDocuments.filter(d => d.status === 'SUBMITTED').length; // PENDING and EXPIRED do not count towards progress
    const progress = total > 0 ? Math.round((submittedOrVerified / total) * 100) : 0;

    return (
        <div className="space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Document Status</AlertTitle>
                <AlertDescription>
                    {submittedOrVerified} of {total} documents submitted ({progress}% complete).
                </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mergedDocuments.map((doc, idx) => (
                    <CandidateDocumentCard
                        key={`${doc.type}-${doc.country || 'none'}-${idx}`}
                        document={doc}
                        candidateId={candidateId}
                        onUpsert={(payload: UpsertDocumentPayload) => upsertMutation.mutate(payload)}
                        isUpdating={upsertMutation.isPending}
                        config={config}
                        isReferrer={isReferrer}
                    />
                ))}
            </div>
        </div>
    );
}

function CandidateDocumentCard({ document, candidateId, onUpsert, isUpdating, config, isReferrer }: any) {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<CandidateDocumentFormValues>({
        resolver: zodResolver(candidateDocumentFormSchema),
        defaultValues: {
            status: (document.status === 'EXPIRED' ? 'SUBMITTED' : document.status) as "PENDING" | "SUBMITTED",
            expiration_date: document.expiration_date || "",
            notes: document.notes || "",
        },
    });

    const status = document.status;
    const expirationDate = document.expiration_date ? new Date(document.expiration_date) : null;
    const isExpired = status === 'EXPIRED' || (expirationDate && isBefore(expirationDate, new Date()));

    // Dynamic calculation of threshold
    const configKey = `${document.type}_warning_days`;
    const thresholdSetting = config?.find((c: any) => c.key === configKey)?.value;
    const warningDays = typeof thresholdSetting !== 'undefined' ? Number(thresholdSetting) : 90;

    // If warningDays is 0, it means the document never expires (from alert perspective)
    const isExpiringSoon = warningDays > 0 && expirationDate && !isExpired && isBefore(expirationDate, addDays(new Date(), warningDays));

    let statusColor = "bg-muted text-muted-foreground border-transparent";
    let StatusIcon = Clock;

    if (status === 'SUBMITTED') {
        if (isExpired) {
            statusColor = "bg-destructive/10 text-destructive border-destructive/20";
            StatusIcon = AlertTriangle;
        } else if (isExpiringSoon) {
            statusColor = "bg-amber-100 text-amber-700 border-amber-200";
            StatusIcon = AlertTriangle;
        } else {
            statusColor = "bg-green-100 text-green-700 border-green-200";
            StatusIcon = CheckCircle2;
        }
    } else if (status === 'EXPIRED' || isExpired) {
        statusColor = "bg-destructive/10 text-destructive border-destructive/20";
        StatusIcon = AlertTriangle;
    }

    const onSubmit = (values: CandidateDocumentFormValues) => {
        onUpsert({
            id: document.id,
            candidate_id: candidateId,
            type: document.type,
            country: document.country,
            ...values
        });
        setIsOpen(false);
    };

    return (
        <Card className={cn("transition-all duration-200 hover:shadow-md", status === 'PENDING' ? "opacity-75 relative bg-muted/30" : "")}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-semibold max-w-[180px] leading-tight flex items-start">
                        {document.label}
                    </CardTitle>
                    {document.notes && <CardDescription className="text-xs italic line-clamp-1" title={document.notes}>"{document.notes}"</CardDescription>}
                </div>
                <Badge variant="outline" className={cn("flex items-center gap-1 shrink-0 text-[10px] px-1.5 py-0 h-5", statusColor)}>
                    <StatusIcon className="h-3 w-3" />
                    {status === 'SUBMITTED' ? (isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Submitted") : status === 'EXPIRED' ? 'Expired' : 'Pending'}
                </Badge>
            </CardHeader>
            <CardContent className="text-sm pb-2 min-h-[40px]">
                {document.expiration_date && (
                    <div className={cn("flex justify-between items-center bg-background/50 rounded-sm px-2 py-1", isExpiringSoon && "bg-amber-50 dark:bg-amber-950/20")}>
                        <span className="text-muted-foreground text-xs">Expires:</span>
                        <div className="flex items-center gap-1.5">
                            {isExpiringSoon && <AlertTriangle className="h-3 w-3 text-amber-500 animate-pulse" />}
                            <span className={cn("text-xs", isExpired ? "text-destructive font-bold" : isExpiringSoon ? "text-amber-600 font-semibold" : "")}>
                                {format(new Date(document.expiration_date), "PP")}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
            {!isReferrer && (
                <CardFooter className="pt-2 pb-3 px-4">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                                <Pencil className="mr-2 h-3 w-3" />
                                Update
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update {document.label}</DialogTitle>
                                <DialogDescription>
                                    Set the status and supply expiration details if applicable.
                                </DialogDescription>
                            </DialogHeader>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="expiration_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Expiration Date (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Any comments or file references..." {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={isUpdating}>Save Changes</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            )}
        </Card>
    );
}
