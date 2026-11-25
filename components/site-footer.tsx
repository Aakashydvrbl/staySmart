import Link from "next/link";

/**
 * Shared footer for the StaySmart marketplace.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-[#e4dccb] bg-[#f3ede0]/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[#4b5e55] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-[#14261f]">StaySmart</p>
          <p className="mt-0.5 text-xs">
            Direct PG rentals across Knowledge Park, Alpha, Beta, Gamma &amp;
            Pari Chowk, Greater Noida.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <Link href="/#listings" className="hover:text-[#0f6b4e]">
            Active PGs
          </Link>
          <Link href="/#areas" className="hover:text-[#0f6b4e]">
            Greater Noida Areas
          </Link>
          <Link href="/#owners" className="hover:text-[#0f6b4e]">
            For PG Owners
          </Link>
        </div>
      </div>
    </footer>
  );
}
