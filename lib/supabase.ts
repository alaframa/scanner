// lib/supabase.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    if (!client) {
        client = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false },
        });
    }
    return client;
}

// Server-side client using service role (bypasses RLS)
export function getSupabaseAdmin(): SupabaseClient {
    return createClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}