"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
}

/**
 * Signs out the current Supabase user and refreshes the route.
 */
export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={
        className ??
        "rounded-lg border border-[#e4dccb] bg-white px-3 py-1.5 text-xs font-semibold text-[#14261f] transition-colors hover:border-[#0f6b4e] hover:text-[#0f6b4e] disabled:opacity-60"
      }
    >
      {loading ? "Signing out..." : "Log out"}
    </button>
  );
}
