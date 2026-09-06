-- Migration 00024: Break-Glass Emergency Access Schema
-- Immutable audit log for emergency EMR overrides

CREATE TABLE break_glass_audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  patient_id    UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT,
  reason        TEXT NOT NULL,
  accessed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address    INET,
  notified      BOOLEAN NOT NULL DEFAULT FALSE
);

-- Prevent updates and deletes on break-glass logs (immutable)
CREATE OR REPLACE FUNCTION prevent_break_glass_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Break-glass audit logs are immutable and cannot be modified or deleted';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER break_glass_no_update
  BEFORE UPDATE ON break_glass_audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_break_glass_modification();

CREATE TRIGGER break_glass_no_delete
  BEFORE DELETE ON break_glass_audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_break_glass_modification();

CREATE INDEX idx_break_glass_provider ON break_glass_audit_logs(provider_id);
CREATE INDEX idx_break_glass_patient ON break_glass_audit_logs(patient_id);
CREATE INDEX idx_break_glass_accessed ON break_glass_audit_logs(accessed_at DESC);

-- Enable RLS
ALTER TABLE break_glass_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only clinic admins and super admins can view break-glass logs
CREATE POLICY "Admins can view break-glass logs"
  ON break_glass_audit_logs FOR SELECT
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Clinical roles can insert break-glass logs (they are the ones requesting access)
CREATE POLICY "Clinical roles can create break-glass logs"
  ON break_glass_audit_logs FOR INSERT
  WITH CHECK (
    provider_id = auth.uid()
    AND (
      user_has_role('doctor')
      OR user_has_role('dentist')
      OR user_has_role('nurse')
      OR user_has_role('clinic_admin')
      OR user_has_role('super_admin')
    )
  );

-- No updates or deletes allowed (enforced by trigger, but also by RLS)
CREATE POLICY "No updates on break-glass logs"
  ON break_glass_audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "No deletes on break-glass logs"
  ON break_glass_audit_logs FOR DELETE
  USING (false);

CREATE POLICY "Deny anon break_glass_logs"
  ON break_glass_audit_logs FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);

-- Function to record break-glass access and notify admins
CREATE OR REPLACE FUNCTION record_break_glass_access(
  p_patient_id UUID,
  p_reason TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
  admin_record RECORD;
  patient_name TEXT;
BEGIN
  -- Insert the audit log
  INSERT INTO break_glass_audit_logs (provider_id, patient_id, reason, ip_address)
  VALUES (auth.uid(), p_patient_id, p_reason, p_ip_address)
  RETURNING id INTO new_id;

  -- Get patient name for notification
  SELECT first_name || ' ' || last_name INTO patient_name
  FROM patient_profiles WHERE id = p_patient_id;

  -- Notify all clinic admins and super admins
  FOR admin_record IN
    SELECT DISTINCT ur.user_id
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('clinic_admin', 'super_admin', 'admin')
  LOOP
    PERFORM create_notification(
      admin_record.user_id,
      'BREAK-GLASS EMERGENCY ACCESS',
      'Provider ' || (SELECT full_name FROM profiles WHERE id = auth.uid())
        || ' accessed full EMR for patient ' || COALESCE(patient_name, 'Unknown')
        || '. Reason: ' || p_reason,
      'break_glass_alert',
      '/patients/' || p_patient_id
    );
  END LOOP;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
