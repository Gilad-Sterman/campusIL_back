-- Phase 1 MVP — incremental migration for existing Supabase DBs
-- Run in SQL Editor after older DBSetup (adds user_applications + RLS + grants).
-- Safe to re-run: IF NOT EXISTS / DROP POLICY IF EXISTS.
-- "Success. No rows returned" is normal for DDL.
--
-- Includes users DOB/zip if missing (skip block if already applied via migration_users_add_dob_zip.sql).

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS zip_code TEXT;

COMMENT ON COLUMN public.users.date_of_birth IS 'Required for new registrations (API); optional for legacy rows.';
COMMENT ON COLUMN public.users.zip_code IS 'Optional postal / ZIP code.';

CREATE TABLE IF NOT EXISTS public.user_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applied')),
  external_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_applications_user_program_unique UNIQUE (user_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_user_applications_user_id
  ON public.user_applications (user_id);

CREATE INDEX IF NOT EXISTS idx_user_applications_program_id
  ON public.user_applications (program_id);

COMMENT ON TABLE public.user_applications IS 'MVP: Add to My Applications — saved vs applied.';
COMMENT ON COLUMN public.user_applications.external_link IS 'Optional; else use programs.application_url in app.';

ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own user_applications" ON public.user_applications;
DROP POLICY IF EXISTS "Users can manage own user_applications" ON public.user_applications;
DROP POLICY IF EXISTS "Admins can view all user_applications" ON public.user_applications;
DROP POLICY IF EXISTS "Concierge can view user_applications" ON public.user_applications;

CREATE POLICY "Users can view own user_applications"
  ON public.user_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own user_applications"
  ON public.user_applications FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user_applications"
  ON public.user_applications FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Concierge can view user_applications"
  ON public.user_applications FOR SELECT
  USING (is_concierge_or_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_applications TO authenticated;
GRANT ALL ON public.user_applications TO service_role;
