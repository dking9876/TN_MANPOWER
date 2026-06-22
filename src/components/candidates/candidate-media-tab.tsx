"use client";

import { useState, useEffect } from "react";
import { useCandidateMedia, useDeleteCandidateMedia } from "@/lib/hooks/use-media";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Loader2 } from "lucide-react";

interface CandidateMediaTabProps {
    candidateId: string;
}

export function CandidateMediaTab({ candidateId }: CandidateMediaTabProps) {
    const { data: media, isLoading } = useCandidateMedia(candidateId);
    
    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading media...</div>;
    
    if (!media || media.length === 0) return <div className="p-8 text-center text-muted-foreground">No media found for this candidate.</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {media.map((item: any) => (
                <MediaItem key={item.id} item={item} />
            ))}
        </div>
    );
}

function MediaItem({ item }: { item: any }) {
    const [url, setUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const deleteMutation = useDeleteCandidateMedia();

    useEffect(() => {
        let cancelled = false;
        const fetchUrl = async () => {
            const supabase = createClient();
            const { data } = await supabase.storage.from('candidate-media').createSignedUrl(item.storage_path, 3600);
            if (!cancelled) {
                if (data?.signedUrl) {
                    setUrl(data.signedUrl);
                }
                setIsLoading(false);
            }
        };
        fetchUrl();
        return () => { cancelled = true; };
    }, [item.storage_path]);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this media?")) {
            await deleteMutation.mutateAsync({
                id: item.id,
                storage_path: item.storage_path,
                candidate_id: item.candidate_id,
            });
        }
    };

    const handleDownload = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase.storage.from('candidate-media').createSignedUrl(item.storage_path, 60, {
                download: item.original_name || item.title || true
            });
            
            if (error) throw error;
            
            if (data?.signedUrl) {
                const a = document.createElement('a');
                a.href = data.signedUrl;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error("Download failed", err);
            if (url) window.open(url, '_blank');
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0 aspect-video relative flex items-center justify-center bg-muted">
                {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : url ? (
                    item.file_type === 'video' ? (
                        <video src={url} controls className="w-full h-full object-cover" />
                    ) : (
                        <img src={url} alt={item.title} className="w-full h-full object-cover" />
                    )
                ) : (
                    <div className="text-muted-foreground text-sm">Failed to load media</div>
                )}
            </CardContent>
            <CardFooter className="p-4 flex items-center justify-between">
                <span className="font-semibold text-sm truncate mr-2" title={item.title}>{item.title || item.original_name}</span>
                <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="icon" onClick={handleDownload} title="Download">
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteMutation.isPending} title="Delete">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
