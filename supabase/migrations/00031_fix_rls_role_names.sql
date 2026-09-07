-- Migration: 00031_fix_rls_role_names.sql
-- Drops and recreates all RLS policies that reference old role names.
-- Old names → New names: super_admin/admin/clinic_admin → superadmin, clinic_staff → staff, nurse_admin → nurse, user → patient

-- ══════════════════════════════════════════════════════════════════
-- PROFILES
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Deny anon profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (user_has_role('superadmin'));

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (user_has_role('superadmin'));

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (user_has_role('superadmin'));

CREATE POLICY "Deny anon profiles" ON profiles
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- ROLES
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;
DROP POLICY IF EXISTS "Only super_admin can manage roles" ON roles;

CREATE POLICY "Authenticated users can view roles" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only superadmin can manage roles" ON roles
  FOR ALL USING (user_has_role('superadmin'));

-- ══════════════════════════════════════════════════════════════════
-- PERMISSIONS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Only super_admin can manage permissions" ON permissions;

CREATE POLICY "Authenticated users can view permissions" ON permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only superadmin can manage permissions" ON permissions
  FOR ALL USING (user_has_role('superadmin'));

-- ══════════════════════════════════════════════════════════════════
-- USER_ROLES
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users can view own user_roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user_roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON user_roles;

CREATE POLICY "Users can view own user_roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user_roles" ON user_roles
  FOR SELECT USING (user_has_role('superadmin'));

CREATE POLICY "Admins can manage user_roles" ON user_roles
  FOR ALL USING (user_has_role('superadmin'));

-- ══════════════════════════════════════════════════════════════════
-- ROLE_PERMISSIONS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated users can view role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Only super_admin can manage role_permissions" ON role_permissions;

CREATE POLICY "Authenticated users can view role_permissions" ON role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only superadmin can manage role_permissions" ON role_permissions
  FOR ALL USING (user_has_role('superadmin'));

-- ══════════════════════════════════════════════════════════════════
-- AUDIT_LOGS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can view audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view audit_logs_select" ON audit_logs;

CREATE POLICY "Admins can view audit_logs" ON audit_logs
  FOR SELECT USING (user_has_role('superadmin'));

-- ══════════════════════════════════════════════════════════════════
-- PATIENT_PROFILES
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Patients can view own profile" ON patient_profiles;
DROP POLICY IF EXISTS "Patients can create own profile" ON patient_profiles;
DROP POLICY IF EXISTS "Patients can update own profile" ON patient_profiles;
DROP POLICY IF EXISTS "Clinic roles can view all patients" ON patient_profiles;
DROP POLICY IF EXISTS "Clinic roles can manage patients" ON patient_profiles;
DROP POLICY IF EXISTS "Deny anon patients" ON patient_profiles;

CREATE POLICY "Patients can view own profile" ON patient_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Patients can create own profile" ON patient_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Patients can update own profile" ON patient_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Clinic roles can view all patients" ON patient_profiles
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Clinic roles can manage patients" ON patient_profiles
  FOR ALL USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Deny anon patients" ON patient_profiles
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- STAFF_AVAILABILITY
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "All authenticated can view staff_availability" ON staff_availability;
DROP POLICY IF EXISTS "Admins can manage staff_availability" ON staff_availability;
DROP POLICY IF EXISTS "Deny anon staff_availability" ON staff_availability;

CREATE POLICY "All authenticated can view staff_availability" ON staff_availability
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage staff_availability" ON staff_availability
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon staff_availability" ON staff_availability
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- WALK_IN_VISITS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Patients can view own walk_in_visits" ON walk_in_visits;
DROP POLICY IF EXISTS "Patients can create walk_in_visits" ON walk_in_visits;
DROP POLICY IF EXISTS "Clinic roles can view all walk_in_visits" ON walk_in_visits;
DROP POLICY IF EXISTS "Clinic roles can manage walk_in_visits" ON walk_in_visits;
DROP POLICY IF EXISTS "Deny anon walk_in_visits" ON walk_in_visits;

