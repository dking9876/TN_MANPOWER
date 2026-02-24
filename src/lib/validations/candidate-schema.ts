import { z } from "zod";
import { parseISO, differenceInYears } from "date-fns";
import { INDUSTRIES, ENGLISH_LEVELS } from "@/lib/constants";

// Helper to validate age >= 18
const isAdult = (dateStr: string) => {
    const date = parseISO(dateStr);
    return differenceInYears(new Date(), date) >= 18;
};

// Enums from constants keys for Zod
const IndustryEnum = z.enum(Object.keys(INDUSTRIES) as [string, ...string[]]);
const EnglishLevelEnum = z.enum(Object.keys(ENGLISH_LEVELS) as [string, ...string[]]);

export const candidateFormSchema = z.object({
    // Personal Info
    first_name: z.string().min(1, "First name is required").max(40, "Max 40 characters"),
    last_name: z.string().min(1, "Last name is required").max(40, "Max 40 characters"),
    national_id: z.string().min(1, "National ID is required").regex(/^[a-zA-Z0-9]+$/, "Alphanumeric only"),
    passport_number: z.string().min(1, "Passport number is required").regex(/^[a-zA-Z0-9]+$/, "Alphanumeric only"),
    date_of_birth: z.string().refine(isAdult, {
        message: "Candidate must be at least 18 years old",
    }),
    primary_phone: z.string().min(1, "Primary phone is required"),
    emergency_phone: z.string().min(1, "Emergency phone is required"),
    // Send null if empty string
    email: z.union([z.literal(""), z.string().email("Invalid email address")]).nullable().optional(),

    // Physical
    height: z.coerce.number().positive("Must be positive").optional().nullable().or(z.literal("")),
    weight: z.coerce.number().positive("Must be positive").optional().nullable().or(z.literal("")),
    shoe_size: z.string().optional().nullable(),
    pants_size: z.string().optional().nullable(),
    allergies: z.string().optional().nullable(),

    // Professional
    primary_industry: IndustryEnum,
    profession: z.string().min(1, "Profession is required"),
    english_level: EnglishLevelEnum,

    // Background
    has_visited_other: z.boolean().default(false),
    countries_visited: z.array(z.string()).optional(),

    // Status (only for edit mode usually, but good to have in schema)
    recruitment_status: z.string().optional(),
    is_blacklisted: z.boolean().optional(),

    // Status Metadata
    interview_date: z.string().optional().nullable(),
    visa_number: z.string().optional().nullable(),
    visa_expiry_date: z.string().optional().nullable(),
    insurance_purchased: z.boolean().optional().nullable(),
    insurance_purchase_date: z.string().optional().nullable(),
    flight_date: z.string().optional().nullable(),
    flight_hour: z.string().optional().nullable(),
    flight_number: z.string().optional().nullable(),
    connection_flight_date: z.string().optional().nullable(),
    connection_flight_hour: z.string().optional().nullable(),
    connection_flight_number: z.string().optional().nullable(),
    arrival_date: z.string().optional().nullable(),
    referrer_got_paid: z.boolean().optional().nullable(),

    // Optional Company / Referrer
    company_id: z.string().uuid("Invalid company ID").optional().nullable(),
    referrer_id: z.string().uuid("Invalid referrer ID").min(1, "Referrer is required"),
});

export type CandidateFormValues = z.infer<typeof candidateFormSchema>;
