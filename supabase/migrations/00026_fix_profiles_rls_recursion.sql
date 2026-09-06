-- Migration 00026: Fix infinite recursion in profiles RLS policies
-- Replace self-referencing profiles queries with user_has_role() SECURITY DEFINER function

-- ============================================================
-- DROP THE THREE RECURSIVE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- ============================================================
-- RECREATE USING user_has_role() (SECURITY DEFINER, bypasses RLS)
-- ============================================================

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    user_has_role('super_admin') OR user_has_role('admin') OR user_has_role('clinic_admin')
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    user_has_role('super_admin') OR user_has_role('admin') OR user_has_role('clinic_admin')
  );

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    user_has_role('super_admin') OR user_has_role('admin')
  );
