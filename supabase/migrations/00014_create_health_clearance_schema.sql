-- Health Clearance module
-- Supports institutional health clearances with requirements checklist

-- Clearance type enum
CREATE TYPE clearance_type AS ENUM (
  'admission',
  'annual',
  'internship',
  'sports',
  'graduation',
  'employee',
  'other'
);

-- Clearance status enum
CREATE TYPE clearance_status AS ENUM (
  'pending',
  'in_review',
  'requires_action',
  'approved',
  'denied',
  'expired',
  'cancelled'
);

-- health_clearances table
CREATE TABLE health_clearances (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clearance_number    TEXT NOT NULL UNIQUE,
  patient_id          UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT,
  clearance_type      clearance_type NOT NULL,
  status              clearance_status NOT NULL DEFAULT 'pending',
  
  -- Purpose and validity
  purpose             TEXT, -- specific purpose description
  valid_from          DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until         DATE,
  
  -- Clinical assessment
  assessed_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assessment_notes    TEXT,
  
  -- Approval
  approved_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approval_date       TIMESTAMPTZ,
  denial_reason       TEXT,
  
  -- Requirements checklist (JSON array of requirement objects)
  requirements        JSONB NOT NULL DEFAULT '[]',
  /*  Example requirements format:
      [
        {"name": "Medical Exam", "completed": true, "date": "2024-01-15"},
        {"name": "Dental Exam", "completed": true, "date": "2024-01-16"},
        {"name": "Chest X-Ray", "completed": false, "date": null}
      ]
  */
  
  -- Related records
  encounter_id        UUID REFERENCES clinical_encounters(id) ON DELETE SET NULL,
  
  -- Audit
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_health_clearances_patient ON health_clearances(patient_id);
CREATE INDEX idx_health_clearances_type ON health_clearances(clearance_type);
CREATE INDEX idx_health_clearances_status ON health_clearances(status);
CREATE INDEX idx_health_clearances_number ON health_clearances(clearance_number);

-- Enable RLS
ALTER TABLE health_clearances ENABLE ROW LEVEL SECURITY;

-- Policies
-- Patients can view their own clearances
CREATE POLICY "Patients can view own clearances"
  ON health_clearances FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- Clinical roles can view clearances
CREATE POLICY "Clinical roles can view clearances"
  ON health_clearances FOR SELECT
  USING (
    user_has_role('doctor')
    OR user_has_role('dentist')
    OR user_has_role('nurse')
    OR user_has_role('clinic_staff')
    OR user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Clinic staff can create clearances
CREATE POLICY "Clinic staff can create clearances"
  ON health_clearances FOR INSERT
  WITH CHECK (
    user_has_role('clinic_staff')
    OR user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Clinic staff can update clearances
CREATE POLICY "Clinic staff can update clearances"
  ON health_clearances FOR UPDATE
  USING (
    user_has_role('clinic_staff')
    OR user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Deny anon access
CREATE POLICY "Deny anon health_clearances"
  ON health_clearances FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_health_clearances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER health_clearances_updated_at
  BEFORE UPDATE ON health_clearances
  FOR EACH ROW
  EXECUTE FUNCTION update_health_clearances_updated_at();

-- Function to generate clearance number
CREATE OR REPLACE FUNCTION generate_clearance_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
BEGIN
  -- Get prefix based on current date
  prefix := 'HC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  
  -- Get next sequence number for today
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(clearance_number FROM LENGTH(prefix) + 1) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM health_clearances
  WHERE clearance_number LIKE prefix || '%';
  
  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
