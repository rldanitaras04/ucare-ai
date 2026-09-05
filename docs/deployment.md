# Deployment

## Overview

UCare AI is designed for independent deployment on Vercel.

## Applications

### Client Application
- **URL**: `client.example.com`
- **Port**: 3000
- **Build Command**: `cd apps/client && npm run build`

### Admin Application
- **URL**: `admin.example.com`
- **Port**: 3001
- **Build Command**: `cd apps/admin && npm run build`

## Environment Variables

### Client App
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Admin App
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Vercel Setup

1. Connect repository to Vercel
2. Create two projects (client, admin)
3. Set root directory for each project
4. Configure environment variables
5. Deploy independently

## Build Process

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build specific app
cd apps/client && pnpm build
cd apps/admin && pnpm build
```

## Database Setup

1. Create Supabase project
2. Run migrations in order
3. Configure RLS policies
4. Set up auth providers

## Post-Deployment

1. Verify authentication flows
2. Test RLS policies
3. Check admin access controls
4. Monitor audit logs
