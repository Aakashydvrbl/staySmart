import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SummaryRequestBody {
  title?: string;
  area?: string;
  roomType?: string;
  monthlyRent?: string | number;
  amenities?: string[];
  description?: string;
}

/**
 * Generates a short 2-sentence PG summary for signed-in sellers using Gemini.
 * Keeps GEMINI_API_KEY strictly on the server.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in as a seller to generate an AI summary." },
      { status: 401 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured yet. Add it to .env.local (and Vercel Environment Variables) to enable AI summaries.",
      },
      { status: 503 }
    );
  }

  let body: SummaryRequestBody;
  try {
    body = (await request.json()) as SummaryRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const title = body.title?.trim() || "PG Accommodation";
  const area = body.area?.trim() || "Greater Noida";
  const roomType = body.roomType?.trim() || "Sharing";
  const monthlyRent = body.monthlyRent ? `₹${body.monthlyRent}/month` : "";
  const amenities = Array.isArray(body.amenities)
    ? body.amenities.slice(0, 8).join(", ")
    : "";
  const description = body.description?.trim() || "";

  if (!description && !body.title?.trim()) {
    return NextResponse.json(
      { error: "Enter a PG title or description first so AI can summarize it." },
      { status: 400 }
    );
  }

  const prompt = [
    "Write a clear, honest 2-sentence summary (max 45 words) for a PG rental listing in Greater Noida, India.",
    "Only use the facts below—do not invent distances, rules, or amenities.",
    `Title: ${title}`,
    `Area: ${area}, Greater Noida`,
    `Room Type: ${roomType}`,
    monthlyRent ? `Rent: ${monthlyRent}` : "",
    amenities ? `Amenities: ${amenities}` : "",
    description ? `Owner notes: ${description}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 120,
          },
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

    const summary =
      result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!summary) {
      return NextResponse.json(
        { error: "Gemini returned an empty summary. Try adding more details." },
        { status: 502 }
      );
    }

    return NextResponse.json({ summary });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to connect to Gemini API.",
      },
      { status: 502 }
    );
  }
}
