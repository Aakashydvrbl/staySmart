import Link from "next/link";

export default function ListingNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <span className="inline-flex rounded-full bg-[#e6f4ee] px-3.5 py-1 text-xs font-semibold text-[#0f6b4e]">
        Listing unavailable
      </span>
      <h1 className="mt-4 text-2xl font-bold text-[#14261f]">
        This PG listing could not be found
      </h1>
      <p className="mt-2 text-sm text-[#4b5e55]">
        It may have been taken offline by the owner or removed, or the link may
        be incorrect.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-[#0f6b4e] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#094c37]"
      >
        Browse active Greater Noida PGs
      </Link>
    </div>
  );
}
