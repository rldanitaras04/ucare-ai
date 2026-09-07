-- Migration: 00030_align_role_names.sql
-- Aligns the roles table to use the new 6-role naming convention.
-- Maps old role names to new ones:
--   super_admin/admin/clinic_admin -> superadmin
--   nurse_admin -> nurse
--   clinic_staff -> staff
--   user -> patient

-- ── Step 1: Ensure target roles exist before migration ─────────
INSERT INTO roles (name, description) VALUES
  ('superadmin', 'Full system administrator with unrestricted access'),
  ('nurse', 'Nurse with clinical and operational access'),
  ('staff', 'Front-desk staff with registration and queue access'),
  ('doctor', 'Medical doctor with clinical access'),
  ('dentist', 'Dental professional with dental access'),
  ('patient', 'Patient with self-service access')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- ── Step 2: Migrate user_roles to canonical role IDs ───────────
-- super_admin / admin / clinic_admin → superadmin
UPDATE user_roles SET role_id = (SELECT id FROM roles WHERE name = 'superadmin')
WHERE role_id IN (SELECT id FROM roles WHERE name IN ('super_admin', 'admin', 'clinic_admin'));

-- nurse_admin → nurse
UPDATE user_roles SET role_id = (SELECT id FROM roles WHERE name = 'nurse')
WHERE role_id IN (SELECT id FROM roles WHERE name = 'nurse_admin');

-- clinic_staff → staff
UPDATE user_roles SET role_id = (SELECT id FROM roles WHERE name = 'staff')
WHERE role_id IN (SELECT id FROM roles WHERE name = 'clinic_staff');

-- user → patient
UPDATE user_roles SET role_id = (SELECT id FROM roles WHERE name = 'patient')
WHERE role_id IN (SELECT id FROM roles WHERE name = 'user');

-- ── Step 3: Remove all old role entries ────────────────────────
DELETE FROM roles WHERE name IN (
  'super_admin', 'admin', 'clinic_admin', 'nurse_admin', 'clinic_staff', 'user'
);

-- Keep only the canonical 6 roles
DELETE FROM roles WHERE name NOT IN ('superadmin', 'nurse', 'staff', 'doctor', 'dentist', 'patient');
