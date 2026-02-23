/**
 * E2E Setup: Ensures a referrer test user exists.
 * Run this via `npx tsx e2e/setup-referrer.ts` before running referrer E2E tests.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const REFERRER_EMAIL = 'referrer@tnmanpower.com';
const REFERRER_PASSWORD = 'Referrer123!';
const REFERRER_NAME = 'Test Referrer';

async function main() {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
        console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user already exists
    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', REFERRER_EMAIL)
        .single();

    if (existing) {
        console.log(`✅ Referrer user already exists (${REFERRER_EMAIL})`);
        return;
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: REFERRER_EMAIL,
        password: REFERRER_PASSWORD,
        email_confirm: true,
    });

    if (authError) {
        console.error('Failed to create auth user:', authError.message);
        process.exit(1);
    }

    // Create public.users row
    const { error: profileError } = await supabase.from('users').insert({
        id: authUser.user.id,
        email: REFERRER_EMAIL,
        full_name: REFERRER_NAME,
        role: 'REFERRER',
        is_active: true,
    });

    if (profileError) {
        // Rollback auth user
        await supabase.auth.admin.deleteUser(authUser.user.id);
        console.error('Failed to create profile:', profileError.message);
        process.exit(1);
    }

    console.log(`✅ Referrer test user created: ${REFERRER_EMAIL}`);
}

main();
