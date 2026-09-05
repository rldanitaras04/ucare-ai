-- Prescriptions module
-- Supports medical and dental prescriptions with lifecycle management

-- Prescription status enum
CREATE TYPE prescription_status AS ENUM (
  'draft',
  'signed',
  'issued',
  'dispensed',
  'completed',
  'cancelled'
);

-- Prescription type enum (medical vs dental)
CREATE TYPE prescription_type AS ENUM (
  'medical',
  'dental'
);

-- Route of administration enum
CREATE TYPE medication_route AS ENUM (
  'oral',
  'topical',
  'intravenous',
  'intramuscular',
  'subcutaneous',
  'inhalation',
  'rectal',
  'ophthalmic',
  'otic',
  'nasal',
  'sublingual',
  'transdermal',
  'other'
);

-- Frequency enum
CREATE TYPE medication_frequency AS ENUM (
  'once_daily',
  'twice_daily',
  'three_times_daily',
  'four_times_daily',
  'every_4_hours',
  'every_6_hours',
  'every_8_hours',
  'every_12_hours',
  'as_needed',
  'at_bedtime',
  'with_meals',
  'other'
);

-- prescriptions table
CREATE TABLE prescriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_number TEXT NOT NULL UNIQUE,
  patient_id          UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT,
  encounter_id        UUID REFERENCES clinical_encounters(id) ON DELETE SET NULL,
  prescriber_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  prescription_type   prescription_type NOT NULL DEFAULT 'medical',
  status              prescription_status NOT NULL DEFAULT 'draft',
  
  -- Medication details
  medication_name     TEXT NOT NULL,
  medication_strength TEXT,
  dose                TEXT NOT NULL,
  route               medication_route NOT NULL DEFAULT 'oral',
  frequency           medication_frequency NOT NULL DEFAULT 'once_daily',
  frequency_custom    TEXT, -- for "other" frequency
  duration_days       INTEGER,
  quantity            INTEGER,
  instructions        TEXT,
  
  -- Dates
  date_prescribed     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_issued         TIMESTAMPTZ,
  date_dispensed      TIMESTAMPTZ,
  date_completed      TIMESTAMPTZ,
  
  -- Audit
  signed_at           TIMESTAMPTZ,
  signed_by           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_encounter ON prescriptions(encounter_id);
CREATE INDEX idx_prescriptions_prescriber ON prescriptions(prescriber_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_number ON prescriptions(prescription_number);

-- Enable RLS
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Patients can view their own prescriptions
CREATE POLICY "Patients can view own prescriptions"
  ON prescriptions FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- Clinical roles can view prescriptions
CREATE POLICY "Clinical roles can view prescriptions"
  ON prescriptions FOR SELECT
  USING (
    user_has_role('doctor')
    OR user_has_role('dentist')
    OR user_has_role('nurse')
    OR user_has_role('clinic_staff')
    OR user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Doctors and dentists can create prescriptions
CREATE POLICY "Doctors and dentists can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (
    user_has_role('doctor')
    OR user_has_role('dentist')
    OR user_has_role('clinic_admin')
    OR user_has_role('super_admin')
  );

-- Prescribers can update their own draft prescriptions
CREATE POLICY "Prescribers can update own draft prescriptions"
  ON prescriptions FOR UPDATE
  USING (
    prescriber_id = auth.uid()
    AND status = 'draft'
  );

-- Clinic admins can manage all prescriptions
CREATE POLICY "Clinic admins can manage prescriptions"
  ON prescriptions FOR ALL
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Deny anon access
CREATE POLICY "Deny anon prescriptions"
  ON prescriptions FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_prescriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_prescriptions_updated_at();

-- Function to generate prescription number
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
BEGIN
  -- Get prefix based on current date
  prefix := 'RX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  
  -- Get next sequence number for today
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(prescription_number FROM LENGTH(prefix) + 1) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM prescriptions
  WHERE prescription_number LIKE prefix || '%';
  
  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
