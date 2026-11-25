"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  role: "buyer" | "seller";
  mode: "login" | "signup";
}

/**
 * Shared email/password sign-in and sign-up form for buyers and sellers.
 */
export function AuthForm({ role, mode }: AuthFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const roleLabel = role === "seller" ? "Seller (PG Owner)" : "Buyer (Renter)";
  const targetAfterAuth =
    role === "seller" ? "/seller/dashboard" : "/buyer/account";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const supabase = createClient();

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              account_type: role,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetAfterAuth)}`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          router.push(targetAfterAuth);
          router.refresh();
          return;
        }

        setSuccessMessage(
          "Account created! Check your email inbox and click the confirmation link, then sign in."
        );
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push(targetAfterAuth);
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[#e4dccb] bg-white p-6 shadow-sm sm:p-8">
      <span className="inline-flex rounded-full bg-[#e6f4ee] px-3 py-1 text-xs font-semibold text-[#0f6b4e]">
        {roleLabel}
      </span>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#14261f]">
        {isSignup
          ? `Create your ${role === "seller" ? "seller" : "buyer"} account`
          : `Sign in as a ${role === "seller" ? "PG owner" : "buyer"}`}
      </h1>
      <p className="mt-1.5 text-sm text-[#4b5e55]">
        {role === "seller"
          ? "Manage your Greater Noida PG listings and upload room photos."
          : "Keep your StaySmart account ready. You can always browse PGs without signing in."}
      </p>

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-4 rounded-xl border border-[#0f6b4e]/30 bg-[#e6f4ee] p-3.5 text-sm text-[#094c37]">
          {successMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {isSignup ? (
          <div>
            <label
              htmlFor="auth-full-name"
              className="block text-xs font-semibold text-[#4b5e55]"
            >
              Full name
            </label>
            <input
              id="auth-full-name"
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
            />
          </div>
        ) : null}

        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-semibold text-[#4b5e55]"
          >
            Email address
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block text-xs font-semibold text-[#4b5e55]"
          >
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={6}
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            className="mt-1.5 w-full rounded-xl border border-[#e4dccb] bg-[#fbf8f1] px-3.5 py-2.5 text-sm text-[#14261f] focus:border-[#0f6b4e] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#0f6b4e] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#094c37] disabled:opacity-60"
        >
          {submitting
            ? isSignup
              ? "Creating account..."
              : "Signing in..."
            : isSignup
              ? "Create Account"
              : "Sign In"}
        </button>
      </form>

      <div className="mt-6 space-y-2 border-t border-[#f3ede0] pt-4 text-center text-xs text-[#4b5e55]">
        <p>
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            href={
              isSignup ? `/${role}/login` : `/${role}/signup`
            }
            className="font-semibold text-[#0f6b4e] hover:underline"
          >
            {isSignup ? "Sign in" : "Sign up"}
          </Link>
        </p>
        <p>
          {role === "seller" ? (
            <>
              Looking for a PG room?{" "}
              <Link
                href="/buyer/login"
                className="font-semibold text-[#0f6b4e] hover:underline"
              >
                Buyer Sign In
              </Link>
            </>
          ) : (
            <>
              Own or manage a PG?{" "}
              <Link
                href="/seller/login"
                className="font-semibold text-[#0f6b4e] hover:underline"
              >
                Seller Sign In
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
