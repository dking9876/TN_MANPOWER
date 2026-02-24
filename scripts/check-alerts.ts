import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function main() {
    const { data: alerts, error: alertError, count } = await supabase
        .from('alerts')
        .select('*', { count: 'exact' });

    console.log("Found alerts:", count);
    if (alerts && alerts.length > 0) {
        console.log("Sample alert:", alerts[0]);
    }
}

main().catch(console.error);
