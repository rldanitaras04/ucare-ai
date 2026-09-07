-- Migration: 00035_seed_clinic_services_and_providers.sql
-- Seeds clinic_services and providers tables with initial data.

-- ============================================================
-- 1. CLINIC SERVICES - Standard university clinic offerings
-- ============================================================
INSERT INTO clinic_services (name, service_type, description, duration_minutes, is_active, requires_provider) VALUES
  ('General Medical Consultation', 'medical', 'General medical checkup and consultation', 30, true, true),
  ('Dental Consultation', 'dental', 'General dental checkup and consultation', 30, true, true),
  ('Nursing Assessment', 'nursing', 'Initial nursing assessment and triage', 15, true, true),
  ('Medical Clearance', 'clearance', 'Medical clearance for enrollment/employment', 30, true, true),
  ('Dental Clearance', 'clearance', 'Dental clearance for enrollment/employment', 30, true, true),
  ('Annual Physical Examination', 'medical', 'Comprehensive annual physical examination', 45, true, true),
  ('Vaccination', 'medical', 'Routine immunization and vaccination services', 20, true, false),
  ('Minor Surgery', 'medical', 'Minor surgical procedures (lancing, suturing)', 60, true, true),
  ('Dental Cleaning', 'dental', 'Professional dental cleaning and prophylaxis', 45, true, true),
  ('Dental Extraction', 'dental', 'Tooth extraction procedures', 45, true, true),
  ('Dental Filling', 'dental', 'Dental restoration and filling procedures', 45, true, true),
  ('Emergency Treatment', 'medical', 'Emergency medical treatment and stabilization', 30, true, true),
  ('Follow-up Consultation', 'medical', 'Follow-up visit for ongoing conditions', 20, true, true),
  ('Dental Follow-up', 'dental', 'Follow-up visit for dental treatment', 20, true, true),
  ('Health Certification', 'clearance', 'Health certification for specific purposes', 30, true, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. PROVIDERS - Create provider entries for existing doctor/dentist users
-- This uses a DO block to dynamically find users with doctor/dentist roles
-- ============================================================
DO $$
DECLARE
  doc_role_id UUID;
  dentist_role_id UUID;
  rec RECORD;
BEGIN
  SELECT id INTO doc_role_id FROM roles WHERE name = 'doctor' LIMIT 1;
  SELECT id INTO dentist_role_id FROM roles WHERE name = 'dentist' LIMIT 1;

  IF doc_role_id IS NOT NULL THEN
    FOR rec IN SELECT ur.user_id FROM user_roles ur WHERE ur.role_id = doc_role_id
    LOOP
      INSERT INTO providers (profile_id, provider_type, specialty, is_active)
      VALUES (rec.user_id, 'doctor', 'General Medicine', true)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  IF dentist_role_id IS NOT NULL THEN
    FOR rec IN SELECT ur.user_id FROM user_roles ur WHERE ur.role_id = dentist_role_id
    LOOP
      INSERT INTO providers (profile_id, provider_type, specialty, is_active)
      VALUES (rec.user_id, 'dentist', 'General Dentistry', true)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;
