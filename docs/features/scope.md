# RECOMMENDED SYSTEM FEATURES AND SCOPE OF WORK

## University Integrated Medical & Dental Health Information System

### 1. Project Overview

The proposed **University Integrated Medical & Dental Health Information System** is a secure, mobile-first Web Application designed to digitize and integrate the university clinic's medical, dental, nursing, walk-in, triage, provider coordination, inventory, health clearance, and administrative operations.

The system shall follow a **walk-in-first clinic model**. Patients shall not book appointments through the system during the initial implementation. Instead, patients will register and be served based on their arrival, triage priority, queue position, and the actual availability of clinic personnel and visiting healthcare providers.

The system shall also accommodate the clinic's actual staffing arrangement:

* **1 Doctor** – available monthly and/or on a case-by-case basis
* **1 Dentist** – available according to scheduled or occasional clinic sessions
* **1 Nurse** – normally stationed at the clinic but may be unavailable due to leave, seminars, trainings, official activities, or other authorized reasons
* **1 Clinic Staff** – normally stationed at the clinic and responsible for front-desk and operational functions
* When the Nurse is unavailable, the **Clinic Staff is authorized to perform designated fallback triage functions**, subject to institutional policy and defined system permissions.

The system shall distinguish between:

1. **Patient Walk-In and Queue Management**
2. **Staff Duty Availability**
3. **Healthcare Provider Sessions/Availability**
4. **Provider Requests/Case Coordination**

These concepts shall not be merged into a conventional appointment system.

---

# 2. General Objectives

The system shall:

1. Digitize clinic registration and walk-in services.
2. Maintain a centralized patient health information repository.
3. Support medical, nursing, and dental documentation.
4. Provide structured triage and queue management.
5. Support Nurse-led management of minor/common illnesses within authorized clinic protocols.
6. Support fallback triage by Clinic Staff when the Nurse is unavailable.
7. Track actual availability of the Nurse and Clinic Staff.
8. Manage periodic and case-based Doctor and Dentist clinic sessions.
9. Facilitate coordination with visiting healthcare providers.
10. Manage prescriptions, medication administration, dispensing, and clinic inventory.
11. Generate health certificates and clearances.
12. Support dental records including an odontogram and treatment history.
13. Provide secure patient access to appropriate personal health information.
14. Provide administrative and management dashboards.
15. Maintain comprehensive audit trails.
16. Implement role-based access control and least-privilege security.
17. Protect sensitive health information in accordance with applicable Philippine data protection requirements and university policies.
18. Provide a scalable foundation for future integration and AI-assisted decision support without allowing AI to replace professional clinical judgment.

---

# 3. Scope of Work

The development scope shall cover the following major work packages:

### 3.1 Requirements Analysis and Business Process Modeling

The development team shall:

* Conduct clinic workflow analysis.
* Document existing medical and dental clinic processes.
* Identify user roles and responsibilities.
* Map walk-in workflows.
* Map triage workflows.
* Map provider availability workflows.
* Map provider request and coordination workflows.
* Define nursing and fallback triage workflows.
* Identify required forms and reports.
* Define data ownership and access requirements.
* Define privacy and security requirements.
* Develop functional and non-functional requirements.
* Produce use-case and process-flow documentation.

---

# 4. Recommended System Modules

The system shall consist of the following major modules:

1. Identity and Access Management
2. Patient Management
3. Walk-In Registration
4. Staff Availability and Duty Management
5. Provider Availability and Session Management
6. Provider Request and Case Coordination
7. Triage Management
8. Queue Management
9. Medical Electronic Medical Record
10. Nursing Clinical Management
11. Dental Electronic Health Record
12. Prescription and Medication Management
13. Inventory and Supplies Management
14. Health Clearance Management
15. Documents and Certificates
16. Patient Portal
17. Notifications
18. Reports and Analytics
19. Privacy, Security and Audit Management
20. System Administration

---

# 5. Identity and Access Management

The system shall implement secure authentication and granular role-based authorization.

### Recommended roles

* Super Administrator
* System Administrator
* Clinic Administrator
* Nurse
* Clinic Staff
* Doctor
* Dentist
* Patient

The system shall support users having **multiple roles simultaneously**.

For example, the Nurse may have:

