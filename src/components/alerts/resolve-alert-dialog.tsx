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
import { FileWarning, CheckCircle2 } from "lucide-react";
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
                    <DialogTitle>Resolve Alert</DialogTitle>
                    <DialogDescription>
                        Provide notes on how this alert was resolved.
                    </DialogDescription>
                </DialogHeader>

                <div className="text-sm bg-muted p-3 rounded-md">
                    <span className="font-semibold">Alert:</span> {alert.alert_message}
                </div>

                {/* Candidate File Status Section */}
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
                                    <Alert key={doc.id} variant={isError ? "destructive" : "default"} className={!isError ? "border-amber-200 bg-amber-50 text-amber-800" : ""}>
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

                            <div className="text-sm font-medium text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 mt-2 flex items-start gap-2">
                                <FileWarning className="w-4 h-4 mt-0.5 shrink-0" />
                                <p><strong>Reminder:</strong> Please discuss these expiring/missing documents with the candidate!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>All required documents are received and valid.</span>
                        </div>
                    )}
                </div>

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

                        <FormField<AlertResolutionValues>
                            control={form.control}
                            name="update_last_updated_at"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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
