"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateFormSchema, CandidateFormValues } from "@/lib/validations/candidate-schema";
import { useCreateCandidate, useUpdateCandidate } from "@/lib/hooks/use-candidates";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { INDUSTRIES, INDUSTRY_PROFESSIONS, ENGLISH_LEVELS, RECRUITMENT_STATUS } from "@/lib/constants";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { differenceInYears, parseISO } from "date-fns";

interface CandidateFormProps {
    initialData?: any; // We'll type this properly with the DB type later
    isEditMode?: boolean;
}

export function CandidateForm({ initialData, isEditMode = false }: CandidateFormProps) {
    const router = useRouter();
    const createMutation = useCreateCandidate();
    const updateMutation = useUpdateCandidate();
    const [age, setAge] = useState<number | null>(null);

    const form = useForm<CandidateFormValues>({
        resolver: zodResolver(candidateFormSchema),
        defaultValues: {
            first_name: initialData?.first_name || "",
            last_name: initialData?.last_name || "",
            national_id: initialData?.national_id || "",
            passport_number: initialData?.passport_number || "",
            date_of_birth: initialData?.date_of_birth || "",
            primary_phone: initialData?.primary_phone || "",
            emergency_phone: initialData?.emergency_phone || "",
            email: initialData?.email || "",
            height: initialData?.height || null,
            weight: initialData?.weight || null,
            shoe_size: initialData?.shoe_size || "",
            pants_size: initialData?.pants_size || "",
            allergies: initialData?.allergies || "",
            primary_industry: initialData?.primary_industry || "",
            profession: initialData?.profession || "",
            english_level: initialData?.english_level || ENGLISH_LEVELS.NONE,
            has_visited_other: initialData?.has_visited_other || false,
            countries_visited: initialData?.countries_visited || [],
            recruitment_status: initialData?.recruitment_status || RECRUITMENT_STATUS.POTENTIAL_CANDIDATE,
            is_blacklisted: initialData?.is_blacklisted || false,
        },
    });

    const watchedIndustry = form.watch("primary_industry");
    const watchedDob = form.watch("date_of_birth");
    const watchedHasVisited = form.watch("has_visited_other");

    // Calculate age on DOB change
    useEffect(() => {
        if (watchedDob) {
            const date = parseISO(watchedDob);
            if (!isNaN(date.getTime())) {
                setAge(differenceInYears(new Date(), date));
            }
        }
    }, [watchedDob]);

    // Derived blacklist check (soft check for UI warning)
    // The real check happens in DB trigger, but we want to warn user
    const [isBlacklistWarning, setIsBlacklistWarning] = useState(false);
    // TODO: We could fetch blacklist countries here to warn dynamically

    const onSubmit = async (values: CandidateFormValues) => {
        try {
            if (isEditMode && initialData) {
                await updateMutation.mutateAsync({ id: initialData.id, values });
                // Redirect back to detail
                router.push(`/candidates/${initialData.id}`);
            } else {
                const newCandidate = await createMutation.mutateAsync(values);
                if (newCandidate) {
                    router.push(`/candidates/${newCandidate.id}`);
                }
            }
        } catch (error) {
            console.error(error);
            // Error handled by mutation hook toaster
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {form.formState.errors.root && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                    </Alert>
                )}

                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="national_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>National ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ID123456789" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="passport_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Passport Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="A1234567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date_of_birth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date of Birth {age !== null && <span className="text-muted-foreground ml-2">(Age: {age})</span>}</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="primary_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+972..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="emergency_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Emergency Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+972..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" value={field.value || ""} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Professional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Professional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="primary_industry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Industry</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select industry" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(INDUSTRIES).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="profession"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profession</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={!watchedIndustry}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select profession" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {watchedIndustry && INDUSTRY_PROFESSIONS[watchedIndustry as keyof typeof INDUSTRIES]?.map((prof) => (
                                                <SelectItem key={prof} value={prof}>
                                                    {prof}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select industry first to see professions.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="english_level"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>English Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(ENGLISH_LEVELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Physical / Other */}
                <Card>
                    <CardHeader>
                        <CardTitle>Physical & Additional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Height (cm)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value || ""} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Weight (kg)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value || ""} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shoe_size"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shoe Size</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pants_size"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pants Size</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="allergies"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Allergies / Medical Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Any allergies or medical conditions..." {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Background */}
                <Card>
                    <CardHeader>
                        <CardTitle>Background Check</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="has_visited_other"
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
                                            Has visited other countries?
                                        </FormLabel>
                                        <FormDescription>
                                            Check if the candidate has worked or visited other countries previously.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {watchedHasVisited && (
                            <div className="rounded-md bg-muted p-4">
                                <p className="text-sm text-yellow-600 mb-2">
                                    Note: If candidate visited restricted countries (e.g. Dubai, Qatar), they will be automatically blacklisted.
                                </p>
                                {/* 
                                    Ideally meaningful multi-select for countries. 
                                    For now, we'll implement a simple comma-separated text input or similar 
                                    since shadcn/ui generic MultiSelect is complex to implement from scratch here quickly.
                                    Let's use a text input where user can type country names for simplicity now, 
                                    or better: We can use the 'command' component if we had more time.
                                    Let's stick to simple text input that parses into array for now to ensure robustness.
                                 */}
                                <FormField
                                    control={form.control}
                                    name="countries_visited"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Countries Visited</FormLabel>
                                            <FormControl>
                                                {/* Temporary: handling array as comma joined string for the input */}
                                                <Input
                                                    placeholder="Dubai, Qatar, USA..."
                                                    defaultValue={field.value?.join(", ")}
                                                    onChange={(e) => {
                                                        const val = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                                                        field.onChange(val);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>Separate multiple countries with commas</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? "Update Candidate" : "Create Candidate"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
