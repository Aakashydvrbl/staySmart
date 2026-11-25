"use client";

import { useMemo, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import {
  GREATER_NOIDA_AREAS,
  ROOM_TYPES,
  type Listing,
} from "@/lib/listings";

interface ListingsExplorerProps {
  initialListings: Listing[];
  loadError?: string | null;
}

const RENT_OPTIONS = [
  { label: "Any budget", value: "" },
  { label: "Up to ₹8,000", value: "8000" },
  { label: "Up to ₹10,000", value: "10000" },
  { label: "Up to ₹12,000", value: "12000" },
  { label: "Up to ₹15,000", value: "15000" },
  { label: "Up to ₹20,000", value: "20000" },
];

/**
 * Interactive search and filter UI for browsing active Greater Noida PG listings.
 */
export function ListingsExplorer({
  initialListings,
  loadError,
}: ListingsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roomType, setRoomType] = useState("");
  const [maxRent, setMaxRent] = useState("");

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const maxRentNumber = maxRent ? Number(maxRent) : null;

    return initialListings.filter((listing) => {
      if (query) {
        const haystack = [
          listing.title,
          listing.area,
          listing.address ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (roomType && listing.room_type !== roomType) {
        return false;
      }

      if (maxRentNumber !== null && listing.monthly_rent > maxRentNumber) {
        return false;
      }

      return true;
    });
  }, [initialListings, searchQuery, roomType, maxRent]);

  const hasActiveFilters = Boolean(searchQuery.trim() || roomType || maxRent);

  function resetFilters() {
    setSearchQuery("");
    setRoomType("");
    setMaxRent("");
  }

  function handleAreaChipClick(area: string) {
    setSearchQuery((prev) => (prev.toLowerCase() === area.toLowerCase() ? "" : area));
    const el = document.getElementById("listings");
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* Hero + Search & Filter Bar */}
      <section className="border-b border-[#e4dccb] bg-gradient-to-b from-[#e6f4ee]/65 via-[#fbf8f1] to-[#fbf8f1]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[#0f6b4e]/25 bg-white px-3.5 py-1 text-xs font-semibold text-[#0f6b4e]">
              Greater Noida PG Marketplace
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#14261f] sm:text-5xl">
              Calm, verified PG stays across Greater Noida.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#4b5e55] sm:text-lg">
              Browse single, double, and triple-sharing PG rooms near Knowledge
              Park, Alpha, Beta, Gamma, and Pari Chowk—with transparent monthly
              rent in INR and direct owner contact.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-[#e4dccb] bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="pg-search"
                  className="block text-xs font-semibold text-[#4b5e55]"
                >
                  Search area or PG name
                </label>
                <input
                  id="pg-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="e.g. Knowledge Park II, Alpha I"
                  className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] placeholder:text-[#4b5e55]/70 focus:border-[#0f6b4e] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="pg-room-type"
                  className="block text-xs font-semibold text-[#4b5e55]"
                >
                  Room type
                </label>
                <select
                  id="pg-room-type"
                  value={roomType}
                  onChange={(event) => setRoomType(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
                >
                  <option value="">All room types</option>
                  {ROOM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="pg-max-rent"
                  className="block text-xs font-semibold text-[#4b5e55]"
                >
                  Max monthly rent
                </label>
                <select
                  id="pg-max-rent"
                  value={maxRent}
                  onChange={(event) => setMaxRent(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
                >
                  {RENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <a
                  href="#listings"
                  className="flex-1 rounded-xl bg-[#0f6b4e] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#094c37]"
                >
                  Show {filteredListings.length}{" "}
                  {filteredListings.length === 1 ? "PG" : "PGs"}
                </a>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm font-medium text-[#14261f] transition-colors hover:bg-[#f3ede0]"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Clickable Greater Noida area chips */}
          <div id="areas" className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#4b5e55]">
              Popular areas:
            </span>
            {GREATER_NOIDA_AREAS.map((area) => {
              const isSelected =
                searchQuery.trim().toLowerCase() === area.toLowerCase();
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleAreaChipClick(area)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? "border-[#0f6b4e] bg-[#0f6b4e] text-white"
                      : "border-[#e4dccb] bg-white text-[#14261f] hover:border-[#0f6b4e]"
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Active Listings Grid */}
      <section id="listings" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#14261f]">
              Active PG Listings in Greater Noida
            </h2>
            <p className="mt-1 text-sm text-[#4b5e55]">
              Click any PG to view all photos, amenities, and direct owner
              contact options.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-[#e6f4ee] px-3 py-1 text-xs font-semibold text-[#0f6b4e]">
            {filteredListings.length}{" "}
            {filteredListings.length === 1 ? "listing" : "listings"} found
          </span>
        </div>

        {loadError ? (
          <div className="mt-7 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950">
            <p className="font-semibold">Could not load listings from Supabase</p>
            <p className="mt-1 text-amber-900">{loadError}</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="mt-7 rounded-2xl border border-[#e4dccb] bg-white p-8 text-center">
            {initialListings.length === 0 ? (
              <>
                <h3 className="text-lg font-bold text-[#14261f]">
                  No active PG listings published yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-[#4b5e55]">
                  Your homepage is now connected to your live Supabase{" "}
                  <code className="rounded bg-[#f3ede0] px-1.5 py-0.5 text-xs">
                    listings
                  </code>{" "}
                  table. Once PG owners publish listings in Milestone 4, they
                  will appear here automatically.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-[#14261f]">
                  No PGs match your current filters
                </h3>
                <p className="mt-2 text-sm text-[#4b5e55]">
                  Try clearing your search text, widening your rent budget, or
                  choosing a different room type.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 rounded-xl bg-[#0f6b4e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#094c37]"
                >
                  Reset filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
