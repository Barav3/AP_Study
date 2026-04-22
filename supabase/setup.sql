-- IJsMadeSomeBullshit — one-shot Supabase setup
-- Paste this entire file into Supabase → SQL Editor → Run.
-- It creates the schema, RLS policies, admin allowlist, and seeds all 40 AP subjects.

-- =============================================================================
-- 1. Tables
-- =============================================================================
create table if not exists public.subjects (
  id           text primary key,
  name         text not null,
  short        text,
  icon         text,
  color        text,
  description  text,
  category     text,
  deploy_mode  text check (deploy_mode in ('url','bundle') or deploy_mode is null),
  deploy_url   text,
  bundle_path  text,
  updated_at   timestamptz not null default now()
);

create table if not exists public.admins (
  email text primary key
);

-- =============================================================================
-- 2. Helper: is_admin() as SECURITY DEFINER to avoid RLS recursion
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
-- 3. RLS
-- =============================================================================
alter table public.subjects enable row level security;
alter table public.admins   enable row level security;

drop policy if exists "subjects_read_all" on public.subjects;
create policy "subjects_read_all"
  on public.subjects for select
  using (true);

drop policy if exists "subjects_admin_write" on public.subjects;
create policy "subjects_admin_write"
  on public.subjects for all
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- Admin self-policy references `email` column directly (no subquery on
-- the admins table itself) to avoid infinite recursion.
drop policy if exists "admins_self_read"  on public.admins;
drop policy if exists "admins_self_write" on public.admins;
drop policy if exists "admins_own_row"    on public.admins;
create policy "admins_own_row"
  on public.admins for all
  using ( email = (auth.jwt() ->> 'email') )
  with check ( email = (auth.jwt() ->> 'email') );

-- =============================================================================
-- 4. Bootstrap admin (CHANGE THIS EMAIL if needed)
-- =============================================================================
insert into public.admins (email) values ('aaravmaggon@gmail.com')
  on conflict (email) do nothing;

-- =============================================================================
-- 5. Seed the 40 AP subjects
-- =============================================================================
insert into public.subjects (id, name, short, icon, color, category) values
  ('ap-art-history',  'AP Art History',                         'Art History',  '🎨',  '#c98c6b', 'Arts'),
  ('ap-art-2d',       'AP 2-D Art and Design',                  '2-D Art',      '🖌️',  '#d9986d', 'Arts'),
  ('ap-art-3d',       'AP 3-D Art and Design',                  '3-D Art',      '🗿',  '#a78362', 'Arts'),
  ('ap-art-drawing',  'AP Drawing',                             'Drawing',      '✏️',  '#b7956a', 'Arts'),
  ('ap-music-theory', 'AP Music Theory',                        'Music Theory', '🎼',  '#8e6fbf', 'Arts'),
  ('ap-eng-lang',     'AP English Language and Composition',    'Eng Lang',     '✍️',  '#6b8ec9', 'English'),
  ('ap-eng-lit',      'AP English Literature and Composition',  'Eng Lit',      '📖',  '#5a7bb0', 'English'),
  ('ap-afam',         'AP African American Studies',            'AfAm Studies', '🌍',  '#b5823e', 'History'),
  ('ap-comp-gov',     'AP Comparative Gov & Politics',          'Comp Gov',     '🏛️',  '#8a7a5c', 'History'),
  ('ap-euro',         'AP European History',                    'Euro',         '🏰',  '#7a6a8e', 'History'),
  ('ap-hug',          'AP Human Geography',                     'HUG',          '🗺️',  '#4a9b7e', 'History'),
  ('ap-macro',        'AP Macroeconomics',                      'Macro',        '📈',  '#3f8a6e', 'History'),
  ('ap-micro',        'AP Microeconomics',                      'Micro',        '📊',  '#3f8a6e', 'History'),
  ('ap-psych',        'AP Psychology',                          'Psych',        '🧠',  '#c96b93', 'History'),
  ('ap-us-gov',       'AP US Gov & Politics',                   'US Gov',       '🦅',  '#3d5a80', 'History'),
  ('ap-us-history',   'AP US History',                          'APUSH',        '🗽',  '#c14b4b', 'History'),
  ('ap-world',        'AP World History: Modern',               'APWH',         '🌐',  '#4b7bc1', 'History'),
  ('ap-calc-ab',      'AP Calculus AB',                         'Calc AB',      '∫',   '#e07a5f', 'Math'),
  ('ap-calc-bc',      'AP Calculus BC',                         'Calc BC',      '∞',   '#cc6144', 'Math'),
  ('ap-precalc',      'AP Precalculus',                         'Precalc',      '📐',  '#e69a7a', 'Math'),
  ('ap-stats',        'AP Statistics',                          'Stats',        '📉',  '#d9844f', 'Math'),
  ('ap-csa',          'AP Computer Science A',                  'CS A',         '💻',  '#2d6a8a', 'CS'),
  ('ap-csp',          'AP Computer Science Principles',         'CSP',          '🖥️',  '#3a87ab', 'CS'),
  ('ap-bio',          'AP Biology',                             'Bio',          '🧬',  '#5ba85c', 'Science'),
  ('ap-chem',         'AP Chemistry',                           'Chem',         '⚗️',  '#a85b9a', 'Science'),
  ('ap-env',          'AP Environmental Science',               'APES',         '🌱',  '#6fa84f', 'Science'),
  ('ap-phys-1',       'AP Physics 1',                           'Phys 1',       '⚛️',  '#5b8aa8', 'Science'),
  ('ap-phys-2',       'AP Physics 2',                           'Phys 2',       '🔭',  '#4a779a', 'Science'),
  ('ap-phys-cm',      'AP Physics C: Mechanics',                'Phys C Mech',  '🎱',  '#3a688a', 'Science'),
  ('ap-phys-ce',      'AP Physics C: E&M',                      'Phys C E&M',   '⚡',  '#2d5e7a', 'Science'),
  ('ap-chinese',      'AP Chinese Language and Culture',        'Chinese',      '🀄',  '#c14b4b', 'Language'),
  ('ap-french',       'AP French Language and Culture',         'French',       '🥖',  '#4b6bc1', 'Language'),
  ('ap-german',       'AP German Language and Culture',         'German',       '🍺',  '#b59a3e', 'Language'),
  ('ap-italian',      'AP Italian Language and Culture',        'Italian',      '🍝',  '#3e8a5a', 'Language'),
  ('ap-japanese',     'AP Japanese Language and Culture',       'Japanese',     '🗾',  '#c96b8a', 'Language'),
  ('ap-latin',        'AP Latin',                               'Latin',        '📜',  '#8a7a4a', 'Language'),
  ('ap-spanish-lang', 'AP Spanish Language and Culture',        'Span Lang',    '🌶️',  '#d97a3e', 'Language'),
  ('ap-spanish-lit',  'AP Spanish Literature and Culture',      'Span Lit',     '💃',  '#b5602d', 'Language'),
  ('ap-research',     'AP Research',                            'Research',     '🔬',  '#6a6a8a', 'Capstone'),
  ('ap-seminar',      'AP Seminar',                             'Seminar',      '🎓',  '#5a5a7a', 'Capstone')
on conflict (id) do nothing;

-- =============================================================================
-- Done. Now:
--   1. Authentication → Users → "Add user" → create email/password for yourself
--      (use the same email as the admin bootstrap above)
--   2. Settings → API → copy the Project URL and anon key
--   3. Paste them into .env in the ap-hub project
-- =============================================================================
