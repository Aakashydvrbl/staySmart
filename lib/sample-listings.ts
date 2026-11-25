export type RoomType = "Single" | "Double Sharing" | "Triple Sharing";

export interface SampleListing {
  id: string;
  title: string;
  description: string;
  monthlyRent: number;
  area: string;
  address: string;
  roomType: RoomType;
  amenities: string[];
  availabilityDate: string;
  photoTint: string;
  photoLabel: string;
}

export const GREATER_NOIDA_AREAS = [
  "Knowledge Park II",
  "Knowledge Park III",
  "Alpha I",
  "Beta II",
  "Gamma I",
  "Pari Chowk",
] as const;

export const SAMPLE_LISTINGS: SampleListing[] = [
  {
    id: "sample-1",
    title: "GreenView Boys & Co-ed Residency",
    description:
      "Bright, airy rooms 5 minutes from Knowledge Park II metro station with freshly cooked meals and quiet study tables.",
    monthlyRent: 9500,
    area: "Knowledge Park II",
    address: "Plot 18, Near Sharda University Gate",
    roomType: "Double Sharing",
    amenities: ["Wi-Fi", "AC", "3 Meals Included", "Power Backup"],
    availabilityDate: "Available Now",
    photoTint: "from-[#d8efe5] via-[#ebf6f0] to-[#f4efe2]",
    photoLabel: "Double Sharing • Near Metro",
  },
  {
    id: "sample-2",
    title: "Olive Courtyard Girls PG",
    description:
      "Calm residential block with biometric entry, warden on site, and hygienic home-style North Indian food.",
    monthlyRent: 11500,
    area: "Alpha I",
    address: "Block C, Alpha I Commercial Belt",
    roomType: "Single",
    amenities: ["Wi-Fi", "AC", "24x7 Security", "Laundry"],
    availabilityDate: "From 1 Dec",
    photoTint: "from-[#e3efe9] via-[#f2f6ee] to-[#efe7d6]",
    photoLabel: "Private Single • Alpha I",
  },
  {
    id: "sample-3",
    title: "CampusNest Student PG",
    description:
      "Budget-friendly triple sharing rooms ideal for engineering and management students in Knowledge Park III.",
    monthlyRent: 7200,
    area: "Knowledge Park III",
    address: "Sector KP-III, Opposite Galgotias College",
    roomType: "Triple Sharing",
    amenities: ["Wi-Fi", "RO Water", "Meals Included", "CCTV"],
    availabilityDate: "Available Now",
    photoTint: "from-[#d4ebe0] via-[#e9f4ee] to-[#f7f1e3]",
    photoLabel: "Triple Sharing • KP-III",
  },
  {
    id: "sample-4",
    title: "Pari Chowk Heritage Stay",
    description:
      "Walking distance to Pari Chowk Metro and Yamuna Expressway bus stop, with attached balconies and housekeeping.",
    monthlyRent: 10200,
    area: "Pari Chowk",
    address: "Near Metro Gate 2, Pari Chowk",
    roomType: "Double Sharing",
    amenities: ["AC", "Housekeeping", "Wi-Fi", "Geyser"],
    availabilityDate: "Available Now",
    photoTint: "from-[#dceee5] via-[#eef6f1] to-[#f1ead9]",
    photoLabel: "Balcony Room • Pari Chowk",
  },
  {
    id: "sample-5",
    title: "Banyan Leaf Residency",
    description:
      "Peaceful park-facing PG in Beta II with high-speed fiber internet, spacious wardrobes, and two-wheeler parking.",
    monthlyRent: 12800,
    area: "Beta II",
    address: "H-42, Beta II Sector",
    roomType: "Single",
    amenities: ["AC", "Wi-Fi", "Parking", "Power Backup"],
    availabilityDate: "From 5 Dec",
    photoTint: "from-[#d9ede3] via-[#edf5ef] to-[#f4ece0]",
    photoLabel: "Park Facing • Beta II",
  },
  {
    id: "sample-6",
    title: "Meadowside PG Homes",
    description:
      "Clean, well-ventilated rooms near Gamma I market and hospitals, suited for students and working professionals.",
    monthlyRent: 8400,
    area: "Gamma I",
    address: "D-114, Gamma I Main Road",
    roomType: "Double Sharing",
    amenities: ["Wi-Fi", "Meals Included", "Fridge", "Laundry"],
    availabilityDate: "Available Now",
    photoTint: "from-[#e0efe8] via-[#f0f6f2] to-[#f3ead8]",
    photoLabel: "Double Sharing • Gamma I",
  },
];
