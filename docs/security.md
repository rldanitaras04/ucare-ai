# Security

## Overview

UCare AI follows a defense-in-depth security model with multiple layers of protection.

## Authentication Security

- Cookie-based sessions (not localStorage)
- httpOnly, Secure, SameSite cookies
- Session refresh on every request
- Automatic token rotation

## Authorization Security

### Layer 1: UI Visibility
- Menu items hidden based on permissions
- NOT a security boundary

### Layer 2: Route Protection
- Middleware validates authentication
- Redirects unauthenticated users

### Layer 3: Server Authorization
- Server-side permission checks
- Role-based access control

### Layer 4: Database RLS
- Row Level Security on all tables
- Final security boundary
- Enforced at database level

## Environment Variables

### Public (Browser)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Private (Server Only)
- `SUPABASE_SERVICE_ROLE_KEY` - NEVER expose to browser

## Security Practices

1. **Input Validation**: Validate all user input at boundaries
2. **Output Encoding**: Prevent XSS attacks
3. **Parameterized Queries**: Prevent SQL injection (handled by Supabase)
4. **CSRF Protection**: Cookie-based sessions with SameSite
5. **Rate Limiting**: Supabase handles auth rate limiting
6. **Error Handling**: Never expose internal errors to users
7. **Secrets Management**: Never commit secrets to repository

## RLS Policies

All tables have RLS enabled with policies for:
- User data access (own data only)
- Admin access (role-based)
- System operations (security definer functions)

## Audit Logging

Sensitive operations are logged to `audit_logs` table for:
- User management actions
- Role changes
- Permission modifications
- Security events
