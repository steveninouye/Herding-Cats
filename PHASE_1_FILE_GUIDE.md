# Phase 1 MVP — File Placement Guide

## How to place these files in your repo

### Database & Schema
| File | Destination |
|------|-------------|
| `schema.ts` | `src/db/schema.ts` (REPLACE) |
| `0001_phase1_migration.sql` | `drizzle/0001_phase1_migration.sql` (NEW) |

### Server Functions (NEW directory: `src/server/`)
| File | Destination |
|------|-------------|
| `auth.server.ts` | `src/server/auth.ts` |
| `groups.server.ts` | `src/server/groups.ts` |
| `events.server.ts` | `src/server/events.ts` |
| `rsvps.server.ts` | `src/server/rsvps.ts` |

### Lib (REPLACE existing)
| File | Destination |
|------|-------------|
| `jwt.ts` | `src/lib/jwt.ts` (REPLACE) |
| `crypto.ts` | `src/lib/crypto.ts` (REPLACE) |
| `password.ts` | `src/lib/password.ts` (REPLACE) |
| `invite.ts` | `src/lib/invite.ts` (REPLACE) |

### Middleware
| File | Destination |
|------|-------------|
| `middleware-auth.ts` | `src/middleware/auth.ts` (REPLACE) |

### UI Components (NEW directory: `src/components/ui/`)
| File | Destination |
|------|-------------|
| `Button.tsx` | `src/components/ui/Button.tsx` |
| `Card.tsx` | `src/components/ui/Card.tsx` |
| `Input.tsx` | `src/components/ui/Input.tsx` |
| `TextArea.tsx` | `src/components/ui/TextArea.tsx` |
| `Badge.tsx` | `src/components/ui/Badge.tsx` |

### Feature Components (NEW in `src/components/`)
| File | Destination |
|------|-------------|
| `Header.tsx` | `src/components/Header.tsx` |
| `GroupCard.tsx` | `src/components/GroupCard.tsx` |
| `EventCard.tsx` | `src/components/EventCard.tsx` |
| `RSVPList.tsx` | `src/components/RSVPList.tsx` |
| `RSVPButton.tsx` | `src/components/RSVPButton.tsx` |

### Routes
| File | Destination |
|------|-------------|
| `layout.tsx` | `src/routes/layout.tsx` (REPLACE) |
| `index.tsx` | `src/routes/index.tsx` (REPLACE) |
| `login-index.tsx` | `src/routes/login/index.tsx` (REPLACE) |
| `dashboard-index.tsx` | `src/routes/dashboard/index.tsx` (NEW) |
| `groups-index.tsx` | `src/routes/groups/index.tsx` (NEW) |
| `groups-new-index.tsx` | `src/routes/groups/new/index.tsx` (NEW) |
| `groups-join-index.tsx` | `src/routes/groups/join/index.tsx` (NEW) |
| `groupId-index.tsx` | `src/routes/groups/[groupId]/index.tsx` (NEW) |
| `events-new-index.tsx` | `src/routes/groups/[groupId]/events/new/index.tsx` (NEW) |
| `eventId-index.tsx` | `src/routes/events/[eventId]/index.tsx` (NEW) |

### Config
| File | Destination |
|------|-------------|
| `global.d.ts` | `src/global.d.ts` (REPLACE) |

---

## After placing files, run:

```bash
# 1. Generate Drizzle migration (if using drizzle-kit)
npx drizzle-kit generate

# 2. Run migration locally
npx wrangler d1 execute herding-cats --local --file=./drizzle/0001_phase1_migration.sql

# 3. Start dev server
npm run dev
```

## New directory structure after Phase 1:

```
src/
├── components/
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── TextArea.tsx
│   ├── EventCard.tsx
│   ├── GroupCard.tsx
│   ├── Header.tsx
│   ├── RSVPButton.tsx
│   └── RSVPList.tsx
├── db/
│   ├── index.ts
│   └── schema.ts          (UPDATED)
├── lib/
│   ├── crypto.ts           (UPDATED)
│   ├── invite.ts           (UPDATED)
│   ├── jwt.ts              (UPDATED)
│   ├── password.ts         (UPDATED)
│   └── session.ts
├── middleware/
│   └── auth.ts             (UPDATED)
├── server/                  (NEW)
│   ├── auth.ts
│   ├── events.ts
│   ├── groups.ts
│   └── rsvps.ts
├── routes/
│   ├── dashboard/
│   │   └── index.tsx       (NEW)
│   ├── events/
│   │   └── [eventId]/
│   │       └── index.tsx   (NEW)
│   ├── groups/
│   │   ├── [groupId]/
│   │   │   ├── events/
│   │   │   │   └── new/
│   │   │   │       └── index.tsx (NEW)
│   │   │   └── index.tsx  (NEW)
│   │   ├── join/
│   │   │   └── index.tsx  (NEW)
│   │   ├── new/
│   │   │   └── index.tsx  (NEW)
│   │   └── index.tsx      (NEW)
│   ├── login/
│   │   └── index.tsx      (UPDATED)
│   ├── index.tsx           (UPDATED)
│   └── layout.tsx          (UPDATED)
└── global.d.ts             (UPDATED)
```

## Environment Variables (wrangler.toml)

Make sure your `wrangler.toml` has:
```toml
[vars]
JWT_SECRET = "your-secret-key-here-change-in-production"

[[d1_databases]]
binding = "herding_cats_db"
database_name = "herding-cats"
database_id = "your-database-id"
```

## Key Architecture Decisions

1. **No `server$` functions** — Used `routeLoader$` and `routeAction$` instead (Qwik best practice for data loading and mutations)
2. **Server logic in `src/server/`** — Pure functions that take a `db` instance, making them testable
3. **Web Crypto API** — JWT and password hashing use Web Crypto (CF Workers compatible, no Node.js deps)
4. **Tailwind v4** — All styling uses Tailwind utility classes (already in your devDeps)
5. **RSVP auto-promotion** — When a confirmed user cancels, first waitlisted is auto-promoted and all positions decremented
