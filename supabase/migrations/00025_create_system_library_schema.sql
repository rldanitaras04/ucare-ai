-- Migration 00025: System Library Schema
-- Centralized lookup tables, clinical reference datasets, and system options

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE public.system_library_type AS ENUM (
  'icd10_diagnoses',
  'medication_formulary',
  'triage_severity_levels',
  'specialties',
  'appointment_statuses',
  'queue_locations',
  'service_types',
  'vital_sign_units',
  'allergy_types',
  'blood_types',
  'immunization_types',
  'lab_result_units',
  'referral_reasons',
  'treatment_procedures',
  'dental_conditions',
  'tooth_surfaces',
  'custom'
);

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.system_libraries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  library_type public.system_library_type NOT NULL DEFAULT 'custom',
  is_system_reserved BOOLEAN NOT NULL DEFAULT false,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.system_libraries IS 'Master lookup table definitions for system-wide reference data';
COMMENT ON COLUMN public.system_libraries.is_system_reserved IS 'If true, the library cannot be deleted by admins (only deactivated)';
COMMENT ON COLUMN public.system_libraries.library_type IS 'Categorizes the library for internal use and validation';

CREATE TABLE public.system_library_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id  UUID NOT NULL REFERENCES public.system_libraries(id) ON DELETE CASCADE,
  item_code   TEXT NOT NULL,
  label       TEXT NOT NULL,
  value       TEXT NOT NULL,
  description TEXT,
  metadata    JSONB DEFAULT '{}',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_library_item_code UNIQUE (library_id, item_code)
);

COMMENT ON TABLE public.system_library_items IS 'Individual configurable records within each system library';
COMMENT ON COLUMN public.system_library_items.metadata IS 'Flexible JSONB field for additional attributes (e.g., dosage units, ICD chapter, display color)';

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_system_libraries_code ON public.system_libraries(code);
CREATE INDEX idx_system_libraries_type ON public.system_libraries(library_type);
CREATE INDEX idx_system_libraries_active ON public.system_libraries(is_active) WHERE is_active = true;

CREATE INDEX idx_system_library_items_library ON public.system_library_items(library_id);
CREATE INDEX idx_system_library_items_code ON public.system_library_items(library_id, item_code);
CREATE INDEX idx_system_library_items_active ON public.system_library_items(is_active) WHERE is_active = true;
CREATE INDEX idx_system_library_items_sort ON public.system_library_items(library_id, sort_order);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_system_libraries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_system_libraries_updated_at
  BEFORE UPDATE ON public.system_libraries
  FOR EACH ROW EXECUTE FUNCTION public.handle_system_libraries_updated_at();

CREATE TRIGGER set_system_library_items_updated_at
  BEFORE UPDATE ON public.system_library_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_system_libraries_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.system_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_library_items ENABLE ROW LEVEL SECURITY;

-- Read: All authenticated users can read active libraries
CREATE POLICY "Authenticated users can view system libraries"
  ON public.system_libraries FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can view active library items"
  ON public.system_library_items FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Also allow admins to see inactive items for management
CREATE POLICY "Admins can view all library items"
  ON public.system_library_items FOR SELECT
  TO authenticated
  USING (
    user_has_role('super_admin') OR
    user_has_role('admin') OR
    user_has_role('clinic_admin')
  );

CREATE POLICY "Admins can view all libraries"
  ON public.system_libraries FOR SELECT
  TO authenticated
  USING (
    user_has_role('super_admin') OR
    user_has_role('admin') OR
    user_has_role('clinic_admin')
  );

-- Write: Only admins can manage libraries
CREATE POLICY "Admins can insert system libraries"
  ON public.system_libraries FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_role('super_admin') OR
    user_has_role('admin') OR
    user_has_role('clinic_admin')
  );

CREATE POLICY "Admins can update system libraries"
  ON public.system_libraries FOR UPDATE
  TO authenticated
  USING (
    user_has_role('super_admin') OR
    user_has_role('admin') OR
    user_has_role('clinic_admin')
  );

CREATE POLICY "Admins can delete system libraries"
  ON public.system_libraries FOR DELETE
  TO authenticated
  USING (
    (user_has_role('super_admin') OR user_has_role('admin'))
    AND is_system_reserved = false
  );

CREATE POLICY "Admins can insert library items"
  ON public.system_library_items FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_role('super_admin') OR
    user_has_role('admin') OR
    user_has_role('clinic_admin')
  );

