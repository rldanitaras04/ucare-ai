-- Create permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('users.view', 'View users', 'users', 'view'),
  ('users.create', 'Create users', 'users', 'create'),
  ('users.update', 'Update users', 'users', 'update'),
  ('users.delete', 'Delete users', 'users', 'delete'),
  ('roles.view', 'View roles', 'roles', 'view'),
  ('roles.manage', 'Manage roles', 'roles', 'manage'),
  ('permissions.view', 'View permissions', 'permissions', 'view'),
  ('permissions.manage', 'Manage permissions', 'permissions', 'manage'),
  ('audit_logs.view', 'View audit logs', 'audit_logs', 'view'),
  ('settings.manage', 'Manage settings', 'settings', 'manage');

-- Enable RLS
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view permissions"
  ON permissions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only super_admin can manage permissions"
  ON permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