CREATE POLICY "Patients can view own walk_in_visits" ON walk_in_visits
  FOR SELECT USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Patients can create walk_in_visits" ON walk_in_visits
  FOR INSERT WITH CHECK (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clinic roles can view all walk_in_visits" ON walk_in_visits
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Clinic roles can manage walk_in_visits" ON walk_in_visits
  FOR ALL USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Deny anon walk_in_visits" ON walk_in_visits
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- TRIAGE_RECORDS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Patients can view own triage_records" ON triage_records;
DROP POLICY IF EXISTS "Clinical roles can view triage_records" ON triage_records;
DROP POLICY IF EXISTS "Nurse can manage triage_records" ON triage_records;
DROP POLICY IF EXISTS "Staff can insert fallback triage" ON triage_records;
DROP POLICY IF EXISTS "Deny anon triage_records" ON triage_records;

CREATE POLICY "Patients can view own triage_records" ON triage_records
  FOR SELECT USING (visit_id IN (SELECT id FROM walk_in_visits WHERE patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Clinical roles can view triage_records" ON triage_records
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Nurse can manage triage_records" ON triage_records
  FOR ALL USING (user_has_role('nurse') OR user_has_role('superadmin'));

CREATE POLICY "Staff can insert fallback triage" ON triage_records
  FOR INSERT WITH CHECK (user_has_role('staff') OR user_has_role('nurse'));

CREATE POLICY "Deny anon triage_records" ON triage_records
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- QUEUE_ENTRIES
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Patients can view own queue_entries" ON queue_entries;
DROP POLICY IF EXISTS "Clinic roles can view all queue_entries" ON queue_entries;
DROP POLICY IF EXISTS "Clinic roles can manage queue_entries" ON queue_entries;
DROP POLICY IF EXISTS "Deny anon queue_entries" ON queue_entries;

CREATE POLICY "Patients can view own queue_entries" ON queue_entries
  FOR SELECT USING (visit_id IN (SELECT id FROM walk_in_visits WHERE patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Clinic roles can view all queue_entries" ON queue_entries
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Clinic roles can manage queue_entries" ON queue_entries
  FOR ALL USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Deny anon queue_entries" ON queue_entries
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- PROVIDER_SESSIONS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Clinical roles can view provider_sessions" ON provider_sessions;
DROP POLICY IF EXISTS "Providers can manage own sessions" ON provider_sessions;
DROP POLICY IF EXISTS "Admins can manage all provider_sessions" ON provider_sessions;
DROP POLICY IF EXISTS "Deny anon provider_sessions" ON provider_sessions;

CREATE POLICY "Clinical roles can view provider_sessions" ON provider_sessions
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Providers can manage own sessions" ON provider_sessions
  FOR ALL USING (provider_profile_id = auth.uid());

CREATE POLICY "Admins can manage all provider_sessions" ON provider_sessions
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon provider_sessions" ON provider_sessions
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- PROVIDER_REQUESTS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Clinical roles can view provider_requests" ON provider_requests;
DROP POLICY IF EXISTS "Nurse and staff can create provider_requests" ON provider_requests;
DROP POLICY IF EXISTS "Clinical roles can update provider_requests" ON provider_requests;
DROP POLICY IF EXISTS "Deny anon provider_requests" ON provider_requests;

CREATE POLICY "Clinical roles can view provider_requests" ON provider_requests
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Nurse and staff can create provider_requests" ON provider_requests
  FOR INSERT WITH CHECK (user_has_role('nurse') OR user_has_role('staff') OR user_has_role('superadmin'));

CREATE POLICY "Clinical roles can update provider_requests" ON provider_requests
  FOR UPDATE USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Deny anon provider_requests" ON provider_requests
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- CLINICAL_ENCOUNTERS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Clinical roles can view clinical_encounters" ON clinical_encounters;
DROP POLICY IF EXISTS "Providers can manage own encounters" ON clinical_encounters;
DROP POLICY IF EXISTS "Admins can manage all clinical_encounters" ON clinical_encounters;
DROP POLICY IF EXISTS "Deny anon clinical_encounters" ON clinical_encounters;

CREATE POLICY "Clinical roles can view clinical_encounters" ON clinical_encounters
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Providers can manage own encounters" ON clinical_encounters
  FOR ALL USING (provider_id = auth.uid());

CREATE POLICY "Admins can manage all clinical_encounters" ON clinical_encounters
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon clinical_encounters" ON clinical_encounters
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- DENTAL_ENCOUNTERS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Dentist can view dental_encounters" ON dental_encounters;
DROP POLICY IF EXISTS "Dentist can manage own dental_encounters" ON dental_encounters;
DROP POLICY IF EXISTS "Admins can manage all dental_encounters" ON dental_encounters;
DROP POLICY IF EXISTS "Deny anon dental_encounters" ON dental_encounters;

CREATE POLICY "Dentist can view dental_encounters" ON dental_encounters
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR user_has_role('dentist')
  );

CREATE POLICY "Dentist can manage own dental_encounters" ON dental_encounters
  FOR ALL USING (provider_id = auth.uid());

CREATE POLICY "Admins can manage all dental_encounters" ON dental_encounters
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon dental_encounters" ON dental_encounters
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- ODONTOGRAM_ENTRIES
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Dentist can view odontogram_entries" ON odontogram_entries;
DROP POLICY IF EXISTS "Dentist can manage own odontogram_entries" ON odontogram_entries;
DROP POLICY IF EXISTS "Admins can manage all odontogram_entries" ON odontogram_entries;
DROP POLICY IF EXISTS "Deny anon odontogram_entries" ON odontogram_entries;

CREATE POLICY "Dentist can view odontogram_entries" ON odontogram_entries
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR user_has_role('dentist')
  );

CREATE POLICY "Dentist can manage own odontogram_entries" ON odontogram_entries
  FOR ALL USING (encounter_id IN (SELECT id FROM dental_encounters WHERE provider_id = auth.uid()));

CREATE POLICY "Admins can manage all odontogram_entries" ON odontogram_entries
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon odontogram_entries" ON odontogram_entries
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- VITAL_SIGNS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Clinical roles can view vital_signs" ON vital_signs;
DROP POLICY IF EXISTS "Nurse can manage vital_signs" ON vital_signs;
DROP POLICY IF EXISTS "Deny anon vital_signs" ON vital_signs;

CREATE POLICY "Clinical roles can view vital_signs" ON vital_signs
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Nurse can manage vital_signs" ON vital_signs
  FOR ALL USING (user_has_role('nurse') OR user_has_role('superadmin'));

CREATE POLICY "Deny anon vital_signs" ON vital_signs
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- NURSING_ASSESSMENTS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Clinical roles can view nursing_assessments" ON nursing_assessments;
DROP POLICY IF EXISTS "Nurse can manage own nursing_assessments" ON nursing_assessments;
DROP POLICY IF EXISTS "Admins can manage all nursing_assessments" ON nursing_assessments;
DROP POLICY IF EXISTS "Deny anon nursing_assessments" ON nursing_assessments;

CREATE POLICY "Clinical roles can view nursing_assessments" ON nursing_assessments
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Nurse can manage own nursing_assessments" ON nursing_assessments
  FOR ALL USING (user_has_role('nurse'));

CREATE POLICY "Admins can manage all nursing_assessments" ON nursing_assessments
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon nursing_assessments" ON nursing_assessments
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- PRESCRIPTIONS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Patients can view own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Clinical roles can view prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors and dentists can create prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Prescribers can update own drafts" ON prescriptions;
DROP POLICY IF EXISTS "Admins can manage all prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Deny anon prescriptions" ON prescriptions;

CREATE POLICY "Patients can view own prescriptions" ON prescriptions
  FOR SELECT USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clinical roles can view prescriptions" ON prescriptions
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Doctors and dentists can create prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (
    user_has_role('doctor') OR user_has_role('dentist') OR user_has_role('superadmin')
  );

CREATE POLICY "Prescribers can update own drafts" ON prescriptions
  FOR UPDATE USING (prescriber_id = auth.uid());

CREATE POLICY "Admins can manage all prescriptions" ON prescriptions
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon prescriptions" ON prescriptions
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- MEDICATION_ADMINISTRATIONS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Clinical roles can view medication_administrations" ON medication_administrations;
DROP POLICY IF EXISTS "Nurse can manage medication_administrations" ON medication_administrations;
DROP POLICY IF EXISTS "Admins can manage all medication_administrations" ON medication_administrations;
DROP POLICY IF EXISTS "Deny anon medication_administrations" ON medication_administrations;

CREATE POLICY "Clinical roles can view medication_administrations" ON medication_administrations
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Nurse can manage medication_administrations" ON medication_administrations
  FOR ALL USING (user_has_role('nurse') OR user_has_role('superadmin'));

CREATE POLICY "Admins can manage all medication_administrations" ON medication_administrations
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon medication_administrations" ON medication_administrations
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- INVENTORY
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Clinical roles can view inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Admins can manage inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Deny anon inventory_items" ON inventory_items;

CREATE POLICY "Clinical roles can view inventory_items" ON inventory_items
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Admins can manage inventory_items" ON inventory_items
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon inventory_items" ON inventory_items
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

DROP POLICY IF EXISTS "Clinical roles can view stock_lots" ON stock_lots;
DROP POLICY IF EXISTS "Admins can manage stock_lots" ON stock_lots;
DROP POLICY IF EXISTS "Deny anon stock_lots" ON stock_lots;

CREATE POLICY "Clinical roles can view stock_lots" ON stock_lots
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Admins can manage stock_lots" ON stock_lots
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon stock_lots" ON stock_lots
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

DROP POLICY IF EXISTS "Clinical roles can view stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Staff can insert stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Admins can manage stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Deny anon stock_movements" ON stock_movements;

CREATE POLICY "Clinical roles can view stock_movements" ON stock_movements
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Staff can insert stock_movements" ON stock_movements
  FOR INSERT WITH CHECK (user_has_role('staff') OR user_has_role('nurse') OR user_has_role('superadmin'));

CREATE POLICY "Admins can manage stock_movements" ON stock_movements
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon stock_movements" ON stock_movements
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- HEALTH_CLEARANCES
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Patients can view own health_clearances" ON health_clearances;
DROP POLICY IF EXISTS "Clinical roles can view health_clearances" ON health_clearances;
DROP POLICY IF EXISTS "Staff and admins can manage health_clearances" ON health_clearances;
DROP POLICY IF EXISTS "Deny anon health_clearances" ON health_clearances;

CREATE POLICY "Patients can view own health_clearances" ON health_clearances
  FOR SELECT USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clinical roles can view health_clearances" ON health_clearances
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Staff and admins can manage health_clearances" ON health_clearances
  FOR ALL USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Deny anon health_clearances" ON health_clearances
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- CERTIFICATES
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Patients can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Clinical roles can view certificates" ON certificates;
DROP POLICY IF EXISTS "Doctors and dentists can create certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can manage all certificates" ON certificates;
DROP POLICY IF EXISTS "Deny anon certificates" ON certificates;

CREATE POLICY "Patients can view own certificates" ON certificates
  FOR SELECT USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clinical roles can view certificates" ON certificates
  FOR SELECT USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR
    user_has_role('staff') OR user_has_role('doctor') OR user_has_role('dentist')
  );

CREATE POLICY "Doctors and dentists can create certificates" ON certificates
  FOR INSERT WITH CHECK (
    user_has_role('doctor') OR user_has_role('dentist') OR user_has_role('superadmin')
  );

CREATE POLICY "Admins can manage all certificates" ON certificates
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon certificates" ON certificates
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Deny anon notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Deny anon notifications" ON notifications
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- BREAK_GLASS_AUDIT_LOGS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can view break-glass logs" ON break_glass_audit_logs;
DROP POLICY IF EXISTS "Clinical roles can create break-glass logs" ON break_glass_audit_logs;
DROP POLICY IF EXISTS "No updates on break-glass logs" ON break_glass_audit_logs;
DROP POLICY IF EXISTS "No deletes on break-glass logs" ON break_glass_audit_logs;
DROP POLICY IF EXISTS "Deny anon break_glass_logs" ON break_glass_audit_logs;

CREATE POLICY "Admins can view break-glass logs" ON break_glass_audit_logs
  FOR SELECT USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Clinical roles can create break-glass logs" ON break_glass_audit_logs
  FOR INSERT WITH CHECK (
    provider_id = auth.uid() AND (
      user_has_role('doctor') OR user_has_role('dentist') OR
      user_has_role('nurse') OR user_has_role('superadmin')
    )
  );

CREATE POLICY "No updates on break-glass logs" ON break_glass_audit_logs
  FOR UPDATE USING (false);

CREATE POLICY "No deletes on break-glass logs" ON break_glass_audit_logs
  FOR DELETE USING (false);

CREATE POLICY "Deny anon break_glass_logs" ON break_glass_audit_logs
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- SYSTEM_LIBRARIES
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Authenticated can view active system_libraries" ON system_libraries;
DROP POLICY IF EXISTS "Admins can view all system_libraries" ON system_libraries;
DROP POLICY IF EXISTS "Admins can manage system_libraries" ON system_libraries;
DROP POLICY IF EXISTS "Deny anon system_libraries" ON system_libraries;

CREATE POLICY "Authenticated can view active system_libraries" ON system_libraries
  FOR SELECT USING (auth.role() = 'authenticated' AND (is_active = true OR user_has_role('superadmin')));

CREATE POLICY "Admins can manage system_libraries" ON system_libraries
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon system_libraries" ON system_libraries
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

DROP POLICY IF EXISTS "Authenticated can view active system_library_items" ON system_library_items;
DROP POLICY IF EXISTS "Admins can manage system_library_items" ON system_library_items;
DROP POLICY IF EXISTS "Deny anon system_library_items" ON system_library_items;

CREATE POLICY "Authenticated can view active system_library_items" ON system_library_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage system_library_items" ON system_library_items
  FOR ALL USING (user_has_role('superadmin') OR user_has_role('nurse'));

CREATE POLICY "Deny anon system_library_items" ON system_library_items
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- ══════════════════════════════════════════════════════════════════
-- APPOINTMENTS
-- ══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Only superadmin can delete appointments" ON appointments;
DROP POLICY IF EXISTS "Deny anon appointments" ON appointments;

CREATE POLICY "Patients can view own appointments" ON appointments
  FOR SELECT USING (patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage appointments" ON appointments
  FOR ALL USING (
    user_has_role('superadmin') OR user_has_role('nurse') OR user_has_role('staff')
  );

CREATE POLICY "Only superadmin can delete appointments" ON appointments
  FOR DELETE USING (user_has_role('superadmin'));

CREATE POLICY "Deny anon appointments" ON appointments
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);
