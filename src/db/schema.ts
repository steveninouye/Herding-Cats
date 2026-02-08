import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── USERS ───────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  inviteToken: text("invite_token").unique(), // for invite-only auth
  invitedBy: integer("invited_by").references(() => users.id),
  socialScore: real("social_score").notNull().default(100.0), // starting karma
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── GROUPS ──────────────────────────────────────────────
export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  maxMembers: integer("max_members").default(50),
  isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── GROUP MEMBERS (join table) ──────────────────────────
export const groupMembers = sqliteTable("group_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role", { enum: ["owner", "admin", "member"] })
    .notNull()
    .default("member"),
  joinedAt: text("joined_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── EVENTS ──────────────────────────────────────────────
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: text("start_time").notNull(), // ISO 8601 string
  endTime: text("end_time"),
  maxAttendees: integer("max_attendees").notNull(), // hard cap (e.g., 24)
  googleCalendarEventId: text("google_calendar_event_id"), // Google Calendar sync
  status: text("status", { enum: ["draft", "open", "closed", "cancelled"] })
    .notNull()
    .default("open"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── RSVPs (The Priority Queue) ──────────────────────────
export const rsvps = sqliteTable("rsvps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  rsvpTime: text("rsvp_time") // actual RSVP timestamp
    .notNull()
    .default(sql`(datetime('now'))`),
  effectiveTime: text("effective_time").notNull(), // calculated: rsvpTime + penalty
  socialScoreAtRsvp: real("social_score_at_rsvp").notNull(), // snapshot
  status: text("status", {
    enum: ["confirmed", "waitlisted", "cancelled", "no_show"],
  })
    .notNull()
    .default("waitlisted"),
  checkedIn: integer("checked_in", { mode: "boolean" }).notNull().default(false),
  checkedInAt: text("checked_in_at"),
});

// ─── SOCIAL SCORE HISTORY (audit trail) ──────────────────
export const scoreHistory = sqliteTable("score_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  eventId: integer("event_id").references(() => events.id), // nullable for non-event adjustments
  delta: real("delta").notNull(), // +5, -10, etc.
  reason: text("reason", {
    enum: [
      "on_time",
      "late_arrival",
      "no_show",
      "early_cancel",
      "late_cancel",
      "brought_gear",
      "helped_out",
      "aggression",
      "manual_adjustment",
    ],
  }).notNull(),
  newScore: real("new_score").notNull(), // score after applying delta
  createdBy: integer("created_by").references(() => users.id), // who issued it (admin/system)
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});