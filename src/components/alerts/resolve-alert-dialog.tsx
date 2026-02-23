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
import { Gift } from "lucide-react";
import { format } from "date-fns";
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

    const form = useForm<AlertResolutionValues>({
        resolver: zodResolver(alertResolutionSchema) as any,
        defaultValues: {
            resolution_notes: "",
            update_last_updated_at: true,
        },
    });

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
