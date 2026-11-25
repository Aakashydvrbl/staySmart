import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Dynamically renders signed-in or signed-out navigation links inside a Suspense boundary.
 */
export async function HeaderAuthNav() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/buyer/login"
          className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#4b5e55] hover:bg-[#f3ede0] hover:text-[#14261f] sm:text-sm"
        >
          Buyer Sign In
        </Link>
        <Link
          href="/seller/signup"
          className="rounded-lg bg-[#0f6b4e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#094c37] sm:text-sm"
        >
          List Your PG
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Link
          href="/buyer/login"
          className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#4b5e55] transition-colors hover:bg-[#f3ede0] hover:text-[#14261f] sm:text-sm"
        >
          Buyer Sign In
        </Link>
        <Link
          href="/buyer/signup"
          className="hidden rounded-lg px-2.5 py-2 text-xs font-medium text-[#4b5e55] transition-colors hover:bg-[#f3ede0] hover:text-[#14261f] md:inline-block sm:text-sm"
        >
          Buyer Sign Up
        </Link>
        <Link
          href="/seller/login"
          className="rounded-lg border border-[#e4dccb] bg-white px-2.5 py-2 text-xs font-semibold text-[#14261f] transition-colors hover:border-[#0f6b4e] hover:text-[#0f6b4e] sm:text-sm"
        >
          Seller Sign In
        </Link>
        <Link
          href="/seller/signup"
          className="rounded-lg bg-[#0f6b4e] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#094c37] sm:text-sm"
        >
          List Your PG
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  const isSeller = profile?.account_type === "seller";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isSeller ? (
        <Link
          href="/seller/dashboard"
          className="rounded-lg bg-[#0f6b4e] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#094c37] sm:text-sm"
        >
          Seller Dashboard
        </Link>
      ) : (
        <>
          <Link
            href="/buyer/account"
            className="rounded-lg border border-[#e4dccb] bg-white px-3 py-2 text-xs font-semibold text-[#14261f] transition-colors hover:border-[#0f6b4e] sm:text-sm"
          >
            My Account
          </Link>
          <Link
            href="/seller/dashboard"
            className="rounded-lg bg-[#0f6b4e] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#094c37] sm:text-sm"
          >
            List Your PG
          </Link>
        </>
      )}
      <LogoutButton />
    </div>
  );
}
