import { sqliteTable, text, integer, real, AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── USERS ───────────────────────────────────────────────
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    passwordHash: text("password_hash"),
    inviteToken: text("invite_token").unique(),
    invitedBy: integer("invited_by").references((): AnySQLiteColumn => users.id),
    inviteStatus: text("invite_status", {
        enum: ["pending", "accepted", "revoked"],
    })
        .notNull()
        .default("pending"),
    socialScore: real("social_score").notNull().default(100.0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    // ─── Platform-level ban (Herding Cats admins only) ───
    isPlatformBanned: integer("is_platform_banned", { mode: "boolean" })
        .notNull()
        .default(false),
    platformBannedAt: text("platform_banned_at"),
    platformBannedBy: integer("platform_banned_by").references((): AnySQLiteColumn => users.id),
    platformBanReason: text("platform_ban_reason"),
    // ─── Platform admin flag ───
    isPlatformAdmin: integer("is_platform_admin", { mode: "boolean" })
        .notNull()
        .default(false),
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
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),
    visibility: text("visibility", {
        enum: ["private", "visible", "public"],
    })
        .notNull()
        .default("private"),
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
    groupDisplayName: text("group_display_name"),
    // ─── Group-level ban (group admins/owners) ───
    isBanned: integer("is_banned", { mode: "boolean" }).notNull().default(false),
    bannedAt: text("banned_at"),
    bannedBy: integer("banned_by").references(() => users.id),
    banReason: text("ban_reason"),
    joinedAt: text("joined_at")
        .notNull()
        .default(sql`(datetime('now'))`),
});

// ─── LOCATIONS (venues) ──────────────────────────────────
export const locations = sqliteTable("locations", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),                    // "Google Soccer Field A"
    address: text("address"),
    lat: real("lat"),
    lng: real("lng"),
    checkInRadius: integer("check_in_radius").default(100), // meters
    description: text("description"),
    createdBy: integer("created_by")
        .notNull()
        .references(() => users.id),
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),
});

// ─── LOCATION MANAGERS ───────────────────────────────────
export const locationManagers = sqliteTable("location_managers", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    locationId: integer("location_id")
        .notNull()
        .references(() => locations.id),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    role: text("role", { enum: ["owner", "manager"] })
        .notNull()
        .default("manager"),
    createdAt: text("created_at")
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
    locationId: integer("location_id").references(() => locations.id),
    locationName: text("location_name"),
    locationLat: real("location_lat"),
    locationLng: real("location_lng"),
    checkInRadius: integer("check_in_radius").default(100),
    calendarVisibility: text("calendar_visibility", {
        enum: ["public", "private", "hidden"],
    })
        .notNull()
        .default("public"),
    startTime: text("start_time").notNull(),
    endTime: text("end_time"),
    maxAttendees: integer("max_attendees").notNull(),
    googleCalendarEventId: text("google_calendar_event_id"),
    status: text("status", { enum: ["draft", "open", "closed", "cancelled"] })
        .notNull()
        .default("open"),
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),
    visibility: text("visibility", {
        enum: ["private", "visible", "public"],
    })
        .notNull()
        .default("private"),
});

// ─── RESERVATIONS (location booking requests) ────────────
export const reservations = sqliteTable("reservations", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    locationId: integer("location_id")
        .notNull()
        .references(() => locations.id),
    eventId: integer("event_id").references(() => events.id), // linked after approval
    requestedBy: integer("requested_by")
        .notNull()
        .references(() => users.id),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    status: text("status", {
        enum: ["pending", "approved", "rejected", "cancelled"],
    })
        .notNull()
        .default("pending"),
    // ─── Pricing ───
    fee: real("fee").default(0),                     // 0 = free
    isPaid: integer("is_paid", { mode: "boolean" }).notNull().default(false),
    // ─── Approval tracking ───
    reviewedBy: integer("reviewed_by").references(() => users.id),
    reviewedAt: text("reviewed_at"),
    rejectionReason: text("rejection_reason"),
    message: text("message"),                        // note from requester
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),
});

// ─── RSVPs (current state) ──────────────────────────────
export const rsvps = sqliteTable("rsvps", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id")
        .notNull()
        .references(() => events.id),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    rsvpTime: text("rsvp_time")
        .notNull()
        .default(sql`(datetime('now'))`),
    effectiveTime: text("effective_time").notNull(),
    socialScoreAtRsvp: real("social_score_at_rsvp").notNull(),
    status: text("status", {
        enum: ["confirmed", "waitlisted", "cancelled", "no_show"],
    })
        .notNull()
        .default("waitlisted"),
    checkedIn: integer("checked_in", { mode: "boolean" }).notNull().default(false),
    checkedInAt: text("checked_in_at"),
});

// ─── RSVP HISTORY (audit trail for every RSVP change) ───
export const rsvpHistory = sqliteTable("rsvp_history", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    rsvpId: integer("rsvp_id")
        .notNull()
        .references(() => rsvps.id),
    eventId: integer("event_id")
        .notNull()
        .references(() => events.id),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    action: text("action", {
        enum: ["rsvp_created", "rsvp_cancelled", "status_changed", "checked_in"],
    }).notNull(),
    fromStatus: text("from_status"), // nullable — null on first creation
    toStatus: text("to_status").notNull(),
    // ─── Timing context for karma decisions ───
    minutesBeforeEvent: integer("minutes_before_event"), // how far out the action happened
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),
});

// ─── SOCIAL SCORE HISTORY (karma audit trail) ────────────
export const scoreHistory = sqliteTable("score_history", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    eventId: integer("event_id").references(() => events.id),
    delta: real("delta").notNull(),
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
    newScore: real("new_score").notNull(),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),
});

// ─── JOIN REQUESTS (group & event approval workflow) ─────
export const joinRequests = sqliteTable("join_requests", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    groupId: integer("group_id").references(() => groups.id),
    eventId: integer("event_id").references(() => events.id),
    type: text("type", { enum: ["group", "event"] }).notNull(),
    status: text("status", {
        enum: ["pending", "approved", "rejected"],
    })
        .notNull()
        .default("pending"),
    reviewedBy: integer("reviewed_by").references(() => users.id),
    reviewedAt: text("reviewed_at"),
    message: text("message"), // optional note from the requester
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),
});