CREATE POLICY "Admins can update library items"
  ON public.system_library_items FOR UPDATE
  TO authenticated
  USING (
    user_has_role('super_admin') OR
    user_has_role('admin') OR
    user_has_role('clinic_admin')
  );

CREATE POLICY "Admins can delete library items"
  ON public.system_library_items FOR DELETE
  TO authenticated
  USING (
    user_has_role('super_admin') OR
    user_has_role('admin')
  );

-- Deny anon access
CREATE POLICY "Deny anon system_libraries"
  ON public.system_libraries FOR ALL
  TO anon
  USING (false);

CREATE POLICY "Deny anon system_library_items"
  ON public.system_library_items FOR ALL
  TO anon
  USING (false);

-- ============================================================
-- SEED DATA: Default Libraries
-- ============================================================

INSERT INTO public.system_libraries (code, name, description, library_type, is_system_reserved) VALUES
  ('icd10_diagnoses', 'ICD-10 Diagnoses', 'International Classification of Diseases, 10th Revision - Clinical Modification codes for diagnoses', 'icd10_diagnoses', true),
  ('medication_formulary', 'Medication Formulary', 'Approved medication list with dosage forms, routes, and units', 'medication_formulary', true),
  ('triage_severity_levels', 'Triage Severity Levels', 'Emergency severity index levels for patient triage prioritization', 'triage_severity_levels', true),
  ('specialties', 'Medical Specialties', 'Clinical departments and specialist areas', 'specialties', true),
  ('appointment_statuses', 'Appointment Statuses', 'Workflow states for patient appointments', 'appointment_statuses', true),
  ('queue_locations', 'Queue Locations', 'Physical or logical queue stations within the clinic', 'queue_locations', true),
  ('service_types', 'Service Types', 'Types of clinical services offered by the clinic', 'service_types', true),
  ('vital_sign_units', 'Vital Sign Units', 'Units of measurement for vital signs (mmHg, bpm, °C, etc.)', 'vital_sign_units', true),
  ('allergy_types', 'Allergy Types', 'Categories of allergies and adverse reactions', 'allergy_types', true),
  ('blood_types', 'Blood Types', 'ABO and Rh blood type classifications', 'blood_types', true),
  ('immunization_types', 'Immunization Types', 'Vaccine types and immunization categories', 'immunization_types', true),
  ('referral_reasons', 'Referral Reasons', 'Common reasons for patient referrals between departments', 'referral_reasons', true),
  ('dental_conditions', 'Dental Conditions', 'Common dental conditions and oral health diagnoses', 'dental_conditions', true),
  ('tooth_surfaces', 'Tooth Surfaces', 'Surface designations for dental charting (MESI, etc.)', 'tooth_surfaces', true);

-- ============================================================
-- SEED DATA: Default Library Items
-- ============================================================

-- Triage Severity Levels
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'triage_severity_levels'), 'ESI1', 'Resuscitation', 'immediate', 1, '{"color": "#DC2626", "description": "Immediate life-saving intervention required"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'triage_severity_levels'), 'ESI2', 'Emergent', 'emergent', 2, '{"color": "#EA580C", "description": "High risk, confused/lethargic/distressed"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'triage_severity_levels'), 'ESI3', 'Urgent', 'urgent', 3, '{"color": "#D97706", "description": "Stable but needs immediate care"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'triage_severity_levels'), 'ESI4', 'Less Urgent', 'less_urgent', 4, '{"color": "#2563EB", "description": "Non-urgent, can wait"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'triage_severity_levels'), 'ESI5', 'Non-Urgent', 'non_urgent', 5, '{"color": "#16A34A", "description": "Walking wounded, lowest acuity"}');

-- Specialties
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'specialties'), 'GEN', 'General Medicine', 'general_medicine', 1, '{"department": "OPD"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'specialties'), 'PED', 'Pediatrics', 'pediatrics', 2, '{"department": "OPD"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'specialties'), 'DEN', 'Dentistry', 'dentistry', 3, '{"department": "Dental"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'specialties'), 'SUR', 'Surgery', 'surgery', 4, '{"department": "Surgical"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'specialties'), 'OBS', 'Obstetrics & Gynecology', 'obstetrics_gynecology', 5, '{"department": "OB-GYN"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'specialties'), 'ORT', 'Orthopedics', 'orthopedics', 6, '{"department": "Surgical"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'specialties'), 'DER', 'Dermatology', 'dermatology', 7, '{"department": "OPD"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'specialties'), 'CAR', 'Cardiology', 'cardiology', 8, '{"department": "Specialist"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'specialties'), 'NEU', 'Neurology', 'neurology', 9, '{"department": "Specialist"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'specialties'), 'EMA', 'Emergency Medicine', 'emergency_medicine', 10, '{"department": "ER"}');

