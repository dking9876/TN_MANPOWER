"use client";

import { useState, useEffect } from "react";
import { useRecruitmentStatuses, useAddStatus, useDeleteStatus, useUpdateStatusesOrder } from "@/lib/hooks/use-settings";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Loader2, GripVertical } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const COLOR_OPTIONS = [
    { value: "bg-slate-100 text-slate-700 border-slate-200", label: "Gray", preview: "bg-slate-400" },
    { value: "bg-blue-100 text-blue-700 border-blue-200", label: "Blue", preview: "bg-blue-400" },
    { value: "bg-indigo-100 text-indigo-700 border-indigo-200", label: "Indigo", preview: "bg-indigo-400" },
    { value: "bg-purple-100 text-purple-700 border-purple-200", label: "Purple", preview: "bg-purple-400" },
    { value: "bg-amber-100 text-amber-700 border-amber-200", label: "Amber", preview: "bg-amber-400" },
    { value: "bg-teal-100 text-teal-700 border-teal-200", label: "Teal", preview: "bg-teal-400" },
    { value: "bg-cyan-100 text-cyan-700 border-cyan-200", label: "Cyan", preview: "bg-cyan-400" },
    { value: "bg-sky-100 text-sky-700 border-sky-200", label: "Sky", preview: "bg-sky-400" },
    { value: "bg-green-100 text-green-700 border-green-200", label: "Green", preview: "bg-green-400" },
    { value: "bg-rose-100 text-rose-700 border-rose-200", label: "Rose", preview: "bg-rose-400" },
    { value: "bg-orange-100 text-orange-700 border-orange-200", label: "Orange", preview: "bg-orange-400" },
    { value: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Emerald", preview: "bg-emerald-400" },
    { value: "bg-destructive/10 text-destructive border-destructive/20", label: "Red (Danger)", preview: "bg-red-400" },
];

function SortableStatusItem({ status, deleteMutation }: { status: any, deleteMutation: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: status.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: isDragging ? "relative" : undefined,
    } as React.CSSProperties;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between gap-3 rounded-lg border p-3 bg-card transition-colors ${isDragging ? "shadow-md opacity-90 border-primary" : "hover:bg-muted/50"
                }`}
        >
            <div className="flex items-center gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing hover:bg-muted p-1 rounded touch-none"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground/60 transition-colors hover:text-foreground" />
                </button>
                <Badge
                    variant="outline"
                    className={`font-medium border px-2 py-0.5 whitespace-nowrap ${status.color}`}
                >
                    {status.label}
                </Badge>
                {status.is_default && (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Default
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                    {status.name}
                </span>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={status.is_default}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Status?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will delete &ldquo;{status.label}&rdquo;. This is blocked if any candidates currently have this status.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteMutation.mutate(status.id)}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

export function StatusesSection() {
    const { data: dbStatuses, isLoading } = useRecruitmentStatuses();
    const addMutation = useAddStatus();
    const deleteMutation = useDeleteStatus();
    const updateOrderMutation = useUpdateStatusesOrder();

    const [statuses, setStatuses] = useState<any[]>([]);
    const [newLabel, setNewLabel] = useState("");
    const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].value);

    // Sync state when DB statuses loaded
    useEffect(() => {
        if (dbStatuses) {
            setStatuses([...dbStatuses].sort((a, b) => a.display_order - b.display_order));
        }
    }, [dbStatuses]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setStatuses((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Construct payload to save to DB safely
                const payload = newItems.map((item, index) => ({
                    id: item.id,
                    display_order: index + 1
                }));

                // Fire off mutation to persist changes in DB
                updateOrderMutation.mutate(payload);

                return newItems;
            });
        }
    };

    const handleAdd = () => {
        if (!newLabel.trim()) return;

        // Generate name from label: "My Custom Status" -> "MY_CUSTOM_STATUS"
        const name = newLabel.trim().toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "");
        const nextOrder = statuses ? Math.max(...statuses.map((s) => s.display_order), 0) + 1 : 1;

        addMutation.mutate(
            { name, label: newLabel.trim(), color: newColor, display_order: nextOrder },
            {
                onSuccess: () => {
                    setNewLabel("");
                    setNewColor(COLOR_OPTIONS[0].value);
                },
            }
        );
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recruitment Statuses</CardTitle>
                <CardDescription>
                    Manage candidate recruitment pipeline statuses. New candidates default to the status marked as default.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Status list */}
                <div className="space-y-2">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={statuses.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {statuses.map((status) => (
                                <SortableStatusItem
                                    key={status.id}
                                    status={status}
                                    deleteMutation={deleteMutation}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>

                {/* Add new status */}
                <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-3">Add New Status</h4>
                    <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                        <div>
                            <Label htmlFor="status-label" className="sr-only">Label</Label>
                            <Input
                                id="status-label"
                                placeholder="Status label (e.g. Medical Check)"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />
                        </div>
                        <div>
                            <Label htmlFor="status-color" className="sr-only">Color</Label>
                            <Select value={newColor} onValueChange={setNewColor}>
                                <SelectTrigger id="status-color">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COLOR_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-3 w-3 rounded-full ${opt.preview}`} />
                                                {opt.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleAdd}
                            disabled={!newLabel.trim() || addMutation.isPending}
                            size="default"
                        >
                            {addMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4 mr-1" />
                            )}
                            Add
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
