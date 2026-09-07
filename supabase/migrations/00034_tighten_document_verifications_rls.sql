-- Migration: 00034_tighten_document_verifications_rls.sql
-- Tightens RLS policies on document_verifications table.
-- SELECT remains public for verification.
-- INSERT/UPDATE restricted to authenticated staff.

-- Drop existing permissive policies
DROP POLICY IF EXISTS "document_verifications_insert_system" ON document_verifications;
DROP POLICY IF EXISTS "document_verifications_update_system" ON document_verifications;

-- INSERT: Only authenticated staff can create verification records
CREATE POLICY "document_verifications_insert_staff" ON document_verifications
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role_id IN (
          SELECT id FROM roles WHERE name IN ('superadmin', 'nurse', 'staff', 'doctor', 'dentist')
        )
      )
    )
  );

-- UPDATE: Only authenticated staff can update verification records (e.g., marking as invalid)
CREATE POLICY "document_verifications_update_staff" ON document_verifications
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role_id IN (
          SELECT id FROM roles WHERE name IN ('superadmin', 'nurse', 'staff')
        )
      )
    )
  );
