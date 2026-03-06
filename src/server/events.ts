// src/server/events.ts
import { eq, and, count } from "drizzle-orm";
import { type AppDatabase } from "~/db";
import { events, rsvps, groupMembers, users } from "~/db/schema";

// ─── Create a new event ──────────────────────────────────
export async function createEvent(
  db: AppDatabase,
  data: {
    groupId: number;
    title: string;
    description?: string;
    locationName: string;
    startTime: string; // ISO datetime string
    endTime?: string;
    maxAttendees?: number;
  },
  userId: number
): Promise<{ success: boolean; error?: string; eventId?: number }> {
  // Check user is owner or admin of the group
  const membership = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, data.groupId),
        eq(groupMembers.userId, userId),
        eq(groupMembers.isBanned, false)
      )
    )
    .get();

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return { success: false, error: "Only group owners and admins can create events" };
  }

  const result = await db
    .insert(events)
    .values({
      groupId: data.groupId,
      createdBy: userId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      locationName: data.locationName.trim(),
      startTime: data.startTime,
      endTime: data.endTime || null,
      maxAttendees: data.maxAttendees ?? 24,
      status: "open",
    })
    .returning();

  return { success: true, eventId: result[0].id };
}

// ─── Get event detail ────────────────────────────────────
export async function getEventDetail(
  db: AppDatabase,
  eventId: number,
  userId: number
) {
  const event = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .get();

  if (!event) return null;

  // Check user is member of the event's group
  const membership = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, event.groupId),
        eq(groupMembers.userId, userId),
        eq(groupMembers.isBanned, false)
      )
    )
    .get();

  if (!membership) return null;

  // Get confirmed RSVPs
  const confirmed = await db
    .select({
      userId: rsvps.userId,
      displayName: users.displayName,
      rsvpTime: rsvps.rsvpTime,
    })
    .from(rsvps)
    .innerJoin(users, eq(rsvps.userId, users.id))
    .where(and(eq(rsvps.eventId, eventId), eq(rsvps.status, "confirmed")));

  // Get waitlisted RSVPs (ordered by position)
  const waitlisted = await db
    .select({
      userId: rsvps.userId,
      displayName: users.displayName,
      waitlistPosition: rsvps.waitlistPosition,
      rsvpTime: rsvps.rsvpTime,
    })
    .from(rsvps)
    .innerJoin(users, eq(rsvps.userId, users.id))
    .where(and(eq(rsvps.eventId, eventId), eq(rsvps.status, "waitlisted")));

  // Sort waitlist by position
  waitlisted.sort((a, b) => (a.waitlistPosition ?? 0) - (b.waitlistPosition ?? 0));

  // Get user's RSVP
  const userRsvp = await db
    .select({
      id: rsvps.id,
      status: rsvps.status,
      waitlistPosition: rsvps.waitlistPosition,
    })
    .from(rsvps)
    .where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, userId)))
    .get();

  return {
    ...event,
    userRole: membership.role,
    confirmed,
    waitlisted,
    confirmedCount: confirmed.length,
    waitlistedCount: waitlisted.length,
    userRsvp: userRsvp ?? null,
  };
}

// ─── Get upcoming events for a user across all groups ────
export async function getUpcomingEventsForUser(
  db: AppDatabase,
  userId: number
) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  // Get all groups user belongs to
  const userGroups = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.userId, userId),
        eq(groupMembers.isBanned, false)
      )
    );

  if (userGroups.length === 0) return [];

  const groupIds = userGroups.map((g) => g.groupId);

  // Get all open events from those groups
  const allEvents = await db.select().from(events).where(eq(events.status, "open"));

  const futureEvents = allEvents.filter(
    (e) => groupIds.includes(e.groupId) && e.startTime > now
  );

  // Enrich with RSVP data
  const enriched = await Promise.all(
    futureEvents.map(async (e) => {
      const confirmedCount = await db
        .select({ count: count() })
        .from(rsvps)
        .where(and(eq(rsvps.eventId, e.id), eq(rsvps.status, "confirmed")))
        .get();

      const userRsvp = await db
        .select({ status: rsvps.status, waitlistPosition: rsvps.waitlistPosition })
        .from(rsvps)
        .where(and(eq(rsvps.eventId, e.id), eq(rsvps.userId, userId)))
        .get();

      return {
        ...e,
        confirmedCount: confirmedCount?.count ?? 0,
        userStatus: userRsvp?.status ?? null,
        waitlistPosition: userRsvp?.waitlistPosition ?? null,
      };
    })
  );

  enriched.sort((a, b) => a.startTime.localeCompare(b.startTime));
  return enriched;
}
