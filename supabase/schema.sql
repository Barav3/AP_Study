-- IJsMadeSomeBullshit — Supabase schema (revised, activities + recursion-safe)
-- Run in SQL Editor on a fresh Supabase project.
-- Safe to re-run on an existing project: every statement is idempotent.

-- =============================================================================
-- 1. Subjects table (the 38 AP tiles — these are FOLDERS, not apps)
-- =============================================================================
create table if not exists public.subjects (
  id           text primary key,              -- slug, e.g. 'ap-hug'
  name         text not null,                 -- 'AP Human Geography'
  short        text,                          -- 'HUG'
  icon         text,                          -- emoji or URL
  color        text,                          -- hex
  description  text,
  category     text,                          -- 'History', 'Math', etc.
  deploy_mode  text,                          -- LEGACY — prefer activities
  deploy_url   text,                          -- LEGACY
  inline_html  text,                          -- LEGACY
  bundle_path  text,                          -- LEGACY
  updated_at   timestamptz not null default now()
);

alter table public.subjects add column if not exists inline_html text;
alter table public.subjects add column if not exists short       text;
alter table public.subjects add column if not exists category    text;

alter table public.subjects drop constraint if exists subjects_deploy_mode_check;
alter table public.subjects add  constraint subjects_deploy_mode_check
  check (deploy_mode in ('url','inline','bundle') or deploy_mode is null);

-- =============================================================================
-- 2. Activities table — the actual mini-apps that live inside a subject folder
-- =============================================================================
-- Each subject can have many activities. A subject tile opens into a grid of
-- its activities. Click an activity → iframe loads that mini-app.
create table if not exists public.activities (
  id           text primary key,               -- slug, e.g. 'ap-hug-practice-tests'
  subject_id   text not null references public.subjects(id) on delete cascade,
  name         text not null,                  -- 'Practice Tests'
  icon         text,                           -- emoji
  description  text,
  deploy_mode  text,                           -- 'url' | 'inline' | null
  deploy_url   text,                           -- for 'url' mode
  inline_html  text,                           -- for 'inline' mode
  sort_order   int  not null default 0,        -- display order within subject
  updated_at   timestamptz not null default now()
);

create index if not exists activities_subject_idx
  on public.activities (subject_id, sort_order);

alter table public.activities drop constraint if exists activities_deploy_mode_check;
alter table public.activities add  constraint activities_deploy_mode_check
  check (deploy_mode in ('url','inline') or deploy_mode is null);

-- =============================================================================
-- 3. Admin allowlist
-- =============================================================================
create table if not exists public.admins (
  email text primary key
);

-- =============================================================================
-- 4. is_admin() helper — SECURITY DEFINER avoids recursive RLS on admins
-- =============================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- =============================================================================
-- 5. Row Level Security
-- =============================================================================
alter table public.subjects   enable row level security;
alter table public.activities enable row level security;
alter table public.admins     enable row level security;

-- --- subjects ---------------------------------------------------------------
drop policy if exists "subjects_read_all"    on public.subjects;
drop policy if exists "subjects_admin_write" on public.subjects;

create policy "subjects_read_all"
  on public.subjects for select using ( true );

create policy "subjects_admin_write"
  on public.subjects for all
  using      ( public.is_admin() )
  with check ( public.is_admin() );

-- --- activities -------------------------------------------------------------
drop policy if exists "activities_read_all"    on public.activities;
drop policy if exists "activities_admin_write" on public.activities;

create policy "activities_read_all"
  on public.activities for select using ( true );

create policy "activities_admin_write"
  on public.activities for all
  using      ( public.is_admin() )
  with check ( public.is_admin() );

-- --- admins -----------------------------------------------------------------
drop policy if exists "admins_self_read"  on public.admins;
drop policy if exists "admins_self_write" on public.admins;
drop policy if exists "admins_own_row"    on public.admins;

create policy "admins_own_row"
  on public.admins for all
  using      ( email = (auth.jwt() ->> 'email') )
  with check ( email = (auth.jwt() ->> 'email') );

-- =============================================================================
-- 6. Refresh PostgREST schema cache
-- =============================================================================
notify pgrst, 'reload schema';

-- =============================================================================
-- 7. Post-install checklist (run manually once)
-- =============================================================================
-- a) Add your email to the admin allowlist:
--      insert into public.admins (email) values ('you@example.com')
--      on conflict (email) do nothing;
--
-- b) Verify:
--      select public.is_admin();            -- should return true when signed in
--      select count(*) from public.subjects;
--      select count(*) from public.activities;
