-- Migration: add inline_html support so admins can paste/upload HTML directly
-- instead of pointing a slot at a hosted URL. Run this in the Supabase SQL editor.

-- 1. Add the column for inline HTML storage
alter table public.subjects
  add column if not exists inline_html text;

-- 2. Relax the deploy_mode CHECK constraint to allow 'inline'
--    (original schema.sql only allowed 'url' or 'bundle')
alter table public.subjects drop constraint if exists subjects_deploy_mode_check;
alter table public.subjects add constraint subjects_deploy_mode_check
  check (deploy_mode in ('url','inline','bundle') or deploy_mode is null);

-- 3. Force PostgREST to refresh its schema cache so the new column is
--    visible to the Supabase JS client immediately.
notify pgrst, 'reload schema';

-- Note: if you get "new row violates row-level security policy" when saving,
-- your signed-in email isn't on the admin allowlist. Add it with:
--   insert into public.admins (email) values ('you@example.com')
--   on conflict (email) do nothing;
