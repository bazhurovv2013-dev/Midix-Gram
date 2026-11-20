import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Publishable key is designed for browser use; database access is protected by RLS.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://trnvqvsfcwqwtmvaqpoz.supabase.co";
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_i0cbcrGHdYGB4hIKSORn9w_DssYoBRT";

export const isSupabaseConfigured = Boolean(url && publishableKey);
export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;
