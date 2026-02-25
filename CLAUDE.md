# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Moment** is a couples/partnership app that enables partners to respond to prompts independently and then reveal their responses together. The app uses a progressive reveal workflow: create moment → both partners respond → both partners reveal.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: PostgreSQL via Prisma ORM (hosted on Supabase)
- **Authentication**: Supabase Auth with Google OAuth
- **UI**: Tailwind CSS v4, shadcn/ui components (New York style)
- **Icons**: Lucide React

## Architecture

### Directory Structure

```
src/
  actions/          # Server Actions (all data mutations and fetching)
    auth.ts         # Authentication and partner management
    moments.ts      # Moment creation and retrieval
    partnerships.ts # Partnership invite system
    prompts.ts      # Prompt management and seeding
    responses.ts    # Response submission and retrieval
    reveals.ts      # Reveal status tracking
  app/              # Next.js App Router pages
src/
  proxy.ts          # Supabase auth proxy (middleware)
lib/
  prisma/
    prisma.ts       # Prisma client singleton
  supabase/
    client.ts       # Client-side Supabase client
    server.ts       # Server-side Supabase client
  utils.ts          # Utility functions (cn, etc.)
prisma/
  schema.prisma     # Database schema
```

### Server Actions Pattern

All data operations use Next.js Server Actions located in `src/actions/`. Each file is marked with `"use server"` and exports async functions that:

1. Authenticate the user via `getPartner()` from `auth.ts`
2. Validate authorization (e.g., user belongs to the partnership)
3. Perform database operations via Prisma
4. Use transactions when multiple operations must succeed/fail together

Example pattern:
```typescript
export async function someAction(arg: string) {
  const partner = await getPartner();
  if (!partner) throw new Error("Not authenticated");

  // Validate authorization
  // Perform database operation

  return result;
}
```

### Database Schema

**Core Models:**
- `Partner`: Represents a user (linked to Supabase Auth via `auth_id`)
- `Partnership`: Connects two partners (one-to-one relationship)
- `Prompt`: Question/prompt text that can be reused
- `PartnershipPrompt`: Junction table linking prompts to partnerships
- `Moment`: An instance of partners responding to a prompt
- `Response`: Each partner's answer to a moment (also tracks reveal state)

**Workflow States:**
- Moment status: `PENDING → BOTH_RESPONDED → REVEALED`
- Response status: `PENDING → RESPONDED → REVEALED`

### Authentication Flow

1. User signs in with Google OAuth via `signIn()` server action
2. Redirects to `/auth/callback` after Supabase authentication
3. `src/proxy.ts` refreshes auth session on every request
4. Server-side auth uses `createClient()` from `lib/supabase/server.ts`
5. Partner record in database is linked to Supabase Auth user via `auth_id`

### Path Aliases

The project uses `@/` to reference the root directory:
- `@/src/actions/auth` → `src/actions/auth.ts`
- `@/lib/prisma/prisma` → `lib/prisma/prisma.ts`
- `@/components/ui/button` → `components/ui/button.tsx`

## Important Conventions

### Prisma Transactions

Use `prisma.$transaction()` when:
- Creating related records (e.g., Moment + Response slots)
- Checking conditions before updates (e.g., both partners responded)
- State transitions that require validation (e.g., reveal logic)

### Error Handling

Server actions throw errors with descriptive messages:
```typescript
throw new Error("Not authenticated")
throw new Error("Partnership not found")
```

These are meant to be caught and displayed to users in the UI.

### Environment Variables

Required environment variables (not checked into git):
- `DATABASE_URL`: PostgreSQL connection string (Supabase)
- `DIRECT_URL`: Direct database connection (for migrations)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_APP_URL`: Application URL (for OAuth redirects)

## Key Business Logic

### Moment Creation Flow
1. User creates moment with a prompt from their partnership
2. System creates two PENDING response slots (one per partner)
3. Each partner submits their response independently
4. When both respond, moment status → `BOTH_RESPONDED`
5. Each partner reveals independently (Response status → `REVEALED`)
6. When both reveal, moment status → `REVEALED`

### Partnership System
- Each partner can only have ONE partnership
- Partnerships are formed via invite links containing `partner_id`
- Invite validation checks:
  - Inviter exists and has no partnership
  - Accepter has no partnership
  - Cannot invite yourself
- Default prompts are seeded when partnership is created

### Prompt Management
- Prompts can be shared across partnerships
- Each partnership links to prompts via `PartnershipPrompt` junction table
- Default prompts (defined in `prompts.ts`) are seeded automatically
- Custom prompts can be added per partnership

## Proxy Configuration

The proxy file is located at `src/proxy.ts` and exports a `proxy` function (per the latest Supabase SSR API). It:
- Runs on all routes except static assets
- Refreshes Supabase auth session
- Required for Supabase SSR to work correctly

## UI Design

See `docs/ui.md` for detailed page specifications including:
- Landing/Sign In Page
- Home Page (Prompt Response Card View)
- Response Reveal Page (side-by-side comparison)
- Create Partnership Page (invite system)
- History Page (past moments)
