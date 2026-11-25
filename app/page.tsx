import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ListingsExplorer } from "@/components/listings-explorer";
import type { Listing } from "@/lib/listings";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

async function ActiveListingsLoader() {
  await connection();

  if (!isSupabaseConfigured()) {
    return (
      <ListingsExplorer
        initialListings={[]}
        loadError="Supabase environment variables are not configured in .env.local yet."
      />
    );
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <ListingsExplorer
        initialListings={[]}
        loadError={`Database query failed: ${error.message}. Make sure you have run supabase/schema.sql in Supabase SQL Editor.`}
      />
    );
  }

  return <ListingsExplorer initialListings={(data ?? []) as Listing[]} />;
}

function ListingsLoadingFallback() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="h-44 animate-pulse rounded-2xl border border-[#e4dccb] bg-white/80" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-80 animate-pulse rounded-2xl border border-[#e4dccb] bg-white/80"
          />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<ListingsLoadingFallback />}>
        <ActiveListingsLoader />
      </Suspense>

      {/* Buyer & Owner entry points */}
      <section
        id="owners"
        className="border-t border-[#e4dccb] bg-[#f3ede0]/55"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-12 sm:px-6 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-[#e4dccb] bg-white p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0f6b4e]">
                For Students &amp; Working Professionals
              </p>
              <h3 className="mt-2 text-xl font-bold text-[#14261f]">
                Browse freely, contact owners directly
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5e55]">
                Explore active Greater Noida PGs without creating an account.
                Want a StaySmart buyer account? Sign up or sign in below.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/buyer/signup"
                className="rounded-xl bg-[#0f6b4e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#094c37]"
              >
                Buyer Sign Up
              </Link>
              <Link
                href="/buyer/login"
                className="rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-4 py-2 text-xs font-semibold text-[#14261f] hover:border-[#0f6b4e]"
              >
                Buyer Sign In
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-[#e4dccb] bg-white p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0f6b4e]">
                For PG Owners &amp; Managers
              </p>
              <h3 className="mt-2 text-xl font-bold text-[#14261f]">
                Publish your PG in minutes
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5e55]">
                Create a seller account to upload 1–5 photos, publish your PG
                immediately, and take it offline or live again anytime.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/seller/signup"
                className="rounded-xl bg-[#0f6b4e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#094c37]"
              >
                Seller Sign Up
              </Link>
              <Link
                href="/seller/login"
                className="rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-4 py-2 text-xs font-semibold text-[#14261f] hover:border-[#0f6b4e]"
              >
                Seller Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
