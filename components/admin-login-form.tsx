"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Sign-in form rendered on /admin when no user session is active.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not sign in."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[#e4dccb] bg-white p-6 shadow-sm sm:p-8">
      <span className="inline-flex rounded-full bg-[#e6f4ee] px-3 py-1 text-xs font-semibold text-[#0f6b4e]">
        Admin Moderation
      </span>
      <h1 className="mt-3 text-2xl font-extrabold text-[#14261f]">
        Admin Sign In
      </h1>
      <p className="mt-1.5 text-sm text-[#4b5e55]">
        Sign in with an authorized StaySmart admin account to moderate
        listings.
      </p>

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
          {errorMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="admin-email"
            className="block text-xs font-semibold text-[#4b5e55]"
          >
            Admin email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs font-semibold text-[#4b5e55]"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#0f6b4e] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#094c37] disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign In to Admin"}
        </button>
      </form>
    </div>
  );
}
