-- Fix for infinite recursion in admin RLS policies.
-- Paste this into Supabase → SQL Editor → Run.

-- A SECURITY DEFINER function runs with the function owner's privileges,
-- which bypasses RLS inside the function body. That breaks the recursion:
-- policies can now call is_admin() without re-triggering the admins-table
-- policy on every check.
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

-- Rewrite the subjects write policy to use the function instead of a subquery.
drop policy if exists "subjects_admin_write" on public.subjects;
create policy "subjects_admin_write"
  on public.subjects for all
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- Replace admin self-policies with ones that don't subquery admins.
-- An admin can only read/modify their own row; anyone else gets nothing.
drop policy if exists "admins_self_read"  on public.admins;
drop policy if exists "admins_self_write" on public.admins;

create policy "admins_own_row"
  on public.admins for all
  using ( email = (auth.jwt() ->> 'email') )
  with check ( email = (auth.jwt() ->> 'email') );

-- Sanity test (run this manually after, should return 40):
--   select count(*) from public.subjects;
