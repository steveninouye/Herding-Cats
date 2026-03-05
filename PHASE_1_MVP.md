# Phase 1: Herding Cats MVP Requirements

> **Target Delivery:** End of Day Friday  
> **Build Time:** Single ChatLLM session  
> **Philosophy:** "People Contributing to Communities"

---

## 1. Overview & Goals

### What We're Building
A simple, clean event management platform for soccer groups with a **hard cap of 24 RSVPs** and automatic waitlist management.

### Why
- Groups need a simple way to organize recurring soccer games
- Hard cap ensures fair, first-come-first-served access
- Waitlist automatically promotes people when spots open
- No complex integrations - just works

### Success Criteria
- Users can create accounts and log in
- Users can create/join soccer groups
- Group owners can create events
- First 24 RSVPs are confirmed, rest go to waitlist
- Cancellations auto-promote waitlisted users
- Mobile-friendly, clean UI

---

## 2. Scope

### ✅ IN SCOPE (Phase 1)
| Feature | Description |
|---------|-------------|
| Authentication | Email/password login with session management |
| User Profiles | Basic profile with name, email |
| Groups | Create and manage soccer groups |
| Group Membership | Join groups via invite code |
| Events | Create events with date, time, location, description |
| RSVP System | 24-person hard cap with waitlist |
| Auto-Promotion | First waitlisted user promoted on cancellation |
| Dashboard | View your groups and upcoming events |
| Responsive UI | Mobile-first design |

### ❌ NOT IN SCOPE (Phase 2+)
| Feature | Reason |
|---------|--------|
| Google Calendar Integration | Complexity - Phase 2 |
| Karma System | Complexity - Phase 2 |
| Teams/Sub-groups | Complexity - Phase 2 |
| Multiple Owners | Simplicity - Phase 2 |
| Email Notifications | Can be added later |
| Payment Integration | Future feature |
| Advanced Permissions | Keep simple for MVP |

---

## 3. User Stories

### Authentication

#### US-1: User Registration
**As a** new user  
**I want to** create an account with email and password  
**So that** I can access the platform

**Acceptance Criteria:**
- [ ] Registration form with: name, email, password, confirm password
- [ ] Email must be unique
- [ ] Password minimum 8 characters
- [ ] On success, redirect to dashboard
- [ ] Show error messages for validation failures

#### US-2: User Login
**As a** registered user  
**I want to** log in with my email and password  
**So that** I can access my groups and events

**Acceptance Criteria:**
- [ ] Login form with email and password
- [ ] On success, redirect to dashboard
- [ ] On failure, show "Invalid credentials" message
- [ ] Session persists across page refreshes

#### US-3: User Logout
**As a** logged-in user  
**I want to** log out  
**So that** I can secure my account

**Acceptance Criteria:**
- [ ] Logout button in header/nav
- [ ] Clears session
- [ ] Redirects to login page

---

### Groups

#### US-4: Create Group
**As a** logged-in user  
**I want to** create a new soccer group  
**So that** I can organize events for my friends

**Acceptance Criteria:**
- [ ] Form with: group name, description (optional)
- [ ] Auto-generates unique 6-character invite code
- [ ] Creator becomes group owner
- [ ] Redirect to group page on success

#### US-5: Join Group
**As a** logged-in user  
**I want to** join a group using an invite code  
**So that** I can participate in events

**Acceptance Criteria:**
- [ ] Input field for invite code
- [ ] Validates code exists
- [ ] Adds user to group
- [ ] Shows error if invalid code or already a member

#### US-6: View My Groups
**As a** logged-in user  
**I want to** see all groups I belong to  
**So that** I can access them quickly

**Acceptance Criteria:**
- [ ] List of groups with name and member count
- [ ] Click to navigate to group page
- [ ] Shows "No groups yet" if empty

#### US-7: View Group Details
**As a** group member  
**I want to** see group details and upcoming events  
**So that** I can participate

**Acceptance Criteria:**
- [ ] Shows group name, description, invite code
- [ ] Lists upcoming events
- [ ] Shows member list
- [ ] Owner sees "Create Event" button

---

### Events

#### US-8: Create Event
**As a** group owner  
**I want to** create an event  
**So that** members can RSVP

**Acceptance Criteria:**
- [ ] Form: title, date, time, location, description (optional)
- [ ] Only group owner can create events
- [ ] Event linked to group
- [ ] Redirect to event page on success