* Nurse role
* Clinic Administrator role
* System Administrator role

However, administrative privileges shall not automatically grant unrestricted access to clinical records.

### Features

* Secure login
* University account integration where available
* Multi-role user accounts
* Role assignment
* Permission management
* Account activation/deactivation
* Password/security management
* Session management
* Login history
* Failed-login monitoring
* Optional multi-factor authentication
* Least-privilege access control

---

# 6. Patient Management

The system shall maintain a centralized patient profile for students, faculty, staff, and other authorized university constituents.

### Patient information

* University ID
* Student/employee number
* Full name
* Sex
* Date of birth
* Contact information
* Address
* University affiliation
* Department/college/unit
* Emergency contact
* Relevant health alerts
* Allergies
* Existing conditions
* Medication history
* Medical history
* Dental history
* Previous clinic visits
* Documents
* Health clearances

### Features

* Patient registration
* Patient search
* Patient verification
* Duplicate detection
* Patient profile updates
* Emergency information
* Health history
* Record timeline
* Document attachment
* Patient status

---

# 7. Walk-In Registration

The clinic shall operate primarily through a **walk-in model**.

### Important scope exclusion

The initial system shall **NOT include patient appointment booking**.

The following shall not be implemented in the MVP:

* Patient appointment slots
* Appointment booking
* Appointment requests
* Appointment confirmation
* Appointment cancellation
* Appointment rescheduling
* Appointment reminders

### Walk-in workflow

```text
Patient Arrives
       ↓
Patient Verification
       ↓
Walk-In Registration
       ↓
Service Selection
       ↓
Triage
       ↓
Queue
       ↓
Available Healthcare Provider
       ↓
Consultation
       ↓
Treatment / Medication / Referral
       ↓
Completion
```

### Walk-in information

* Patient
* Date/time
* Service requested
* Reason for visit
* Medical/Dental/Nursing
* Arrival status
* Triage status
* Queue number
* Priority
* Assigned provider
* Encounter
* Disposition

---

# 8. Staff Availability and Duty Management

The system shall distinguish **clinic staff availability** from provider availability.

### Staff covered

* Nurse
* Clinic Staff

### Staff status

* Available
* Unavailable
* Seminar
* Training
* Official Activity
* Off-Campus Duty
* On Leave
* Sick/Other Authorized Absence
* Temporary Unavailability

### Features

* Daily staff availability
* Duty status
* Leave/absence recording
* Official activity recording
* Seminar/training status
* Start/end date and time
* Reason
* Authorized by
* Availability history
* Audit trail

### Operational logic

If:

**Nurse = Available**

→ Nurse performs primary triage.

If:

**Nurse = Unavailable + Clinic Staff = Available**

→ Clinic Staff may perform authorized fallback triage.

If:

**Nurse = Unavailable + Clinic Staff = Unavailable**

→ System shall indicate that no authorized clinic personnel are currently available for normal walk-in/triage operations.

---

# 9. Provider Availability and Session Management

The system shall not use conventional patient appointments for Doctors and Dentists.

Instead, the system shall manage **Provider Sessions**.

A Provider Session represents a period when a healthcare provider is physically available at the clinic.

### Provider types

* Doctor
* Dentist

### Session types

* Monthly Visit
* Case-Based Visit
* Special Session
* Emergency Session
* Other Authorized Session

### Session status

* Planned
* Confirmed
* Active
* Completed
* Cancelled

### Provider availability

The system shall support:

* Regular availability
* One-time sessions
* Monthly visits
* Case-based visits
* Modified schedules
* Unavailability
* Leave
* Official activities
* Blocked time

Example:

> Doctor – September 15, 2026 – 8:00 AM–12:00 PM – Monthly Visit – Confirmed

Patients do not reserve this time.

Instead, eligible walk-in patients are served while the provider is physically available.

---

# 10. Provider Request and Case Coordination

Because Doctors and Dentists may only visit periodically or on a case-by-case basis, the system shall provide a **Provider Request** mechanism.

### Example workflow

```text
Patient Walk-In
       ↓
Nurse/Clinic Staff Assessment
       ↓
Doctor/Dentist Required
       ↓
Provider Request
       ↓
Provider Coordination
       ↓
Provider Confirms
       ↓
Provider Session Created
       ↓
Provider Visits Clinic
       ↓
Patient Consultation
```

