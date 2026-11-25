-- Add AI buyer review column to listings (run in Supabase SQL Editor)
alter table public.listings
  add column if not exists ai_buyer_review text;
