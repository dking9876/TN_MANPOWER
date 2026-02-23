"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "ADMIN") throw new Error("Unauthorized: Admin only");
    return user.id;
}

export async function createUserAction(data: {
    fullName: string;
    email: string;
    password: string;
    role: "ADMIN" | "RECRUITER" | "REFERRER";
    companyIds?: string[];
}) {
    await assertAdmin();
    const admin = createAdminClient();

    // Create auth user
    const { data: authUser, error: authError } =
        await admin.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
        });

    if (authError) throw new Error(authError.message);

    // Insert public.users row
    const { error: profileError } = await admin.from("users").insert({
        id: authUser.user.id,
        email: data.email,
        full_name: data.fullName,
        role: data.role,
        is_active: true,
    });

    if (profileError) {
        // Rollback: delete auth user
        await admin.auth.admin.deleteUser(authUser.user.id);
        throw new Error(profileError.message);
    }

    if (data.role === "RECRUITER" && data.companyIds && data.companyIds.length > 0) {
        const companyLinks = data.companyIds.map(companyId => ({
            recruiter_id: authUser.user.id,
            company_id: companyId
        }));
        const { error: companiesError } = await admin
            .from("recruiter_companies")
            .insert(companyLinks);

        if (companiesError) {
            console.error("Failed to link companies to recruiter:", companiesError);
            // Optionally rollback or just log the error depending on strictness
        }
    }

    return { success: true, userId: authUser.user.id };
}

export async function updateUserAction(
    userId: string,
    data: { fullName: string; role: "ADMIN" | "RECRUITER" | "REFERRER"; companyIds?: string[] }
) {
    await assertAdmin();
    const admin = createAdminClient();

    const { error } = await admin
        .from("users")
        .update({ full_name: data.fullName, role: data.role })
        .eq("id", userId);

    if (error) throw new Error(error.message);

    // Update companies if the user is a recruiter (or being changed to one)
    // We'll clear the existing associations and re-insert them cleanly
    if (data.role === "RECRUITER" && data.companyIds !== undefined) {
        await admin
            .from("recruiter_companies")
            .delete()
            .eq("recruiter_id", userId);

        if (data.companyIds.length > 0) {
            const companyLinks = data.companyIds.map(companyId => ({
                recruiter_id: userId,
                company_id: companyId
            }));
            const { error: insertError } = await admin
                .from("recruiter_companies")
                .insert(companyLinks);

            if (insertError) {
                console.error("Failed to update recruiter companies:", insertError);
            }
        }
    } else if (data.role !== "RECRUITER") {
        // Automatically cleanup if role is changed away from recruiter
        await admin
            .from("recruiter_companies")
            .delete()
            .eq("recruiter_id", userId);
    }

    return { success: true };
}

export async function resetPasswordAction(
    userId: string,
    newPassword: string
) {
    await assertAdmin();
    const admin = createAdminClient();

    const { error } = await admin.auth.admin.updateUserById(userId, {
        password: newPassword,
    });

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function toggleUserActiveAction(
    userId: string,
    isActive: boolean
) {
    const currentUserId = await assertAdmin();
    if (userId === currentUserId) {
        throw new Error("Cannot deactivate your own account");
    }

    const admin = createAdminClient();

    const { error } = await admin
        .from("users")
        .update({ is_active: isActive })
        .eq("id", userId);

    if (error) throw new Error(error.message);

    // Also ban/unban in auth
    if (!isActive) {
        await admin.auth.admin.updateUserById(userId, {
            ban_duration: "876000h", // ~100 years
        });
    } else {
        await admin.auth.admin.updateUserById(userId, {
            ban_duration: "none",
        });
    }

    return { success: true };
}

export async function deleteUserAction(userId: string) {
    const currentUserId = await assertAdmin();
    if (userId === currentUserId) {
        throw new Error("Cannot delete your own account");
    }

    const admin = createAdminClient();

    // Delete from public.users first
    const { error: profileError } = await admin
        .from("users")
        .delete()
        .eq("id", userId);

    if (profileError) throw new Error(profileError.message);

    // Delete from auth
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) throw new Error(authError.message);

    return { success: true };
}
