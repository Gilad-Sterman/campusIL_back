-- MVP: extend public.users with date_of_birth and zip_code
-- Run in Supabase SQL Editor if your database was created from an older DBSetup.sql
-- without these columns. Safe to re-run (IF NOT EXISTS).
--
-- New greenfield installs: columns are already included in DBSetup.sql CREATE TABLE users.
--
-- Full Phase 1 (users + user_applications + RLS): see migration_phase1_user_applications_mvp.sql

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS zip_code TEXT;

COMMENT ON COLUMN public.users.date_of_birth IS 'Required for new registrations (validated in API); optional for legacy rows.';
COMMENT ON COLUMN public.users.zip_code IS 'Optional postal / ZIP code.';