#### US-9: View Event
**As a** group member  
**I want to** see event details and who's attending  
**So that** I know when/where and who's coming

**Acceptance Criteria:**
- [ ] Shows: title, date, time, location, description
- [ ] Shows confirmed attendees (up to 24) with count
- [ ] Shows waitlist (if any) with position numbers
- [ ] Shows my RSVP status
- [ ] Shows RSVP/Cancel button based on status

---

### RSVP System

#### US-10: RSVP to Event
**As a** group member  
**I want to** RSVP to an event  
**So that** I can secure my spot

**Acceptance Criteria:**
- [ ] One-click RSVP button
- [ ] If < 24 confirmed → confirmed immediately
- [ ] If ≥ 24 confirmed → added to waitlist
- [ ] Shows confirmation message with status
- [ ] Cannot RSVP twice

#### US-11: Cancel RSVP
**As a** user who has RSVP'd  
**I want to** cancel my RSVP  
**So that** I can free up my spot

**Acceptance Criteria:**
- [ ] One-click cancel button
- [ ] Removes from confirmed list OR waitlist
- [ ] If confirmed spot freed, first waitlisted auto-promoted
- [ ] Shows confirmation message

#### US-12: View My RSVP Status
**As a** user  
**I want to** see my RSVP status clearly  
**So that** I know if I'm confirmed or waitlisted

**Acceptance Criteria:**
- [ ] Clear visual indicator: ✅ Confirmed / ⏳ Waitlist #N / Not RSVP'd
- [ ] Waitlist shows position number

---

## 4. Database Schema (Drizzle ORM for D1)

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID or nanoid
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Groups table
export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  inviteCode: text('invite_code').notNull().unique(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Group Members table (many-to-many)
export const groupMembers = sqliteTable('group_members', {
  id: text('id').primaryKey(),
  groupId: text('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: integer('joined_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Events table
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  groupId: text('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location').notNull(),
  eventDate: integer('event_date', { mode: 'timestamp' }).notNull(),
  maxAttendees: integer('max_attendees').notNull().default(24),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// RSVPs table
export const rsvps = sqliteTable('rsvps', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['confirmed', 'waitlist'] }).notNull(),
  position: integer('position'), // For waitlist ordering
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type RSVP = typeof rsvps.$inferSelect;
export type NewRSVP = typeof rsvps.$inferInsert;
```

### Database Indexes (add to schema)
```typescript
import { index } from 'drizzle-orm/sqlite-core';

// Add to events table for faster queries
export const eventsGroupIdIdx = index('events_group_id_idx').on(events.groupId);

// Add to rsvps table
export const rsvpsEventIdIdx = index('rsvps_event_id_idx').on(rsvps.eventId);
export const rsvpsUserIdIdx = index('rsvps_user_id_idx').on(rsvps.userId);

// Add to groupMembers table
export const groupMembersGroupIdIdx = index('group_members_group_id_idx').on(groupMembers.groupId);
export const groupMembersUserIdIdx = index('group_members_user_id_idx').on(groupMembers.userId);
```

---

## 5. Route Structure

```
src/routes/
├── index.tsx                    # Landing page (redirect to dashboard if logged in)
├── layout.tsx                   # Main layout with nav
│
├── auth/
│   ├── login/
│   │   └── index.tsx            # Login page
│   ├── register/
│   │   └── index.tsx            # Registration page
│   └── logout/
│       └── index.tsx            # Logout action
│
├── dashboard/
│   └── index.tsx                # User dashboard - list groups & upcoming events
│
├── groups/
│   ├── index.tsx                # List all user's groups
│   ├── new/
│   │   └── index.tsx            # Create new group form
│   ├── join/
│   │   └── index.tsx            # Join group with invite code
│   └── [groupId]/
│       ├── index.tsx            # Group detail page
│       └── events/
│           └── new/
│               └── index.tsx    # Create event form
│
└── events/
    └── [eventId]/
        └── index.tsx            # Event detail page with RSVP
```

---

## 6. Component Specifications

### Layout Components

#### `Header`
```typescript
// src/components/Header.tsx
interface HeaderProps {
  user?: { name: string; email: string } | null;
}

// Behavior:
// - Shows logo/brand "Herding Cats"
// - If user logged in: shows user name + logout button
// - If not logged in: shows login/register links
// - Mobile: hamburger menu
```

#### `Card`
```typescript
// src/components/Card.tsx
interface CardProps {
  title?: string;
  children: any;
  className?: string;
}

// Styling:
// - White background
// - Soft shadow: shadow-md
// - Rounded corners: rounded-xl
// - Padding: p-6
```

#### `Button`
```typescript
// src/components/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick$?: () => void;
  type?: 'button' | 'submit';
  children: any;
}

// Styling:
// Primary: bg-gradient-to-r from-amber-500 to-orange-500, white text
// Secondary: white bg, amber border, amber text
// Danger: red-500 bg, white text
```

### Form Components

#### `Input`
```typescript
// src/components/Input.tsx
interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
}

// Styling:
// - Label: text-gray-700, font-medium, mb-1
// - Input: border rounded-lg px-4 py-2, focus:ring-amber-500
// - Error: text-red-500 text-sm mt-1
```

#### `TextArea`
```typescript
// src/components/TextArea.tsx
interface TextAreaProps {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  value?: string;
}
```

### Feature Components

#### `GroupCard`
```typescript
// src/components/GroupCard.tsx
interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    memberCount: number;
  };
}

