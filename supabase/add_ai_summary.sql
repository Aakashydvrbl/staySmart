-- Optional Milestone 7 migration: add ai_summary column to listings
-- Run this in Supabase Dashboard -> SQL Editor.

alter table public.listings
  add column if not exists ai_summary text;
