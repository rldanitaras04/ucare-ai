-- Fix audit_logs SELECT policy: restrict to admin-only
-- Migration 00017 broadened SELECT to all authenticated users.
-- Restore admin-only access for audit log viewing.

DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON audit_logs;

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
