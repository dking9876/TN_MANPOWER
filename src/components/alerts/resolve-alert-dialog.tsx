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
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alertResolutionSchema, AlertResolutionValues } from "@/lib/validations/alert-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ResolveAlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    alert: any;
}

export function ResolveAlertDialog({ open, onOpenChange, alert }: ResolveAlertDialogProps) {
    const resolveMutation = useResolveAlert();
    const form = useForm<AlertResolutionValues>({
        resolver: zodResolver(alertResolutionSchema),
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

                <div className="text-sm bg-muted p-3 rounded-md mb-2">
                    <span className="font-semibold">Alert:</span> {alert.alert_message}
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="resolution_notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resolution Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Contacted candidate, updated status..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="update_last_updated_at"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Reset Staleness Timer
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Updates candidate's "Last Updated" timestamp to now.
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
