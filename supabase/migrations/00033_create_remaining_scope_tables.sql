-- Migration: 00033_create_remaining_scope_tables.sql
-- Creates remaining missing tables from scope.md

-- ============================================================
-- 1. EMERGENCY_CONTACTS - Dedicated emergency contact table
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emergency_contacts_select_patient" ON emergency_contacts
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist', 'staff')
    )
  );

CREATE POLICY "emergency_contacts_insert_patient" ON emergency_contacts
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist', 'staff')
    )
  );

CREATE POLICY "emergency_contacts_update_patient" ON emergency_contacts
  FOR UPDATE USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist', 'staff')
    )
  );

CREATE POLICY "emergency_contacts_delete_patient" ON emergency_contacts
  FOR DELETE USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse')
    )
  );

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_patient ON emergency_contacts(patient_id);

-- ============================================================
-- 2. ALLERGIES - Dedicated allergy tracking with severity
-- ============================================================
CREATE TABLE IF NOT EXISTS allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  allergen_type TEXT NOT NULL DEFAULT 'other' CHECK (allergen_type IN ('medication', 'food', 'environmental', 'latex', 'other')),
  reaction TEXT,
  severity TEXT NOT NULL DEFAULT 'moderate' CHECK (severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
  onset_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allergies_select_patient" ON allergies
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist', 'staff')
    )
  );

CREATE POLICY "allergies_insert_clinical" ON allergies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist')
    )
    AND recorded_by = auth.uid()
  );

CREATE POLICY "allergies_update_clinical" ON allergies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist')
    )
  );

CREATE POLICY "allergies_delete_admin" ON allergies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_allergies_patient ON allergies(patient_id);

-- ============================================================
-- 3. MEDICAL_HISTORY - Longitudinal medical history
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  icd_code TEXT,
  diagnosis_date DATE,
  resolution_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic', 'in_remission')),
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  treating_facility TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medical_history_select_patient" ON medical_history
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist')
    )
  );

CREATE POLICY "medical_history_insert_clinical" ON medical_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor')
    )
    AND recorded_by = auth.uid()
  );

CREATE POLICY "medical_history_update_clinical" ON medical_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor')
    )
  );

CREATE INDEX IF NOT EXISTS idx_medical_history_patient ON medical_history(patient_id);

-- ============================================================
-- 4. DENTAL_HISTORY - Longitudinal dental history
-- ============================================================
CREATE TABLE IF NOT EXISTS dental_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  tooth_number INTEGER,
  surface TEXT,
  diagnosis_date DATE,
  treatment_date DATE,
  treatment_performed TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'treated', 'monitoring', 'resolved')),
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dental_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dental_history_select_patient" ON dental_history
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patient_profiles WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist')
    )
  );

CREATE POLICY "dental_history_insert_clinical" ON dental_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'dentist')
    )
    AND recorded_by = auth.uid()
  );

CREATE POLICY "dental_history_update_clinical" ON dental_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'dentist')
    )
  );

CREATE INDEX IF NOT EXISTS idx_dental_history_patient ON dental_history(patient_id);

-- ============================================================
-- 5. CLINIC_SERVICES - Available clinic services
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('medical', 'dental', 'nursing', 'clearance')),
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_provider BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_services_select_all" ON clinic_services
  FOR SELECT USING (true);

CREATE POLICY "clinic_services_insert_admin" ON clinic_services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

CREATE POLICY "clinic_services_update_admin" ON clinic_services
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

CREATE POLICY "clinic_services_delete_admin" ON clinic_services
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

-- ============================================================
-- 6. STAFF_ABSENCES - Dedicated absence/leave tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS staff_absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  absence_type TEXT NOT NULL CHECK (absence_type IN ('leave', 'sick', 'seminar', 'training', 'official_activity', 'off_campus', 'other')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE staff_absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_absences_select_own" ON staff_absences
  FOR SELECT USING (
    staff_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse')
    )
  );

CREATE POLICY "staff_absences_insert_own" ON staff_absences
  FOR INSERT WITH CHECK (
    staff_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse')
    )
  );

CREATE POLICY "staff_absences_update_admin" ON staff_absences
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse')
    )
  );

CREATE INDEX IF NOT EXISTS idx_staff_absences_profile ON staff_absences(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_absences_dates ON staff_absences(start_date, end_date);

-- ============================================================
-- 7. PROVIDERS - Dedicated provider profile table
-- ============================================================
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('doctor', 'dentist')),
  specialty TEXT,
  license_number TEXT,
  consultation_fee NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_select_all" ON providers
  FOR SELECT USING (true);

CREATE POLICY "providers_insert_admin" ON providers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

CREATE POLICY "providers_update_admin" ON providers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

CREATE POLICY "providers_delete_admin" ON providers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_profile ON providers(profile_id);

-- ============================================================
-- 8. DENTAL_PROCEDURES - Structured dental procedure tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS dental_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dental_encounter_id UUID NOT NULL REFERENCES dental_encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  tooth_number INTEGER NOT NULL,
  surface TEXT,
  procedure_type TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  cost NUMERIC,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dental_procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dental_procedures_select_staff" ON dental_procedures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'dentist')
    )
  );

CREATE POLICY "dental_procedures_insert_dentist" ON dental_procedures
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'dentist')
    )
    AND performed_by = auth.uid()
  );

CREATE POLICY "dental_procedures_update_dentist" ON dental_procedures
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'dentist')
    )
  );

CREATE INDEX IF NOT EXISTS idx_dental_procedures_encounter ON dental_procedures(dental_encounter_id);
CREATE INDEX IF NOT EXISTS idx_dental_procedures_patient ON dental_procedures(patient_id);
