/**
 * E2E Setup: Creates test data for recruiter company linkages and alerts.
 * Run this via `npx tsx e2e/setup-recruiter-alerts.ts` before running recruiter-alerts tests.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const RECRUITER_EMAIL = 'recruiter.alerts@tnmanpower.com';
const RECRUITER_PASSWORD = 'Recruiter123!';
const RECRUITER_NAME = 'Test Recruiter Alerts';

const COMPANY_A_NAME = 'Test Company A - Alerts';
const COMPANY_B_NAME = 'Test Company B - Alerts';

async function main() {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
        console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    try {
        // --- 1. CLEANUP PREVIOUS TEST DATA ---
        console.log('Cleaning up previous test data...');

        // Delete alerts first (they depend on candidates and companies)
        await supabase.from('alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Find test candidates to delete their related records
        const { data: testCands } = await supabase.from('candidates').select('id').in('national_id', ['IDA123456', 'IDB123456', 'IDA_TESTV1', 'IDB_TESTV1']);
        if (testCands && testCands.length > 0) {
            const candIds = testCands.map(c => c.id);
            console.log(`Cleaning up ${candIds.length} test candidates and their data...`);
            await supabase.from('candidate_documents').delete().in('candidate_id', candIds);
            await supabase.from('candidate_status_history').delete().in('candidate_id', candIds);
            await supabase.from('audit_logs').delete().in('candidate_id', candIds);
            await supabase.from('candidates').delete().in('id', candIds);
        }

        // Find Recruiter to delete linkages
        const { data: usersList } = await supabase.auth.admin.listUsers();
        const existingAuthUser = usersList?.users.find(u => u.email === RECRUITER_EMAIL);

        if (existingAuthUser) {
            console.log('Cleaning up existing recruiter links and auth user...');
            await supabase.from('recruiter_companies').delete().eq('recruiter_id', existingAuthUser.id);
            await supabase.from('candidates').delete().eq('created_by', existingAuthUser.id);
            await supabase.from('users').delete().eq('id', existingAuthUser.id);
            await supabase.auth.admin.deleteUser(existingAuthUser.id);
        } else {
            // Check public.users just in case record exists but auth is gone
            const { data: publicUser } = await supabase.from('users').select('id').eq('email', RECRUITER_EMAIL).maybeSingle();
            if (publicUser) {
                console.log('Cleaning up orphaned recruiter profile...');
                await supabase.from('recruiter_companies').delete().eq('recruiter_id', publicUser.id);
                await supabase.from('users').delete().eq('id', publicUser.id);
            }
        }

        await supabase.from('companies').delete().in('name', [COMPANY_A_NAME, COMPANY_B_NAME]);

        // --- 2. CREATE COMPANIES ---
        console.log('Creating test companies...');
        const { data: companies, error: companiesError } = await supabase.from('companies').insert([
            { name: COMPANY_A_NAME },
            { name: COMPANY_B_NAME }
        ]).select();

        if (companiesError || !companies) throw new Error(`Companies creation failed: ${companiesError?.message}`);
        const companyA = companies.find(c => c.name === COMPANY_A_NAME)!;
        const companyB = companies.find(c => c.name === COMPANY_B_NAME)!;

        // --- 3. CREATE RECRUITER ---
        console.log('Creating test recruiter...');
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: RECRUITER_EMAIL,
            password: RECRUITER_PASSWORD,
            email_confirm: true,
        });

        if (authError || !authUser.user) throw new Error(`Auth user creation failed: ${authError?.message}`);
        const recruiterId = authUser.user.id;

        const { error: profileError } = await supabase.from('users').insert({
            id: recruiterId,
            email: RECRUITER_EMAIL,
            full_name: RECRUITER_NAME,
            role: 'RECRUITER',
            is_active: true,
        });
        if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);

        // --- 4. LINK RECRUITER TO COMPANY A ONLY ---
        console.log('Linking recruiter to Company A...');
        const { error: linkError } = await supabase.from('recruiter_companies').insert({
            recruiter_id: recruiterId,
            company_id: companyA.id
        });
        if (linkError) throw new Error(`Link creation failed: ${linkError.message}`);

        // --- 5. CREATE CANDIDATES ---
        console.log('Creating test candidates...');
        const { data: adminUser } = await supabase.from('users').select('id').eq('role', 'ADMIN').limit(1).single();
        const createdBy = adminUser?.id || recruiterId;

        const { data: candidates, error: candidatesError } = await supabase.from('candidates').upsert([
            {
                first_name: 'AlertTest',
                last_name: 'CandidateA',
                passport_number: 'ALERTA_TESTV1',
                national_id: 'IDA_TESTV1',
                date_of_birth: '1995-01-01',
                primary_phone: '+1234567890',
                emergency_phone: '+1234567890',
                primary_industry: 'CONSTRUCTION',
                profession: 'Builder',
                english_level: 'BASIC',
                company_id: companyA.id,
                recruitment_status: 'POTENTIAL_CANDIDATE',
                created_by: createdBy,
                last_updated_by: createdBy
            },
            {
                first_name: 'AlertTest',
                last_name: 'CandidateB',
                passport_number: 'ALERTB_TESTV1',
                national_id: 'IDB_TESTV1',
                date_of_birth: '1996-01-01',
                primary_phone: '+0987654321',
                emergency_phone: '+0987654321',
                primary_industry: 'AGRICULTURE',
                profession: 'Farmer',
                english_level: 'NONE',
                company_id: companyB.id,
                recruitment_status: 'POTENTIAL_CANDIDATE',
                created_by: createdBy,
                last_updated_by: createdBy
            }
        ], { onConflict: 'national_id' }).select();

        if (candidatesError || !candidates) throw new Error(`Candidates creation failed: ${candidatesError?.message}`);
        const candidateA = candidates.find(c => c.national_id === 'IDA_TESTV1')!;
        const candidateB = candidates.find(c => c.national_id === 'IDB_TESTV1')!;

        // --- 6. CREATE ALERTS ---
        console.log('Creating test alerts...');
        const { error: alertsError } = await supabase.from('alerts').insert([
            {
                candidate_id: candidateA.id,
                company_id: companyA.id,
                alert_type: 'STALENESS',
                alert_message: `Test staleness alert for CandidateA in Company A`,
                is_resolved: false
            },
            {
                candidate_id: candidateB.id,
                company_id: companyB.id,
                alert_type: 'STALENESS',
                alert_message: `Test staleness alert for CandidateB in Company B`,
                is_resolved: false
            }
        ]);
        if (alertsError) throw new Error(`Alerts creation failed: ${alertsError.message}`);

        console.log('✅ Setup complete!');
    } catch (e: any) {
        console.error('Setup failed:', e.message);
        process.exit(1);
    }
}

main();
