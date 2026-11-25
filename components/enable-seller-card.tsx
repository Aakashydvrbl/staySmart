"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface EnableSellerCardProps {
  userId: string;
  email: string;
}

/**
 * Lets a signed-in buyer upgrade their profile to seller access.
 */
export function EnableSellerCard({ userId, email }: EnableSellerCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleEnableSeller() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        email,
        account_type: "seller",
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#e4dccb] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-[#14261f]">
        Activate Seller Access
      </h2>
      <p className="mt-2 text-sm text-[#4b5e55]">
        You are currently signed in as a buyer ({email}). Enable seller access on
        your account to publish and manage PG listings.
      </p>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <button
        type="button"
        onClick={handleEnableSeller}
        disabled={loading}
        className="mt-5 rounded-xl bg-[#0f6b4e] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#094c37] disabled:opacity-60"
      >
        {loading ? "Enabling..." : "Enable Seller Portal"}
      </button>
    </div>
  );
}
