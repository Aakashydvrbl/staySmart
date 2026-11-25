export const ROOM_TYPES = [
  "Single",
  "Double Sharing",
  "Triple Sharing",
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

export const GREATER_NOIDA_AREAS = [
  "Knowledge Park II",
  "Knowledge Park III",
  "Alpha I",
  "Alpha II",
  "Beta I",
  "Beta II",
  "Gamma I",
  "Gamma II",
  "Pari Chowk",
  "Omega I",
  "Techzone IV",
] as const;

export const COMMON_AMENITIES = [
  "Wi-Fi",
  "AC",
  "Meals Included",
  "Power Backup",
  "Laundry",
  "24x7 Security",
  "CCTV",
  "RO Water",
  "Parking",
  "Housekeeping",
  "Geyser",
  "Attached Washroom",
] as const;

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  monthly_rent: number;
  area: string;
  address: string | null;
  room_type: RoomType;
  amenities: string[];
  photo_urls: string[];
  availability_date: string | null;
  contact_phone: string;
  whatsapp_phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Formats an availability date (YYYY-MM-DD) for display.
 */
export function formatAvailabilityDate(dateStr: string | null): string {
  if (!dateStr) {
    return "Available Now";
  }

  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return "Available Now";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (parsed <= today) {
    return "Available Now";
  }

  return `From ${parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

/**
 * Normalizes a phone number into a tel: link.
 * Defaults 10-digit Indian mobile numbers to +91.
 */
export function buildTelHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (/^\d{10}$/.test(cleaned)) {
    return `tel:+91${cleaned}`;
  }
  return `tel:${cleaned}`;
}

/**
 * Normalizes a WhatsApp number into a https://wa.me/ link with a prefilled PG inquiry message.
 */
export function buildWhatsAppHref(phone: string, listingTitle: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  const text = encodeURIComponent(
    `Hi, I saw "${listingTitle}" on StaySmart (Greater Noida) and would like to know more.`
  );
  return `https://wa.me/${normalized}?text=${text}`;
}
