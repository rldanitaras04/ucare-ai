-- Migration: 00036_fix_legacy_profile_role_values.sql
-- Fixes profiles.role column and auth.users.raw_user_meta_data
-- that were seeded with old role names (super_admin) by migration 00016.
-- Migration 00030 only cleaned up roles table and user_roles, not these.

-- ── Step 1: Update profiles.role to canonical names ────────────
UPDATE profiles SET role = 'superadmin' WHERE role IN ('super_admin', 'admin', 'clinic_admin');
UPDATE profiles SET role = 'staff' WHERE role = 'clinic_staff';
UPDATE profiles SET role = 'nurse' WHERE role = 'nurse_admin';
UPDATE profiles SET role = 'patient' WHERE role = 'user';

-- ── Step 2: Update auth.users.raw_user_meta_data.role ──────────
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'superadmin')
WHERE raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'clinic_admin');

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'staff')
WHERE raw_user_meta_data->>'role' = 'clinic_staff';

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'nurse')
WHERE raw_user_meta_data->>'role' = 'nurse_admin';

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'patient')
WHERE raw_user_meta_data->>'role' = 'user';

-- ── Step 3: Reload PostgREST schema cache ─────────────────────
NOTIFY pgrst, 'reload schema';
