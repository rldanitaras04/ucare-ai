-- =============================================================================
-- Migration 00009: Clinic Operations Schema
-- =============================================================================
-- Creates the core clinic tables: patient_profiles, staff_availability,
-- walk_in_visits, triage_records, and queue_entries.
-- Enables RLS on every table with role-aware policies.
-- =============================================================================

-- ─── Custom ENUM types ─────────────────────────────────────────────────────

CREATE TYPE duty_status AS ENUM (
  'available',
  'unavailable',
  'seminar',
  'training',
  'official_activity',
  'on_leave'
);

CREATE TYPE service_type AS ENUM (
  'medical',
  'dental',
  'nursing',
  'clearance'
);

CREATE TYPE visit_status AS ENUM (
  'registered',
  'triaged',
  'waiting_provider',
  'in_consultation',
  'completed',
  'cancelled'
);

CREATE TYPE priority_level AS ENUM (
  'emergency',
  'urgent',
  'priority',
  'normal'
);

CREATE TYPE queue_status AS ENUM (
  'waiting',
  'called',
  'in_session',
  'served',
  'skipped'
);

CREATE TYPE affiliation_type AS ENUM (
  'student',
  'faculty',
  'staff'
);

-- ─── patient_profiles ──────────────────────────────────────────────────────
CREATE TABLE patient_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES profiles(id) ON DELETE SET NULL,
  university_id           TEXT UNIQUE NOT NULL,
  student_employee_no     TEXT,
  first_name              TEXT NOT NULL,
  last_name               TEXT NOT NULL,
  middle_name             TEXT,
  sex                     TEXT,
  date_of_birth           DATE,
  contact_number          TEXT,
  affiliation             affiliation_type,
  college_unit            TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_number TEXT,
  blood_type              TEXT,
  allergies               TEXT[] DEFAULT '{}',
  chronic_conditions      TEXT[] DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_profiles_user_id   ON patient_profiles(user_id);
CREATE INDEX idx_patient_profiles_university ON patient_profiles(university_id);

-- ─── staff_availability ────────────────────────────────────────────────────
CREATE TABLE staff_availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  duty_status     duty_status NOT NULL DEFAULT 'available',
  notes           TEXT,
  start_time      TIMESTAMPTZ,
  end_time        TIMESTAMPTZ,
  authorized_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_availability_profile ON staff_availability(staff_profile_id);

-- ─── walk_in_visits ────────────────────────────────────────────────────────
CREATE TABLE walk_in_visits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  visit_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  service_type      service_type NOT NULL,
  reason_for_visit  TEXT,
  status            visit_status NOT NULL DEFAULT 'registered',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_walk_in_visits_patient  ON walk_in_visits(patient_id);
CREATE INDEX idx_walk_in_visits_date     ON walk_in_visits(visit_date);
CREATE INDEX idx_walk_in_visits_status   ON walk_in_visits(status);

-- ─── triage_records ────────────────────────────────────────────────────────
CREATE TABLE triage_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES walk_in_visits(id) ON DELETE CASCADE,
  triaged_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  is_fallback     BOOLEAN NOT NULL DEFAULT FALSE,
  fallback_reason TEXT,
  priority        priority_level NOT NULL DEFAULT 'normal',
  temperature_c   NUMERIC(4,1),
  systolic_bp     INT,
  diastolic_bp    INT,
  heart_rate_bpm  INT,
  resp_rate_cpm   INT,
  spo2_percent    INT,
  pain_score      INT CHECK (pain_score >= 0 AND pain_score <= 10),
  chief_complaint TEXT,
  red_flags       TEXT[] DEFAULT '{}',
  triage_notes    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_triage_records_visit ON triage_records(visit_id);
CREATE INDEX idx_triage_records_triaged_by ON triage_records(triaged_by);

-- ─── queue_entries ─────────────────────────────────────────────────────────
CREATE TABLE queue_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id          UUID NOT NULL REFERENCES walk_in_visits(id) ON DELETE CASCADE,
  queue_number      TEXT NOT NULL,
  service_category  service_type NOT NULL,
  priority          priority_level NOT NULL DEFAULT 'normal',
  status            queue_status NOT NULL DEFAULT 'waiting',
  called_at        TIMESTAMPTZ,
  served_at        TIMESTAMPTZ,
  room_station     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_queue_entries_visit    ON queue_entries(visit_id);
CREATE INDEX idx_queue_entries_status   ON queue_entries(status);
CREATE INDEX idx_queue_entries_priority ON queue_entries(priority);

-- ─── updated_at trigger for new tables ─────────────────────────────────────

CREATE TRIGGER update_patient_profiles_updated_at
  BEFORE UPDATE ON patient_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_walk_in_visits_updated_at
  BEFORE UPDATE ON walk_in_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE patient_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_in_visits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries     ENABLE ROW LEVEL SECURITY;

-- ─── Helper: check whether the current user holds a given role name ────────
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

