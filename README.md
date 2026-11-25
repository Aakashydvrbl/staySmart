# StaySmart — Greater Noida PG Marketplace

StaySmart is a PG rental marketplace for **Greater Noida, India**, built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

## Features

- **Buyers / Renters:** Browse active PG listings without signing in, search by area or PG name, filter by room type and max monthly rent in INR, view full photo galleries and amenities, and contact owners via phone call or WhatsApp.
- **Sellers (PG Owners):** Sign up, sign in, publish listings with 1–5 uploaded photos, manage only their own listings, and take listings offline or make them live again.
- **Admin Moderation:** Protected `/admin` route backed by Supabase Row-Level Security (`public.admin_users` + `public.is_admin()`) to review all listings and take listings offline or restore them.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your Supabase project values (never commit `.env.local`):
   ```bash
   cp .env.example .env.local
   ```
   - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — your Supabase Publishable (`anon`) key (never use a service-role/secret key here)
3. Run `supabase/schema.sql` in **Supabase Dashboard → SQL Editor**.
4. Start the local server:
   ```bash
   npm run dev
   ```
5. To grant admin access after creating your admin user, run `supabase/grant_admin.sql` in **Supabase Dashboard → SQL Editor**.

## Deploying to GitHub & Vercel

1. **GitHub:** Verify `.env.local` is not tracked (`git status` should not show `.env.local`), then commit and push your repository to GitHub.
2. **Vercel:** Import the GitHub repository in Vercel and add these Environment Variables in **Project Settings → Environment Variables** (for Production & Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. **Supabase Auth URLs:** After Vercel gives you your live URL (e.g. `https://staysmart.vercel.app`), open **Supabase Dashboard → Authentication → URL Configuration**:
   - **Site URL:** `https://your-vercel-domain.vercel.app`
   - **Redirect URLs:**
     - `https://your-vercel-domain.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`
