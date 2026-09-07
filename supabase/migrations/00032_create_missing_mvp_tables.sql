-- Migration: 00032_create_missing_mvp_tables.sql
-- Creates missing tables identified in scope.md audit

-- ============================================================
-- 1. DIAGNOSES - Structured diagnosis tracking per encounter
-- ============================================================
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES clinical_encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  diagnosis_type TEXT NOT NULL DEFAULT 'medical' CHECK (diagnosis_type IN ('medical', 'dental', 'nursing')),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ruled_out')),
  diagnosed_by UUID NOT NULL REFERENCES auth.users(id),
  diagnosed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diagnoses_select_staff" ON diagnoses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist', 'staff')
    )
  );

CREATE POLICY "diagnoses_insert_clinical" ON diagnoses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'doctor', 'dentist')
    )
    AND diagnosed_by = auth.uid()
  );

CREATE POLICY "diagnoses_update_clinical" ON diagnoses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'doctor', 'dentist')
    )
  );

CREATE POLICY "diagnoses_delete_admin" ON diagnoses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_diagnoses_encounter ON diagnoses(encounter_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient ON diagnoses(patient_id);

-- ============================================================
-- 2. TREATMENTS - Structured treatment tracking per encounter
-- ============================================================
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES clinical_encounters(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  diagnosis_id UUID REFERENCES diagnoses(id) ON DELETE SET NULL,
  treatment_type TEXT NOT NULL DEFAULT 'medical' CHECK (treatment_type IN ('medical', 'dental', 'nursing')),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "treatments_select_staff" ON treatments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist', 'staff')
    )
  );

CREATE POLICY "treatments_insert_clinical" ON treatments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'doctor', 'dentist')
    )
    AND performed_by = auth.uid()
  );

CREATE POLICY "treatments_update_clinical" ON treatments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'doctor', 'dentist')
    )
  );

CREATE INDEX IF NOT EXISTS idx_treatments_encounter ON treatments(encounter_id);
CREATE INDEX IF NOT EXISTS idx_treatments_patient ON treatments(patient_id);

-- ============================================================
-- 3. DISPENSING - Medication dispensing workflow
-- ============================================================
CREATE TABLE IF NOT EXISTS dispensing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  medication_admin_id UUID REFERENCES medication_administrations(id) ON DELETE SET NULL,
  stock_lot_id UUID REFERENCES stock_lots(id) ON DELETE SET NULL,
  dispensed_by UUID NOT NULL REFERENCES auth.users(id),
  medication_name TEXT NOT NULL,
  quantity_dispensed NUMERIC NOT NULL CHECK (quantity_dispensed > 0),
  unit TEXT NOT NULL DEFAULT 'tablets',
  dispensed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dispensing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dispensing_select_staff" ON dispensing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist', 'staff')
    )
  );

CREATE POLICY "dispensing_insert_nurse_admin" ON dispensing
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse')
    )
    AND dispensed_by = auth.uid()
  );

CREATE INDEX IF NOT EXISTS idx_dispensing_prescription ON dispensing(prescription_id);
CREATE INDEX IF NOT EXISTS idx_dispensing_patient ON dispensing(patient_id);
CREATE INDEX IF NOT EXISTS idx_dispensing_stock_lot ON dispensing(stock_lot_id);

-- ============================================================
-- 4. SUPPLIERS - Dedicated supplier tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_select_staff" ON suppliers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'staff')
    )
  );

CREATE POLICY "suppliers_insert_admin" ON suppliers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse')
    )
  );

CREATE POLICY "suppliers_update_admin" ON suppliers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse')
    )
  );

CREATE POLICY "suppliers_delete_admin" ON suppliers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

-- ============================================================
-- 5. QUEUE_STATUS_HISTORY - Audit trail for queue transitions
-- ============================================================
CREATE TABLE IF NOT EXISTS queue_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_entry_id UUID NOT NULL REFERENCES queue_entries(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE queue_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "queue_status_history_select_staff" ON queue_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'staff', 'doctor', 'dentist')
    )
  );

CREATE POLICY "queue_status_history_insert_staff" ON queue_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'staff', 'doctor', 'dentist')
    )
    AND changed_by = auth.uid()
  );

CREATE INDEX IF NOT EXISTS idx_queue_history_entry ON queue_status_history(queue_entry_id);

-- ============================================================
-- 6. DOCUMENT_TEMPLATES - Certificate/document templates
-- ============================================================
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('medical_certificate', 'dental_certificate', 'health_clearance', 'referral_letter', 'prescription', 'other')),
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_templates_select_staff" ON document_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superadmin', 'nurse', 'doctor', 'dentist', 'staff')
    )
  );

CREATE POLICY "document_templates_insert_admin" ON document_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "document_templates_update_admin" ON document_templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

CREATE POLICY "document_templates_delete_admin" ON document_templates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

-- ============================================================
-- 7. DOCUMENT_VERIFICATIONS - Verification trail for issued documents
-- ============================================================
CREATE TABLE IF NOT EXISTS document_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL CHECK (document_type IN ('certificate', 'health_clearance', 'prescription', 'other')),
  document_id UUID NOT NULL,
  verification_code TEXT NOT NULL UNIQUE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE document_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_verifications_select_public" ON document_verifications
  FOR SELECT USING (true);

CREATE POLICY "document_verifications_insert_system" ON document_verifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "document_verifications_update_system" ON document_verifications
  FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_doc_verification_code ON document_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_doc_verification_document ON document_verifications(document_type, document_id);
