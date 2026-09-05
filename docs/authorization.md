# Authorization (RBAC)

## Overview

UCare AI implements Role-Based Access Control (RBAC) with permission-based authorization.

## Roles

| Role | Level | Description |
|------|-------|-------------|
| super_admin | 0 | Full system access |
| admin | 1 | Administrative access |
| staff | 2 | Staff member access |
| user | 3 | Regular user access |

## Permissions

| Permission | Resource | Action |
|------------|----------|--------|
| users.view | users | view |
| users.create | users | create |
| users.update | users | update |
| users.delete | users | delete |
| roles.view | roles | view |
| roles.manage | roles | manage |
| permissions.view | permissions | view |
| permissions.manage | permissions | manage |
| audit_logs.view | audit_logs | view |
| settings.manage | settings | manage |

## Authorization Layers

1. **UI Visibility**: Menu items hidden based on permissions
2. **Route Protection**: Middleware checks authentication
3. **Server Authorization**: Server-side permission checks
4. **Database RLS**: Final security boundary

## Usage

### Checking Permissions

```typescript
import { hasPermission, requirePermission } from "@repo/auth";

// Check if user has permission
if (hasPermission(user.permissions, "users.delete")) {
  // Allow action
}

// Require permission (returns AuthorizationResult)
const result = requirePermission(user.permissions, "users.delete");
if (!result.authorized) {
  // Deny action
}
```

### Checking Roles

```typescript
import { isAdmin, canAccessAdminPanel } from "@repo/auth";

if (isAdmin(user.role)) {
  // Allow admin action
}

if (canAccessAdminPanel(user.role)) {
  // Allow admin panel access
}
```

## Security Model

- UI hiding is NOT security
- Every permission check must be enforced at server and database level
- RLS policies are the final security boundary
- Service role bypasses RLS (use sparingly)