### Provider request information

* Patient
* Requested provider
* Provider type
* Reason
* Urgency
* Requested by
* Date requested
* Preferred/required session date
* Provider response
* Status
* Resolution
* Notes
* Audit history

### Status

* Pending
* For Coordination
* Provider Contacted
* Provider Confirmed
* Provider Declined
* Provider Session Created
* Served
* Cancelled
* Closed

---

# 11. Triage Management

Triage shall be a major component of the system.

### Primary triage provider

**Nurse**

### Fallback triage provider

**Clinic Staff when the Nurse is unavailable.**

The system shall not permanently assign unrestricted nursing privileges to Clinic Staff.

Instead, fallback triage shall be activated based on the recorded Nurse availability status.

### Triage information

* Chief complaint
* Symptoms
* Duration
* Pain score
* Vital signs
* Temperature
* Blood pressure
* Pulse rate
* Respiratory rate
* Oxygen saturation where available
* Relevant history
* Allergies
* Current medications
* Initial observations
* Red flags
* Priority
* Triage disposition
* Triage provider
* Fallback indicator
* Reason for fallback

### Queue priorities

* Emergency
* Urgent
* Priority
* Normal

Clinical prioritization should primarily be performed by the Nurse or authorized clinical personnel.

---

# 12. Nursing Clinical Management

The system shall provide a dedicated nursing workspace.

### Features

* Nursing assessment
* Vital signs
* Triage
* Nursing notes
* Minor illness management
* First aid documentation
* Medication administration
* Nursing interventions
* Patient education
* Referral
* Follow-up
* Provider coordination

---

# 13. Minor Illness and Nursing Medication Management

The system shall support Nurse management of **simple/common illnesses within the clinic's approved scope, protocols, formulary, and applicable professional/institutional requirements**.

Examples may include:

* Headache
* Mild stomach ache
* Mild fever
* Minor body pain
* Simple cough/colds
* Minor allergies
* Minor wounds
* Other conditions covered by approved clinic protocols

### Important design principle

The system shall distinguish:

**Nursing Medication Order/Intervention**

from

**Medical Prescription**

The Nurse shall only be able to select medications/interventions that are authorized by the clinic's approved protocol/formulary and applicable policy.

### Nursing Protocol module

Each protocol may contain:

* Protocol name
* Indication
* Symptoms/criteria
* Required assessment
* Authorized intervention
* Authorized medications
* Dosage rules
* Contraindications
* Allergy warnings
* Red flags
* Referral criteria
* Follow-up requirements
* Effective date
* Expiration/review date
* Approving authority
* Protocol version
* Active/inactive status

The system shall provide decision support based on configured protocols but shall **not independently diagnose patients**.

---

# 14. Medical Electronic Medical Record

The Doctor shall have access to a structured medical EMR.

### Features

* Medical history
* SOAP notes
* Clinical assessment
* Diagnosis
* Treatment
* Prescription
* Medical certificate
* Referral
* Follow-up
* Laboratory/external results
* Attachments
* Encounter history

### Medical encounter lifecycle

```text
Open
 ↓
Assessment
 ↓
Diagnosis
 ↓
Treatment
 ↓
Prescription/Referral
 ↓
Follow-Up
 ↓
Completed
```

---

# 15. Dental Electronic Health Record

The Dentist shall have a dedicated dental workspace.

### Features

* Dental history
* Dental examination
* Odontogram
* Tooth-specific findings
* Surface-specific findings
* Dental diagnosis
* Dental procedures
* Treatment plans
* Dental prescription
* Dental certificate
* Referral
* Follow-up

### Tooth surfaces

Where applicable:

* Mesial
* Distal
* Occlusal
* Buccal
* Lingual

### Procedures

Examples:

* Oral examination
* Cleaning
* Filling
* Extraction
* Restoration
* Root canal
* Preventive treatment
* Orthodontic monitoring
* Referral

---

# 16. Prescription and Medication Management

The system shall support electronic medication documentation.

### Medical prescriptions

Created by authorized Doctors.

### Dental prescriptions

Created by authorized Dentists within applicable scope.

### Nursing medication orders/interventions

Created by authorized Nurses according to approved clinic protocols.

