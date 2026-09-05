# Database Schema

## Overview

UCare AI uses Supabase PostgreSQL with Row Level Security (RLS).

## Tables

### profiles
Extends Supabase auth.users with application-specific data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, FK to auth.users |
| email | TEXT | User email |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | Profile image URL |
| role | TEXT | User role (default: 'user') |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### roles
System roles for RBAC.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Unique role name |
| description | TEXT | Role description |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### permissions
System permissions for RBAC.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Unique permission name |
| description | TEXT | Permission description |
| resource | TEXT | Resource type |
| action | TEXT | Action type |
| created_at | TIMESTAMPTZ | Creation timestamp |

### user_roles
Many-to-many relationship between users and roles.

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | FK to profiles |
| role_id | UUID | FK to roles |
| created_at | TIMESTAMPTZ | Creation timestamp |

### role_permissions
Many-to-many relationship between roles and permissions.

| Column | Type | Description |
|--------|------|-------------|
| role_id | UUID | FK to roles |
| permission_id | UUID | FK to permissions |
| created_at | TIMESTAMPTZ | Creation timestamp |

### audit_logs
System audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to profiles (nullable) |
| action | TEXT | Action performed |
| resource | TEXT | Resource affected |
| resource_id | TEXT | Specific resource ID |
| details | JSONB | Additional details |
| ip_address | TEXT | Client IP address |
| created_at | TIMESTAMPTZ | Creation timestamp |

## Migrations

Migrations are located in `supabase/migrations/` and follow sequential naming:

1. `00001_create_profiles.sql` - Profiles table and triggers
2. `00002_create_roles.sql` - Roles table
3. `00003_create_permissions.sql` - Permissions table
4. `00004_create_user_roles.sql` - User-role assignments
5. `00005_create_role_permissions.sql` - Role-permission assignments
6. `00006_create_audit_logs.sql` - Audit logs table

## Row Level Security

All application tables have RLS enabled. Policies ensure:

- Users can only access their own data
- Admins have broader access based on role
- Service role bypasses RLS for trusted operations
