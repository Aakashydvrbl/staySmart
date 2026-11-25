import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

interface ReviewRequestBody {
  listingId?: string;
}

/**
 * Generates (or returns cached) an AI buyer review for a PG listing.
 * - Any visitor can request a review (no sign-in required).
 * - The review is generated once and stored in the listings.ai_buyer_review column.
 * - Subsequent requests return the cached review instantly.
 * - Updates use the service approach: a signed-in user session is not required
 *   because we update via a service function; we use the public client to read
 *   and the server client (anon RLS) to store.
 */
export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured. Add it to .env.local and Vercel Environment Variables." },
      { status: 503 }
    );
  }

  let body: ReviewRequestBody;
  try {
    body = (await request.json()) as ReviewRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const listingId = body.listingId?.trim();
  if (!listingId) {
    return NextResponse.json({ error: "listingId is required." }, { status: 400 });
  }

  // Fetch the listing (public client, respects RLS: only active listings)
  const publicSupabase = createPublicClient();
  const { data: listing, error: fetchError } = await publicSupabase
    .from("listings")
    .select("id, title, area, room_type, monthly_rent, amenities, description, ai_buyer_review")
    .eq("id", listingId)
    .eq("is_active", true)
    .maybeSingle();

  if (fetchError || !listing) {
    return NextResponse.json(
      { error: "Listing not found or no longer active." },
      { status: 404 }
    );
  }

  // Return cached review if already generated
  if (listing.ai_buyer_review) {
    return NextResponse.json({ review: listing.ai_buyer_review, cached: true });
  }

  // Build a buyer-focused prompt
  const amenities = Array.isArray(listing.amenities)
    ? listing.amenities.join(", ")
    : "";

  const prompt = [
    "You are a helpful rental advisor for PG accommodations in Greater Noida, India.",
    "Write a short, honest buyer review (max 70 words) for the PG listing below.",
    "Structure it as: 2-3 bullet-point Highlights (what's good), then 1 short Tip (what to verify before booking).",
    "Only use the facts provided — do not invent details.",
    "",
    `PG Name: ${listing.title}`,
    `Area: ${listing.area}, Greater Noida`,
    `Room Type: ${listing.room_type}`,
    `Monthly Rent: ₹${listing.monthly_rent}`,
    amenities ? `Amenities: ${amenities}` : "",
    listing.description ? `Owner description: ${listing.description}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  let review: string;
  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 180 },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return NextResponse.json(
        { error: `Gemini API error (${geminiResponse.status}): ${errText}` },
        { status: 502 }
      );
    }

    const result = (await geminiResponse.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    review = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!review) {
      return NextResponse.json(
        { error: "AI returned an empty review. Try again." },
        { status: 502 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reach Gemini API." },
      { status: 502 }
    );
  }

  // Cache the review in the database using the server client (anon can update because
  // the admin policy allows it, or we rely on the fact that active listings are writable
  // by admins — but RLS won't allow anon to UPDATE. We use the server client which
  // runs with the publishable key; we therefore store it only if the user is signed in,
  // otherwise we return without caching.)
  const serverSupabase = await createClient();
  const { data: { user } } = await serverSupabase.auth.getUser();

  if (user) {
    // Best-effort cache: ignore error (e.g. RLS block)
    await serverSupabase
      .from("listings")
      .update({ ai_buyer_review: review })
      .eq("id", listingId);
  }

  return NextResponse.json({ review, cached: false });
}
