# Herding Cats 🐈

Herding Cats is an invite-only event management platform designed to organize groups, manage events, and gamify user behavior to encourage reliability. Unlike traditional platforms, Herding Cats uses a "Social Score" system to prioritize active and reliable community members.

## 🚀 Core Features

### 1. Invite-Only Ecosystem
- **Invite Chain Tracking:** Every user is part of a lineage. The system tracks who invited whom to maintain community quality.
- **Lifecycle Management:** Invites move through `pending`, `accepted`, and `revoked` states.

### 2. The Social Score (Karma)
- **Starting Score:** Every new user begins with a score of **100.0**.
- **Gamified Reliability:** 
  - **Gain Points:** Punctuality, helping out, and bringing gear.
  - **Lose Points:** No-shows, late arrivals, or aggressive behavior.
- **Audit Trail:** Every change is logged in a `ScoreHistory` table with a reason and timestamp.

### 3. Smart RSVP & Waitlists
- **Hard Caps:** Strict limits on event attendance (e.g., 24-player limit).
- **Priority Algorithm:** The waitlist isn't just first-come, first-served. It uses an "Effective RSVP Timestamp":
  $$Effective\_Time = Actual\_RSVP\_Time + (Social\_Score \times Time\_Penalty\_Modifier)$$
- **Flake Protection:** Tracks `minutesBeforeEvent` for cancellations to penalize last-minute changes.

### 4. Roles & Permissions
- **Platform Admins:** Global control, including platform-level banning.
- **Group Owners/Admins:** Manage specific groups and can ban users locally.

## 🛠 Tech Stack

- **Frontend:** [Qwik JS](https://qwik.dev/) (Resumability & Signals)
- **Backend/Edge:** [Cloudflare Pages & Workers](https://pages.cloudflare.com/)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Integrations:** Google Calendar API

## 💻 Development

### Prerequisites
- MacOS (Recommended)
- Node.js & npm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for Cloudflare D1)

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/steveninouye/Herding-Cats.git
   cd Herding-Cats
   ```