import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { EnableSellerCard } from "@/components/enable-seller-card";
import { LogoutButton } from "@/components/logout-button";
import { SellerListingForm } from "@/components/seller-listing-form";
import { SellerListingsManager } from "@/components/seller-listings-manager";
import type { Listing } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

async function SellerDashboardContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/seller/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, account_type")
    .eq("id", user.id)
    .maybeSingle();

  const isSeller = profile?.account_type === "seller";

  const { data: ownListings, error: listingsError } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e4dccb] bg-white p-6 shadow-xs">
        <div>
          <span className="inline-flex rounded-full bg-[#e6f4ee] px-3 py-1 text-xs font-semibold text-[#0f6b4e]">
            Seller Portal
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-[#14261f]">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="mt-0.5 text-sm text-[#4b5e55]">{user.email}</p>
        </div>

        <LogoutButton />
      </div>

      {!isSeller ? (
        <EnableSellerCard userId={user.id} email={user.email ?? ""} />
      ) : (
        <>
          <SellerListingForm sellerId={user.id} />

          {listingsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              Could not load your listings: {listingsError.message}
            </div>
          ) : (
            <SellerListingsManager
              listings={(ownListings ?? []) as Listing[]}
            />
          )}
        </>
      )}
    </div>
  );
}

function SellerDashboardFallback() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <div className="h-28 animate-pulse rounded-2xl border border-[#e4dccb] bg-white/80" />
      <div className="h-96 animate-pulse rounded-2xl border border-[#e4dccb] bg-white/80" />
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <Suspense fallback={<SellerDashboardFallback />}>
      <SellerDashboardContent />
    </Suspense>
  );
}
