-- =============================================================================
-- Migration 00016: Seed Super Admin User
-- =============================================================================
-- Sets up rldanitaras@isufst.edu.ph as a super_admin with full permissions.
-- Handles both the legacy profiles.role column and the user_roles join table,
-- plus auth.users raw_user_meta_data for JWT-based middleware checks.
--
-- Default password: SuperAdmin@123
-- IMPORTANT: User should change password after first login.
-- =============================================================================

DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  -- ─── 1. Find or create the user in auth.users ──────────────────────────
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'rldanitaras@isufst.edu.ph';

  IF v_user_id IS NULL THEN
    -- User does not exist yet — create them
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_user_meta_data, raw_app_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(), 'authenticated', 'authenticated',
      'rldanitaras@isufst.edu.ph',
      -- Default password: Demo@12345 (same as demo accounts)
      -- User should change password after first login via the portal.
      '$2b$10$wf3V7SVfCon/tFDHj4qYC.DcFellZLFsJqUuGQTP3C4RxN8DodBY6',
      NOW(), NOW(), NOW(),
      jsonb_build_object(
        'full_name', 'RL Danitaras',
        'role', 'super_admin',
        'email', 'rldanitaras@isufst.edu.ph',
        'email_verified', true,
        'phone_verified', false,
        'sub', gen_random_uuid()::text
      ),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'))
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_user_id;

    -- If INSERT was skipped (race), fetch existing
    IF v_user_id IS NULL THEN
      SELECT id INTO v_user_id FROM auth.users WHERE email = 'rldanitaras@isufst.edu.ph';
    END IF;
  ELSE
    -- User exists — update all three role sources
    UPDATE auth.users
    SET
      raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'super_admin'),
      raw_app_meta_data = raw_app_meta_data || jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- ─── 2. Upsert profiles row (legacy single-role column) ────────────────
  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (v_user_id, 'rldanitaras@isufst.edu.ph', 'RL Danitaras', 'super_admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    full_name = COALESCE(profiles.full_name, 'RL Danitaras'),
    updated_at = NOW();

  -- ─── 3. Ensure super_admin role exists in roles table ───────────────────
  INSERT INTO roles (name, description)
  VALUES ('super_admin', 'Full system access')
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO v_role_id FROM roles WHERE name = 'super_admin';

  -- ─── 4. Assign super_admin role in user_roles join table ────────────────
  INSERT INTO user_roles (user_id, role_id, created_at)
  VALUES (v_user_id, v_role_id, NOW())
  ON CONFLICT DO NOTHING;

  -- ─── 5. Ensure super_admin has ALL permissions ──────────────────────────
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT v_role_id, p.id
  FROM permissions p
  ON CONFLICT DO NOTHING;

  -- ─── 6. Reload PostgREST schema cache ───────────────────────────────────
  NOTIFY pgrst, 'reload schema';

  RAISE NOTICE 'Super admin user configured: rldanitaras@isufst.edu.ph (id: %)', v_user_id;
END $$;
