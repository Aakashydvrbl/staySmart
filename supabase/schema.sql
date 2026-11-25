-- StaySmart Database & Storage Setup
-- Run this script in your Supabase Dashboard -> SQL Editor.
-- Safe to re-run: it does not drop tables or delete existing data.

-- 1. User profiles (stores buyer or seller preference; NEVER grants admin access)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  account_type text not null default 'buyer' check (account_type in ('buyer', 'seller')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (
    auth.uid() = id
    and account_type in ('buyer', 'seller')
  );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and account_type in ('buyer', 'seller')
  );

-- Automatically create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_type text;
begin
  requested_type := coalesce(new.raw_user_meta_data ->> 'account_type', 'buyer');
  if requested_type not in ('buyer', 'seller') then
    requested_type := 'buyer';
  end if;

  insert into public.profiles (id, email, full_name, account_type)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    requested_type
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 2. Admin allow-list table (only editable inside Supabase SQL Editor, never by users)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admins can check own admin status" on public.admin_users;
create policy "Admins can check own admin status"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Helper function used by RLS policies to verify admin privileges
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

-- 3. PG Listings table
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  monthly_rent integer not null check (monthly_rent > 0),
  area text not null,
  address text,
  room_type text not null check (room_type in ('Single', 'Double Sharing', 'Triple Sharing')),
  amenities text[] not null default '{}',
  photo_urls text[] not null default '{}',
  availability_date date,
  contact_phone text not null,
  whatsapp_phone text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_active_created
  on public.listings (is_active, created_at desc);

create index if not exists idx_listings_area
  on public.listings (area);

create index if not exists idx_listings_seller
  on public.listings (seller_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
  before update on public.listings
  for each row
  execute function public.set_updated_at();

alter table public.listings enable row level security;

drop policy if exists "Public can view active listings" on public.listings;
create policy "Public can view active listings"
  on public.listings
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Sellers can view own listings" on public.listings;
create policy "Sellers can view own listings"
  on public.listings
  for select
  to authenticated
  using (auth.uid() = seller_id);

drop policy if exists "Admins can view all listings" on public.listings;
create policy "Admins can view all listings"
  on public.listings
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Sellers can create own listings" on public.listings;
create policy "Sellers can create own listings"
  on public.listings
  for insert
  to authenticated
  with check (auth.uid() = seller_id);

drop policy if exists "Sellers can update own listings" on public.listings;
create policy "Sellers can update own listings"
  on public.listings
  for update
  to authenticated
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "Admins can update any listing" on public.listings;
create policy "Admins can update any listing"
  on public.listings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Sellers can delete own listings" on public.listings;
create policy "Sellers can delete own listings"
  on public.listings
  for delete
  to authenticated
  using (auth.uid() = seller_id);

-- 4. Grants
grant usage on schema public to anon, authenticated;
grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.admin_users to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- 5. Public Storage bucket for PG photos (uploads restricted to user's own folder)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view listing photos" on storage.objects;
create policy "Public can view listing photos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'listing-photos');

drop policy if exists "Users can upload listing photos to own folder" on storage.objects;
create policy "Users can upload listing photos to own folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own listing photos" on storage.objects;
create policy "Users can update own listing photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own listing photos" on storage.objects;
create policy "Users can delete own listing photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