// Behavior:
// - Clickable, navigates to /groups/[id]
// - Shows group name, description preview, member count
// - Hover effect with slight scale
```

#### `EventCard`
```typescript
// src/components/EventCard.tsx
interface EventCardProps {
  event: {
    id: string;
    title: string;
    eventDate: Date;
    location: string;
    confirmedCount: number;
    maxAttendees: number;
    userStatus?: 'confirmed' | 'waitlist' | null;
    waitlistPosition?: number;
  };
}

// Behavior:
// - Shows event title, date/time, location
// - Shows "X/24 Confirmed"
// - Badge showing user's RSVP status
// - Clickable, navigates to /events/[id]
```

#### `RSVPList`
```typescript
// src/components/RSVPList.tsx
interface RSVPListProps {
  confirmed: Array<{ userId: string; userName: string }>;
  waitlist: Array<{ userId: string; userName: string; position: number }>;
  maxAttendees: number;
}

// Behavior:
// - Two sections: "Confirmed (X/24)" and "Waitlist (X)"
// - Confirmed shows names in a grid
// - Waitlist shows position numbers
// - Visual distinction between sections
```

#### `RSVPButton`
```typescript
// src/components/RSVPButton.tsx
interface RSVPButtonProps {
  eventId: string;
  userStatus: 'confirmed' | 'waitlist' | null;
  waitlistPosition?: number;
  onRSVP$: () => void;
  onCancel$: () => void;
}

// Behavior:
// - If null: shows "RSVP" button (primary)
// - If confirmed: shows "✅ Confirmed" + "Cancel" button
// - If waitlist: shows "⏳ Waitlist #X" + "Leave Waitlist" button
```

---

## 7. API/Server Functions

### Authentication

```typescript
// src/server/auth.ts
import { server$ } from '@builder.io/qwik-city';

// Register new user
export const registerUser = server$(async function(data: {
  name: string;
  email: string;
  password: string;
}) {
  // 1. Validate input
  // 2. Check email doesn't exist
  // 3. Hash password (use bcrypt or similar)
  // 4. Insert user into DB
  // 5. Create session
  // 6. Return success or error
});

// Login user
export const loginUser = server$(async function(data: {
  email: string;
  password: string;
}) {
  // 1. Find user by email
  // 2. Verify password
  // 3. Create session cookie
  // 4. Return success or error
});

// Logout user
export const logoutUser = server$(async function() {
  // 1. Clear session cookie
});

// Get current user (from session)
export const getCurrentUser = server$(async function() {
  // 1. Read session cookie
  // 2. Validate session
  // 3. Return user or null
});
```

### Groups

```typescript
// src/server/groups.ts

// Create group
export const createGroup = server$(async function(data: {
  name: string;
  description?: string;
}) {
  // 1. Get current user (must be logged in)
  // 2. Generate unique invite code (6 chars)
  // 3. Insert group
  // 4. Add creator as member
  // 5. Return group
});

// Join group by invite code
export const joinGroup = server$(async function(inviteCode: string) {
  // 1. Get current user
  // 2. Find group by invite code
  // 3. Check not already a member
  // 4. Add as member
  // 5. Return group
});

