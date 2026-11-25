"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  COMMON_AMENITIES,
  GREATER_NOIDA_AREAS,
  ROOM_TYPES,
  type RoomType,
} from "@/lib/listings";
import { createClient } from "@/lib/supabase/client";

interface SellerListingFormProps {
  sellerId: string;
}

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Form for sellers to publish a new PG listing with 1–5 uploaded photos.
 */
export function SellerListingForm({ sellerId }: SellerListingFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [area, setArea] = useState<string>(GREATER_NOIDA_AREAS[0]);
  const [address, setAddress] = useState("");
  const [roomType, setRoomType] = useState<RoomType>(ROOM_TYPES[1]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Wi-Fi",
  ]);
  const [customAmenities, setCustomAmenities] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState(getTodayDateString);
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [sameAsContact, setSameAsContact] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [aiSummary, setAiSummary] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setErrorMessage(null);

    if (selected.length > MAX_PHOTOS) {
      setErrorMessage(`Please select at most ${MAX_PHOTOS} photos.`);
      setFiles([]);
      return;
    }

    const oversized = selected.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setErrorMessage(
        `"${oversized.name}" is larger than 5 MB. Please choose smaller images.`
      );
      setFiles([]);
      return;
    }

    setFiles(selected);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setCreatedListingId(null);

    const rentNumber = Number(monthlyRent);
    if (!Number.isInteger(rentNumber) || rentNumber <= 0) {
      setErrorMessage("Please enter a valid monthly rent in INR.");
      return;
    }

    if (files.length < 1 || files.length > MAX_PHOTOS) {
      setErrorMessage("Please upload between 1 and 5 photos of your PG.");
      return;
    }

    const effectiveWhatsapp = sameAsContact
      ? contactPhone.trim()
      : whatsappPhone.trim();

    if (!contactPhone.trim() || !effectiveWhatsapp) {
      setErrorMessage("Please enter both contact and WhatsApp numbers.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];
      const batchStamp = Date.now();

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `${sellerId}/${batchStamp}-${index}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Photo upload failed (${file.name}): ${uploadError.message}`
          );
        }

        const { data: urlData } = supabase.storage
          .from("listing-photos")
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }

      const extraAmenities = customAmenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const allAmenities = Array.from(
        new Set([...selectedAmenities, ...extraAmenities])
      );

      const { data: inserted, error: insertError } = await supabase
        .from("listings")
        .insert({
          seller_id: sellerId,
          title: title.trim(),
          description: description.trim(),
          monthly_rent: rentNumber,
          area,
          address: address.trim() || null,
          room_type: roomType,
          amenities: allAmenities,
          photo_urls: uploadedUrls,
          availability_date: availabilityDate || null,
          contact_phone: contactPhone.trim(),
          whatsapp_phone: effectiveWhatsapp,
          ai_summary: aiSummary.trim() || null,
          is_active: true,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        throw new Error(
          insertError?.message ?? "Could not save listing to database."
        );
      }

      setTitle("");
      setDescription("");
      setMonthlyRent("");
      setAddress("");
      setCustomAmenities("");
      setContactPhone("");
      setWhatsappPhone("");
      setSameAsContact(true);
      setFiles([]);
      setFileInputKey((prev) => prev + 1);
      setAiSummary("");
      setCreatedListingId(inserted.id);
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong while publishing your listing."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#e4dccb] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#14261f]">Publish a New PG</h2>
      <p className="mt-1 text-sm text-[#4b5e55]">
        Your listing goes live immediately on StaySmart after publishing.
      </p>

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
          {errorMessage}
        </div>
      ) : null}

      {createdListingId ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#0f6b4e]/30 bg-[#e6f4ee] p-4 text-sm text-[#094c37]">
          <span>Your PG listing is now live on StaySmart!</span>
          <Link
            href={`/listings/${createdListingId}`}
            className="font-semibold underline hover:text-[#14261f]"
          >
            View live listing →
          </Link>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="listing-title"
              className="block text-xs font-semibold text-[#4b5e55]"
            >
              PG Name / Title *
            </label>
            <input
              id="listing-title"
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. GreenView Boys & Co-ed PG"
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="listing-rent"
              className="block text-xs font-semibold text-[#4b5e55]"
            >
              Monthly Rent (INR ₹) *
            </label>
            <input
              id="listing-rent"
              type="number"
              required
              min={1000}
              step={100}
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(event.target.value)}
              placeholder="e.g. 9500"
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="listing-room-type"
              className="block text-xs font-semibold text-[#4b5e55]"
            >
              Room Type *
            </label>
            <select
              id="listing-room-type"
              value={roomType}
              onChange={(event) => setRoomType(event.target.value as RoomType)}
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
            >
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="listing-area"
              className="block text-xs font-semibold text-[#4b5e55]"
            >
              Greater Noida Area *
            </label>
            <select
              id="listing-area"
              value={area}
              onChange={(event) => setArea(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
            >
              {GREATER_NOIDA_AREAS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="Other Greater Noida">Other Greater Noida</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="listing-availability"
              className="block text-xs font-semibold text-[#4b5e55]"
            >
              Available From *
            </label>
            <input
              id="listing-availability"
              type="date"
              required
              value={availabilityDate}
              onChange={(event) => setAvailabilityDate(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="listing-address"
              className="block text-xs font-semibold text-[#4b5e55]"
            >
              Full Address (optional)
            </label>
            <input
              id="listing-address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="e.g. Plot 18, Near Sharda University Gate, Knowledge Park II"
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="listing-description"
              className="block text-xs font-semibold text-[#4b5e55]"
            >
              Description *
            </label>
            <textarea
              id="listing-description"
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe room setup, meal options, distance to colleges/metro, house rules, and security deposit..."
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
            />
          </div>

          {/* AI Summary (optional) */}
          <div className="sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="listing-ai-summary"
                className="block text-xs font-semibold text-[#4b5e55]"
              >
                AI Summary{" "}
                <span className="font-normal text-[#4b5e55]/70">
                  (optional — appears on the listing page)
                </span>
              </label>
              <button
                type="button"
                disabled={generatingAi || (!title.trim() && !description.trim())}
                onClick={async () => {
                  setGeneratingAi(true);
                  setErrorMessage(null);
                  try {
                    const response = await fetch("/api/ai-summary", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title,
                        area,
                        roomType,
                        monthlyRent,
                        amenities: selectedAmenities,
                        description,
                      }),
                    });
                    const result = (await response.json()) as {
                      summary?: string;
                      error?: string;
                    };
                    if (result.summary) {
                      setAiSummary(result.summary);
                    } else {
                      setErrorMessage(
                        result.error ?? "AI summary failed. Try again."
                      );
                    }
                  } catch {
                    setErrorMessage("Could not reach AI summary service.");
                  } finally {
                    setGeneratingAi(false);
                  }
                }}
                className="rounded-lg border border-[#0f6b4e]/40 bg-[#e6f4ee] px-3 py-1.5 text-xs font-semibold text-[#0f6b4e] transition-colors hover:bg-[#0f6b4e] hover:text-white disabled:opacity-50"
              >
                {generatingAi ? "Generating…" : "✦ Generate with AI"}
              </button>
            </div>
            <textarea
              id="listing-ai-summary"
              rows={3}
              value={aiSummary}
              onChange={(event) => setAiSummary(event.target.value)}
              placeholder="Click 'Generate with AI' to create a short 2-sentence summary, or type your own here."
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
            />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <span className="block text-xs font-semibold text-[#4b5e55]">
            Amenities
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON_AMENITIES.map((amenity) => {
              const selected = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? "border-[#0f6b4e] bg-[#0f6b4e] text-white"
                      : "border-[#e4dccb] bg-[#fbf8f1] text-[#14261f] hover:border-[#0f6b4e]"
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={customAmenities}
            onChange={(event) => setCustomAmenities(event.target.value)}
            placeholder="Optional extra amenities (comma-separated, e.g. Gym, Study Room)"
            className="mt-2.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
          />
        </div>

        {/* Contact & WhatsApp */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="listing-phone"
              className="block text-xs font-semibold text-[#4b5e55]"
            >
              Contact Phone Number *
            </label>
            <input
              id="listing-phone"
              type="tel"
              required
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              placeholder="e.g. 9876543210"
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="listing-whatsapp"
                className="block text-xs font-semibold text-[#4b5e55]"
              >
                WhatsApp Number *
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#4b5e55]">
                <input
                  type="checkbox"
                  checked={sameAsContact}
                  onChange={(event) => setSameAsContact(event.target.checked)}
                  className="accent-[#0f6b4e]"
                />
                Same as phone
              </label>
            </div>
            <input
              id="listing-whatsapp"
              type="tel"
              required={!sameAsContact}
              disabled={sameAsContact}
              value={sameAsContact ? contactPhone : whatsappPhone}
              onChange={(event) => setWhatsappPhone(event.target.value)}
              placeholder="e.g. 9876543210"
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none disabled:opacity-65"
            />
          </div>
        </div>

        {/* Photos */}
        <div>
          <label
            htmlFor="listing-photos"
            className="block text-xs font-semibold text-[#4b5e55]"
          >
            PG Photos (1 to 5 images, max 5 MB each: JPG, PNG, WebP) *
          </label>
          <input
            key={fileInputKey}
            id="listing-photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            className="mt-1.5 block w-full rounded-xl border border-dashed border-[#0f6b4e]/40 bg-[#fbf8f1] p-3 text-sm text-[#14261f] file:mr-4 file:rounded-lg file:border-0 file:bg-[#0f6b4e] file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#094c37]"
          />
          {files.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-[#4b5e55]">
              {files.map((file) => (
                <li key={`${file.name}-${file.size}`}>
                  Selected: <span className="font-medium">{file.name}</span> (
                  {(file.size / (1024 * 1024)).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#0f6b4e] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#094c37] disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Uploading photos & publishing..." : "Publish Listing"}
        </button>
      </form>
    </section>
  );
}