### Prescription lifecycle

```text
Draft
 ↓
Signed
 ↓
Issued
 ↓
Dispensed
 ↓
Completed
```

### Information

* Prescription number
* Patient
* Encounter
* Prescriber
* Medication
* Strength
* Dose
* Route
* Frequency
* Duration
* Quantity
* Instructions
* Date issued
* Status
* Signature

Signed prescriptions shall not simply be overwritten. Corrections shall preserve the original record and create an auditable amendment/version.

---

# 17. Medication Administration

The system shall support documentation of medication actually administered at the clinic.

### Information

* Patient
* Medication
* Dose
* Route
* Date/time
* Administered by
* Related encounter
* Source inventory
* Batch/lot
* Remarks
* Adverse reaction, if any

---

# 18. Inventory and Supplies Management

The system shall manage medicines, medical supplies, dental supplies, and other clinic resources.

### Features

* Item master
* Category
* Unit
* Supplier
* Stock quantity
* Batch number
* Expiration date
* Acquisition date
* Cost
* Stock-in
* Stock-out
* Dispensing
* Adjustments
* Returns
* Expiry monitoring
* Low-stock alerts

### Inventory principle

The system should support **FEFO (First Expiry, First Out)** where appropriate.

### Traceability

Medication dispensing should be traceable:

```text
Prescription
      ↓
Dispensing
      ↓
Stock Lot
      ↓
Inventory Deduction
```

---

# 19. Health Clearance Management

The system shall support institutional health clearances.

### Clearance types

* Admission
* Annual
* Internship/OJT
* Sports
* Graduation
* Employee
* Other institutional requirements

### Features

* Clearance request/processing
* Clinical assessment
* Requirements checklist
* Approval
* Digital certificate
* Verification number
* Expiration/validity
* Audit trail
* Printing/PDF

---

# 20. Certificates and Documents

The system shall generate official clinic documents.

### Examples

* Medical Certificate
* Dental Certificate
* Health Clearance
* Referral Letter
* Treatment Summary
* Prescription
* Other approved clinic documents

### Features

* Unique document number
* Template management
* Digital signature where approved
* PDF generation
* Verification code/QR
* Document status
* Versioning
* Audit trail

A public certificate verification page should expose only the minimum information necessary to verify authenticity and should not expose diagnosis or other sensitive health information.

---

# 21. Patient Portal

Patients shall have access to a secure personal portal.

### Features

* Personal profile
* Emergency contact
* Health information
* Walk-in history
* Visit history
* Prescriptions
* Certificates
* Health clearances
* Treatment history
* Dental history as permitted
* Uploaded documents
* Notifications
* Privacy information

The patient shall only be able to access records belonging to their own account.

---

# 22. Notifications

The system may support:

* Provider session announcements
* Provider request status
* Clearance status
* Prescription availability
* Document availability
* System announcements
* Inventory alerts for authorized personnel
* Administrative notifications

Notifications shall not expose sensitive medical information unnecessarily.

---

# 23. Dashboard and Analytics

The system shall provide role-specific dashboards.

### Clinic dashboard

* Today's walk-ins
* Current queue
* Patients served
* Waiting patients
* Triage statistics
* Available staff
* Unavailable staff
* Current provider session
* Upcoming provider sessions
* Pending provider requests
* Inventory alerts
* Clearance statistics

### Management dashboard

* Patient volume
* Medical vs dental visits
* Common visit reasons
* Service utilization
* Monthly trends
* Provider utilization
* Medicine consumption
* Inventory trends
* Clearance statistics
* Staff availability
* Provider session history

Clinical analytics should use appropriate access controls and, where possible, aggregated/de-identified information.

---

# 24. Security and Privacy

Because the system processes health information, security shall be a core requirement.

### Required controls

* Role-Based Access Control
* Least-privilege authorization
* Database Row-Level Security
* Secure authentication
* Session security
* Encryption in transit
* Secure storage
* Private document storage
* Access-controlled file URLs
* Audit logging
* Security event logging
* Data backup
* Recovery procedures
* Account deactivation
* Password/security policies
* Sensitive data minimization
* Export restrictions

The system shall be designed with the **Philippine Data Privacy Act of 2012 (RA 10173), applicable National Privacy Commission requirements, and university policies** as primary privacy/security considerations.

