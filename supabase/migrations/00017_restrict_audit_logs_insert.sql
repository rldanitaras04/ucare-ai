-- Restrict audit_logs INSERT to service_role only.
-- Normal authenticated users can SELECT (view) but cannot insert directly.
-- Only server-side code using the service-role key should write audit logs.

-- Remove the existing permissive INSERT policy (if any)
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;

-- Create a restrictive INSERT policy that only allows service_role
CREATE POLICY "Only service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure SELECT remains available for authenticated users
-- (keep existing SELECT policy if present, otherwise create one)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_logs'
      AND policyname = 'Authenticated users can view audit logs'
      AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "Authenticated users can view audit logs"
      ON audit_logs
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;
