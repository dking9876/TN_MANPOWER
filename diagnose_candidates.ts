import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkLastCandidates() {
    const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching candidates:', error);
        return;
    }

    console.log('Last 5 candidates:');
    data.forEach(c => {
        console.log(`ID: ${c.id}, Name: ${c.first_name} ${c.last_name}, NID: ${c.national_id}, Status: ${c.recruitment_status}, Blacklisted: ${c.is_blacklisted}`);
    });
}

checkLastCandidates();
