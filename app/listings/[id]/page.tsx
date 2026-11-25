import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { formatINR } from "@/lib/format";
import {
  buildTelHref,
  buildWhatsAppHref,
  formatAvailabilityDate,
  isValidUuid,
  type Listing,
} from "@/lib/listings";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

async function ListingDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  if (!isValidUuid(id) || !isSupabaseConfigured()) {
    notFound();
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const listing = data as Listing;
  const photos = listing.photo_urls ?? [];
  const availabilityLabel = formatAvailabilityDate(listing.availability_date);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f6b4e] hover:text-[#094c37]"
      >
        ← Back to all Greater Noida PGs
      </Link>

      {/* Photo Gallery */}
      <section className="mt-6">
        {photos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative h-72 overflow-hidden rounded-2xl border border-[#e4dccb] bg-[#f3ede0] sm:h-96 md:col-span-2">
              <Image
                src={photos[0]}
                alt={`${listing.title} main photo`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
              />
            </div>

            {photos.length > 1 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                {photos.slice(1, 5).map((photoUrl, index) => (
                  <div
                    key={photoUrl}
                    className="relative h-36 overflow-hidden rounded-2xl border border-[#e4dccb] bg-[#f3ede0] md:h-44"
                  >
                    <Image
                      src={photoUrl}
                      alt={`${listing.title} photo ${index + 2}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="hidden items-center justify-center rounded-2xl border border-[#e4dccb] bg-[#f3ede0]/70 p-6 text-center text-sm text-[#4b5e55] md:flex">
                1 photo provided by the PG owner
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-[#e4dccb] bg-gradient-to-br from-[#d8efe5] via-[#ebf6f0] to-[#f4efe2] p-6 text-center">
            <p className="rounded-xl bg-white/90 px-4 py-2 text-sm font-medium text-[#4b5e55]">
              No photos uploaded for this PG yet
            </p>
          </div>
        )}
      </section>

      {/* Main Details + Contact Sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-[#e4dccb] bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#0f6b4e] px-3 py-1 text-xs font-semibold text-white">
                {listing.room_type}
              </span>
              <span className="rounded-full bg-[#e6f4ee] px-3 py-1 text-xs font-semibold text-[#0f6b4e]">
                {availabilityLabel}
              </span>
              <span className="rounded-full border border-[#e4dccb] bg-[#fbf8f1] px-3 py-1 text-xs font-medium text-[#14261f]">
                {listing.area}, Greater Noida
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#14261f] sm:text-3xl">
              {listing.title}
            </h1>

            {listing.address ? (
              <p className="mt-2 text-sm font-medium text-[#4b5e55]">
                Address: {listing.address}
              </p>
            ) : null}

            <div className="mt-6 border-t border-[#f3ede0] pt-6">
              <h2 className="text-base font-bold text-[#14261f]">
                About this PG
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#4b5e55]">
                {listing.description}
              </p>
            </div>

            <div className="mt-6 border-t border-[#f3ede0] pt-6">
              <h2 className="text-base font-bold text-[#14261f]">Amenities</h2>
              {listing.amenities.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-lg border border-[#e4dccb] bg-[#fbf8f1] px-3 py-1.5 text-sm font-medium text-[#14261f]"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#4b5e55]">
                  Ask the owner directly for specific amenities.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Owner Card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-[#e4dccb] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4b5e55]">
              Monthly Rent
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#0f6b4e]">
                {formatINR(listing.monthly_rent)}
              </span>
              <span className="text-sm text-[#4b5e55]">/ month</span>
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-[#f3ede0] pt-4 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-[#4b5e55]">Area</dt>
                <dd className="font-semibold text-[#14261f]">{listing.area}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#4b5e55]">Room Type</dt>
                <dd className="font-semibold text-[#14261f]">
                  {listing.room_type}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#4b5e55]">Availability</dt>
                <dd className="font-semibold text-[#14261f]">
                  {availabilityLabel}
                </dd>
              </div>
            </dl>

            <div className="mt-6 space-y-3">
              <a
                href={buildTelHref(listing.contact_phone)}
                className="flex w-full items-center justify-center rounded-xl bg-[#0f6b4e] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#094c37]"
              >
                Call Owner ({listing.contact_phone})
              </a>

              <a
                href={buildWhatsAppHref(listing.whatsapp_phone, listing.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-xl border border-[#0f6b4e] bg-[#e6f4ee] px-4 py-3 text-sm font-semibold text-[#0f6b4e] transition-colors hover:bg-[#0f6b4e] hover:text-white"
              >
                Message on WhatsApp
              </a>
            </div>

            <p className="mt-4 rounded-xl bg-[#fbf8f1] p-3 text-xs leading-relaxed text-[#4b5e55]">
              Tip: Always visit the PG room in person and confirm meal timings
              and deposit terms before paying any advance.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ListingDetailFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-80 animate-pulse rounded-2xl border border-[#e4dccb] bg-white/80" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl border border-[#e4dccb] bg-white/80 lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl border border-[#e4dccb] bg-white/80" />
      </div>
    </div>
  );
}

export default function ListingDetailPage({
  params,
}: PageProps<"/listings/[id]">) {
  return (
    <Suspense fallback={<ListingDetailFallback />}>
      <ListingDetailContent params={params} />
    </Suspense>
  );
}
