import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase Client (Requires Service Role Key to bypass RLS for seeding)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// Helper for random choice
const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateId = () => crypto.randomBytes(4).toString('hex').toUpperCase();
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const FIRST_NAMES = ["Sunil", "Aman", "Rajesh", "Priya", "Arjun", "Vikram", "Neha", "Anita", "Dev", "Kiran", "Amit", "Ravi", "Suresh", "Ramesh", "Gita", "Sita", "Ram", "Shyam", "Krishna", "Radha"];
const LAST_NAMES = ["Kumar", "Sharma", "Singh", "Patel", "Gupta", "Das", "Rao", "Joshi", "Nair", "Reddy", "Chauhan", "Yadav", "Verma", "Pandey", "Mishra", "Tiwari", "Khan", "Ali"];

const INDUSTRIES = ["NURSING", "CONSTRUCTION", "INDUSTRY", "AGRICULTURE", "COMMERCE", "HOSPITALITY", "SERVICES"];
const PROFESSIONS_BY_INDUSTRY: Record<string, string[]> = {
    NURSING: ["Nurse", "Caregiver"],
    CONSTRUCTION: ["Plasterer", "Mason", "Form Worker"],
    INDUSTRY: ["General Worker"],
    AGRICULTURE: ["General Worker", "Picker"],
    COMMERCE: ["Cashier", "Sales Associate"],
    HOSPITALITY: ["Housekeeper", "Kitchen Worker"],
    SERVICES: ["General Worker"],
};

const ENGLISH_LEVELS = ["NONE", "BASIC", "GOOD", "EXCELLENT"];
const STATUSES = [
    "POTENTIAL_CANDIDATE", "RECRUITMENT_STARTED", "DOCUMENTS_RECEIVED",
    "SENT_TO_IVS", "AWAITING_INTERVIEW", "VISA_APPROVED",
    "HEALTH_INSURANCE_PURCHASED", "FLIGHT_TICKET_PURCHASED",
    "ARRIVED_IN_ISRAEL", "CANDIDATE_REJECTED"
];

const DOC_TYPES = ["PASSPORT_COPIES", "POLICE_REPORT", "MEDICAL_REPORT", "VISA_APPLICATION_FORM"];

