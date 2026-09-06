# Security

## Overview

UCare AI follows a defense-in-depth security model with multiple layers of protection.

## Authentication Security

- Cookie-based sessions (not localStorage)
- httpOnly, Secure, SameSite cookies
- Session refresh on every request
- Automatic token rotation
- Auth code exchange with error handling
- Open redirect prevention on callback routes

## Authorization Security

### Layer 1: UI Visibility
- Menu items hidden based on permissions
- NOT a security boundary

### Layer 2: Route Protection
- Middleware validates authentication
- Redirects unauthenticated users
- Admin panel requires `admin`+ role via proxy

### Layer 3: Server Authorization
- Server-side role checks in all actions (defense-in-depth)
- Role-based access control enforced at action level
- Caller role validated from `user_metadata` (not client-provided)

### Layer 4: Database RLS
- Row Level Security on all tables
- Final security boundary
- Enforced at database level

## Role-Based Access Control

### 3-Layer Role System
1. **JWT metadata** (`user.user_metadata.role`) — checked in server actions
2. **`profiles.role`** — synced by `updateUserRole` (super_admin only)
3. **`user_roles` join table** — synced by `updateUserRole` (super_admin only)

### Role Hierarchy
| Level | Role | Permissions |
|-------|------|-------------|
| 0 | super_admin | Full access, manages roles and users |
| 1 | admin | Manages clinic operations |
| 2 | clinic_admin | Clinic-specific admin |
| 3 | nurse, doctor, dentist | Clinical operations |
| 4 | staff, clinic_staff | Support operations |
| 5 | user, patient | Read-only / patient portal |

### Action-Level Role Checks
All server actions enforce role-based authorization:

| Action | Required Role |
|--------|--------------|
| `updateUserRole` | super_admin |
| `createRole` | super_admin |
| `updateRole` | admin+ |
| `assignPermissionToRole` | super_admin |
| `createPrescription` | doctor, dentist, super_admin, admin |
| `createHealthClearance` | nurse, doctor, dentist, admin+ |
| `registerWalkIn` | staff+ |
| `saveTriageAssessment` | nurse, doctor, admin+ |
| `getOrCreateEncounter` | doctor, dentist, admin+ |
| `getOrCreateDentalEncounter` | dentist, super_admin, admin |
| `updatePatientProfile` | staff+ |
| `callPatient` | staff+ |
| `recordDutyStatus` | admin+ |
| `createProviderSession` | admin+ |
| `getAuditLogs` | admin+ |

## Input Validation

### API Routes
- `/api/carina`: Runtime validation of message format (role, content)
- Message count limit (max 50 per request)
- Rate limiting: 20 requests per minute per user

### Server Actions
- Field allowlisting on profile updates
- Role validation against database
- Self-role-change prevention

## Rate Limiting

- In-memory sliding window rate limiter
- Carina API: 20 requests/minute per user
- Returns `429 Too Many Requests` with retry headers

## Environment Variables

### Public (Browser)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Private (Server Only)
- `SUPABASE_SERVICE_ROLE_KEY` - NEVER expose to browser
- `GROQ_API_KEY` - AI service key

## Security Practices

1. **Input Validation**: Validate all user input at boundaries (runtime + TypeScript)
2. **Output Encoding**: Prevent XSS attacks
3. **Parameterized Queries**: Prevent SQL injection (handled by Supabase)
4. **CSRF Protection**: Cookie-based sessions with SameSite
5. **Rate Limiting**: Per-user rate limiting on AI endpoints
6. **Error Handling**: Never expose internal errors to users
7. **Secrets Management**: Never commit secrets to repository
8. **Authorization Checks**: Server-side role validation on all mutations
9. **Open Redirect Prevention**: Callback URLs validated against origin

## RLS Policies

All tables have RLS enabled with policies for:
- User data access (own data only)
- Admin access (role-based)
- System operations (security definer functions)
- Audit logs: admin-only SELECT, service_role-only INSERT

## Audit Logging

Sensitive operations are logged to `audit_logs` table for:
- User management actions
- Role changes
- Permission modifications
- Security events

Audit log access is restricted to admin roles only.
The `log_audit_event` function uses `SECURITY DEFINER` to bypass RLS for INSERT.

## Known Security Considerations

1. **RLS as Primary Defense**: Server action role checks are defense-in-depth; RLS is the primary enforcement
2. **Service Role Key**: Must only exist in trusted server environments
3. **Auth Callback**: `next` parameter sanitized to prevent open redirect attacks
4. **Self-Role-Change**: Users cannot change their own role via `updateUserRole`
