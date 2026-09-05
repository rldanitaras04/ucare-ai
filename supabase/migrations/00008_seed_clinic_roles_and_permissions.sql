-- =============================================================================
-- Migration 00008: Seed Clinic Roles and Permissions
-- =============================================================================
-- Adds granular clinic-operation roles and maps them to fine-grained
-- permissions for walk-ins, queue, triage, staff duty, clinical, dental,
-- prescriptions, and clearances.
-- =============================================================================

-- ─── Clinic Roles ──────────────────────────────────────────────────────────
INSERT INTO roles (name, description) VALUES
  ('clinic_admin',   'Clinic operational administrator'),
  ('nurse',          'Primary triage and nursing care provider'),
  ('clinic_staff',   'Front-desk and fallback triage personnel'),
  ('doctor',         'Physician consultation and medical EMR'),
  ('dentist',        'Dental examination, procedures, and odontogram'),
  ('patient',        'Student/Faculty/Staff personal portal')
ON CONFLICT (name) DO NOTHING;

-- ─── Clinic Permissions ────────────────────────────────────────────────────
-- resource.action naming convention  (resource is the noun, action is the verb)
INSERT INTO permissions (name, description, resource, action) VALUES
  -- Walk-ins
  ('walk_ins.view',   'View walk-in records',       'walk_ins',   'view'),
  ('walk_ins.create', 'Register a walk-in patient',  'walk_ins',   'create'),
  ('walk_ins.update', 'Update walk-in status',       'walk_ins',   'update'),

  -- Queue
  ('queue.view',   'View the patient queue',          'queue',      'view'),
  ('queue.manage', 'Manage queue ordering & priority', 'queue',     'manage'),
  ('queue.call',   'Call next patient from queue',     'queue',     'call'),

  -- Triage
  ('triage.create',          'Record triage assessment',    'triage',  'create'),
  ('triage.view',            'View triage records',         'triage',  'view'),
  ('triage.fallback_override','Override triage assignment',  'triage',  'fallback_override'),

  -- Staff Duty
  ('staff_duty.view',   'View staff availability',        'staff_duty', 'view'),
  ('staff_duty.manage', 'Manage staff duty schedules',    'staff_duty', 'manage'),

  -- Clinical (medical consultations)
  ('clinical.view',   'View clinical / EMR records',     'clinical', 'view'),
  ('clinical.create', 'Create clinical notes & orders',  'clinical', 'create'),

  -- Dental
  ('dental.view',   'View dental records & odontogram',  'dental',  'view'),
  ('dental.create', 'Create dental chart & procedures',  'dental',  'create'),

  -- Prescriptions
  ('prescriptions.create', 'Issue prescriptions',         'prescriptions', 'create'),
  ('prescriptions.view',   'View prescriptions',          'prescriptions', 'view'),

  -- Clearances
  ('clearances.create', 'Create clearance requests',     'clearances', 'create'),
  ('clearances.view',   'View clearance status',         'clearances', 'view'),
  ('clearances.approve','Approve / sign clearances',     'clearances', 'approve')

ON CONFLICT (name) DO NOTHING;

-- ─── Role → Permission Mapping ─────────────────────────────────────────────
-- Helper CTEs to resolve role / permission UUIDs so the mapping INSERT is
-- deterministic regardless of auto-generated UUIDs.

WITH
  -- Resolve role IDs
  r AS (
    SELECT id, name FROM roles WHERE name IN (
      'clinic_admin', 'nurse', 'clinic_staff', 'doctor', 'dentist', 'patient'
    )
  ),
  -- Resolve permission IDs
  p AS (
    SELECT id, name FROM permissions WHERE name IN (
      'walk_ins.view', 'walk_ins.create', 'walk_ins.update',
      'queue.view', 'queue.manage', 'queue.call',
      'triage.create', 'triage.view', 'triage.fallback_override',
      'staff_duty.view', 'staff_duty.manage',
      'clinical.view', 'clinical.create',
      'dental.view', 'dental.create',
      'prescriptions.create', 'prescriptions.view',
      'clearances.create', 'clearances.view', 'clearances.approve'
    )
  )

-- clinic_admin  →  all clinic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM r CROSS JOIN p
WHERE r.name = 'clinic_admin'
ON CONFLICT DO NOTHING;

WITH
  r AS (SELECT id FROM roles WHERE name = 'nurse'),
  p AS (
    SELECT id FROM permissions WHERE name IN (
      'triage.create', 'triage.view',
      'walk_ins.view', 'walk_ins.update',
      'queue.view',
      'clinical.view', 'clinical.create',
      'prescriptions.view',
      'clearances.view', 'clearances.create',
      'staff_duty.view'
    )
  )
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM r CROSS JOIN p
ON CONFLICT DO NOTHING;

WITH
  r AS (SELECT id FROM roles WHERE name = 'clinic_staff'),
  p AS (
    SELECT id FROM permissions WHERE name IN (
      'walk_ins.view', 'walk_ins.create', 'walk_ins.update',
      'queue.view', 'queue.manage', 'queue.call',
      'triage.create', 'triage.view', 'triage.fallback_override',
      'staff_duty.view',
      'clearances.view'
    )
  )
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM r CROSS JOIN p
ON CONFLICT DO NOTHING;

WITH
  r AS (SELECT id FROM roles WHERE name = 'doctor'),
  p AS (
    SELECT id FROM permissions WHERE name IN (
      'walk_ins.view',
      'queue.view',
      'triage.view',
      'clinical.view', 'clinical.create',
      'prescriptions.create', 'prescriptions.view',
      'clearances.view', 'clearances.approve'
    )
  )
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM r CROSS JOIN p
ON CONFLICT DO NOTHING;

WITH
  r AS (SELECT id FROM roles WHERE name = 'dentist'),
  p AS (
    SELECT id FROM permissions WHERE name IN (
      'walk_ins.view',
      'queue.view',
      'dental.view', 'dental.create',
      'prescriptions.create', 'prescriptions.view',
      'clearances.view', 'clearances.approve'
    )
  )
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM r CROSS JOIN p
ON CONFLICT DO NOTHING;

WITH
  r AS (SELECT id FROM roles WHERE name = 'patient'),
  p AS (
    SELECT id FROM permissions WHERE name IN (
      'walk_ins.view',
      'queue.view',
      'triage.view',
      'clearances.create', 'clearances.view'
    )
  )
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM r CROSS JOIN p
ON CONFLICT DO NOTHING;
