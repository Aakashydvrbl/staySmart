"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/format";
import { formatAvailabilityDate, type Listing } from "@/lib/listings";
import { createClient } from "@/lib/supabase/client";

interface SellerListingsManagerProps {
  listings: Listing[];
}

/**
 * Lets a seller view their own PG listings, toggle live/offline status, or delete one.
 */
export function SellerListingsManager({
  listings,
}: SellerListingsManagerProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleToggleActive(listing: Listing) {
    setBusyId(listing.id);
    setActionError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .update({ is_active: !listing.is_active })
        .eq("id", listing.id)
        .eq("seller_id", listing.seller_id);

      if (error) {
        setActionError(error.message);
        return;
      }

      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(listing: Listing) {
    setBusyId(listing.id);
    setActionError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listing.id)
        .eq("seller_id", listing.seller_id);

      if (error) {
        setActionError(error.message);
        return;
      }

      setConfirmDeleteId(null);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-[#e4dccb] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-[#14261f]">Your PG Listings</h2>
          <p className="mt-1 text-sm text-[#4b5e55]">
            Only your own listings appear here. You can take a PG offline or
            make it live again anytime.
          </p>
        </div>
        <span className="rounded-full bg-[#e6f4ee] px-3 py-1 text-xs font-semibold text-[#0f6b4e]">
          {listings.length} total
        </span>
      </div>

      {actionError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {actionError}
        </div>
      ) : null}

      {listings.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#e4dccb] bg-[#fbf8f1] p-8 text-center text-sm text-[#4b5e55]">
          You haven’t published any PG listings yet. Use the form above to
          publish your first PG.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {listings.map((listing) => {
            const isBusy = busyId === listing.id;
            const photo = listing.photo_urls[0] ?? null;

            return (
              <div
                key={listing.id}
                className="flex flex-col gap-4 rounded-xl border border-[#e4dccb] bg-[#fbf8f1]/70 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-[#e4dccb] bg-[#e6f4ee]">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={listing.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] text-[#4b5e55]">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          listing.is_active
                            ? "bg-[#e6f4ee] text-[#0f6b4e]"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {listing.is_active ? "Live" : "Offline"}
                      </span>
                      <span className="text-xs font-medium text-[#4b5e55]">
                        {listing.area} • {listing.room_type}
                      </span>
                    </div>

                    <h3 className="mt-1 font-bold text-[#14261f]">
                      {listing.title}
                    </h3>

                    <p className="mt-0.5 text-sm font-semibold text-[#0f6b4e]">
                      {formatINR(listing.monthly_rent)} / month
                      <span className="ml-2 text-xs font-normal text-[#4b5e55]">
                        ({formatAvailabilityDate(listing.availability_date)})
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {listing.is_active ? (
                    <Link
                      href={`/listings/${listing.id}`}
                      className="rounded-lg border border-[#e4dccb] bg-white px-3 py-1.5 text-xs font-semibold text-[#14261f] hover:border-[#0f6b4e] hover:text-[#0f6b4e]"
                    >
                      View Live
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleToggleActive(listing)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                      listing.is_active
                        ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                        : "bg-[#0f6b4e] text-white hover:bg-[#094c37]"
                    }`}
                  >
                    {isBusy
                      ? "Saving..."
                      : listing.is_active
                        ? "Take Offline"
                        : "Make Live Again"}
                  </button>

                  {confirmDeleteId === listing.id ? (
                    <>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(listing)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-[#e4dccb] bg-white px-3 py-1.5 text-xs font-medium text-[#4b5e55]"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => setConfirmDeleteId(listing.id)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
