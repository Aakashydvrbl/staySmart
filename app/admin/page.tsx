import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AdminListingsManager } from "@/components/admin-listings-manager";
import { AdminLoginForm } from "@/components/admin-login-form";
import { LogoutButton } from "@/components/logout-button";
import type { Listing } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

async function AdminPageContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="px-4 py-12 sm:px-6">
        <AdminLoginForm />
      </div>
    );
  }

  const { data: adminRecord, error: adminCheckError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminCheckError || !adminRecord) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            Access Restricted
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-[#14261f]">
            Admin access required
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#4b5e55]">
            You are signed in as{" "}
            <span className="font-semibold text-[#14261f]">{user.email}</span>,
            which is not listed in{" "}
            <code className="rounded bg-[#f3ede0] px-1.5 py-0.5 text-xs">
              public.admin_users
            </code>
            .
          </p>
          <p className="mt-2 text-sm text-[#4b5e55]">
            If you are the site owner, run{" "}
            <code className="rounded bg-[#f3ede0] px-1.5 py-0.5 text-xs">
              supabase/grant_admin.sql
            </code>{" "}
            in your Supabase SQL Editor after signing up your admin email, then
            refresh this page.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-[#0f6b4e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#094c37]"
            >
              Back to Marketplace
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  const { data: allListings, error: listingsError } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e4dccb] bg-white p-6 shadow-xs">
        <div>
          <span className="inline-flex rounded-full bg-[#e6f4ee] px-3 py-1 text-xs font-semibold text-[#0f6b4e]">
            Admin Moderation
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-[#14261f]">
            All StaySmart PG Listings
          </h1>
          <p className="mt-0.5 text-sm text-[#4b5e55]">
            Signed in as {user.email}. Actions are enforced by Supabase
            row-level security.
          </p>
        </div>

        <LogoutButton />
      </div>

      {listingsError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          Could not load listings: {listingsError.message}
        </div>
      ) : (
        <AdminListingsManager listings={(allListings ?? []) as Listing[]} />
      )}
    </div>
  );
}

function AdminFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="h-28 animate-pulse rounded-2xl border border-[#e4dccb] bg-white/80" />
      <div className="h-80 animate-pulse rounded-2xl border border-[#e4dccb] bg-white/80" />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminPageContent />
    </Suspense>
  );
}