---

# 25. Clinical Record Access Control

Clinical permissions shall be separated from administrative permissions.

### Example

A Clinic Staff member may:

* Register patients
* Manage walk-ins
* View queue
* Coordinate provider sessions
* Process documents

But should not automatically be able to:

* View unrestricted medical history
* Edit SOAP notes
* Create medical diagnoses
* View unrestricted dental records
* Modify prescriptions

Similarly, a System Administrator may manage:

* Users
* Roles
* Permissions
* System configuration
* Security settings

without automatically receiving unrestricted access to clinical records.

---

# 26. Break-Glass Emergency Access

The system should support controlled emergency access.

When authorized personnel need access to restricted information during an emergency:

1. User selects Break-Glass.
2. User provides a reason.
3. System grants temporary authorized access.
4. The access is prominently logged.
5. The event is flagged for review.

This prevents emergency access from becoming unrestricted permanent access.

---

# 27. Audit Trail

The system shall maintain comprehensive audit records.

Audit logs should capture:

* User
* Role
* Date/time
* Action
* Resource
* Record ID
* IP address where appropriate
* Device/session information where appropriate
* Previous value
* New value
* Reason
* Result
* Access type

The system should log not only modifications but also sensitive **record views**, exports, downloads, prescription changes, certificate generation, permission changes, and bulk operations.

---

# 28. Progressive Web Application

The system shall be implemented as a responsive web application/PWA.

### PWA features

* Responsive design
* Desktop support
* Tablet support
* Mobile support
* Installable application
* App shell caching
* Network status indication
* Fast loading
* Push notifications where supported

### Important security restriction

Sensitive medical records shall **not be cached for offline access by default**.

Offline capability should be limited to non-sensitive application resources unless a formal security/privacy assessment approves otherwise.

---

# 29. Recommended Technology Stack

### Frontend

**Next.js**

* App Router
* TypeScript
* Responsive UI
* PWA support
* Server/client component architecture

### Backend

**Supabase**

* PostgreSQL
* Supabase Auth
* Row-Level Security
* Storage
* Realtime where appropriate
* Edge/server-side functions where appropriate

### Hosting

**Vercel**

* Production deployment
* Preview deployments
* Environment variables
* Monitoring
* Scheduled jobs where appropriate

### Source Control

**GitHub**

* Repository
* Branching strategy
* Pull requests
* Code review
* Issue tracking
* CI/CD integration

### Development Environment

**Antigravity IDE + OpenCode**

AI-assisted development shall be governed by documented architecture, coding standards, security rules, database migration procedures, and review requirements.

---

# 30. Recommended Database Domains

The PostgreSQL database should be organized logically into the following domains:

### Identity

* users
* persons
* university_profiles
* roles
* permissions
* user_roles
* role_permissions

### Patient

* patient_profiles
* emergency_contacts
* allergies
* medical_history
* dental_history

### Clinic Operations

* walk_in_visits
* clinic_services
* staff_availability
* staff_absences
* queue_entries
* queue_status_history

### Provider Coordination

* providers
* provider_schedules
* provider_schedule_exceptions
* provider_sessions
* provider_requests

### Clinical

* encounters
* vitals
* nursing_assessments
* diagnoses
* treatments
* medications
* prescriptions
* medication_administrations
* referrals
* follow_ups

### Dental

* dental_encounters
* odontograms
* tooth_findings
* dental_procedures
* dental_treatment_plans

### Inventory

* inventory_items
* suppliers
* stock_lots
* stock_movements
* dispensing

### Documents

* certificates
* health_clearances
* attachments
* document_templates
* document_verifications

### Security

* audit_logs
* access_logs
* security_events
* break_glass_events

### Notifications

* notification_templates
* notifications
* notification_logs

---

# 31. Core System Workflow

The primary operational workflow shall be:

