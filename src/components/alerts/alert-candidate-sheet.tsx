"use client";

import { useCandidate, useChangeStatus, useUpdateCandidate } from "@/lib/hooks/use-candidates";
import { useCandidateDocumentsData } from "@/lib/hooks/use-candidate-documents";
import { useSystemConfig, useRecruitmentStatuses } from "@/lib/hooks/use-settings";
import { StatusBadge } from "@/components/candidates/status-badge";
import { Database } from "@/lib/supabase/types";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Phone,
    Mail,
    User,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Clock,
    ExternalLink,
    Loader2,
    Gift,
    FileWarning,
} from "lucide-react";
import { format, isBefore, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ResolveAlertDialog } from "./resolve-alert-dialog";
import { Tables } from "@/lib/supabase/types";

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

interface AlertCandidateSheetProps {
    alert: Tables<"alerts"> & { candidate?: { first_name: string; last_name: string } | null } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AlertCandidateSheet({ alert, open, onOpenChange }: AlertCandidateSheetProps) {
    const candidateId = alert?.candidate_id || null;
    const router = useRouter();
    const { data: candidate, isLoading: isLoadingCandidate } = useCandidate(candidateId || "");
    const { data: existingDocuments, isLoading: isLoadingDocs } = useCandidateDocumentsData(candidateId || "");
    const { data: config } = useSystemConfig();
    const { data: statuses } = useRecruitmentStatuses();
    const changeStatusMutation = useChangeStatus();
    const updateMutation = useUpdateCandidate();

    // Local state for status-specific field editing
    const [editingFields, setEditingFields] = useState<Record<string, any>>({});
    const [isDirty, setIsDirty] = useState(false);
    const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);

    // Reset editing fields when candidate changes
    useEffect(() => {
        if (candidate) {
            setEditingFields({
                interview_date: candidate.interview_date || "",
                visa_number: candidate.visa_number || "",
                visa_expiry_date: candidate.visa_expiry_date || "",
                insurance_purchased: candidate.insurance_purchased || false,
                insurance_purchase_date: candidate.insurance_purchase_date || "",
                flight_date: candidate.flight_date || "",
                flight_hour: candidate.flight_hour || "",
                flight_number: candidate.flight_number || "",
                connection_flight_date: candidate.connection_flight_date || "",
                connection_flight_hour: candidate.connection_flight_hour || "",
                connection_flight_number: candidate.connection_flight_number || "",
                arrival_date: candidate.arrival_date || "",
                referrer_got_paid: candidate.referrer_got_paid || false,
            });
            setIsDirty(false);
        }
    }, [candidate]);

    if (!candidateId || !alert) return null;

    const isLoading = isLoadingCandidate || isLoadingDocs;

    // Build merged documents list
    const requiredDocs: { type: CandidateDocumentType; label: string; country?: string }[] = [];
    if (candidate) {
        STANDARD_DOCUMENTS.forEach(docDef => {
            requiredDocs.push(docDef);
            if (docDef.type === 'POLICE_REPORT' && candidate.has_visited_other && candidate.countries_visited) {
                (candidate.countries_visited as string[]).forEach((country: string) => {
                    requiredDocs.push({ type: 'POLICE_REPORT', label: `Police Report (${country})`, country });
                });
            }
        });
    }

    const mergedDocuments = requiredDocs.map(reqDoc => {
        const existing = existingDocuments?.find((d: any) =>
            d.type === reqDoc.type &&
            (d.country === reqDoc.country || (!d.country && !reqDoc.country))
        );
        return {
            ...reqDoc,
            status: existing?.status || 'PENDING',
            expiration_date: existing?.expiration_date,
        };
    });

    const totalDocs = mergedDocuments.length;
    const submittedDocs = mergedDocuments.filter(d => d.status === 'SUBMITTED').length;
    const pendingDocs = mergedDocuments.filter(d => d.status === 'PENDING');
    const expiredOrExpiring = mergedDocuments.filter(d => {
        if (d.status === 'EXPIRED') return true;
        if (d.expiration_date) {
            const exp = new Date(d.expiration_date);
            const configKey = `${d.type}_warning_days`;
            const thresholdSetting = config?.find((c: any) => c.key === configKey)?.value;
            const warningDays = typeof thresholdSetting !== 'undefined' ? Number(thresholdSetting) : 90;
            if (warningDays > 0 && isBefore(exp, addDays(new Date(), warningDays))) return true;
            if (isBefore(exp, new Date())) return true;
        }
        return false;
    });
    const progress = totalDocs > 0 ? Math.round((submittedDocs / totalDocs) * 100) : 0;

    const handleStatusChange = (newStatus: string) => {
        if (!candidate || newStatus === candidate.recruitment_status) return;
        changeStatusMutation.mutate({
            candidateId: candidateId!,
            oldStatus: candidate.recruitment_status,
            newStatus,
        });
    };

