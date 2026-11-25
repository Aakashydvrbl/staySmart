import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges a Supabase email confirmation code for a user session cookie.
 * Supports both localhost and Vercel reverse-proxy domains.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : "/";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const redirectBase =
    !isLocalEnv && forwardedHost ? `https://${forwardedHost}` : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${redirectBase}/buyer/login`);
}
