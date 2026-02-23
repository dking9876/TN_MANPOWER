"use client";

import { useResolveAlert } from "@/lib/hooks/use-alerts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCandidateDocuments } from "@/lib/hooks/use-documents";
import { FileWarning, CheckCircle2, Gift } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alertResolutionSchema, AlertResolutionValues } from "@/lib/validations/alert-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tables } from "@/lib/supabase/types";

interface ResolveAlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    alert: Tables<"alerts"> & { candidate?: { first_name: string; last_name: string } | null };
}

export function ResolveAlertDialog({ open, onOpenChange, alert }: ResolveAlertDialogProps) {
    const resolveMutation = useResolveAlert();
    const { data: documents, isLoading: docsLoading } = useCandidateDocuments(alert.candidate_id || "");

    const form = useForm<AlertResolutionValues>({
        resolver: zodResolver(alertResolutionSchema) as any,
        defaultValues: {
            resolution_notes: "",
            update_last_updated_at: true,
        },
    });

    const expiringOrMissingDocs = documents?.filter(doc => {
        if (!doc.is_received) return true;
        if (!doc.expiration_date) return false;

        const daysUntilExpiration = differenceInDays(new Date(doc.expiration_date), new Date());
        return daysUntilExpiration <= 30;
    }) || [];

    const onSubmit = async (values: AlertResolutionValues) => {
        try {
            await resolveMutation.mutateAsync({
                id: alert.id,
                notes: values.resolution_notes,
                updateTimestamp: values.update_last_updated_at,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            // Handled by mutation
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {alert.alert_type === "REFERRER_BONUS" ? "Confirm Bonus Payment" : "Resolve Alert"}
                    </DialogTitle>
                    <DialogDescription>
                        {alert.alert_type === "REFERRER_BONUS"
                            ? "Confirm that the referrer bonus has been paid. This will mark the referrer as paid."
                            : "Provide notes on how this alert was resolved."}
                    </DialogDescription>
                </DialogHeader>

                <div className="text-sm bg-muted/50 p-3 rounded-lg border border-border/50">
                    <span className="font-semibold text-foreground">Alert:</span> <span className="text-muted-foreground">{alert.alert_message}</span>
                </div>

                {/* Referrer Bonus confirmation banner */}
                {alert.alert_type === "REFERRER_BONUS" && (
                    <div className="flex items-start gap-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                        <Gift className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">Bonus Payment Required</p>
                            <p className="text-xs mt-1 text-emerald-600/80 dark:text-emerald-400/80">
                                Resolving this alert will automatically mark the referrer as paid in the candidate&apos;s profile.
                            </p>
                        </div>
                    </div>
                )}

                {/* Candidate File Status Section (hide for bonus alerts) */}
                {alert.alert_type !== "REFERRER_BONUS" && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold border-b pb-1">Candidate File Status</h4>

                        {docsLoading ? (
                            <div className="text-sm text-muted-foreground animate-pulse">Loading documents...</div>
                        ) : expiringOrMissingDocs.length > 0 ? (
                            <div className="space-y-2">
                                {expiringOrMissingDocs.map((doc) => {
                                    let statusText = "";
                                    let isError = false;

                                    if (!doc.is_received) {
                                        statusText = "Missing completely";
                                        isError = true;
                                    } else if (doc.expiration_date) {
                                        const days = differenceInDays(new Date(doc.expiration_date), new Date());
                                        if (days < 0) {
                                            statusText = `Expired ${Math.abs(days)} days ago`;
                                            isError = true;
                                        } else {
                                            statusText = `Expiring in ${days} days`;
                                        }
                                    }

                                    return (
                                        <Alert key={doc.id} variant={isError ? "destructive" : "default"} className={!isError ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400" : ""}>
                                            <FileWarning className="h-4 w-4" />
                                            <AlertTitle className="text-xs font-semibold">{doc.document_type}</AlertTitle>
                                            <AlertDescription className="text-xs flex justify-between items-center">
                                                <span>{statusText}</span>
                                                {doc.expiration_date && (
                                                    <span className="opacity-80 block text-right mt-1">({format(new Date(doc.expiration_date), "MMM d, yyyy")})</span>
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    );
                                })}

                                <div className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 mt-3 flex items-start gap-2">
                                    <FileWarning className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p><strong>Reminder:</strong> Please discuss these expiring/missing documents with the candidate!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>All required documents are received and valid.</span>
                            </div>
                        )}
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField<AlertResolutionValues>
                            control={form.control}
                            name="resolution_notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resolution Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Contacted candidate, updated status..." {...field} value={(field.value as string) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Hide staleness timer for bonus alerts */}
                        {alert.alert_type !== "REFERRER_BONUS" && (
                            <FormField<AlertResolutionValues>
                                control={form.control}
                                name="update_last_updated_at"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40 cursor-pointer">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value as boolean}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Reset Staleness Timer
                                            </FormLabel>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Updates candidate&apos;s &quot;Last Updated&quot; timestamp to now.
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={resolveMutation.isPending}>
                                {resolveMutation.isPending ? "Resolving..." : "Resolve Alert"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