-- Service Types
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'service_types'), 'CONS', 'Consultation', 'consultation', 1, '{"duration_minutes": 30}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'service_types'), 'DENT', 'Dental Service', 'dental_service', 2, '{"duration_minutes": 45}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'service_types'), 'VACC', 'Vaccination', 'vaccination', 3, '{"duration_minutes": 15}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'service_types'), 'LAB', 'Laboratory', 'laboratory', 4, '{"duration_minutes": 20}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'service_types'), 'PHYSC', 'Physical Examination', 'physical_examination', 5, '{"duration_minutes": 30}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'service_types'), 'FOLL', 'Follow-up', 'follow_up', 6, '{"duration_minutes": 20}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'service_types'), 'PROC', 'Minor Procedure', 'minor_procedure', 7, '{"duration_minutes": 60}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'service_types'), 'PRESC', 'Prescription Renewal', 'prescription_renewal', 8, '{"duration_minutes": 15}');

-- Appointment Statuses
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'appointment_statuses'), 'PENDING', 'Pending', 'pending', 1, '{"color": "#D97706"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'appointment_statuses'), 'CONFIRMED', 'Confirmed', 'confirmed', 2, '{"color": "#2563EB"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'appointment_statuses'), 'CHECKED_IN', 'Checked In', 'checked_in', 3, '{"color": "#7C3AED"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'appointment_statuses'), 'IN_PROGRESS', 'In Progress', 'in_progress', 4, '{"color": "#EA580C"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'appointment_statuses'), 'COMPLETED', 'Completed', 'completed', 5, '{"color": "#16A34A"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'appointment_statuses'), 'CANCELLED', 'Cancelled', 'cancelled', 6, '{"color": "#DC2626"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'appointment_statuses'), 'NO_SHOW', 'No Show', 'no_show', 7, '{"color": "#6B7280"}');

-- Queue Locations
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'queue_locations'), 'REG', 'Registration', 'registration', 1, '{"floor": 1}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'queue_locations'), 'WAIT', 'Waiting Area', 'waiting_area', 2, '{"floor": 1}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'queue_locations'), 'TRIAGE', 'Triage', 'triage', 3, '{"floor": 1}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'queue_locations'), 'CONSULT', 'Consultation Room', 'consultation_room', 4, '{"floor": 2}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'queue_locations'), 'DENTAL', 'Dental Clinic', 'dental_clinic', 5, '{"floor": 2}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'queue_locations'), 'LAB_AREA', 'Laboratory', 'laboratory', 6, '{"floor": 1}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'queue_locations'), 'PHARM', 'Pharmacy', 'pharmacy', 7, '{"floor": 1}');

-- Blood Types
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'blood_types'), 'A_POS', 'A+', 'A+', 1, '{"rh": "positive"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'blood_types'), 'A_NEG', 'A-', 'A-', 2, '{"rh": "negative"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'blood_types'), 'B_POS', 'B+', 'B+', 3, '{"rh": "positive"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'blood_types'), 'B_NEG', 'B-', 'B-', 4, '{"rh": "negative"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'blood_types'), 'AB_POS', 'AB+', 'AB+', 5, '{"rh": "positive"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'blood_types'), 'AB_NEG', 'AB-', 'AB-', 6, '{"rh": "negative"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'blood_types'), 'O_POS', 'O+', 'O+', 7, '{"rh": "positive"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'blood_types'), 'O_NEG', 'O-', 'O-', 8, '{"rh": "negative"}');

-- Allergy Types
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'allergy_types'), 'DRUG', 'Drug Allergy', 'drug', 1, '{"severity_levels": ["mild", "moderate", "severe"]}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'allergy_types'), 'FOOD', 'Food Allergy', 'food', 2, '{}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'allergy_types'), 'ENV', 'Environmental Allergy', 'environmental', 3, '{}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'allergy_types'), 'LAT', 'Latex Allergy', 'latex', 4, '{}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'allergy_types'), 'INSECT', 'Insect Sting Allergy', 'insect_sting', 5, '{}');

