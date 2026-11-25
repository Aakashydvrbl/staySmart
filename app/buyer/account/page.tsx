import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

async function BuyerAccountContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/buyer/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, account_type")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[#e4dccb] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-[#e6f4ee] px-3 py-1 text-xs font-semibold text-[#0f6b4e]">
              Signed-in Account
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-[#14261f]">
              {profile?.full_name || "StaySmart Member"}
            </h1>
            <p className="mt-1 text-sm text-[#4b5e55]">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#f3ede0] pt-6 sm:grid-cols-2">
          <Link
            href="/"
            className="rounded-xl bg-[#0f6b4e] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#094c37]"
          >
            Browse Greater Noida PGs
          </Link>
          <Link
            href="/seller/dashboard"
            className="rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-4 py-3 text-center text-sm font-semibold text-[#14261f] transition-colors hover:border-[#0f6b4e] hover:text-[#0f6b4e]"
          >
            Go to Seller Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BuyerAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <div className="h-48 animate-pulse rounded-2xl border border-[#e4dccb] bg-white/80" />
        </div>
      }
    >
      <BuyerAccountContent />
    </Suspense>
  );
}
