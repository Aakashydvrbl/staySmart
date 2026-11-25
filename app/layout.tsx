import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "StaySmart — PG Rentals in Greater Noida",
  description:
    "Browse verified paying guest (PG) accommodations in Greater Noida across Knowledge Park, Alpha, Beta, Gamma, and Pari Chowk.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#fbf8f1] text-[#14261f]">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