async function main() {
    console.log("Starting Demo Data Seeder...");

    // 1. Fetch relations
    const { data: users, error: userError } = await supabase.from('users').select('id, role');
    if (userError) throw userError;

    const recruiters = users.filter(u => u.role === 'RECRUITER' || u.role === 'ADMIN').map(u => u.id);
    const referrers = users.filter(u => u.role === 'REFERRER').map(u => u.id);

    const { data: companies, error: compError } = await supabase.from('companies').select('id');
    if (compError) throw compError;
    const companyIds = companies.map(c => c.id);

    if (recruiters.length === 0) {
        console.error("No recruiters found in the database. Please create a user first.");
        process.exit(1);
    }

    // 2. Wipe existing data
    console.log("Wiping existing data...");
    await supabase.from('alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('candidate_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('candidate_status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('candidates').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 3. Generate Candidates
    console.log("Generating candidates...");
    const numCandidates = 45;
    const candidatesToInsert = [];

    for (let i = 0; i < numCandidates; i++) {
        const ind = pick(INDUSTRIES);
        const status = pick(STATUSES);
        const createdBy = pick(recruiters);

        const candidate: any = {
            first_name: pick(FIRST_NAMES),
            last_name: pick(LAST_NAMES),
            national_id: "NAT" + generateId(),
            passport_number: "P" + generateId(),
            date_of_birth: randomDate(new Date(1980, 0, 1), new Date(2002, 0, 1)).toISOString().split('T')[0],
            primary_phone: "+94" + randomInt(700000000, 799999999),
            emergency_phone: "+94" + randomInt(700000000, 799999999),
            email: `candidate${i}@example.com`,
            primary_industry: ind,
            profession: pick(PROFESSIONS_BY_INDUSTRY[ind]),
            english_level: pick(ENGLISH_LEVELS),
            recruitment_status: status,
            is_blacklisted: Math.random() > 0.95,
            created_by: createdBy,
            last_updated_by: createdBy,
            company_id: companyIds.length > 0 && Math.random() > 0.3 ? pick(companyIds) : null,
            referrer_id: referrers.length > 0 && Math.random() > 0.5 ? pick(referrers) : null,
        };

        // Status specific metadata
        if (["ARRIVED_IN_ISRAEL", "FLIGHT_TICKET_PURCHASED"].includes(status)) {
            candidate.flight_date = new Date().toISOString();
            candidate.flight_number = "LY" + randomInt(100, 999);
        }
        if (status === "ARRIVED_IN_ISRAEL") {
            candidate.arrival_date = new Date().toISOString();
        }

        candidatesToInsert.push(candidate);
    }

    const { data: insertedCandidates, error: insertError } = await supabase
        .from('candidates')
        .insert(candidatesToInsert)
        .select('id, recruitment_status, company_id');

    if (insertError) throw insertError;
    console.log(`Inserted ${insertedCandidates.length} candidates.`);

    // Wait, let's delete any auto-created documents from triggers just in case
    console.log("Wiping any auto-generated docs...");
    await supabase.from('candidate_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 4. Generate Documents & Alerts
    console.log("Generating documents and alerts...");
    const docsToInsert = [];
    const alertsToInsert = [];

    for (const c of insertedCandidates) {
        // Documents
        let docCount = 0;
        if (c.recruitment_status === "POTENTIAL_CANDIDATE") docCount = 1;
        else if (c.recruitment_status === "RECRUITMENT_STARTED") docCount = 2;
        else docCount = DOC_TYPES.length; // Advanced statuses have most docs

        for (let j = 0; j < docCount; j++) {
            const hasExpired = Math.random() > 0.85;
            const isExpiringSoon = Math.random() > 0.85;

            let expiration = randomDate(new Date(2027, 0, 1), new Date(2030, 0, 1)).toISOString();
            if (hasExpired) {
                expiration = randomDate(new Date(2023, 0, 1), new Date(2024, 0, 1)).toISOString();
            } else if (isExpiringSoon) {
                // Expiring within 20 days
                expiration = new Date(Date.now() + randomInt(5, 20) * 24 * 60 * 60 * 1000).toISOString();
            }

            docsToInsert.push({
                candidate_id: c.id,
                type: DOC_TYPES[j],
                status: hasExpired ? 'EXPIRED' : (Math.random() > 0.9 ? 'PENDING' : 'SUBMITTED'),
                expiration_date: expiration,
            });
        }

        // Random Alerts
        const shouldMakeStaleness = Math.random() > 0.3;

        if (shouldMakeStaleness) {
            alertsToInsert.push({
                candidate_id: c.id,
                alert_message: "Candidate has been in current status for more than 14 days without an update.",
                alert_type: "STALENESS",
                company_id: c.company_id || companyIds[0], // fallback to first company if null
                is_resolved: Math.random() > 0.7,
                created_at: new Date(Date.now() - randomInt(1, 45) * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
    }

    if (docsToInsert.length > 0) {
        const { error: docErr } = await supabase.from('candidate_documents').insert(docsToInsert);
        if (docErr) throw docErr;
    }

    if (alertsToInsert.length > 0) {
        console.log(`Attempting to insert ${alertsToInsert.length} alerts...`);
        const { data: insertedAlerts, error: alertErr } = await supabase.from('alerts').insert(alertsToInsert).select('id');
        if (alertErr) {
            console.error("ALERT INSERT ERROR:", alertErr);
            throw alertErr;
        }
        console.log(`Inserted ${insertedAlerts?.length || 0} alerts successfully.`);
    }

    console.log("Successfully seeded demo data!");
}

main().catch(console.error);
