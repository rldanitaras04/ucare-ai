-- =============================================================================
-- Migration 00011: Dental EMR Schema
-- =============================================================================
-- Creates dental_encounters and odontogram_entries tables for
-- dentist workspace with interactive odontogram.
-- =============================================================================

-- ─── Custom ENUM types ─────────────────────────────────────────────────────

CREATE TYPE odontogram_condition AS ENUM (
  'sound',
  'caries',
  'restored',
  'missing',
  'crown',
  'extraction_indicated'
);

CREATE TYPE odontogram_surface AS ENUM (
  'mesial',
  'distal',
  'occlusal',
  'buccal',
  'lingual',
  'whole'
);

-- ─── dental_encounters ─────────────────────────────────────────────────────

CREATE TABLE dental_encounters (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id          UUID NOT NULL REFERENCES walk_in_visits(id) ON DELETE CASCADE,
  patient_id        UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  dentist_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  examination_notes TEXT,
  diagnosis         TEXT,
  treatment_plan    TEXT,
  status            encounter_status NOT NULL DEFAULT 'in_progress',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dental_encounters_visit     ON dental_encounters(visit_id);
CREATE INDEX idx_dental_encounters_patient   ON dental_encounters(patient_id);
CREATE INDEX idx_dental_encounters_dentist   ON dental_encounters(dentist_id);
CREATE INDEX idx_dental_encounters_status    ON dental_encounters(status);

-- ─── odontogram_entries ────────────────────────────────────────────────────

CREATE TABLE odontogram_entries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dental_encounter_id   UUID NOT NULL REFERENCES dental_encounters(id) ON DELETE CASCADE,
  patient_id            UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  tooth_number          INT NOT NULL CHECK (tooth_number BETWEEN 11 AND 85),
  surface               odontogram_surface NOT NULL,
  condition             odontogram_condition NOT NULL DEFAULT 'sound',
  procedure_performed   TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_odontogram_entries_encounter ON odontogram_entries(dental_encounter_id);
CREATE INDEX idx_odontogram_entries_patient   ON odontogram_entries(patient_id);
CREATE INDEX idx_odontogram_entries_tooth     ON odontogram_entries(tooth_number);

-- Unique constraint: one entry per tooth+surface per encounter
CREATE UNIQUE INDEX idx_odontogram_unique_tooth_surface
  ON odontogram_entries(dental_encounter_id, tooth_number, surface);

-- ─── Updated_at trigger ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_odontogram_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_odontogram_updated_at
  BEFORE UPDATE ON odontogram_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_odontogram_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE dental_encounters   ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontogram_entries  ENABLE ROW LEVEL SECURITY;

-- ─── dental_encounters ─────────────────────────────────────────────────────

CREATE POLICY "Dentist and admin can view dental encounters"
  ON dental_encounters FOR SELECT
  USING (
    user_has_role('dentist')
    OR user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

CREATE POLICY "Dentists can manage own dental encounters"
  ON dental_encounters FOR ALL
  USING (
    dentist_id = auth.uid()
    AND user_has_role('dentist')
  );

CREATE POLICY "Clinic admins can manage dental encounters"
  ON dental_encounters FOR ALL
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- ─── odontogram_entries ────────────────────────────────────────────────────

CREATE POLICY "Dentist and admin can view odontogram entries"
  ON odontogram_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dental_encounters de
      WHERE de.id = odontogram_entries.dental_encounter_id
      AND (
        de.dentist_id = auth.uid()
        OR user_has_role('clinic_admin')
        OR user_has_role('super_admin')
        OR user_has_role('admin')
      )
    )
  );

CREATE POLICY "Dentists can manage own odontogram entries"
  ON odontogram_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM dental_encounters de
      WHERE de.id = odontogram_entries.dental_encounter_id
      AND de.dentist_id = auth.uid()
      AND user_has_role('dentist')
    )
  );

CREATE POLICY "Clinic admins can manage odontogram entries"
  ON odontogram_entries FOR ALL
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- ─── Deny unauthenticated access ───────────────────────────────────────────

CREATE POLICY "Deny anon dental_encounters"
  ON dental_encounters FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);

CREATE POLICY "Deny anon odontogram_entries"
  ON odontogram_entries FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);
