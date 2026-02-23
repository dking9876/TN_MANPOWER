"use client";

import { useCandidate, useDeleteCandidate, useLogActivity, useChangeStatus, useStatusHistory } from "@/lib/hooks/use-candidates";
import { useRecruitmentStatuses } from "@/lib/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./status-badge";
import { CandidateDocumentsTab } from "./candidate-documents-tab";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pencil,
    Trash2,
    History,
    ArrowLeft,
    Ban,
    User,
    Calendar,
    Phone,
    MapPin,
    Briefcase,
    Info,
    Clock,
    ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { INDUSTRIES, ENGLISH_LEVELS } from "@/lib/constants";

interface CandidateDetailProps {
    id: string;
}

export function CandidateDetail({ id }: CandidateDetailProps) {
    const router = useRouter();
    const { data: candidate, isLoading, error } = useCandidate(id);
    const deleteMutation = useDeleteCandidate();
    const logActivityMutation = useLogActivity();
    const changeStatusMutation = useChangeStatus();
    const { data: statuses } = useRecruitmentStatuses();
    const { data: statusHistory } = useStatusHistory(id);

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading candidate details...</div>;
    if (error || !candidate) return <div className="p-8 text-center text-destructive">Error loading candidate.</div>;

    const handleDelete = async () => {
        await deleteMutation.mutateAsync(id);
        router.push("/candidates");
    };

    const handleLogActivity = () => {
        logActivityMutation.mutate(id);
    };

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === candidate.recruitment_status) return;
        changeStatusMutation.mutate({
            candidateId: id,
            oldStatus: candidate.recruitment_status,
            newStatus,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push("/candidates")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {candidate.first_name} {candidate.last_name}
                            {candidate.is_blacklisted && (
                                <Badge variant="destructive" className="ml-2 gap-1 px-2">
                                    <Ban className="h-3 w-3" /> Blacklisted
                                </Badge>
                            )}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <span className="font-mono">{candidate.national_id}</span>
                            <span>•</span>
                            <span>{candidate.passport_number}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Status dropdown */}
                    <Select
                        value={candidate.recruitment_status}
                        onValueChange={handleStatusChange}
                        disabled={changeStatusMutation.isPending}
                    >
                        <SelectTrigger className="w-[220px] h-9">
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
                    <Button onClick={() => router.push(`/candidates/${id}/edit`)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" onClick={handleLogActivity}>
                        <History className="mr-2 h-4 w-4" /> Log Activity
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the candidate and all associated documents and logs.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Personal Info */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Personal Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Date of Birth:</span>
                                    <span>
                                        {candidate.date_of_birth ? format(new Date(candidate.date_of_birth), "PP") : "-"}
                                        {candidate.date_of_birth && ` (Age: ${new Date().getFullYear() - new Date(candidate.date_of_birth).getFullYear()})`}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="font-mono">{candidate.primary_phone}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Alt Phone:</span>
                                    <span className="font-mono">{candidate.emergency_phone}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span>{candidate.email || "-"}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Professional Info */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Professional</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Industry:</span>
                                    <span>{INDUSTRIES[candidate.primary_industry as keyof typeof INDUSTRIES] || candidate.primary_industry}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Profession:</span>
                                    <span>{candidate.profession}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Company:</span>
                                    <span>{candidate.companies?.name || <span className="text-muted-foreground italic">Unassigned</span>}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">English Level:</span>
                                    <span>{ENGLISH_LEVELS[candidate.english_level as keyof typeof ENGLISH_LEVELS] || candidate.english_level}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Visited Other Countries:</span>
                                    <span className={candidate.has_visited_other ? "text-amber-600 font-medium" : ""}>
                                        {candidate.has_visited_other ? "Yes" : "No"}
                                    </span>
                                </div>
                                {candidate.has_visited_other && candidate.countries_visited && (
                                    <div className="col-span-2 mt-2 p-2 bg-muted rounded-md text-xs">
                                        <span className="font-semibold">Countries:</span> {candidate.countries_visited.join(", ")}
                                    </div>
                                )}
                                <Separator className="col-span-2 my-2" />
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Referrer:</span>
                                    <span>{candidate.referrer?.full_name || <span className="text-muted-foreground italic">None</span>}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Physical Info */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Physical</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Height:</span>
                                    <span>{candidate.height ? `${candidate.height} cm` : "-"}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Weight:</span>
                                    <span>{candidate.weight ? `${candidate.weight} kg` : "-"}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Shoe Size:</span>
                                    <span>{candidate.shoe_size || "-"}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Pants Size:</span>
                                    <span>{candidate.pants_size || "-"}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground block mb-1">Allergies/Notes:</span>
                                    <p className="p-2 bg-muted rounded-md text-xs min-h-[40px]">
                                        {candidate.allergies || "None"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Details */}
                        {(candidate.interview_date || candidate.visa_number || candidate.visa_expiry_date ||
                            candidate.insurance_purchased || candidate.insurance_purchase_date ||
                            candidate.flight_date || candidate.flight_number ||
                            candidate.arrival_date || candidate.referrer_got_paid) && (
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <CardTitle className="text-lg">Status Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 text-sm">
                                        {candidate.interview_date && (
                                            <div className="grid grid-cols-2">
                                                <span className="text-muted-foreground">Interview Date:</span>
                                                <span>{format(new Date(candidate.interview_date), "PP")}</span>
                                            </div>
                                        )}
                                        {candidate.visa_number && (
                                            <div className="grid grid-cols-2">
                                                <span className="text-muted-foreground">Visa Number:</span>
                                                <span className="font-mono">{candidate.visa_number}</span>
                                            </div>
                                        )}
                                        {candidate.visa_expiry_date && (
                                            <div className="grid grid-cols-2">
                                                <span className="text-muted-foreground">Visa Expiry:</span>
                                                <span>{format(new Date(candidate.visa_expiry_date), "PP")}</span>
                                            </div>
                                        )}
                                        {candidate.insurance_purchased && (
                                            <div className="grid grid-cols-2">
                                                <span className="text-muted-foreground">Insurance:</span>
                                                <span className="text-green-600 font-medium">Purchased{candidate.insurance_purchase_date ? ` (${format(new Date(candidate.insurance_purchase_date), "PP")})` : ""}</span>
                                            </div>
                                        )}
                                        {candidate.flight_date && (
                                            <>
                                                <div className="grid grid-cols-2">
                                                    <span className="text-muted-foreground">Flight:</span>
                                                    <span>
                                                        {format(new Date(candidate.flight_date), "PP")}
                                                        {candidate.flight_hour ? ` at ${candidate.flight_hour}` : ""}
                                                        {candidate.flight_number ? ` — ${candidate.flight_number}` : ""}
                                                    </span>
                                                </div>
                                                {candidate.connection_flight_date && (
                                                    <div className="grid grid-cols-2">
                                                        <span className="text-muted-foreground">Connection:</span>
                                                        <span>
                                                            {format(new Date(candidate.connection_flight_date), "PP")}
                                                            {candidate.connection_flight_hour ? ` at ${candidate.connection_flight_hour}` : ""}
                                                            {candidate.connection_flight_number ? ` — ${candidate.connection_flight_number}` : ""}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {candidate.arrival_date && (
                                            <div className="grid grid-cols-2">
                                                <span className="text-muted-foreground">Arrival Date:</span>
                                                <span className="text-green-600 font-medium">{format(new Date(candidate.arrival_date), "PP")}</span>
                                            </div>
                                        )}
                                        {candidate.referrer_got_paid !== null && candidate.referrer_got_paid !== undefined && (
                                            <div className="grid grid-cols-2">
                                                <span className="text-muted-foreground">Referrer Paid:</span>
                                                <span className={candidate.referrer_got_paid ? "text-green-600 font-medium" : "text-amber-600"}>
                                                    {candidate.referrer_got_paid ? "Yes" : "No"}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                        {/* System Info */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                                <Info className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">System Info</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2 text-xs text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Created By:</span>
                                    <span>{candidate.creator?.full_name || "System"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Created At:</span>
                                    <span>{format(new Date(candidate.created_at), "PPP p")}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between">
                                    <span>Last Updated By:</span>
                                    <span>{candidate.updater?.full_name || "System"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Last Updated At:</span>
                                    <span className="font-medium text-foreground">{format(new Date(candidate.last_updated_at), "PPP p")}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                    <CandidateDocumentsTab candidateId={id} />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                Status Change History
                            </CardTitle>
                            <CardDescription>
                                Timeline of all recruitment status changes for this candidate
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!statusHistory || statusHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No status changes recorded yet. Changes will appear here when the status is updated.
                                </p>
                            ) : (
                                <div className="relative space-y-0">
                                    {/* Timeline line */}
                                    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                                    {statusHistory.map((entry: any, i: number) => (
                                        <div key={entry.id} className="relative flex items-start gap-4 py-3">
                                            {/* Timeline dot */}
                                            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {entry.old_status && (
                                                        <>
                                                            <StatusBadge status={entry.old_status} className="text-xs" />
                                                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        </>
                                                    )}
                                                    <StatusBadge status={entry.new_status} className="text-xs" />
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <span>
                                                        by <span className="font-medium text-foreground">{entry.changer?.full_name || "System"}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span>{format(new Date(entry.changed_at), "PPP p")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
