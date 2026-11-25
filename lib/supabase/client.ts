import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Creates a Supabase client for use inside Client Components ("use client").
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local"
    );
  }

  return createBrowserClient(url, publishableKey);
}
