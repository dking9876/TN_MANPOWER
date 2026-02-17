"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { Pencil, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { format, isAfter, isBefore, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentFormSchema, DocumentFormValues } from "@/lib/validations/document-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface DocumentCardProps {
    document: any;
    onUpdate: (values: DocumentFormValues) => void;
    isUpdating: boolean;
}

export function DocumentCard({ document, onUpdate, isUpdating }: DocumentCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<DocumentFormValues>({
        resolver: zodResolver(documentFormSchema),
        defaultValues: {
            document_type: document.document_type,
            is_received: document.is_received,
            expiration_date: document.expiration_date || null,
            received_date: document.received_date || null,
            notes: document.notes || "",
        },
    });

    const isReceived = document.is_received;
    const expirationDate = document.expiration_date ? new Date(document.expiration_date) : null;
    const isExpired = expirationDate && isBefore(expirationDate, new Date());
    const isExpiringSoon = expirationDate && !isExpired && isBefore(expirationDate, addMonths(new Date(), 3));

    let statusColor = "bg-muted text-muted-foreground border-transparent";
    let StatusIcon = XCircle;

    if (isReceived) {
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
    }

    const onSubmit = (values: DocumentFormValues) => {
        onUpdate(values);
        setIsOpen(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium">
                        {DOCUMENT_TYPES[document.document_type as keyof typeof DOCUMENT_TYPES] || document.document_type}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {document.notes && <span className="italic">"{document.notes}"</span>}
                    </CardDescription>
                </div>
                <Badge variant="outline" className={cn("flex items-center gap-1", statusColor)}>
                    <StatusIcon className="h-3 w-3" />
                    {isReceived ? (isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Received") : "Missing"}
                </Badge>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="grid gap-1">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Received:</span>
                        <span>{document.received_date ? format(new Date(document.received_date), "PP") : "-"}</span>
                    </div>
                    {(document.document_type === "PASSPORT" || document.document_type === "VISA" || document.document_type === "POLICE_CLEARANCE" || document.expiration_date) && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires:</span>
                            <span className={isExpired ? "text-destructive font-medium" : ""}>
                                {document.expiration_date ? format(new Date(document.expiration_date), "PP") : "-"}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                            <Pencil className="mr-2 h-3 w-3" />
                            Update
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update {DOCUMENT_TYPES[document.document_type as keyof typeof DOCUMENT_TYPES]}</DialogTitle>
                            <DialogDescription>
                                Update the status and details of this document.
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="is_received"
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
                                                    Mark as Received
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="received_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Received Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        value={field.value || ""}
                                                        disabled={!form.watch("is_received")}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="expiration_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Expiration Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        value={field.value || ""}
                                                    // Require for Passport/Visa if received
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Any comments..." {...field} value={field.value || ""} />
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
        </Card>
    );
}
