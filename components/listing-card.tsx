import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import {
  buildTelHref,
  buildWhatsAppHref,
  formatAvailabilityDate,
  type Listing,
} from "@/lib/listings";

interface ListingCardProps {
  listing: Listing;
}

/**
 * Displays a single active PG listing card with photo, rent in INR, area, amenities, and quick actions.
 */
export function ListingCard({ listing }: ListingCardProps) {
  const primaryPhoto = listing.photo_urls[0] ?? null;
  const availabilityLabel = formatAvailabilityDate(listing.availability_date);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#e4dccb] bg-white shadow-xs transition-shadow hover:shadow-md">
      <Link href={`/listings/${listing.id}`} className="group block">
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#d8efe5] via-[#ebf6f0] to-[#f4efe2]">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto}
              alt={`${listing.title} in ${listing.area}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-103"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center">
              <span className="rounded-lg bg-white/85 px-3 py-1.5 text-xs font-medium text-[#4b5e55]">
                No photo uploaded yet
              </span>
            </div>
          )}

          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#0f6b4e] px-3 py-1 text-xs font-semibold text-white shadow-xs">
              {listing.room_type}
            </span>
            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-[#14261f] shadow-xs">
              {availabilityLabel}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0f6b4e]">
              {listing.area}
            </p>
            <Link href={`/listings/${listing.id}`}>
              <h3 className="mt-1 truncate text-lg font-bold leading-snug text-[#14261f] hover:text-[#0f6b4e]">
                {listing.title}
              </h3>
            </Link>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-extrabold text-[#0f6b4e]">
              {formatINR(listing.monthly_rent)}
            </p>
            <p className="text-xs text-[#4b5e55]">per month</p>
          </div>
        </div>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[#4b5e55]">
          {listing.description}
        </p>

        {listing.address ? (
          <p className="mt-2 truncate text-xs text-[#4b5e55]">
            {listing.address}
          </p>
        ) : null}

        {listing.amenities.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {listing.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="rounded-md border border-[#e4dccb] bg-[#fbf8f1] px-2.5 py-1 text-xs font-medium text-[#14261f]"
              >
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 4 ? (
              <span className="rounded-md px-2 py-1 text-xs font-medium text-[#4b5e55]">
                +{listing.amenities.length - 4} more
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#f3ede0] pt-4">
          <Link
            href={`/listings/${listing.id}`}
            className="flex-1 rounded-xl bg-[#0f6b4e] px-3.5 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#094c37]"
          >
            View Details
          </Link>
          <a
            href={buildTelHref(listing.contact_phone)}
            className="rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3 py-2 text-xs font-semibold text-[#14261f] transition-colors hover:border-[#0f6b4e] hover:text-[#0f6b4e]"
          >
            Call
          </a>
          <a
            href={buildWhatsAppHref(listing.whatsapp_phone, listing.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[#0f6b4e]/30 bg-[#e6f4ee] px-3 py-2 text-xs font-semibold text-[#0f6b4e] transition-colors hover:bg-[#0f6b4e] hover:text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
