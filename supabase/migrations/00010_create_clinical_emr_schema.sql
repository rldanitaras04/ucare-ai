-- =============================================================================
-- Migration 00010: Clinical EMR Schema
-- =============================================================================
-- Creates provider_sessions, provider_requests, and clinical_encounters
-- tables for doctor/dentist consultation workflow.
-- =============================================================================

-- ─── Custom ENUM types ─────────────────────────────────────────────────────

CREATE TYPE provider_type AS ENUM (
  'doctor',
  'dentist'
);

CREATE TYPE session_type AS ENUM (
  'monthly_visit',
  'case_based',
  'emergency'
);

CREATE TYPE provider_session_status AS ENUM (
  'planned',
  'confirmed',
  'active',
  'completed',
  'cancelled'
);

CREATE TYPE request_urgency AS ENUM (
  'normal',
  'urgent',
  'emergency'
);

CREATE TYPE provider_request_status AS ENUM (
  'pending',
  'for_coordination',
  'confirmed',
  'served',
  'cancelled'
);

CREATE TYPE encounter_type AS ENUM (
  'medical',
  'nursing'
);

CREATE TYPE encounter_status AS ENUM (
  'in_progress',
  'completed'
);

-- ─── provider_sessions ─────────────────────────────────────────────────────
CREATE TABLE provider_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_type       provider_type NOT NULL,
  session_type        session_type NOT NULL,
  session_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time            TIMESTAMPTZ,
  status              provider_session_status NOT NULL DEFAULT 'planned',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_provider_sessions_provider ON provider_sessions(provider_profile_id);
CREATE INDEX idx_provider_sessions_date     ON provider_sessions(session_date);
CREATE INDEX idx_provider_sessions_status   ON provider_sessions(status);

-- ─── provider_requests ─────────────────────────────────────────────────────
CREATE TABLE provider_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  visit_id        UUID NOT NULL REFERENCES walk_in_visits(id) ON DELETE CASCADE,
  requested_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  provider_type   provider_type NOT NULL,
  urgency         request_urgency NOT NULL DEFAULT 'normal',
  reason          TEXT,
  status          provider_request_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_provider_requests_patient  ON provider_requests(patient_id);
CREATE INDEX idx_provider_requests_visit    ON provider_requests(visit_id);
CREATE INDEX idx_provider_requests_status   ON provider_requests(status);
CREATE INDEX idx_provider_requests_provider ON provider_requests(provider_type);

-- ─── clinical_encounters ───────────────────────────────────────────────────
CREATE TABLE clinical_encounters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES walk_in_visits(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  provider_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  session_id      UUID REFERENCES provider_sessions(id) ON DELETE SET NULL,
  encounter_type  encounter_type NOT NULL,
  status          encounter_status NOT NULL DEFAULT 'in_progress',
  subjective      TEXT,
  objective       TEXT,
  assessment      TEXT,
  plan            TEXT,
  diagnosis_codes TEXT[] DEFAULT '{}',
  notes           TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_clinical_encounters_visit     ON clinical_encounters(visit_id);
CREATE INDEX idx_clinical_encounters_patient   ON clinical_encounters(patient_id);
CREATE INDEX idx_clinical_encounters_provider  ON clinical_encounters(provider_id);
CREATE INDEX idx_clinical_encounters_session   ON clinical_encounters(session_id);
CREATE INDEX idx_clinical_encounters_status    ON clinical_encounters(status);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE provider_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_encounters ENABLE ROW LEVEL SECURITY;

-- ─── provider_sessions ─────────────────────────────────────────────────────
-- Doctors, dentists, clinic admins, super admins can view provider sessions
CREATE POLICY "Clinical roles can view provider sessions"
  ON provider_sessions FOR SELECT
  USING (
    user_has_role('doctor')
    OR user_has_role('dentist')
    OR user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Doctors and dentists can manage their own sessions
CREATE POLICY "Providers can manage own sessions"
  ON provider_sessions FOR ALL
  USING (
    provider_profile_id = auth.uid()
    AND (user_has_role('doctor') OR user_has_role('dentist'))
  );

-- Clinic admins can manage all sessions
CREATE POLICY "Clinic admins can manage provider sessions"
  ON provider_sessions FOR ALL
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- ─── provider_requests ─────────────────────────────────────────────────────
-- Doctors, dentists, clinic admins can view provider requests
CREATE POLICY "Clinical roles can view provider requests"
  ON provider_requests FOR SELECT
  USING (
    user_has_role('doctor')
    OR user_has_role('dentist')
    OR user_has_role('clinic_admin')
    OR user_has_role('nurse')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Nurses and clinic staff can create provider requests
CREATE POLICY "Nurse and clinic staff can create provider requests"
  ON provider_requests FOR INSERT
  WITH CHECK (
    requested_by = auth.uid()
    AND (
      user_has_role('nurse')
      OR user_has_role('clinic_staff')
      OR user_has_role('doctor')
      OR user_has_role('dentist')
      OR user_has_role('clinic_admin')
    )
  );

-- Doctors, dentists, clinic admins can update provider requests
CREATE POLICY "Clinical roles can update provider requests"
  ON provider_requests FOR UPDATE
  USING (
    user_has_role('doctor')
    OR user_has_role('dentist')
    OR user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- ─── clinical_encounters ───────────────────────────────────────────────────
-- Doctors, dentists, nurses, clinic admins can view clinical encounters
CREATE POLICY "Clinical roles can view clinical encounters"
  ON clinical_encounters FOR SELECT
  USING (
    user_has_role('doctor')
    OR user_has_role('dentist')
    OR user_has_role('nurse')
    OR user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Doctors and dentists can manage encounters they are assigned to
CREATE POLICY "Providers can manage own encounters"
  ON clinical_encounters FOR ALL
  USING (
    provider_id = auth.uid()
    AND (user_has_role('doctor') OR user_has_role('dentist'))
  );

-- Clinic admins can manage all encounters
CREATE POLICY "Clinic admins can manage clinical encounters"
  ON clinical_encounters FOR ALL
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Nurses can create encounters (nursing type)
CREATE POLICY "Nurses can create nursing encounters"
  ON clinical_encounters FOR INSERT
  WITH CHECK (
    provider_id = auth.uid()
    AND user_has_role('nurse')
    AND encounter_type = 'nursing'
  );

-- ─── Deny unauthenticated access ───────────────────────────────────────────

CREATE POLICY "Deny anon provider_sessions"
  ON provider_sessions FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);

CREATE POLICY "Deny anon provider_requests"
  ON provider_requests FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);

CREATE POLICY "Deny anon clinical_encounters"
  ON clinical_encounters FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);
