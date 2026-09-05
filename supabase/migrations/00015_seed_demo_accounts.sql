-- =============================================================================
-- Migration 00015: Seed Demo Accounts
-- =============================================================================
-- Creates demo accounts for each user role with predictable credentials.
-- Password for all accounts: Demo@12345
-- Pre-computed bcrypt hash used (pgcrypto not available in remote context).
-- =============================================================================

-- ─── Helper: Pre-computed password hash ──────────────────────────────────
-- $2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6 = Demo@12345

-- ─── Super Admin ────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'superadmin@ucare-demo.com',
    '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
    NOW(), NOW(), NOW(),
    jsonb_build_object('full_name', 'Super Admin User', 'role', 'super_admin'),
    '{}'::jsonb
  ) ON CONFLICT DO NOTHING RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'superadmin@ucare-demo.com';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'superadmin@ucare-demo.com', 'Super Admin User', 'super_admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();

  SELECT id INTO v_role_id FROM roles WHERE name = 'super_admin';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_at)
    VALUES (v_user_id, v_role_id, NOW()) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── Admin ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'admin@ucare-demo.com',
    '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
    NOW(), NOW(), NOW(),
    jsonb_build_object('full_name', 'Admin User', 'role', 'admin'),
    '{}'::jsonb
  ) ON CONFLICT DO NOTHING RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@ucare-demo.com';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'admin@ucare-demo.com', 'Admin User', 'admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();

  SELECT id INTO v_role_id FROM roles WHERE name = 'admin';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_at)
    VALUES (v_user_id, v_role_id, NOW()) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── Clinic Admin ───────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'clinic.admin@ucare-demo.com',
    '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
    NOW(), NOW(), NOW(),
    jsonb_build_object('full_name', 'Dr. Maria Santos', 'role', 'clinic_admin'),
    '{}'::jsonb
  ) ON CONFLICT DO NOTHING RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'clinic.admin@ucare-demo.com';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'clinic.admin@ucare-demo.com', 'Dr. Maria Santos', 'clinic_admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();

  SELECT id INTO v_role_id FROM roles WHERE name = 'clinic_admin';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_at)
    VALUES (v_user_id, v_role_id, NOW()) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── Doctor ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'doctor@ucare-demo.com',
    '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
    NOW(), NOW(), NOW(),
    jsonb_build_object('full_name', 'Dr. Juan Dela Cruz', 'role', 'doctor'),
    '{}'::jsonb
  ) ON CONFLICT DO NOTHING RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'doctor@ucare-demo.com';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'doctor@ucare-demo.com', 'Dr. Juan Dela Cruz', 'doctor', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();

  SELECT id INTO v_role_id FROM roles WHERE name = 'doctor';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_at)
    VALUES (v_user_id, v_role_id, NOW()) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── Dentist ────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'dentist@ucare-demo.com',
    '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
    NOW(), NOW(), NOW(),
    jsonb_build_object('full_name', 'Dr. Ana Reyes', 'role', 'dentist'),
    '{}'::jsonb
  ) ON CONFLICT DO NOTHING RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'dentist@ucare-demo.com';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'dentist@ucare-demo.com', 'Dr. Ana Reyes', 'dentist', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();

  SELECT id INTO v_role_id FROM roles WHERE name = 'dentist';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_at)
    VALUES (v_user_id, v_role_id, NOW()) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── Nurse ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'nurse@ucare-demo.com',
    '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
    NOW(), NOW(), NOW(),
    jsonb_build_object('full_name', 'Nurse Rosa Garcia', 'role', 'nurse'),
    '{}'::jsonb
  ) ON CONFLICT DO NOTHING RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'nurse@ucare-demo.com';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'nurse@ucare-demo.com', 'Nurse Rosa Garcia', 'nurse', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();

  SELECT id INTO v_role_id FROM roles WHERE name = 'nurse';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_at)
    VALUES (v_user_id, v_role_id, NOW()) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── Clinic Staff ───────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'clinic.staff@ucare-demo.com',
    '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
    NOW(), NOW(), NOW(),
    jsonb_build_object('full_name', 'Staff Member Perez', 'role', 'clinic_staff'),
    '{}'::jsonb
  ) ON CONFLICT DO NOTHING RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'clinic.staff@ucare-demo.com';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'clinic.staff@ucare-demo.com', 'Staff Member Perez', 'clinic_staff', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();

  SELECT id INTO v_role_id FROM roles WHERE name = 'clinic_staff';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_at)
    VALUES (v_user_id, v_role_id, NOW()) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── Staff (generic) ────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'staff@ucare-demo.com',
    '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
    NOW(), NOW(), NOW(),
    jsonb_build_object('full_name', 'Generic Staff User', 'role', 'staff'),
    '{}'::jsonb
  ) ON CONFLICT DO NOTHING RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'staff@ucare-demo.com';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'staff@ucare-demo.com', 'Generic Staff User', 'staff', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();

  SELECT id INTO v_role_id FROM roles WHERE name = 'staff';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_at)
    VALUES (v_user_id, v_role_id, NOW()) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ─── Patient ────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'patient@ucare-demo.com',
    '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
    NOW(), NOW(), NOW(),
    jsonb_build_object('full_name', 'Student Pedro Mendoza', 'role', 'patient'),
    '{}'::jsonb
  ) ON CONFLICT DO NOTHING RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'patient@ucare-demo.com';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'patient@ucare-demo.com', 'Student Pedro Mendoza', 'patient', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();

  SELECT id INTO v_role_id FROM roles WHERE name = 'patient';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_at)
    VALUES (v_user_id, v_role_id, NOW()) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO patient_profiles (
    user_id, university_id, student_employee_no, first_name, last_name, middle_name,
    sex, date_of_birth, contact_number, affiliation, college_unit, blood_type,
    allergies, chronic_conditions
  ) VALUES (
    v_user_id, '2024-DEMO-001', 'STU-001', 'Pedro', 'Mendoza', 'Santos',
    'male', '2002-05-15', '+63-917-123-4567', 'student', 'College of Engineering', 'O+',
    ARRAY['Penicillin']::TEXT[], ARRAY[]::TEXT[]
  ) ON CONFLICT DO NOTHING;
