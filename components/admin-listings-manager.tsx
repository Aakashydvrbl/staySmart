"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/format";
import { formatAvailabilityDate, type Listing } from "@/lib/listings";
import { createClient } from "@/lib/supabase/client";

interface AdminListingsManagerProps {
  listings: Listing[];
}

type StatusFilter = "all" | "active" | "offline";

/**
 * Admin moderation table/list for reviewing all PG listings and toggling live/offline status.
 */
export function AdminListingsManager({ listings }: AdminListingsManagerProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const active = listings.filter((item) => item.is_active).length;
    return {
      total: listings.length,
      active,
      offline: listings.length - active,
    };
  }, [listings]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return listings.filter((listing) => {
      if (statusFilter === "active" && !listing.is_active) return false;
      if (statusFilter === "offline" && listing.is_active) return false;

      if (normalizedQuery) {
        const text = `${listing.title} ${listing.area} ${listing.address ?? ""}`.toLowerCase();
        if (!text.includes(normalizedQuery)) return false;
      }

      return true;
    });
  }, [listings, statusFilter, query]);

  async function handleToggleStatus(listing: Listing) {
    setBusyId(listing.id);
    setActionError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .update({ is_active: !listing.is_active })
        .eq("id", listing.id);

      if (error) {
        setActionError(
          `Database rejected moderation update: ${error.message}`
        );
        return;
      }

      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e4dccb] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#4b5e55]">
            Total Listings
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[#14261f]">
            {counts.total}
          </p>
        </div>
        <div className="rounded-2xl border border-[#e4dccb] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0f6b4e]">
            Live on Marketplace
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[#0f6b4e]">
            {counts.active}
          </p>
        </div>
        <div className="rounded-2xl border border-[#e4dccb] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Taken Offline
          </p>
          <p className="mt-1 text-3xl font-extrabold text-amber-800">
            {counts.offline}
          </p>
        </div>
      </div>

      {/* Filters & List */}
      <section className="rounded-2xl border border-[#e4dccb] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "all", label: `All (${counts.total})` },
                { key: "active", label: `Live (${counts.active})` },
                { key: "offline", label: `Offline (${counts.offline})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === tab.key
                    ? "bg-[#0f6b4e] text-white"
                    : "border border-[#e4dccb] bg-[#fbf8f1] text-[#14261f] hover:border-[#0f6b4e]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by PG name or area..."
            className="w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none sm:w-64"
          />
        </div>

        {actionError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
            {actionError}
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-[#e4dccb] bg-[#fbf8f1] p-8 text-center text-sm text-[#4b5e55]">
            No listings match this filter.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filtered.map((listing) => {
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

                      <h2 className="mt-1 font-bold text-[#14261f]">
                        {listing.title}
                      </h2>

                      <p className="mt-0.5 text-sm font-semibold text-[#0f6b4e]">
                        {formatINR(listing.monthly_rent)} / month
                        <span className="ml-2 text-xs font-normal text-[#4b5e55]">
                          ({formatAvailabilityDate(listing.availability_date)})
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-[#4b5e55]">
                        Phone: {listing.contact_phone} • WhatsApp:{" "}
                        {listing.whatsapp_phone}
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
                      onClick={() => handleToggleStatus(listing)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                        listing.is_active
                          ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                          : "bg-[#0f6b4e] text-white hover:bg-[#094c37]"
                      }`}
                    >
                      {isBusy
                        ? "Updating..."
                        : listing.is_active
                          ? "Take Offline"
                          : "Restore Live"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
