# Herding Cats - Features & Specifications 🐈

> **The Single Source of Truth** for all project features, design decisions, and technical specifications.
>
> *Last Updated: March 2026*

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Philosophy](#core-philosophy)
- [Feature Documentation](#feature-documentation)
  - [1. Authentication & User Profiles](#1-authentication--user-profiles)
  - [2. Groups & Roles](#2-groups--roles)
  - [3. Locations & Venue Management](#3-locations--venue-management)
  - [4. Events & Geolocation](#4-events--geolocation)
  - [5. RSVP & Priority Algorithm](#5-rsvp--priority-algorithm)
  - [6. Community Contributions (Karma)](#6-community-contributions-karma)
  - [7. Moderation](#7-moderation)
- [Design System](#design-system)
- [Tech Stack & Constraints](#tech-stack--constraints)
- [Implementation Status](#implementation-status)

---

## Project Overview

**Herding Cats** is an invite-only event management platform designed to organize groups, manage events, and celebrate positive community contributions. Unlike traditional platforms, Herding Cats uses a Karma-based system to recognize and reward active, reliable community members who make their communities better.

### Target Scale
- ~1,000 users maximum
- Community-focused, intimate scale
- Quality over quantity approach

### Key Differentiators
- **Invite-only ecosystem** maintains community quality
- **Dual karma system** celebrates contributions at both global and group levels
- **Teams & sub-groups** enable flexible organization within communities
- **Privacy-first** approach to location and check-in data
- **Smart RSVP** with priority algorithms that reward active contributors

---

## Core Philosophy

### "People Contributing to Communities"

The platform is built around **celebrating and supporting positive community contributions**. Every feature is designed to recognize and uplift members who make their communities better:

- **Trust through Transparency**: Invite chains are tracked, contributions are celebrated
- **Recognizing Contributions**: Karma system highlights positive behavior and community involvement
- **Community Ownership**: Groups are self-moderating with flexible role structures
- **Respect for Privacy**: Location data and check-ins are handled with care
- **Positive Framing**: Focus on rewarding good behavior, not punishing mistakes

---

## Feature Documentation

### 1. Authentication & User Profiles

#### Overview
An invite-only authentication system that tracks user lineage and maintains community quality through invitation chains.

#### Key Features

##### Invite-Only Access
- Users can only join through an invitation from an existing member
- Every user's "invite chain" is tracked (who invited whom)
- Creates accountability and maintains community quality

##### Invite Lifecycle States
| State | Description |
|-------|-------------|
| `pending` | Invite sent, awaiting acceptance |
| `accepted` | User has joined via the invite |
| `revoked` | Invite withdrawn before acceptance |

##### User Profile System
- **Global Display Name**: Default identity across the platform
- **Per-Group Display Names**: Optional group-specific names
- **Profile Information**: Configurable user details

#### Business Rules
- Each invite code is single-use
- Invites can be revoked while in `pending` state
- Users can see their invite chain (who invited them, who they've invited)
- Invite limits may be placed on new or low-karma users

#### Data Model Considerations
```
User
├── id (primary key)
├── email (unique)
├── globalDisplayName
├── invitedById (foreign key → User)
├── inviteCode (for sending invites)
├── createdAt
└── karmaScore (default: 100.0)
```

---

### 2. Groups & Roles

#### Overview
Flexible group management with privacy controls, hierarchical roles, and support for multiple owners and teams within groups.

#### Group Visibility Levels

| Visibility | Description |
|------------|-------------|
| **Private** | Hidden from search, invite-only access |
| **Visible** | Appears in search, requires request to join |
| **Public** | Open to all platform members |

#### Role Hierarchy

| Role | Permissions |
|------|-------------|
| **Owner** | Full control: delete group, manage ownership, manage all roles (multiple owners allowed) |
| **Admin** | Manage members, events, locations; cannot delete group or manage owners |
| **Member** | Participate in events, RSVP, view group content |

#### Key Features
- **Multiple Owners**: Groups can have multiple owners for shared leadership and responsibility
- Group-specific display names
- Group-level banning (separate from platform bans)
- Member management and role assignment
- Group settings and preferences

#### Teams & Sub-groups

Groups can create **teams** (sub-groups) within them for better organization:

##### Use Cases
- **Sports**: An under-18 soccer group with 100 members can form teams of 15 players each
- **Projects**: A community group can create specialized teams for different activities
- **Events**: Teams can organize and participate in activities together

##### Algorithm-Based Team Formation
Teams can be formed automatically using smart algorithms that consider:
- **Skill Level**: Balance teams based on member skill ratings
- **Position/Role**: Distribute positions fairly (e.g., goalkeepers, defenders, forwards)
- **Fair Division**: Ensure competitive balance across teams
- **Preferences**: Account for member preferences when possible

##### Team Structure
- Teams exist within a parent group
- Team members must be members of the parent group
- Teams can have their own admins/captains
- Teams can participate in group events as a unit

#### Business Rules
- Groups can have **one or more Owners** for shared leadership
- Owners can add or remove other owners (minimum one owner required)
- Ownership can be transferred to Admins
- Admins can promote Members to Admin
- Members can leave groups voluntarily
- Banned members cannot rejoin without admin approval
- Teams inherit visibility settings from parent group by default

---

### 3. Locations & Venue Management

#### Overview
A registry for managing venues with reservation tracking and privacy-aware calendar features.

#### Key Features

##### Location Registry
- Create and manage venue profiles
- Store address, capacity, amenities, and contact info
- Link to external maps/directions

##### Reservation System
- Book venues for specific dates/times
- Track reservation status
- Prevent double-booking conflicts

##### Calendar Privacy
- Private calendars visible only to authorized users
- Configurable sharing settings per location
- Integration with event visibility rules

#### Business Rules
- Locations can be group-owned or platform-wide
- Reservation conflicts are checked automatically
- Historical usage data is maintained for analytics
- Location details can have different visibility than events

---

### 4. Events & Geolocation

#### Overview
Privacy-first event management with location-based check-in capabilities and calendar integration.

#### Key Features

##### Event Creation & Management
- Title, description, date/time, location
- Capacity limits (hard caps)
- Recurring event support
- Event visibility settings

##### Privacy-First Check-In
- **Geolocation-based** verification (optional)
- Check-in data is **not stored** beyond verification
- Respects user privacy while confirming attendance
- Alternative check-in methods available

##### Google Calendar Integration
- Sync events to personal Google Calendar
- Two-way sync support (future)
- Calendar visibility respects event privacy settings

#### Check-In Flow
```
1. User arrives at event location
2. Opts to check in via app
3. Geolocation verified against event location
4. Check-in confirmed (location data discarded)
5. Karma points awarded for punctuality
```

#### Business Rules
- Events must have at least one organizer
- Check-in window is configurable (e.g., 15 min before to 30 min after)
- Late check-ins are recorded for karma calculations
- No-shows are tracked when check-in is not completed

---

### 5. RSVP & Priority Algorithm

#### Overview
Smart RSVP system with hard caps, karma-based priority for waitlist management, and support for team/group RSVPs.

#### Key Features

##### Hard Caps
- Strict attendance limits that cannot be exceeded
- Prevents over-enrollment at capacity-limited venues
- Clear waitlist when capacity is reached

##### The Priority Algorithm
Unlike first-come-first-served, waitlist position is calculated using an **Effective RSVP Timestamp**:

```
Effective_Time = Actual_RSVP_Time + (Karma_Modifier × Time_Penalty)
```

**How it works:**
- Higher karma = earlier effective time = better waitlist position
- Rewards reliable community members
- Time_Penalty_Modifier is configurable per event/group

##### RSVP States

| State | Description |
|-------|-------------|
| `confirmed` | Spot secured, within capacity |
| `waitlisted` | Capacity full, in priority queue |
| `cancelled` | User cancelled their RSVP |
| `no-show` | Did not attend despite RSVP |

##### Team & Group RSVP

Teams or entire groups can RSVP to events as a unit:

**Use Cases:**
- **Sports Matches**: Two teams scheduling a game at a venue
- **Group Activities**: A group booking a venue for a shared event
- **Inter-group Events**: Multiple groups coordinating attendance

**Cancellation Visibility:**
- When a team/group cancels or an event doesn't meet minimum requirements, the venue becomes **visible as available** to other teams/groups
- This helps maximize venue utilization and gives other groups opportunities to use freed-up spaces
- Notifications sent to interested parties when venues become available

**Team RSVP Features:**
- Team captain/admin can RSVP on behalf of the team
- Individual team members can confirm their participation within the team RSVP
- Minimum attendance thresholds can be set (e.g., need 11 players for a soccer match)
- Events auto-cancel or flag for review if minimums aren't met

##### Flake Protection
- Tracks `minutesBeforeEvent` for cancellations
- Last-minute cancellations impact karma (with understanding for emergencies)
- Identifies patterns to help members improve their reliability

#### Business Rules
- RSVPs can be cancelled any time, but timing affects karma recognition
- Waitlist auto-promotes when spots open
- No-show status assigned if no check-in by event end
- Event organizers can manually override RSVP status
- Team RSVPs count toward capacity based on confirmed individual members
- Cancelled team events release venues back to the availability pool

---

### 6. Community Contributions (Karma)

#### Overview
A dual karma system that celebrates positive community participation through both **global** and **group-based** scores. The system focuses on recognizing contributions rather than punishing mistakes.

#### Dual Karma System

Users have **two types of karma scores**:

##### Global Karma
- Platform-wide reputation score
- Reflects overall community contribution across all groups
- Used for platform-level privileges and recognition
- Starting score: **100.0**

##### Group Karma
- Separate karma score for each group the user belongs to
- Reflects contribution within that specific community
- Used for group-level RSVP priority and recognition
- Starting score: **100.0** per group
- Groups can have different karma rules and values

#### Default Karma Values (Customizable)

##### Positive Contributions (+Karma)
| Action | Default Points | Notes |
|--------|----------------|-------|
| On-time check-in | +2 | Within check-in window |
| Early arrival | +1 | Bonus for being early |
| Bringing food/snacks | +5 | Sharing with the community |
| Bringing gear/supplies | +3 | Community contribution |
| Helping with setup/cleanup | +2-5 | Varies by effort |
| Positive peer recognition | +1-3 | From other members |

##### Areas for Improvement (-Karma)
| Action | Default Points | Notes |
|--------|----------------|-------|
| No-show (RSVP'd but didn't attend) | -100 | Significant impact on others |
| Late (per minute) | -1 | Configurable per group |
| Late cancellation (<24h) | -5 | Reduces to -2 if >24h notice |
| Aggressive behavior | -5 to -20 | Per moderation review |

#### Customizable Karma System

**Moderators can configure karma point values for their group:**

##### How It Works
- Group owners/admins can customize point values for any action
- Each group can have its own karma rules tailored to their community
- Custom actions can be created beyond the defaults

##### Example Configurations

**Casual Sports Group:**
```
+5  Bringing snacks/drinks
+2  On-time arrival
+1  Positive attitude recognition
-10 No-show without notice
```

**Competitive League:**
```
+10 MVP recognition
+5  Perfect attendance streak
+3  Bringing required equipment
-1  Per minute late
-50 Game day no-show
```

**Study Group:**
```
+5  Sharing study materials
+3  Helping other members
+2  Showing up prepared
-5  Late cancellation
```

#### Karma Thresholds

| Score Range | Status | Effects |
|-------------|--------|---------|
| 120+ | ⭐ Outstanding Contributor | Priority RSVP, trusted member recognition |
| 100-119 | ✅ Active Contributor | Standard member |
| 70-99 | 📈 Building Reputation | Encouraged to participate more |
| 50-69 | 🔶 Needs Engagement | Guided support offered |
| <50 | 🔴 Review Needed | Community check-in and support |

#### Audit Trail
Every karma change is logged in the `ScoreHistory` table:
- Timestamp
- Previous score
- New score
- Delta (+/-)
- Reason/description
- Related entity (event, user, group, etc.)
- Score type (global or group-specific)

#### Business Rules
- Karma changes are immutable (logged, not editable)
- Admins can award karma with documented reasons to recognize contributions
- Automated karma changes occur after event completion
- Users can view their karma history for both global and per-group scores
- Score decay may apply for inactive users (configurable)
- Group karma configurations are managed by group owners/admins
- Default values are used if no custom configuration is set

---

### 7. Moderation

#### Overview
Multi-level moderation system with platform-wide and group-specific controls.

#### Moderation Levels

##### Platform-Level Moderation
- **Platform Admins** have global control
- Can ban users from entire platform
- Handle cross-group disputes
- Manage platform-wide policies

##### Group-Level Moderation
- **Group Owners/Admins** manage their groups
- Can ban users from specific groups
- Handle intra-group disputes
- Set group-specific rules

#### Ban Types

| Type | Scope | Applied By |
|------|-------|------------|
| Platform Ban | All groups, all events | Platform Admin |
| Group Ban | Single group only | Group Owner/Admin |
| Event Ban | Single event only | Event Organizer |

#### Moderation Actions
- Issue warnings
- Temporary suspensions
- Karma penalties
- Permanent bans
- Escalation to platform level

#### Business Rules
- All moderation actions are logged
- Users can appeal bans through designated process
- Platform bans override all group memberships
- Group bans don't affect other group memberships
- Cooling-off periods before ban appeals are heard

---

## Design System

### Brand Identity

#### Tone & Feel
- **Bright** - Optimistic, energetic
- **Warm** - Welcoming, friendly
- **Positive** - Encouraging, supportive
- **Community-Focused** - Inclusive, collaborative

### Color Palette

#### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Amber | `#F59E0B` | Primary actions, highlights |
| Orange | `#EA580C` | CTAs, important elements |
| Warm Yellow | `#FBBF24` | Accents, success states |

#### Neutral Colors
| Color | Hex | Usage |
|-------|-----|-------|
| White | `#FFFFFF` | Backgrounds |
| Warm Cream | `#FFFBEB` | Cards, secondary backgrounds |
| Warm Gray | `#78716C` | Text, subtle elements |
| Dark | `#1C1917` | Primary text |

#### Semantic Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Success | `#22C55E` | Confirmations, positive karma |
| Warning | `#F59E0B` | Alerts, cautions |
| Error | `#EF4444` | Errors, negative karma |
| Info | `#3B82F6` | Information, links |

### UI Components

#### Cards
- Soft shadows (`shadow-md` or `box-shadow: 0 4px 6px rgba(0,0,0,0.1)`)
- Rounded corners (`border-radius: 12px`)
- White or cream backgrounds
- Subtle hover elevation

#### Buttons
- **Primary**: Gradient from amber to orange
- **Secondary**: White with amber border
- **Ghost**: Transparent with text color
- Hover effects with slight scale and shadow
- Rounded corners (`border-radius: 8px`)

#### Forms
- Rounded input fields
- Warm focus states (amber outline)
- Clear validation feedback
- Consistent label styling

### Typography

#### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
```

#### Scale
| Element | Size | Weight |
|---------|------|--------|
| H1 | 2.5rem | Bold (700) |
| H2 | 2rem | Bold (700) |
| H3 | 1.5rem | Semi-bold (600) |
| H4 | 1.25rem | Semi-bold (600) |
| Body | 1rem | Normal (400) |
| Small | 0.875rem | Normal (400) |

### Iconography
- Consistent stroke width
- Rounded line caps
- Warm color when highlighted
- Gray when inactive

### Motion & Animation
- Subtle transitions (200-300ms)
- Ease-out timing function
- Hover state animations
- Loading spinners in brand colors

---

## Tech Stack & Constraints

### Frontend
| Technology | Purpose |
|------------|---------|
| [Qwik JS](https://qwik.dev/) | UI framework (Resumability & Signals) |
| TypeScript | Type safety |
| CSS/Tailwind | Styling |

### Backend / Edge
| Technology | Purpose |
|------------|---------|
| [Cloudflare Pages](https://pages.cloudflare.com/) | Static hosting & SSR |
| [Cloudflare Workers](https://workers.cloudflare.com/) | Edge compute |
| [Cloudflare D1](https://developers.cloudflare.com/d1/) | SQLite database |

### ORM & Data
| Technology | Purpose |
|------------|---------|
| [Drizzle ORM](https://orm.drizzle.team/) | Type-safe database queries |
| SQLite | Database engine (via D1) |

### Integrations
| Service | Purpose |
|---------|---------|
| Google Calendar API | Event sync |
| Geolocation API | Check-in verification |

### Constraints & Considerations

#### Scale Constraints
- Designed for ~1,000 users
- SQLite/D1 suitable for this scale
- Edge-first architecture for performance

#### Performance Goals
- First contentful paint < 1.5s
- Time to interactive < 2.5s
- Lighthouse score > 90

#### Browser Support
- Modern evergreen browsers
- Mobile-first responsive design
- Progressive enhancement

---

## Implementation Status

> 📋 **Legend:**
> - ✅ Complete
> - 🚧 In Progress
> - 📋 Planned
> - ❌ Not Started

### Core Infrastructure
| Component | Status | Notes |
|-----------|--------|-------|
| Project Setup | ✅ | Qwik, Cloudflare, Drizzle configured |
| Database Schema | 📋 | Design complete, implementation pending |
| Authentication | ❌ | |
| API Routes | ❌ | |

### Feature 1: Auth & Profiles
| Component | Status | Notes |
|-----------|--------|-------|
| Invite System | ❌ | |
| User Registration | ❌ | |
| Profile Management | ❌ | |
| Invite Chain Tracking | ❌ | |

### Feature 2: Groups & Roles
| Component | Status | Notes |
|-----------|--------|-------|
| Group CRUD | ❌ | |
| Multiple Owners | ❌ | Support for shared group leadership |
| Role Management | ❌ | |
| Visibility Settings | ❌ | |
| Teams/Sub-groups | ❌ | Sub-group creation within groups |
| Algorithm Team Formation | ❌ | Skill/position-based team balancing |

### Feature 3: Locations
| Component | Status | Notes |
|-----------|--------|-------|
| Location Registry | ❌ | |
| Reservation System | ❌ | |
| Calendar Privacy | ❌ | |

### Feature 4: Events
| Component | Status | Notes |
|-----------|--------|-------|
| Event CRUD | ❌ | |
| Geolocation Check-in | ❌ | |
| Google Calendar Sync | ❌ | |

### Feature 5: RSVP
| Component | Status | Notes |
|-----------|--------|-------|
| Basic RSVP | ❌ | |
| Waitlist | ❌ | |
| Priority Algorithm | ❌ | |
| Team/Group RSVP | ❌ | Teams can RSVP as a unit |
| Cancellation Visibility | ❌ | Freed venues visible to others |

### Feature 6: Karma
| Component | Status | Notes |
|-----------|--------|-------|
| Global Score Tracking | ❌ | Platform-wide karma |
| Group Score Tracking | ❌ | Per-group karma scores |
| Karma Modifiers | ❌ | |
| Customizable Point Values | ❌ | Moderator-configurable points |
| History/Audit | ❌ | |

### Feature 7: Moderation
| Component | Status | Notes |
|-----------|--------|-------|
| Platform Moderation | ❌ | |
| Group Moderation | ❌ | |
| Ban System | ❌ | |

---

## Contributing to This Document

This is a **living document**. When making changes:

1. Update the "Last Updated" date at the top
2. Add implementation notes as features are built
3. Document any deviations from original spec with reasoning
4. Keep the status table current

---

*Built with ❤️ for communities who herd cats together.*