    const handleFieldChange = (field: string, value: any) => {
        setEditingFields(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSaveFields = () => {
        if (!candidateId || !isDirty) return;
        updateMutation.mutate(
            { id: candidateId, values: editingFields },
            { onSuccess: () => setIsDirty(false) }
        );
    };

    const currentStatus = candidate?.recruitment_status || "";

    // Which status-specific fields to show
    const statusFieldsMap: Record<string, string[]> = {
        AWAITING_INTERVIEW: ["interview_date"],
        VISA_APPROVED: ["visa_number", "visa_expiry_date"],
        HEALTH_INSURANCE_PURCHASED: ["insurance_purchased", "insurance_purchase_date"],
        FLIGHT_TICKET_PURCHASED: ["flight_date", "flight_hour", "flight_number", "connection_flight_date", "connection_flight_hour", "connection_flight_number"],
        ARRIVED_IN_ISRAEL: ["arrival_date", "referrer_got_paid"],
    };

    const activeStatusFields = statusFieldsMap[currentStatus] || [];

    const fieldLabels: Record<string, string> = {
        interview_date: "Interview Date",
        visa_number: "Visa Number",
        visa_expiry_date: "Visa Expiry Date",
        insurance_purchased: "Insurance Purchased",
        insurance_purchase_date: "Purchase Date",
        flight_date: "Flight Date",
        flight_hour: "Flight Hour",
        flight_number: "Flight Number",
        connection_flight_date: "Connection Date",
        connection_flight_hour: "Connection Hour",
        connection_flight_number: "Connection Flight No.",
        arrival_date: "Arrival Date",
        referrer_got_paid: "Referrer Got Paid",
    };

    const booleanFields = ["insurance_purchased", "referrer_got_paid"];
    const dateFields = ["interview_date", "visa_expiry_date", "insurance_purchase_date", "flight_date", "connection_flight_date", "arrival_date"];
    const timeFields = ["flight_hour", "connection_flight_hour"];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg overflow-y-auto"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Loading Candidate</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-sm">Loading candidate details...</span>
                        </div>
                    </div>
                ) : !candidate ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Candidate Not Found</SheetTitle>
                        </SheetHeader>
                        Candidate not found
                    </div>
                ) : (
                    <>
                        <SheetHeader className="pb-2">
                            <SheetTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5 text-primary" />
                                {candidate.first_name} {candidate.last_name}
                            </SheetTitle>
                            <SheetDescription className="flex items-center gap-2">
                                <StatusBadge status={candidate.recruitment_status} />
                                <span className="text-xs font-mono text-muted-foreground">
                                    {candidate.passport_number}
                                </span>
                            </SheetDescription>
                        </SheetHeader>

                        <div className="flex-1 space-y-5 px-4 pb-6 overflow-y-auto">
                            <section className="bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30 p-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-500 mb-1 flex items-center gap-1.5">
                                            {alert.alert_type === "STALENESS" ? (
                                                <Clock className="h-3.5 w-3.5" />
                                            ) : alert.alert_type === "REFERRER_BONUS" ? (
                                                <Gift className="h-3.5 w-3.5" />
                                            ) : (
                                                <FileWarning className="h-3.5 w-3.5" />
                                            )}
                                            {alert.alert_type === "REFERRER_BONUS" ? "Referrer Bonus" : alert.alert_type} Alert
                                        </h3>
                                        <p className="text-sm text-foreground/90 leading-snug">
                                            {alert.alert_message}
                                        </p>
                                    </div>
                                    {alert.is_resolved && (
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-none font-medium text-xs shrink-0">
                                            Resolved
                                        </Badge>
                                    )}
                                </div>
                            </section>

                            {/* ─── 1. Contact Information ─── */}
                            <section>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5" />
                                    Contact Information
                                </h3>
                                <div className="bg-muted/30 rounded-xl border border-border/50 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Primary Phone</span>
                                        <a
                                            href={`tel:${candidate.primary_phone}`}
                                            className="text-sm font-medium font-mono text-primary hover:underline flex items-center gap-1"
                                        >
                                            <Phone className="h-3 w-3" />
                                            {candidate.primary_phone}
                                        </a>
                                    </div>
                                    {candidate.emergency_phone && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Alt / Emergency</span>
                                            <a
                                                href={`tel:${candidate.emergency_phone}`}
                                                className="text-sm font-medium font-mono text-foreground hover:text-primary transition-colors"
                                            >
                                                {candidate.emergency_phone}
                                            </a>
                                        </div>
                                    )}
                                    {candidate.email && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Email</span>
                                            <a
                                                href={`mailto:${candidate.email}`}
                                                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                            >
                                                <Mail className="h-3 w-3" />
                                                {candidate.email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <Separator className="bg-border/40" />

                            {/* ─── 2. Documents State ─── */}
                            <section>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5" />
                                    Documents ({submittedDocs}/{totalDocs})
                                </h3>

                                {/* Progress bar */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                        <span>{progress}% complete</span>
                                        <span>{pendingDocs.length} missing</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                progress === 100
                                                    ? "bg-emerald-500"
                                                    : progress >= 50
                                                        ? "bg-amber-500"
                                                        : "bg-rose-500"
                                            )}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Expiring / Expired documents (highlighted) */}
                                {expiredOrExpiring.length > 0 && (
                                    <div className="mb-3 space-y-1.5">
                                        <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Expiring / Expired
                                        </p>
                                        {expiredOrExpiring.map((doc, i) => (
                                            <div key={`exp-${i}`} className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-1.5 border border-amber-200/50 dark:border-amber-800/30">
                                                <span className="text-xs font-medium text-foreground">{doc.label}</span>
                                                <span className="text-[10px] text-amber-600 font-medium">
                                                    {doc.expiration_date ? format(new Date(doc.expiration_date), "MMM d, yyyy") : "Expired"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Missing documents (pending) */}
                                {pendingDocs.length > 0 && (
                                    <div className="mb-3 space-y-1.5">
                                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Missing Documents
                                        </p>
                                        {pendingDocs.map((doc, i) => (
                                            <div key={`pend-${i}`} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-1.5 border border-border/40">
                                                <span className="text-xs text-muted-foreground">{doc.label}</span>
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-muted text-muted-foreground border-transparent">
                                                    Pending
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Submitted documents */}
                                {submittedDocs > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Submitted ({submittedDocs})
                                        </p>
                                        {mergedDocuments
                                            .filter(d => d.status === 'SUBMITTED' && !expiredOrExpiring.includes(d))
                                            .map((doc, i) => (
                                                <div key={`sub-${i}`} className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/10 rounded-lg px-3 py-1.5 border border-emerald-200/30 dark:border-emerald-800/20">
                                                    <span className="text-xs text-foreground">{doc.label}</span>
                                                    {doc.expiration_date && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            Exp: {format(new Date(doc.expiration_date), "MMM d")}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </section>

                            <Separator className="bg-border/40" />

                            {/* ─── 3. Status & Status Details ─── */}
                            <section>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                    Status
                                </h3>

                                {/* Status changer */}
                                <div className="mb-4">
                                    <Select
                                        value={candidate.recruitment_status}
                                        onValueChange={handleStatusChange}
                                        disabled={changeStatusMutation.isPending}
                                    >
                                        <SelectTrigger className="w-full h-10">
                                            <SelectValue>
                                                <StatusBadge status={candidate.recruitment_status} />
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses?.map((s) => (
                                                <SelectItem key={s.name} value={s.name}>
                                                    <div className="flex items-center gap-2">
                                                        <StatusBadge status={s.name} className="text-xs" />
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status-specific fields */}
                                {activeStatusFields.length > 0 && (
                                    <div className="bg-muted/30 rounded-xl border border-border/50 p-4 space-y-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                            Status Details
                                        </p>
                                        {activeStatusFields.map(field => (
                                            <div key={field} className="space-y-1">
                                                <label className="text-xs text-muted-foreground">
                                                    {fieldLabels[field] || field}
                                                </label>
                                                {booleanFields.includes(field) ? (
                                                    <div className="flex items-center gap-2 h-9">
                                                        <Checkbox
                                                            checked={!!editingFields[field]}
                                                            onCheckedChange={(v) => handleFieldChange(field, !!v)}
                                                        />
                                                        <span className="text-sm">
                                                            {editingFields[field] ? "Yes" : "No"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Input
                                                        type={dateFields.includes(field) ? "date" : timeFields.includes(field) ? "time" : "text"}
                                                        value={editingFields[field] || ""}
                                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                                        className="h-9 text-sm"
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        {isDirty && (
                                            <Button
                                                size="sm"
                                                onClick={handleSaveFields}
                                                disabled={updateMutation.isPending}
                                                className="w-full mt-2"
                                            >
                                                {updateMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {activeStatusFields.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">
                                        No additional details for this status.
                                    </p>
                                )}
                            </section>

                            {/* Bottom action buttons */}
                            <div className="space-y-2">
                                {!alert.is_resolved && (
                                    <Button
                                        className="w-full gap-2 shadow-sm"
                                        onClick={() => setIsResolveDialogOpen(true)}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Resolve Alert
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => {
                                        onOpenChange(false);
                                        router.push(`/candidates/${candidateId}`);
                                    }}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    View Full Profile
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>

            {alert && isResolveDialogOpen && (
                <ResolveAlertDialog
                    open={isResolveDialogOpen}
                    onOpenChange={(open) => {
                        setIsResolveDialogOpen(open);
                        if (!open && alert.is_resolved) {
                            onOpenChange(false); // Close sheet if resolved
                        }
                    }}
                    alert={alert}
                />
            )}
        </Sheet>
    );
}
