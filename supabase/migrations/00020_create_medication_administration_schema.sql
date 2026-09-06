-- Migration 00020: Medication Administration Schema
-- Tracks medications actually administered at the clinic

CREATE TYPE administration_route AS ENUM (
  'oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous',
  'inhalation', 'rectal', 'ophthalmic', 'otic', 'nasal', 'sublingual',
  'transdermal', 'other'
);

CREATE TABLE medication_administrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  encounter_id      UUID REFERENCES clinical_encounters(id) ON DELETE SET NULL,
  prescription_id   UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  administered_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  medication_name   TEXT NOT NULL,
  medication_strength TEXT,
  dose              TEXT NOT NULL,
  route             administration_route NOT NULL DEFAULT 'oral',
  
  administered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_inventory  TEXT,
  batch_number      TEXT,
  quantity          NUMERIC(8,2),
  unit              TEXT DEFAULT 'tablets',
  
  notes             TEXT,
  adverse_reaction  TEXT,
  
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_med_admin_patient ON medication_administrations(patient_id);
CREATE INDEX idx_med_admin_encounter ON medication_administrations(encounter_id);
CREATE INDEX idx_med_admin_prescriber ON medication_administrations(administered_by);

-- Enable RLS
ALTER TABLE medication_administrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinical roles can view med administrations"
  ON medication_administrations FOR SELECT
  USING (
    user_has_role('doctor') OR user_has_role('dentist')
    OR user_has_role('nurse') OR user_has_role('clinic_staff')
    OR user_has_role('clinic_admin') OR user_has_role('super_admin')
    OR user_has_role('admin')
    OR patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Nurses can record med administrations"
  ON medication_administrations FOR INSERT
  WITH CHECK (
    administered_by = auth.uid()
    AND (user_has_role('nurse') OR user_has_role('clinic_admin')
      OR user_has_role('super_admin') OR user_has_role('admin'))
  );

CREATE POLICY "Clinic admins can manage med administrations"
  ON medication_administrations FOR ALL
  USING (
    user_has_role('clinic_admin') OR user_has_role('super_admin') OR user_has_role('admin')
  );

CREATE POLICY "Deny anon med administrations"
  ON medication_administrations FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);