// Get user's groups
export const getUserGroups = server$(async function() {
  // 1. Get current user
  // 2. Query groups where user is member
  // 3. Include member count
  // 4. Return groups
});

// Get group by ID
export const getGroup = server$(async function(groupId: string) {
  // 1. Get current user
  // 2. Check user is member
  // 3. Get group with members and upcoming events
  // 4. Return group or 403
});
```

### Events

```typescript
// src/server/events.ts

// Create event
export const createEvent = server$(async function(data: {
  groupId: string;
  title: string;
  description?: string;
  location: string;
  eventDate: Date;
}) {
  // 1. Get current user
  // 2. Check user is group owner
  // 3. Insert event
  // 4. Return event
});

// Get event by ID
export const getEvent = server$(async function(eventId: string) {
  // 1. Get current user
  // 2. Get event with RSVPs
  // 3. Check user is member of event's group
  // 4. Return event with RSVP lists
});

// Get upcoming events for user
export const getUpcomingEvents = server$(async function() {
  // 1. Get current user
  // 2. Get events from user's groups where date > now
  // 3. Include RSVP counts and user's status
  // 4. Return sorted by date
});
```

### RSVPs

```typescript
// src/server/rsvps.ts

// RSVP to event
export const rsvpToEvent = server$(async function(eventId: string) {
  // 1. Get current user
  // 2. Check user is member of event's group
  // 3. Check not already RSVP'd
  // 4. Count current confirmed RSVPs
  // 5. If < 24: insert as 'confirmed'
  // 6. If >= 24: insert as 'waitlist' with position
  // 7. Return new status
});

// Cancel RSVP
export const cancelRSVP = server$(async function(eventId: string) {
  // 1. Get current user
  // 2. Find user's RSVP
  // 3. If was confirmed: promote first waitlisted
  // 4. Delete RSVP
  // 5. Reorder waitlist positions
  // 6. Return success
});

// Helper: Promote waitlist
async function promoteWaitlist(eventId: string, db: DrizzleDB) {
  // 1. Find first waitlisted (lowest position)
  // 2. Update status to 'confirmed'
  // 3. Clear position
  // 4. Decrement all other waitlist positions
}
```

---

## 8. Design System Application

### Colors (Tailwind Classes)

```css
/* Primary Gradient */
.btn-primary {
  @apply bg-gradient-to-r from-amber-500 to-orange-500 text-white;
}

/* Text Colors */
.text-primary: text-amber-600
.text-secondary: text-gray-600
.text-muted: text-gray-400

/* Background Colors */
.bg-page: bg-gray-50 or bg-amber-50/30
.bg-card: bg-white
.bg-accent: bg-amber-50

/* Status Colors */
.status-confirmed: text-green-600, bg-green-50
.status-waitlist: text-amber-600, bg-amber-50
.status-empty: text-gray-400
```

### Typography

```css
/* Headings */
h1: text-3xl font-bold text-gray-900
h2: text-2xl font-semibold text-gray-800
h3: text-xl font-medium text-gray-700

/* Body */
p: text-gray-600
.text-sm: text-sm text-gray-500

/* Font Stack (system) */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Component Patterns

```tsx
// Card Pattern
<div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
  {/* content */}
</div>

// Primary Button
<button class="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium px-6 py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg">
  Button Text
</button>

// Input Field
<div class="space-y-1">
  <label class="block text-sm font-medium text-gray-700">Label</label>
  <input class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
</div>

// Status Badge - Confirmed
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
  ✅ Confirmed
</span>

// Status Badge - Waitlist
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
  ⏳ Waitlist #3
</span>
```

### Layout Patterns

```tsx
// Page Container
<div class="min-h-screen bg-gray-50">
  <Header />
  <main class="max-w-4xl mx-auto px-4 py-8">
    {/* content */}
  </main>
</div>

// Grid for Cards
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* cards */}
</div>

// Two Column Layout
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div class="lg:col-span-2">{/* main content */}</div>
  <div>{/* sidebar */}</div>
</div>
```

---

## 9. Implementation Steps

### Step 1: Project Setup (15 min)

1. **Verify dependencies in package.json**
   ```bash
   npm install drizzle-orm @libsql/client bcryptjs nanoid
   npm install -D drizzle-kit @types/bcryptjs
   ```