END $$;

-- ─── User (generic) ─────────────────────────────────────────────────────
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'user@ucare-demo.com',
    '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
    NOW(), NOW(), NOW(),
    jsonb_build_object('full_name', 'Generic User Account', 'role', 'user'),
    '{}'::jsonb
  ) ON CONFLICT DO NOTHING RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'user@ucare-demo.com';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'user@ucare-demo.com', 'Generic User Account', 'user', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, updated_at = NOW();

  SELECT id INTO v_role_id FROM roles WHERE name = 'user';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, created_at)
    VALUES (v_user_id, v_role_id, NOW()) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO patient_profiles (
    user_id, university_id, student_employee_no, first_name, last_name, middle_name,
    sex, date_of_birth, contact_number, affiliation, college_unit, blood_type,
    allergies, chronic_conditions
  ) VALUES (
    v_user_id, '2024-DEMO-002', 'STU-002', 'Maria', 'Cruz', 'Lopez',
    'female', '2001-08-22', '+63-918-765-4321', 'student', 'College of Medicine', 'A+',
    ARRAY[]::TEXT[], ARRAY['Asthma']::TEXT[]
  ) ON CONFLICT DO NOTHING;
END $$;

-- ─── Demo Visit ─────────────────────────────────────────────────────────
DO $$
DECLARE
  v_patient_profile_id UUID;
  v_visit_id UUID;
BEGIN
  SELECT id INTO v_patient_profile_id FROM patient_profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'patient@ucare-demo.com');

  IF v_patient_profile_id IS NOT NULL THEN
    INSERT INTO walk_in_visits (patient_id, service_type, reason_for_visit, status, visit_date)
    VALUES (v_patient_profile_id, 'medical', 'Annual physical examination', 'registered', CURRENT_DATE)
    RETURNING id INTO v_visit_id;

    INSERT INTO queue_entries (visit_id, queue_number, service_category, priority, status)
    VALUES (v_visit_id, 'M-001', 'medical', 'normal', 'waiting');
  END IF;
END $$;

-- ─── Fix auth.users metadata ────────────────────────────────────────────
-- Supabase GoTrue expects raw_app_meta_data to have provider/providers
-- and raw_user_meta_data to have sub/email/email_verified/phone_verified
UPDATE auth.users
SET
  raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
  raw_user_meta_data = jsonb_build_object(
    'email', email,
    'email_verified', false,
    'phone_verified', false,
    'sub', id::text,
    'full_name', raw_user_meta_data->>'full_name',
    'role', raw_user_meta_data->>'role'
  )
WHERE email LIKE '%ucare-demo%';

-- ─── Reload PostgREST schema cache ──────────────────────────────────────
NOTIFY pgrst, 'reload schema';
