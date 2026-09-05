# Architecture

## Overview

UCare AI is a production-ready monorepo containing two Next.js applications sharing a common backend and design system.

## Applications

### Client Application (`apps/client`)
- **Port**: 3000
- **Audience**: End users
- **Features**: Landing page, authentication, user dashboard, profile management

### Admin Application (`apps/admin`)
- **Port**: 3001
- **Audience**: Administrators and staff
- **Features**: User management, role management, audit logs, system administration

## Shared Packages

### `@repo/ui`
Shared design system and UI components used by both applications.

### `@repo/supabase`
Supabase client utilities for browser, server, and middleware environments.

### `@repo/auth`
Authentication and authorization utilities including RBAC permissions.

### `@repo/types`
Shared TypeScript type definitions for database schema and domain models.

### `@repo/utils`
Common utility functions.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Package Manager**: pnpm
- **Build System**: Turborepo
- **Deployment**: Vercel (independent deployments)

## Directory Structure

```
/
├── apps/
│   ├── client/          # Client application
│   └── admin/           # Admin application
├── packages/
│   ├── ui/              # Shared UI components
│   ├── supabase/        # Supabase client utilities
│   ├── auth/            # Authentication/authorization
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # Common utilities
│   └── config/          # Shared configurations
├── supabase/
│   └── migrations/      # Database migrations
├── docs/                # Documentation
└── turbo.json           # Turborepo configuration
```

## Key Principles

1. **Separation of Concerns**: Client and Admin are independent applications
2. **Shared Infrastructure**: Common packages prevent duplication
3. **Security First**: RLS, middleware, and server-side authorization
4. **Mobile-First**: Client application optimized for mobile
5. **Type Safety**: Strict TypeScript across all packages