2. **Configure Drizzle** (`drizzle.config.ts`)
   ```typescript
   import { defineConfig } from 'drizzle-kit';
   
   export default defineConfig({
     schema: './src/db/schema.ts',
     out: './drizzle',
     dialect: 'sqlite',
   });
   ```

3. **Create database connection** (`src/db/index.ts`)
   ```typescript
   import { drizzle } from 'drizzle-orm/d1';
   import * as schema from './schema';
   
   export function getDB(d1: D1Database) {
     return drizzle(d1, { schema });
   }
   ```

4. **Update wrangler.toml** for D1
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "herding-cats"
   database_id = "<your-database-id>"
   ```

### Step 2: Database Schema (20 min)

1. Create `src/db/schema.ts` with all tables (see Section 4)
2. Generate migrations: `npx drizzle-kit generate`
3. Apply migrations to local D1: `npx wrangler d1 execute herding-cats --local --file=./drizzle/0000_initial.sql`

### Step 3: Authentication System (45 min)

1. Create `src/server/auth.ts` with server functions
2. Create session management (use cookies)
3. Create `src/routes/auth/login/index.tsx`
4. Create `src/routes/auth/register/index.tsx`
5. Create `src/routes/auth/logout/index.tsx`
6. Add auth check middleware

### Step 4: Base Components (30 min)

1. Create `src/components/ui/Button.tsx`
2. Create `src/components/ui/Card.tsx`
3. Create `src/components/ui/Input.tsx`
4. Create `src/components/Header.tsx`
5. Update `src/routes/layout.tsx`

### Step 5: Groups Feature (45 min)

1. Create `src/server/groups.ts` with server functions
2. Create `src/routes/groups/index.tsx` (list)
3. Create `src/routes/groups/new/index.tsx` (create form)
4. Create `src/routes/groups/join/index.tsx` (join form)
5. Create `src/routes/groups/[groupId]/index.tsx` (detail)
6. Create `src/components/GroupCard.tsx`

### Step 6: Events Feature (45 min)

1. Create `src/server/events.ts` with server functions
2. Create `src/routes/groups/[groupId]/events/new/index.tsx`
3. Create `src/routes/events/[eventId]/index.tsx`
4. Create `src/components/EventCard.tsx`

### Step 7: RSVP System (45 min)

1. Create `src/server/rsvps.ts` with server functions
2. Implement RSVP logic with 24-cap
3. Implement waitlist promotion
4. Create `src/components/RSVPList.tsx`
5. Create `src/components/RSVPButton.tsx`
6. Add RSVP UI to event page

### Step 8: Dashboard (20 min)

1. Create `src/routes/dashboard/index.tsx`
2. Show user's groups
3. Show upcoming events across all groups
4. Add quick links

### Step 9: Polish & Testing (30 min)

1. Test all user flows
2. Add error handling
3. Add loading states
4. Responsive testing
5. Fix any bugs

### Step 10: Deploy (15 min)

1. Create D1 database in Cloudflare
2. Run migrations on production D1
3. Deploy: `npm run deploy`
4. Test production

---

## 10. Testing Criteria

### Authentication Tests

| Test | Expected Result |
|------|----------------|
| Register with valid data | User created, redirected to dashboard |
| Register with existing email | Error: "Email already exists" |
| Register with short password | Error: "Password must be 8+ characters" |
| Login with valid credentials | Session created, redirected to dashboard |
| Login with wrong password | Error: "Invalid credentials" |
| Access protected route without login | Redirected to login |
| Logout | Session cleared, redirected to login |

### Group Tests

| Test | Expected Result |
|------|----------------|
| Create group | Group created with unique invite code |
| Join with valid code | Added to group members |
| Join with invalid code | Error: "Invalid invite code" |
| Join group already member of | Error: "Already a member" |
| View group as member | Shows group details |
| View group as non-member | Error: 403 |

### Event Tests

| Test | Expected Result |
|------|----------------|
| Create event as owner | Event created |
| Create event as non-owner | Error: 403 |
| View event as group member | Shows event details |

### RSVP Tests (Critical)

| Test | Expected Result |
|------|----------------|
| RSVP as 1st person | Status: confirmed |
| RSVP as 24th person | Status: confirmed |
| RSVP as 25th person | Status: waitlist #1 |
| RSVP as 26th person | Status: waitlist #2 |
| Cancel confirmed (24/24) | Spot freed, waitlist #1 → confirmed |
| Cancel waitlist #2 (25 total) | Waitlist #3 → #2, etc |
| Double RSVP | Error: "Already RSVP'd" |
| RSVP to event from other group | Error: 403 |

### UI Tests

| Test | Expected Result |
|------|----------------|
| Mobile viewport | Responsive layout, no horizontal scroll |
| Click group card | Navigate to group page |
| Click event card | Navigate to event page |
| RSVP button changes state | Shows confirmed/waitlist status |
| Confirmed count updates | Shows X/24 after RSVP |

---

## 11. Deployment Instructions

### Prerequisites
- Cloudflare account
- Wrangler CLI installed and authenticated (`npx wrangler login`)

### Step 1: Create D1 Database

```bash
# Create the database
npx wrangler d1 create herding-cats

