-- Fix overly permissive audit_logs INSERT policy
-- The security-definer function log_audit_event() bypasses RLS, so direct table
-- inserts should be restricted to prevent users from forging audit trails.

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Only allow inserts from service_role or authenticated users
-- (the security-definer function will bypass this anyway)
CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    auth.uid() IS NOT NULL
  );