-- Vital Sign Units
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'vital_sign_units'), 'BP_MMHG', 'mmHg', 'mmHg', 1, '{"category": "blood_pressure"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'vital_sign_units'), 'HR_BPM', 'bpm', 'bpm', 2, '{"category": "heart_rate"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'vital_sign_units'), 'TEMP_C', '°C', 'celsius', 3, '{"category": "temperature"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'vital_sign_units'), 'TEMP_F', '°F', 'fahrenheit', 4, '{"category": "temperature"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'vital_sign_units'), 'RR_MIN', 'breaths/min', 'breaths_per_min', 5, '{"category": "respiratory_rate"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'vital_sign_units'), 'SPO2_PCT', '% SpO2', 'percent_spo2', 6, '{"category": "oxygen_saturation"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'vital_sign_units'), 'WT_KG', 'kg', 'kilograms', 7, '{"category": "weight"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'vital_sign_units'), 'HT_CM', 'cm', 'centimeters', 8, '{"category": "height"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'vital_sign_units'), 'BMI', 'kg/m²', 'bmi', 9, '{"category": "bmi"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'vital_sign_units'), 'BG_MGDL', 'mg/dL', 'mg_per_dl', 10, '{"category": "blood_glucose"}');

-- Dental Conditions
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'dental_conditions'), 'CAV', 'Dental Caries', 'dental_caries', 1, '{"category": "restorative"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'dental_conditions'), 'PERIO', 'Periodontal Disease', 'periodontal_disease', 2, '{"category": "periodontal"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'dental_conditions'), 'GING', 'Gingivitis', 'gingivitis', 3, '{"category": "periodontal"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'dental_conditions'), 'ABS', 'Dental Abscess', 'dental_abscess', 4, '{"category": "infection"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'dental_conditions'), 'IMP', 'Impacted Tooth', 'impacted_tooth', 5, '{"category": "surgical"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'dental_conditions'), 'EROS', 'Tooth Erosion', 'tooth_erosion', 6, '{"category": "erosive"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'dental_conditions'), 'MAL', 'Malocclusion', 'malocclusion', 7, '{"category": "orthodontic"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'dental_conditions'), 'BRUX', 'Bruxism', 'bruxism', 8, '{"category": "functional"}');

-- Tooth Surfaces
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'tooth_surfaces'), 'MES', 'Mesial', 'mesial', 1, '{"abbreviation": "M"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'tooth_surfaces'), 'DIS', 'Distal', 'distal', 2, '{"abbreviation": "D"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'tooth_surfaces'), 'OCI', 'Occlusal', 'occlusal', 3, '{"abbreviation": "O"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'tooth_surfaces'), 'FAC', 'Facial', 'facial', 4, '{"abbreviation": "F"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'tooth_surfaces'), 'LIN', 'Lingual', 'lingual', 5, '{"abbreviation": "L"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'tooth_surfaces'), 'INC', 'Incisal', 'incisal', 6, '{"abbreviation": "I"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'tooth_surfaces'), 'CER', 'Cervical', 'cervical', 7, '{"abbreviation": "C"}');

-- Immunization Types
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'immunization_types'), 'BCG', 'BCG', 'bcg', 1, '{"target": "tuberculosis"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'immunization_types'), 'HEP_B', 'Hepatitis B', 'hepatitis_b', 2, '{"target": "hepatitis_b"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'immunization_types'), 'DPT', 'DPT', 'dpt', 3, '{"target": "diphtheria_pertussis_tetanus"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'immunization_types'), 'MMR', 'MMR', 'mmr', 4, '{"target": "measles_mumps_rubella"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'immunization_types'), 'POLIO', 'Polio (OPV/IPV)', 'polio', 5, '{"target": "poliomyelitis"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'immunization_types'), 'FLU', 'Influenza', 'influenza', 6, '{"target": "seasonal_influenza"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'immunization_types'), 'COVID', 'COVID-19', 'covid19', 7, '{"target": "sars_cov_2"}');

