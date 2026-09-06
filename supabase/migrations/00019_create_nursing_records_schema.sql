-- Migration 00019: Nursing Records Schema
-- Nursing assessments, vital signs, and nursing interventions

-- Nursing assessment type enum
CREATE TYPE nursing_assessment_type AS ENUM (
  'triage',
  'initial',
  'ongoing',
  'focused',
  'emergency'
);

-- Vital signs table
CREATE TABLE vital_signs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id    UUID NOT NULL REFERENCES clinical_encounters(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  recorded_by     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  temperature_c   NUMERIC(4,1),
  systolic_bp     INTEGER,
  diastolic_bp    INTEGER,
  heart_rate_bpm  INTEGER,
  resp_rate_cpm   INTEGER,
  spo2_percent    NUMERIC(4,1),
  pain_score      INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
  weight_kg       NUMERIC(5,1),
  height_cm       NUMERIC(5,1),
  
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vital_signs_encounter ON vital_signs(encounter_id);
CREATE INDEX idx_vital_signs_patient ON vital_signs(patient_id);

-- Nursing assessments table
CREATE TABLE nursing_assessments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id      UUID NOT NULL REFERENCES clinical_encounters(id) ON DELETE CASCADE,
  patient_id        UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  assessed_by       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  assessment_type   nursing_assessment_type NOT NULL DEFAULT 'initial',
  
  chief_complaint   TEXT,
  symptoms          TEXT,
  duration          TEXT,
  relevant_history  TEXT,
  allergies         TEXT,
  current_meds      TEXT,
  observations      TEXT,
  red_flags         TEXT[] DEFAULT '{}',
  nursing_notes     TEXT,
  
  -- Minor illness management
  is_minor_illness  BOOLEAN DEFAULT FALSE,
  protocol_name     TEXT,
  intervention      TEXT,
  
  disposition       TEXT,
  priority          TEXT DEFAULT 'normal',
  
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nursing_assessments_encounter ON nursing_assessments(encounter_id);
CREATE INDEX idx_nursing_assessments_patient ON nursing_assessments(patient_id);

-- Enable RLS
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nursing_assessments ENABLE ROW LEVEL SECURITY;

-- Vital signs policies
CREATE POLICY "Clinical roles can view vital signs"
  ON vital_signs FOR SELECT
  USING (
    user_has_role('doctor') OR user_has_role('dentist')
    OR user_has_role('nurse') OR user_has_role('clinic_staff')
    OR user_has_role('clinic_admin') OR user_has_role('super_admin')
    OR user_has_role('admin')
    OR patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Nurses and clinic staff can record vital signs"
  ON vital_signs FOR INSERT
  WITH CHECK (
    recorded_by = auth.uid()
    AND (user_has_role('nurse') OR user_has_role('clinic_staff')
      OR user_has_role('doctor') OR user_has_role('clinic_admin')
      OR user_has_role('super_admin'))
  );

CREATE POLICY "Clinic admins can manage vital signs"
  ON vital_signs FOR ALL
  USING (
    user_has_role('clinic_admin') OR user_has_role('super_admin') OR user_has_role('admin')
  );

CREATE POLICY "Deny anon vital_signs"
  ON vital_signs FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- Nursing assessments policies
CREATE POLICY "Clinical roles can view nursing assessments"
  ON nursing_assessments FOR SELECT
  USING (
    user_has_role('doctor') OR user_has_role('dentist')
    OR user_has_role('nurse') OR user_has_role('clinic_staff')
    OR user_has_role('clinic_admin') OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

CREATE POLICY "Nurses can create nursing assessments"
  ON nursing_assessments FOR INSERT
  WITH CHECK (
    assessed_by = auth.uid() AND user_has_role('nurse')
  );

CREATE POLICY "Nurses can update own nursing assessments"
  ON nursing_assessments FOR UPDATE
  USING (
    assessed_by = auth.uid() AND user_has_role('nurse')
  );

CREATE POLICY "Clinic admins can manage nursing assessments"
  ON nursing_assessments FOR ALL
  USING (
    user_has_role('clinic_admin') OR user_has_role('super_admin') OR user_has_role('admin')
  );

CREATE POLICY "Deny anon nursing_assessments"
  ON nursing_assessments FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_nursing_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nursing_assessments_updated_at
  BEFORE UPDATE ON nursing_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_nursing_assessments_updated_at();
