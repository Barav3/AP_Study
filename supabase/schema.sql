-- IJsMadeSomeBullshit — Supabase schema
-- Run in SQL Editor on a fresh Supabase project.

-- =============================================================================
-- 1. Subjects table
-- =============================================================================
create table if not exists public.subjects (
  id           text primary key,              -- slug, e.g. 'ap-hug'
  name         text not null,                 -- 'AP Human Geography'
  short        text,                          -- 'HUG'
  icon         text,                          -- emoji or URL
  color        text,                          -- hex
  description  text,
  category     text,                          -- 'History', 'Math', etc.
  deploy_mode  text check (deploy_mode in ('url','bundle') or deploy_mode is null),
  deploy_url   text,                          -- for 'url' mode
  bundle_path  text,                          -- storage path for 'bundle' mode
  updated_at   timestamptz not null default now()
);

-- =============================================================================
-- 2. Admin allowlist (emails allowed to write)
-- =============================================================================
create table if not exists public.admins (
  email text primary key
);

-- Bootstrap: insert your own admin email manually after signup, e.g.
--   insert into public.admins (email) values ('you@example.com');

-- =============================================================================
-- 3. Row Level Security
-- =============================================================================
alter table public.subjects enable row level security;
alter table public.admins   enable row level security;

-- Public can read subjects (the hub needs to list tiles for anonymous visitors).
drop policy if exists "subjects_read_all" on public.subjects;
create policy "subjects_read_all"
  on public.subjects for select
  using (true);

-- Only admins can write.
drop policy if exists "subjects_admin_write" on public.subjects;
create policy "subjects_admin_write"
  on public.subjects for all
  using ( (auth.jwt() ->> 'email') in (select email from public.admins) )
  with check ( (auth.jwt() ->> 'email') in (select email from public.admins) );

-- Admins table is private: only admins see/modify it.
drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read"
  on public.admins for select
  using ( (auth.jwt() ->> 'email') in (select email from public.admins) );

drop policy if exists "admins_self_write" on public.admins;
create policy "admins_self_write"
  on public.admins for all
  using ( (auth.jwt() ->> 'email') in (select email from public.admins) )
  with check ( (auth.jwt() ->> 'email') in (select email from public.admins) );

-- =============================================================================
-- 4. Storage bucket for future bundle uploads (v1.1)
-- =============================================================================
-- In the Storage UI, create a bucket named 'mini-apps' (private).
-- Storage policies (run in SQL editor after bucket exists):
--
--   create policy "mini_apps_public_read"
--     on storage.objects for select
--     using (bucket_id = 'mini-apps');
--
--   create policy "mini_apps_admin_write"
--     on storage.objects for insert
--     with check (
--       bucket_id = 'mini-apps'
--       and (auth.jwt() ->> 'email') in (select email from public.admins)
--     );

-- =============================================================================
-- 5. (Optional) Seed with the canonical 38 AP subjects
-- =============================================================================
-- The app works fine without this — it falls back to the local constant list.
-- But seeding lets you assign deploy_urls immediately via the admin panel.
--
-- Run src/lib/subjects.js data through a quick SQL insert if you want to
-- pre-populate. Skipping here to keep this file idempotent and small.
