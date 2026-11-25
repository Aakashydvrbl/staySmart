import { Suspense } from "react";
import Link from "next/link";
import { HeaderAuthNav } from "@/components/header-auth-nav";

/**
 * Shared top navigation bar used across buyer, seller, and admin pages.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#e4dccb] bg-[#fbf8f1]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f6b4e] text-sm font-bold text-white shadow-sm">
              SS
            </span>
            <div className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-[#14261f]">
                StaySmart
              </span>
              <span className="block text-[11px] font-medium text-[#4b5e55]">
                Greater Noida PGs
              </span>
            </div>
          </Link>

          <Link
            href="/#listings"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[#14261f] transition-colors hover:bg-[#f3ede0] sm:inline-block"
          >
            Browse PGs
          </Link>
        </div>

        <nav
          aria-label="Account navigation"
          className="flex items-center gap-2"
        >
          <Suspense
            fallback={
              <div className="h-9 w-36 animate-pulse rounded-lg bg-[#f3ede0]" />
            }
          >
            <HeaderAuthNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
