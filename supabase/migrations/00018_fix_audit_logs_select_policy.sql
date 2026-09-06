-- Fix audit_logs SELECT policy: restrict to admin-only
-- Migration 00017 broadened SELECT to all authenticated users.
-- Restore admin-only access for audit log viewing.

-- Drop all existing SELECT policies on audit_logs
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'audit_logs' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON audit_logs', pol.policyname);
  END LOOP;
END
$$;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'clinic_admin')
    )
  );
