-- Fix user_has_role() to query user_roles join table instead of profiles.role
-- The original implementation checked profiles.role (single column) which
-- disconnects from the multi-role RBAC system using the user_roles join table.

CREATE OR REPLACE FUNCTION public.user_has_role(target_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.name = target_role
  );
$$;
