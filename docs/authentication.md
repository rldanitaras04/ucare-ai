# Authentication

## Overview

UCare AI uses Supabase Auth with cookie-based sessions via `@supabase/ssr`.

## Architecture

### Session Management
- Sessions are managed via HTTP cookies (not localStorage)
- Supabase SSR handles cookie serialization
- Middleware refreshes sessions on every request

### Client Flow
1. User submits credentials
2. Supabase authenticates and creates session
3. Session stored in httpOnly cookies
4. Middleware validates session on protected routes

### Server Flow
1. Server reads cookies from request
2. Supabase server client validates session
3. User data retrieved from database
4. Authorization checked before data access

## Protected Routes

### Client Application
- `/dashboard/*` requires authentication
- `/login` and `/signup` redirect authenticated users

### Admin Application
- `/*` requires authentication
- `/login` redirects authenticated users
- Admin panel requires `admin` or `super_admin` role

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Security Considerations

- Never store auth tokens in localStorage
- Always use `@supabase/ssr` for server-side operations
- Service role key must never be exposed to browser
- RLS policies enforce data access at database level
