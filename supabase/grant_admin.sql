-- Initial Admin Setup for StaySmart
-- Run this in Supabase Dashboard -> SQL Editor AFTER aakashec9860@gmail.com
-- has signed up at least once on the StaySmart site.

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) = lower('aakashec9860@gmail.com')
on conflict (user_id) do nothing;