-- Referral Reasons
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'referral_reasons'), 'SPEC', 'Specialist Consultation', 'specialist_consultation', 1, '{}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'referral_reasons'), 'SURG', 'Surgical Evaluation', 'surgical_evaluation', 2, '{}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'referral_reasons'), 'LAB_R', 'Laboratory Investigation', 'laboratory_investigation', 3, '{}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'referral_reasons'), 'IMAGING', 'Imaging Studies', 'imaging_studies', 4, '{}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'referral_reasons'), 'REHAB', 'Rehabilitation', 'rehabilitation', 5, '{}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'referral_reasons'), 'MENTAL', 'Mental Health', 'mental_health', 6, '{}');

-- ICD-10 Sample Diagnoses (common primary care codes)
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'icd10_diagnoses'), 'J06.9', 'Acute upper respiratory infection, unspecified', 'J06.9', 1, '{"chapter": "XIX", "block": "J00-J99"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'icd10_diagnoses'), 'J18.9', 'Pneumonia, unspecified organism', 'J18.9', 2, '{"chapter": "XIX", "block": "J00-J99"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'icd10_diagnoses'), 'I10', 'Essential (primary) hypertension', 'I10', 3, '{"chapter": "IX", "block": "I10-I16"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'icd10_diagnoses'), 'E11.9', 'Type 2 diabetes mellitus without complications', 'E11.9', 4, '{"chapter": "IV", "block": "E08-E13"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'icd10_diagnoses'), 'M54.5', 'Low back pain', 'M54.5', 5, '{"chapter": "XIII", "block": "M50-M54"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'icd10_diagnoses'), 'K21.0', 'Gastro-esophageal reflux disease with esophagitis', 'K21.0', 6, '{"chapter": "XI", "block": "K20-K31"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'icd10_diagnoses'), 'R51.9', 'Headache, unspecified', 'R51.9', 7, '{"chapter": "XVIII", "block": "R50-R69"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'icd10_diagnoses'), 'L30.9', 'Dermatitis, unspecified', 'L30.9', 8, '{"chapter": "XII", "block": "L20-L30"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'icd10_diagnoses'), 'N39.0', 'Urinary tract infection, site not specified', 'N39.0', 9, '{"chapter": "XIV", "block": "N30-N39"}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'icd10_diagnoses'), 'A09', 'Infectious gastroenteritis and colitis, unspecified', 'A09', 10, '{"chapter": "I", "block": "A00-A09"}');

-- Medication Formulary Sample
INSERT INTO public.system_library_items (library_id, item_code, label, value, sort_order, metadata) VALUES
  ((SELECT id FROM public.system_libraries WHERE code = 'medication_formulary'), 'PARA', 'Paracetamol', 'paracetamol', 1, '{"dosage_forms": ["tablet", "syrup", "suppository"], "routes": ["oral", "rectal"], "unit": "mg", "common_doses": [250, 500, 1000]}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'medication_formulary'), 'AMOX', 'Amoxicillin', 'amoxicillin', 2, '{"dosage_forms": ["capsule", "suspension"], "routes": ["oral"], "unit": "mg", "common_doses": [250, 500]}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'medication_formulary'), 'METF', 'Metformin', 'metformin', 3, '{"dosage_forms": ["tablet"], "routes": ["oral"], "unit": "mg", "common_doses": [500, 850, 1000]}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'medication_formulary'), 'AMLO', 'Amlodipine', 'amlodipine', 4, '{"dosage_forms": ["tablet"], "routes": ["oral"], "unit": "mg", "common_doses": [2.5, 5, 10]}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'medication_formulary'), 'IBU', 'Ibuprofen', 'ibuprofen', 5, '{"dosage_forms": ["tablet", "capsule"], "routes": ["oral"], "unit": "mg", "common_doses": [200, 400, 600]}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'medication_formulary'), 'CEPH', 'Cephalexin', 'cephalexin', 6, '{"dosage_forms": ["capsule", "suspension"], "routes": ["oral"], "unit": "mg", "common_doses": [250, 500]}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'medication_formulary'), 'LORAT', 'Loratadine', 'loratadine', 7, '{"dosage_forms": ["tablet"], "routes": ["oral"], "unit": "mg", "common_doses": [10]}'),
  ((SELECT id FROM public.system_libraries WHERE code = 'medication_formulary'), 'OMEP', 'Omeprazole', 'omeprazole', 8, '{"dosage_forms": ["capsule"], "routes": ["oral"], "unit": "mg", "common_doses": [20, 40]}');
