"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateFormSchema, CandidateFormValues } from "@/lib/validations/candidate-schema";
import { useCreateCandidate, useUpdateCandidate } from "@/lib/hooks/use-candidates";
import { useCompanies, useRecruitmentStatuses, useProfessions, useBlacklistedCountries } from "@/lib/hooks/use-settings";
import { useAllReferrers } from "@/lib/hooks/use-users";
import { Tables } from "@/lib/supabase/types";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { INDUSTRIES, ENGLISH_LEVELS } from "@/lib/constants";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { differenceInYears, parseISO, format } from "date-fns";

interface CandidateFormProps {
    initialData?: Tables<"candidates">;
    isEditMode?: boolean;
}

export function CandidateForm({ initialData, isEditMode = false }: CandidateFormProps) {
    const router = useRouter();
    const createMutation = useCreateCandidate();
    const updateMutation = useUpdateCandidate();
    const { data: companies, isLoading: companiesLoading } = useCompanies();
    const { data: users, isLoading: usersLoading } = useAllReferrers();
    const { data: recruitmentStatuses } = useRecruitmentStatuses();
    const { data: professionsData, isLoading: professionsLoading } = useProfessions();
    const { data: countriesData, isLoading: countriesLoading } = useBlacklistedCountries();
    const [age, setAge] = useState<number | null>(null);
    const [openCountriesDropdown, setOpenCountriesDropdown] = useState(false);

    // Find the default status from DB
    const defaultStatusName = recruitmentStatuses?.find((s) => s.is_default)?.name || "POTENTIAL_CANDIDATE";

    const form = useForm<CandidateFormValues>({
        resolver: zodResolver(candidateFormSchema) as any,
        defaultValues: {
            first_name: initialData?.first_name || "",
            last_name: initialData?.last_name || "",
            national_id: initialData?.national_id || "",
            passport_number: initialData?.passport_number || "",
            date_of_birth: initialData?.date_of_birth || "",
            primary_phone: initialData?.primary_phone || "+94",
            emergency_phone: initialData?.emergency_phone || "+94",
            email: initialData?.email || "",
            height: initialData?.height || null,
            weight: initialData?.weight || null,
            shoe_size: initialData?.shoe_size || "",
            pants_size: initialData?.pants_size || "",
            allergies: initialData?.allergies || "",
            primary_industry: initialData?.primary_industry || "",
            profession: initialData?.profession || "",
            english_level: initialData?.english_level || "NONE",
            has_visited_other: initialData?.has_visited_other || false,
            countries_visited: initialData?.countries_visited || [],
            recruitment_status: initialData?.recruitment_status || defaultStatusName,
            is_blacklisted: initialData?.is_blacklisted || false,
            company_id: initialData?.company_id || null,
            referrer_id: initialData?.referrer_id || "",
            // Status metadata
            interview_date: initialData?.interview_date || null,
            visa_number: initialData?.visa_number || "",
            visa_expiry_date: initialData?.visa_expiry_date || null,
            insurance_purchased: initialData?.insurance_purchased || false,
            insurance_purchase_date: initialData?.insurance_purchase_date || null,
            flight_date: initialData?.flight_date || null,
            flight_hour: initialData?.flight_hour || "",
            flight_number: initialData?.flight_number || "",
            connection_flight_date: initialData?.connection_flight_date || null,
            connection_flight_hour: initialData?.connection_flight_hour || "",
            connection_flight_number: initialData?.connection_flight_number || "",
            arrival_date: initialData?.arrival_date || null,
            referrer_got_paid: initialData?.referrer_got_paid || false,
        },
    });

    const watchedIndustry = form.watch("primary_industry");
    const watchedDob = form.watch("date_of_birth");
    const watchedHasVisited = form.watch("has_visited_other");
    const watchedStatus = form.watch("recruitment_status");

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

    useEffect(() => {
        const visited = form.watch("countries_visited") || [];
        if (countriesData && visited.length > 0) {
            const hasBlacklisted = visited.some((cv: string) => {
                return countriesData.some(c => c.country_name === cv && c.is_blacklisted);
            });
            setIsBlacklistWarning(hasBlacklisted);
        } else {
            setIsBlacklistWarning(false);
        }
    }, [form.watch("countries_visited"), countriesData]);

    const relevantProfessions = watchedIndustry
        ? professionsData?.filter(p => p.industry === watchedIndustry) || []
        : [];

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
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} value={(field.value as any) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} value={(field.value as any) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="national_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>National ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123456789" {...field} value={(field.value as any) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="passport_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Passport Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="A1234567" {...field} value={(field.value as any) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="date_of_birth"
                            render={({ field }) => (
                                <FormItem className="flex flex-col mt-2.5">
                                    <FormLabel>Date of Birth {age !== null && <span className="text-muted-foreground ml-2">(Age: {age})</span>}</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(parseISO(field.value.toString()), "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? parseISO(field.value.toString()) : undefined}
                                                onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1930-01-01")
                                                }
                                                captionLayout="dropdown"
                                                fromYear={1930}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="primary_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+94..." {...field} value={(field.value as any) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="emergency_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Emergency Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+94..." {...field} value={(field.value as any) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" {...field} value={(field.value as any) ?? ""} />
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
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="primary_industry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Industry</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={(field.value as any) || undefined}>
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
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="profession"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profession</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={(field.value as any) || undefined}
                                        disabled={!watchedIndustry}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select profession" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {relevantProfessions.map((prof) => (
                                                <SelectItem key={prof.id} value={prof.profession}>
                                                    {prof.profession}
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
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="english_level"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>English Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={(field.value as any) || undefined}>
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
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="company_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company (Optional)</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                                        value={(field.value as string) || "none"}
                                        disabled={companiesLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select company" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {companies?.map((company) => (
                                                <SelectItem key={company.id} value={company.id}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Assign the candidate to a specific company
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="referrer_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Referrer</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={(field.value as string) || undefined}
                                        disabled={usersLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select referrer" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {users?.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.full_name} ({user.role.toLowerCase()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The person who referred this candidate
                                    </FormDescription>
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
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Height (cm)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={(field.value as any) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Weight (kg)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={(field.value as any) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="shoe_size"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shoe Size</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={(field.value as any) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="pants_size"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pants Size</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={(field.value as any) ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="allergies"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Allergies / Medical Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Any allergies or medical conditions..." {...field} value={(field.value as any) ?? ""} />
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
                        <FormField<CandidateFormValues>
                            control={form.control}
                            name="has_visited_other"
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
                                <FormField<CandidateFormValues>
                                    control={form.control}
                                    name="countries_visited"
                                    render={({ field }) => {
                                        const selectedValues = (field.value as string[]) || [];
                                        return (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Countries Visited</FormLabel>
                                                <Popover open={openCountriesDropdown} onOpenChange={setOpenCountriesDropdown}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className={cn(
                                                                    "w-full justify-between font-normal",
                                                                    !selectedValues.length && "text-muted-foreground"
                                                                )}
                                                                disabled={countriesLoading}
                                                            >
                                                                {selectedValues.length > 0
                                                                    ? `${selectedValues.length} selected`
                                                                    : "Select countries"}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[400px] p-0" align="start">
                                                        <Command>
                                                            <CommandInput placeholder="Search country..." />
                                                            <CommandList>
                                                                <CommandEmpty>No country found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {countriesData?.map((country) => {
                                                                        const isSelected = selectedValues.includes(country.country_name);
                                                                        return (
                                                                            <CommandItem
                                                                                key={country.id}
                                                                                value={country.country_name}
                                                                                keywords={[country.country_name, country.country_code]}
                                                                                onSelect={() => {
                                                                                    const newSelected = isSelected
                                                                                        ? selectedValues.filter((val) => val !== country.country_name)
                                                                                        : [...selectedValues, country.country_name];
                                                                                    field.onChange(newSelected);
                                                                                }}
                                                                                className="flex justify-between items-center"
                                                                            >
                                                                                <div className="flex items-center">
                                                                                    <Check
                                                                                        className={cn(
                                                                                            "mr-2 h-4 w-4",
                                                                                            isSelected ? "opacity-100" : "opacity-0"
                                                                                        )}
                                                                                    />
                                                                                    {country.country_name}
                                                                                </div>
                                                                                {country.is_blacklisted && (
                                                                                    <Badge variant="destructive" className="ml-2 text-[10px] uppercase">
                                                                                        Blacklisted
                                                                                    </Badge>
                                                                                )}
                                                                            </CommandItem>
                                                                        );
                                                                    })}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>

                                                {selectedValues.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {selectedValues.map(val => {
                                                            const c = countriesData?.find(x => x.country_name === val);
                                                            return (
                                                                <Badge key={val} variant={c?.is_blacklisted ? "destructive" : "secondary"}>
                                                                    {val}
                                                                </Badge>
                                                            )
                                                        })}
                                                    </div>
                                                )}

                                                {isBlacklistWarning && (
                                                    <Alert variant="destructive" className="mt-2 py-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertTitle className="text-sm">Warning</AlertTitle>
                                                        <AlertDescription className="text-xs">
                                                            Candidate has visited a restricted country and will be automatically blacklisted after saving.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}

                                                <FormDescription>Select multiple countries from the list</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status Details (conditional, edit mode only) */}
                {isEditMode && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            {/* Awaiting Interview */}
                            {watchedStatus === "AWAITING_INTERVIEW" && (
                                <FormField<CandidateFormValues>
                                    control={form.control}
                                    name="interview_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Interview Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} value={(field.value as any) ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Visa Approved */}
                            {watchedStatus === "VISA_APPROVED" && (
                                <>
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="visa_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Visa Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Visa number" {...field} value={(field.value as any) ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="visa_expiry_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Visa Expiry Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} value={(field.value as any) ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Health Insurance */}
                            {watchedStatus === "HEALTH_INSURANCE_PURCHASED" && (
                                <>
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="insurance_purchased"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value as boolean}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="leading-none">
                                                    <FormLabel>Insurance Purchased</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="insurance_purchase_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Purchase Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} value={(field.value as any) ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Flight Ticket */}
                            {watchedStatus === "FLIGHT_TICKET_PURCHASED" && (
                                <>
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="flight_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Flight Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} value={(field.value as any) ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="flight_hour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Flight Hour</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} value={(field.value as any) ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="flight_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Flight Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. TK 788" {...field} value={(field.value as any) ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="col-span-2">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Connection Flight (Optional)</h4>
                                    </div>
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="connection_flight_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Connection Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} value={(field.value as any) ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="connection_flight_hour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Connection Hour</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} value={(field.value as any) ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="connection_flight_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Connection Flight No.</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. LY 315" {...field} value={(field.value as any) ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Arrived in Israel */}
                            {watchedStatus === "ARRIVED_IN_ISRAEL" && (
                                <>
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="arrival_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Arrival Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} value={(field.value as any) ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField<CandidateFormValues>
                                        control={form.control}
                                        name="referrer_got_paid"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value as boolean}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="leading-none">
                                                    <FormLabel>Referrer Got Paid</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* No special fields for this status */}
                            {!["AWAITING_INTERVIEW", "VISA_APPROVED", "HEALTH_INSURANCE_PURCHASED", "FLIGHT_TICKET_PURCHASED", "ARRIVED_IN_ISRAEL"].includes(watchedStatus || "") && (
                                <p className="text-sm text-muted-foreground col-span-2">
                                    No additional details required for the current status.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

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
