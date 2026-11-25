/**
 * Reads public Supabase connection settings from environment variables.
 * Uses only the public URL and publishable key (never a secret/service-role key).
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "";

  return { url, publishableKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, publishableKey } = getSupabaseEnv();
  return (
    url.startsWith("https://") &&
    !url.includes("your-project-id") &&
    publishableKey.length > 0 &&
    !publishableKey.includes("your-supabase-publishable-key")
  );
}