```text
                 PATIENT ARRIVES
                       │
                       ▼
               PATIENT VERIFICATION
                       │
                       ▼
                WALK-IN REGISTRATION
                       │
                       ▼
                     TRIAGE
                       │
             ┌─────────┴─────────┐
             │                   │
       Nurse Available      Nurse Unavailable
             │                   │
             ▼                   ▼
       Nurse Triage       Clinic Staff Fallback
             │                   │
             └─────────┬─────────┘
                       ▼
                 PRIORITIZATION
                       │
                       ▼
                    QUEUE
                       │
              ┌────────┴────────┐
              │                 │
        Provider Available   Provider Absent
              │                 │
              ▼                 ▼
         Consultation      Provider Request
              │                 │
              │           Provider Coordination
              │                 │
              │          Provider Session
              │                 │
              └────────┬────────┘
                       ▼
                 CLINICAL ENCOUNTER
                       │
          ┌────────────┼────────────┐
          │            │            │
       Treatment    Medication    Referral
          │            │            │
          └────────────┼────────────┘
                       ▼
                 DOCUMENTATION
                       │
                       ▼
              DISCHARGE / FOLLOW-UP
```

---

# 32. Role-Based Operational Model

### Super Administrator

Responsible for:

* Institutional governance
* Global configuration
* Role/permission governance
* Security policies
* System-wide configuration
* Data governance

Clinical access shall be separately granted when required.

### System Administrator

Responsible for:

* User accounts
* Roles
* Permissions
* Authentication
* Integrations
* System configuration
* Security
* Technical monitoring
* Audit/security logs

### Clinic Administrator

Responsible for:

* Clinic operations
* Walk-in operations
* Queue
* Staff availability
* Provider sessions
* Provider requests
* Inventory
* Clearances
* Reports

### Nurse

Responsible for:

* Triage
* Nursing assessment
* Vital signs
* Nursing documentation
* Minor illness management within authorized scope
* Authorized nursing medication management
* Patient education
* Referral
* Provider coordination
* Queue management
* Clinic operations

### Clinic Staff

Responsible for:

* Patient registration
* Walk-in processing
* Front desk
* Queue operations
* Provider coordination
* Provider session management as authorized
* Inventory administration
* Clearance processing
* **Fallback triage when Nurse is unavailable**

### Doctor

Responsible for:

* Medical consultation
* Medical assessment
* Diagnosis
* Medical treatment
* Medical prescriptions
* Medical certificates
* Referrals
* Follow-up

### Dentist

Responsible for:

* Dental examination
* Dental diagnosis
* Dental procedures
* Odontogram
* Dental treatment planning
* Dental prescriptions
* Dental certificates
* Referrals
* Follow-up

### Patient

Responsible for:

* Maintaining personal information
* Viewing authorized health records
* Viewing prescriptions/certificates
* Viewing visit history
* Submitting permitted information/documents

---

# 33. Functional Requirements Summary

The completed system shall be capable of:

| Functional Area              |               Required |
| ---------------------------- | ---------------------: |
| User authentication          |                      ✓ |
| Multi-role RBAC              |                      ✓ |
| Patient management           |                      ✓ |
| Patient portal               |                      ✓ |
| Walk-in registration         |                      ✓ |
| Patient appointment booking  | **NO – MVP exclusion** |
| Queue management             |                      ✓ |
| Nurse triage                 |                      ✓ |
| Clinic Staff fallback triage |                      ✓ |
| Staff availability           |                      ✓ |
| Doctor availability          |                      ✓ |
| Dentist availability         |                      ✓ |
| Provider sessions            |                      ✓ |
| Provider requests            |                      ✓ |
| Medical EMR                  |                      ✓ |
| Nursing records              |                      ✓ |
| Dental EMR                   |                      ✓ |
| Odontogram                   |                      ✓ |
| Prescriptions                |                      ✓ |
| Nursing medication protocols |                      ✓ |
| Medication administration    |                      ✓ |
| Inventory                    |                      ✓ |
| Health clearance             |                      ✓ |
| Certificates                 |                      ✓ |
| Referrals                    |                      ✓ |
| Follow-up                    |                      ✓ |
| Notifications                |                      ✓ |
| Reports                      |                      ✓ |
| Analytics                    |                      ✓ |
| Audit trail                  |                      ✓ |
| Privacy management           |                      ✓ |
| Break-glass access           |            Recommended |
| PWA                          |                      ✓ |
| Offline clinical records     |      **NO by default** |
| AI clinical diagnosis        |                 **NO** |
| AI decision support          |      Future/controlled |

---

# 34. Non-Functional Requirements

### Security

