/**
 * Utility to convert raw Supabase/PostgreSQL error messages into human-readable strings.
 */
export function handleError(error: any, defaultMessage: string = "An unexpected error occurred"): string {
    console.error("Supabase/Postgres Error:", error);

    if (!error) return defaultMessage;

    // Supabase error object usually has a 'code', 'message', and 'details'
    const code = error.code;
    const message = error.message || "";

    // 42501: Insufficient Privileges (RLS Violation)
    if (code === "42501" || message.includes("row-level security policy")) {
        return "You do not have permission to perform this action.";
    }

    // 23505: Unique Violation
    if (code === "23505" || message.includes("unique constraint")) {
        return "This record already exists.";
    }

    // 23503: Foreign Key Violation
    if (code === "23503" || message.includes("foreign key constraint")) {
        return "This action cannot be completed because this record is being used elsewhere.";
    }

    // AUTH errors (Supabase Auth often doesn't use standard PostgREST codes)
    if (message.includes("Invalid login credentials")) {
        return "Invalid email or password. Please try again.";
    }

    if (message.includes("Email not confirmed")) {
        return "Please confirm your email address before logging in.";
    }

    if (message.includes("User already registered")) {
        return "An account with this email already exists.";
    }

    // Network / Timeout
    if (message.includes("fetch") || message.includes("network")) {
        return "Network error. Please check your internet connection and try again.";
    }

    // Fallback to default or the error message if it's relatively clean
    return message && !message.includes("row-level security") && !message.includes("violate")
        ? message
        : defaultMessage;
}
