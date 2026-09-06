-- Migration 00022: Certificates Schema
-- Medical/dental certificates and document generation

CREATE TYPE certificate_type AS ENUM (
  'medical', 'dental', 'referral', 'treatment_summary', 'other'
);

CREATE TYPE certificate_status AS ENUM (
  'draft', 'issued', 'cancelled'
);

CREATE TABLE certificates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number  TEXT NOT NULL UNIQUE,
  patient_id          UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  encounter_id        UUID REFERENCES clinical_encounters(id) ON DELETE SET NULL,
  issued_by           UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  certificate_type    certificate_type NOT NULL,
  status              certificate_status NOT NULL DEFAULT 'draft',
  
  title               TEXT NOT NULL,
  content             TEXT NOT NULL,
  
  issue_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until         DATE,
  
  signed_at           TIMESTAMPTZ,
  signed_by           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certificates_patient ON certificates(patient_id);
CREATE INDEX idx_certificates_type ON certificates(certificate_type);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own certificates"
  ON certificates FOR SELECT
  USING (
    patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Clinical roles can view certificates"
  ON certificates FOR SELECT
  USING (
    user_has_role('doctor') OR user_has_role('dentist')
    OR user_has_role('nurse') OR user_has_role('clinic_staff')
    OR user_has_role('clinic_admin') OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

CREATE POLICY "Doctors and dentists can create certificates"
  ON certificates FOR INSERT
  WITH CHECK (
    issued_by = auth.uid()
    AND (user_has_role('doctor') OR user_has_role('dentist')
      OR user_has_role('clinic_admin') OR user_has_role('super_admin'))
  );

CREATE POLICY "Issuers can update own draft certificates"
  ON certificates FOR UPDATE
  USING (
    issued_by = auth.uid() AND status = 'draft'
  );

CREATE POLICY "Clinic admins can manage certificates"
  ON certificates FOR ALL
  USING (
    user_has_role('clinic_admin') OR user_has_role('super_admin') OR user_has_role('admin')
  );

CREATE POLICY "Deny anon certificates"
  ON certificates FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_certificates_updated_at();

CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
BEGIN
  prefix := 'CERT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(certificate_number FROM LENGTH(prefix) + 1) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM certificates
  WHERE certificate_number LIKE prefix || '%';
  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