# Copy the database_id from output and update wrangler.toml
```

### Step 2: Update wrangler.toml

```toml
name = "herding-cats"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./dist"

[[d1_databases]]
binding = "DB"
database_name = "herding-cats"
database_id = "your-database-id-here"
```

### Step 3: Run Migrations on Production D1

```bash
# Generate migrations if not done
npx drizzle-kit generate

# Apply to production (remove --local flag)
npx wrangler d1 execute herding-cats --file=./drizzle/0000_initial.sql
```

### Step 4: Build and Deploy

```bash
# Build the Qwik app
npm run build

# Deploy to Cloudflare Pages
npm run deploy
# OR
npx wrangler pages deploy ./dist
```

### Step 5: Verify Deployment

1. Visit your Cloudflare Pages URL
2. Test registration flow
3. Test group creation
4. Test event creation
5. Test RSVP system with multiple users

### Environment Variables (if needed)

```bash
# Set secrets via Wrangler
npx wrangler secret put SESSION_SECRET
```

---

## Quick Reference

### Key File Locations
```
src/
├── db/
│   ├── schema.ts        # Database schema
│   └── index.ts         # DB connection
├── server/
│   ├── auth.ts          # Auth functions
│   ├── groups.ts        # Group functions
│   ├── events.ts        # Event functions
│   └── rsvps.ts         # RSVP functions
├── components/
│   ├── ui/              # Base components
│   ├── Header.tsx
│   ├── GroupCard.tsx
│   ├── EventCard.tsx
│   ├── RSVPList.tsx
│   └── RSVPButton.tsx
└── routes/
    ├── layout.tsx
    ├── auth/
    ├── dashboard/
    ├── groups/
    └── events/
```

### Common Commands
```bash
npm run dev              # Local development
npm run build            # Build for production
npm run deploy           # Deploy to Cloudflare
npx drizzle-kit generate # Generate migrations
npx drizzle-kit studio   # Visual DB browser
```

### RSVP Logic Pseudocode
```
function rsvp(eventId, userId):
    confirmedCount = count RSVPs where eventId AND status='confirmed'
    
    if confirmedCount < 24:
        insert RSVP(status='confirmed')
    else:
        maxPosition = max position where eventId AND status='waitlist'
        insert RSVP(status='waitlist', position=maxPosition+1)

function cancel(eventId, userId):
    rsvp = find RSVP(eventId, userId)
    
    if rsvp.status == 'confirmed':
        firstWaitlisted = find RSVP where eventId AND status='waitlist' ORDER BY position LIMIT 1
        if firstWaitlisted:
            update firstWaitlisted SET status='confirmed', position=NULL
            update all waitlist SET position = position - 1
    else:
        update all waitlist where position > rsvp.position SET position = position - 1
    
    delete rsvp
```

---

## Design Mockup References

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Amber 500 | #f59e0b | Primary gradient start |
| Orange 500 | #f97316 | Primary gradient end |
| Amber 50 | #fffbeb | Light accent backgrounds |
| Gray 50 | #f9fafb | Page background |
| Gray 700 | #374151 | Body text |
| Gray 900 | #111827 | Headings |
| Green 600 | #16a34a | Confirmed status |
| Red 500 | #ef4444 | Danger/cancel |

### Spacing Scale
- xs: 0.5rem (8px)
- sm: 0.75rem (12px)  
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

---

**End of Phase 1 MVP Requirements**
