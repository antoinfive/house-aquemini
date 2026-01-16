import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for browser/client components.
 * Uses singleton pattern by default to prevent multiple client instances.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
