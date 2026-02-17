"use client";

import { useCandidateDocuments, useUpdateDocument } from "@/lib/hooks/use-documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentCard } from "./document-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface DocumentListProps {
    candidateId: string;
}

export function DocumentList({ candidateId }: DocumentListProps) {
    const { data: documents, isLoading } = useCandidateDocuments(candidateId);
    const updateMutation = useUpdateDocument();

    if (isLoading) {
        return <div className="text-muted-foreground">Loading documents...</div>;
    }

    if (!documents || documents.length === 0) {
        return <div className="text-muted-foreground">No documents found. System error?</div>;
    }

    const handleUpdate = (id: string, values: any) => {
        updateMutation.mutate({ id, candidateId, values });
    };

    // Calculate status summary
    const total = documents.length;
    const received = documents.filter((d: any) => d.is_received).length;
    const progress = Math.round((received / total) * 100);

    return (
        <div className="space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Document Status</AlertTitle>
                <AlertDescription>
                    {received} of {total} documents received ({progress}% complete).
                </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
                {documents.map((doc: any) => (
                    <DocumentCard
                        key={doc.id}
                        document={doc}
                        onUpdate={(values) => handleUpdate(doc.id, values)}
                        isUpdating={updateMutation.isPending}
                    />
                ))}
            </div>
        </div>
    );
}
