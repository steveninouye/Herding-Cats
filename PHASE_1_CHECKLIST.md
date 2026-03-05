# Phase 1 MVP Checklist

> **Target:** End of Day Friday  
> **Status:** 🔴 Not Started

---

## Setup

- [ ] Install dependencies (`drizzle-orm`, `bcryptjs`, `nanoid`)
- [ ] Configure `drizzle.config.ts`
- [ ] Create D1 database binding in `wrangler.toml`
- [ ] Create `src/db/index.ts` (DB connection)

## Database

- [ ] Create `src/db/schema.ts` with all tables:
  - [ ] `users` table
  - [ ] `groups` table
  - [ ] `groupMembers` table
  - [ ] `events` table
  - [ ] `rsvps` table
- [ ] Generate migrations (`npx drizzle-kit generate`)
- [ ] Test migrations locally

## Authentication

- [ ] Create `src/server/auth.ts`:
  - [ ] `registerUser` function
  - [ ] `loginUser` function
  - [ ] `logoutUser` function
  - [ ] `getCurrentUser` function
  - [ ] Session management (cookies)
- [ ] Create auth routes:
  - [ ] `/auth/register` page
  - [ ] `/auth/login` page
  - [ ] `/auth/logout` action
- [ ] Add auth protection to routes

## Base Components

- [ ] Create `src/components/ui/Button.tsx`
- [ ] Create `src/components/ui/Card.tsx`
- [ ] Create `src/components/ui/Input.tsx`
- [ ] Create `src/components/Header.tsx`
- [ ] Update `src/routes/layout.tsx`

## Groups Feature

- [ ] Create `src/server/groups.ts`:
  - [ ] `createGroup` function
  - [ ] `joinGroup` function
  - [ ] `getUserGroups` function
  - [ ] `getGroup` function
- [ ] Create group routes:
  - [ ] `/groups` (list)
  - [ ] `/groups/new` (create form)
  - [ ] `/groups/join` (join form)
  - [ ] `/groups/[groupId]` (detail page)
- [ ] Create `src/components/GroupCard.tsx`

## Events Feature

- [ ] Create `src/server/events.ts`:
  - [ ] `createEvent` function
  - [ ] `getEvent` function
  - [ ] `getUpcomingEvents` function
- [ ] Create event routes:
  - [ ] `/groups/[groupId]/events/new` (create form)
  - [ ] `/events/[eventId]` (detail page)
- [ ] Create `src/components/EventCard.tsx`

## RSVP System (Critical)

- [ ] Create `src/server/rsvps.ts`:
  - [ ] `rsvpToEvent` function (24-cap logic)
  - [ ] `cancelRSVP` function (auto-promote)
  - [ ] Waitlist position management
- [ ] Create RSVP components:
  - [ ] `src/components/RSVPList.tsx`
  - [ ] `src/components/RSVPButton.tsx`
- [ ] Integrate RSVP UI into event page

## Dashboard

- [ ] Create `/dashboard` page
- [ ] Show user's groups
- [ ] Show upcoming events
- [ ] Add navigation links

## Landing Page

- [ ] Update `/` (index) page
- [ ] Redirect logged-in users to dashboard
- [ ] Show login/register for guests

## Testing

- [ ] Test registration flow
- [ ] Test login/logout flow
- [ ] Test group creation
- [ ] Test joining group with invite code
- [ ] Test event creation
- [ ] Test RSVP (1st-24th person → confirmed)
- [ ] Test RSVP (25th+ person → waitlist)
- [ ] Test cancel (confirmed → promotes waitlist)
- [ ] Test cancel (waitlist → reorders positions)
- [ ] Test mobile responsiveness

## Polish

- [ ] Error messages display properly
- [ ] Loading states on buttons
- [ ] Empty states ("No groups yet")
- [ ] Consistent styling throughout

## Deployment

- [ ] Create D1 database in Cloudflare Dashboard
- [ ] Update `wrangler.toml` with database ID
- [ ] Run migrations on production D1
- [ ] Build app (`npm run build`)
- [ ] Deploy (`npm run deploy`)
- [ ] Test production deployment
- [ ] Verify RSVP system works in production

---

## Quick Commands

```bash
# Development
npm run dev

# Database
npx drizzle-kit generate
npx wrangler d1 execute herding-cats --local --file=./drizzle/0000_initial.sql

# Production
npx wrangler d1 execute herding-cats --file=./drizzle/0000_initial.sql
npm run build
npm run deploy
```

---

## Critical Path

1. ✅ Setup → 2. ✅ Database → 3. ✅ Auth → 4. ✅ Groups → 5. ✅ Events → 6. ✅ RSVP → 7. ✅ Deploy

**Blockers:** None identified

---

**Last Updated:** Phase 1 Planning
