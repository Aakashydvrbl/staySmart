import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Creates an anonymous public Supabase client for reading public data (such as active listings).
 * Does not read request cookies, keeping public queries simple while respecting RLS.
 */
export function createPublicClient() {
  const { url, publishableKey } = getSupabaseEnv();

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local"
    );
  }

  return createSupabaseClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