* Strong authentication
* RBAC
* RLS
* Encryption
* Audit logging
* Secure storage
* Secure file handling

### Performance

* Fast page loads
* Efficient database queries
* Pagination
* Indexing
* Optimized dashboards
* Appropriate caching for non-sensitive data

### Reliability

* Automated backups
* Error handling
* Transaction integrity
* Recovery procedures
* Monitoring
* Logging

### Usability

* Simple clinic workflow
* Minimal data entry
* Responsive interface
* Clear queue status
* Large readable queue displays
* Accessible forms
* Mobile-friendly design

### Scalability

The architecture should allow future integration of:

* Laboratory services
* Pharmacy
* Immunization
* Telehealth
* Appointment management
* External hospital referral
* University HR/student systems
* Laboratory information systems
* AI-assisted analytics

These shall not be required for the initial MVP unless specifically approved.

---

# 35. Implementation Phases

## Phase 1 – Foundation

* Project setup
* Next.js
* Supabase
* Authentication
* Database
* RBAC
* RLS
* Base UI
* Audit framework

## Phase 2 – Clinic Operations

* Patient management
* Walk-in registration
* Queue
* Staff availability
* Triage
* Fallback triage
* Provider availability
* Provider sessions
* Provider requests

## Phase 3 – Clinical System

* Nursing records
* Medical EMR
* Dental EMR
* Odontogram
* Diagnosis
* Treatment
* Referral
* Follow-up

## Phase 4 – Medication and Inventory

* Medication master
* Nursing protocols
* Prescriptions
* Medication administration
* Inventory
* Dispensing
* Expiration monitoring

## Phase 5 – Documents and Clearance

* Medical certificates
* Dental certificates
* Health clearance
* PDF generation
* Verification

## Phase 6 – Patient Portal

* Personal records
* Visit history
* Prescriptions
* Certificates
* Clearances
* Notifications

## Phase 7 – Analytics and Security

* Dashboards
* Reports
* Audit logs
* Security monitoring
* Data privacy features
* Break-glass access
* Backup/recovery

## Phase 8 – Testing and Deployment

* Unit testing
* Integration testing
* Security testing
* RLS testing
* User acceptance testing
* Performance testing
* Mobile/PWA testing
* Deployment to Vercel
* Production configuration
* Documentation
* User training

---

# 36. Key Design Principles

The system development shall follow these principles:

### 1. Walk-In First

Patients do not book appointments in the initial implementation.

### 2. Provider Availability ≠ Patient Appointment

Doctor/Dentist schedules represent their physical clinic sessions, not reserved patient appointments.

### 3. Nurse First, Clinic Staff Fallback

The Nurse is the primary triage provider. Clinic Staff may perform authorized fallback triage only when the Nurse is unavailable.

### 4. Administrative Authority ≠ Clinical Authority

System/clinic administration does not automatically provide unrestricted clinical access.

### 5. Least Privilege

Users receive only the permissions required for their responsibilities.

### 6. Protocol-Guided Nursing Care

Nursing medication management shall be constrained by approved protocols, formulary, professional requirements, and institutional policies.

### 7. Clinical Accountability

Every clinical action shall identify the person who performed it.

### 8. Auditability

Sensitive access and modifications shall be traceable.

### 9. Privacy by Design

Sensitive health information shall be protected throughout collection, processing, storage, transmission, and disposal.

### 10. Human-in-the-Loop

AI, if introduced later, shall support—not replace—qualified healthcare professionals.

---

# 37. Final Recommended System Scope

The **MVP** shall focus on:

**Patient Management + Walk-In + Triage + Queue + Staff Availability + Provider Sessions + Provider Coordination + Medical EMR + Nursing Management + Dental EMR + Prescriptions + Medication Management + Inventory + Health Clearance + Documents + Patient Portal + Security + Reports.**

The following shall explicitly remain **outside the MVP**:

* Patient appointment booking
* Appointment slots
* Appointment reminders
* Automated clinical diagnosis
* Autonomous AI treatment recommendations
* Fully offline medical records
* Unrestricted Nurse prescribing
* Unrestricted Clinic Staff clinical access

This scope produces a system that reflects the actual operational reality of the university clinic rather than forcing the clinic into a conventional hospital appointment model.
