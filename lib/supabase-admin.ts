import { createClient } from '@supabase/supabase-js';

/**
 * Server-side only Supabase client using the service role key.
 * This bypasses Row Level Security — NEVER import this in client components.
 * Only use in API route handlers (app/api/**\/route.ts).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
