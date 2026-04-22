-- Migration: add inline_html support so admins can paste/upload HTML directly
-- instead of pointing a slot at a hosted URL. Run this in the Supabase SQL editor.

alter table subjects
  add column if not exists inline_html text;

-- Update deploy_mode values to support 'inline' (in addition to 'url' and future 'bundle').
-- No enum constraint in the original schema, so nothing to drop — just document here
-- that valid values are now: 'url' | 'inline' | 'bundle' | null.
