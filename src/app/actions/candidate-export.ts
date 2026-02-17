"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCandidatesForExport(filters: any) {
    const supabase = await createClient();

    // 1. Check Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 2. Check RBAC (Admin or Recruiter)
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (userError || !userData) {
        throw new Error("Failed to verify user permissions");
    }

    const allowedRoles = ["ADMIN", "RECRUITER"];
    if (!allowedRoles.includes(userData.role)) {
        throw new Error("Forbidden: You do not have permission to export data.");
    }

    // 3. Fetch Data (Server-Side)
    let query = supabase
        .from("candidates")
        .select(`
            *,
            creator:created_by (full_name),
            updater:last_updated_by (full_name),
            documents (
                document_type,
                is_received,
                expiration_date
            )
        `);

    // Apply filters (Server-side logic matches client-side request)
    if (filters.search) {
        const search = `%${filters.search}%`;
        query = query.or(`first_name.ilike.${search},last_name.ilike.${search},national_id.ilike.${search},passport_number.ilike.${search}`);
    }

    if (filters.status && filters.status.length > 0) {
        query = query.in("recruitment_status", filters.status);
    }

    if (filters.industry && filters.industry.length > 0) {
        query = query.in("primary_industry", filters.industry);
    }

    if (filters.recruiter && filters.recruiter.length > 0) {
        query = query.in("created_by", filters.recruiter);
    }

    if (filters.is_blacklisted !== undefined) {
        query = query.eq("is_blacklisted", filters.is_blacklisted);
    }

    query = query.order("last_updated_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error("Export query error:", error);
        throw new Error("Failed to fetch data for export");
    }

    return data;
}