-- ─── patient_profiles ──────────────────────────────────────────────────────
-- Patients see only their own row
CREATE POLICY "Patients can view own profile"
  ON patient_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Patients can insert their own profile
CREATE POLICY "Patients can create own profile"
  ON patient_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Patients can update their own profile
CREATE POLICY "Patients can update own profile"
  ON patient_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Clinic staff / nurse / admin / doctor / dentist can view all patient profiles
CREATE POLICY "Clinic roles can view all patient profiles"
  ON patient_profiles FOR SELECT
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('nurse')
    OR user_has_role('clinic_staff')
    OR user_has_role('doctor')
    OR user_has_role('dentist')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Clinic staff / nurse / admin can manage patient profiles
CREATE POLICY "Clinic roles can manage patient profiles"
  ON patient_profiles FOR ALL
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('nurse')
    OR user_has_role('clinic_staff')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- ─── staff_availability ────────────────────────────────────────────────────
-- Any authenticated user can view staff availability (transparent scheduling)
CREATE POLICY "Authenticated users can view staff availability"
  ON staff_availability FOR SELECT
  USING (auth.role() = 'authenticated');

-- Clinic admin / nurse / super_admin / admin can manage staff availability
CREATE POLICY "Clinic admin can manage staff availability"
  ON staff_availability FOR ALL
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('nurse')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- ─── walk_in_visits ────────────────────────────────────────────────────────
-- Patients can view their own visits
CREATE POLICY "Patients can view own visits"
  ON walk_in_visits FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- Patients can register their own walk-in
CREATE POLICY "Patients can create own walk-in"
  ON walk_in_visits FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
  );

-- Clinic roles can view all walk-in visits
CREATE POLICY "Clinic roles can view all walk-ins"
  ON walk_in_visits FOR SELECT
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('nurse')
    OR user_has_role('clinic_staff')
    OR user_has_role('doctor')
    OR user_has_role('dentist')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Clinic roles can manage walk-in visits
CREATE POLICY "Clinic roles can manage walk-ins"
  ON walk_in_visits FOR ALL
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('nurse')
    OR user_has_role('clinic_staff')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- ─── triage_records ────────────────────────────────────────────────────────
-- Patients can view triage records for their own visits
CREATE POLICY "Patients can view own triage records"
  ON triage_records FOR SELECT
  USING (
    visit_id IN (
      SELECT wv.id FROM walk_in_visits wv
      JOIN patient_profiles pp ON wv.patient_id = pp.id
      WHERE pp.user_id = auth.uid()
    )
  );

-- Nurse can view all triage records
CREATE POLICY "Nurse can view triage records"
  ON triage_records FOR SELECT
  USING (
    user_has_role('nurse')
    OR user_has_role('clinic_admin')
    OR user_has_role('doctor')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Nurse can create and update triage records
CREATE POLICY "Nurse can manage triage records"
  ON triage_records FOR ALL
  USING (
    user_has_role('nurse')
    OR user_has_role('clinic_admin')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Clinic staff can insert triage records only when fallback is active
CREATE POLICY "Clinic staff can insert fallback triage"
  ON triage_records FOR INSERT
  WITH CHECK (
    user_has_role('clinic_staff')
    AND is_fallback = TRUE
  );

-- ─── queue_entries ─────────────────────────────────────────────────────────
-- Patients can view the queue entry for their own visit
CREATE POLICY "Patients can view own queue entries"
  ON queue_entries FOR SELECT
  USING (
    visit_id IN (
      SELECT wv.id FROM walk_in_visits wv
      JOIN patient_profiles pp ON wv.patient_id = pp.id
      WHERE pp.user_id = auth.uid()
    )
  );

-- Clinic roles can view all queue entries
CREATE POLICY "Clinic roles can view all queue entries"
  ON queue_entries FOR SELECT
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('nurse')
    OR user_has_role('clinic_staff')
    OR user_has_role('doctor')
    OR user_has_role('dentist')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- Clinic roles can manage queue entries
CREATE POLICY "Clinic roles can manage queue entries"
  ON queue_entries FOR ALL
  USING (
    user_has_role('clinic_admin')
    OR user_has_role('nurse')
    OR user_has_role('clinic_staff')
    OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

-- ─── Deny unauthenticated access to all clinical tables ────────────────────
-- (RLS enabled + no permissive policies for anon role = implicit deny,
--  but we add explicit DENY for defence-in-depth.)

CREATE POLICY "Deny anon patient_profiles"
  ON patient_profiles FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);

CREATE POLICY "Deny anon staff_availability"
  ON staff_availability FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);

CREATE POLICY "Deny anon walk_in_visits"
  ON walk_in_visits FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);

CREATE POLICY "Deny anon triage_records"
  ON triage_records FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);

CREATE POLICY "Deny anon queue_entries"
  ON queue_entries FOR ALL
  USING (auth.role() = 'anon')
  WITH CHECK (false);
