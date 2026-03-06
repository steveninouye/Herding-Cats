// src/server/rsvps.ts
import { eq, and, count, asc, gt, sql } from "drizzle-orm";
import { type AppDatabase } from "~/db";
import { rsvps, events, groupMembers, users, rsvpHistory } from "~/db/schema";

// ─── RSVP to an event ────────────────────────────────────
export async function rsvpToEvent(
  db: AppDatabase,
  eventId: number,
  userId: number
): Promise<{ success: boolean; error?: string; status?: string; waitlistPosition?: number | null }> {
  // Get event
  const event = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .get();

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  if (event.status !== "open") {
    return { success: false, error: "Event is not open for RSVPs" };
  }

  // Check user is member of the group
  const membership = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, event.groupId),
        eq(groupMembers.userId, userId),
        eq(groupMembers.isBanned, false)
      )
    )
    .get();

  if (!membership) {
    return { success: false, error: "You must be a group member to RSVP" };
  }

  // Check not already RSVP'd (confirmed or waitlisted)
  const existing = await db
    .select({ id: rsvps.id, status: rsvps.status })
    .from(rsvps)
    .where(
      and(
        eq(rsvps.eventId, eventId),
        eq(rsvps.userId, userId)
      )
    )
    .get();

  if (existing && (existing.status === "confirmed" || existing.status === "waitlisted")) {
    return { success: false, error: "You have already RSVP'd to this event" };
  }

  // Count confirmed
  const confirmedResult = await db
    .select({ count: count() })
    .from(rsvps)
    .where(and(eq(rsvps.eventId, eventId), eq(rsvps.status, "confirmed")))
    .get();

  const confirmedCount = confirmedResult?.count ?? 0;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  // Get user's social score for effective time calc
  const user = await db
    .select({ socialScore: users.socialScore })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  const socialScore = user?.socialScore ?? 100.0;

  if (confirmedCount < event.maxAttendees) {
    // Confirmed!
    const result = await db
      .insert(rsvps)
      .values({
        eventId,
        userId,
        rsvpTime: now,
        effectiveTime: now,
        socialScoreAtRsvp: socialScore,
        status: "confirmed",
        waitlistPosition: null,
      })
      .returning();

    // Audit trail
    await db.insert(rsvpHistory).values({
      rsvpId: result[0].id,
      eventId,
      userId,
      action: "rsvp_created",
      fromStatus: null,
      toStatus: "confirmed",
    });

    return { success: true, status: "confirmed", waitlistPosition: null };
  } else {
    // Waitlisted — find next position
    const maxPos = await db
      .select({ maxPos: sql<number>`COALESCE(MAX(${rsvps.waitlistPosition}), 0)` })
      .from(rsvps)
      .where(and(eq(rsvps.eventId, eventId), eq(rsvps.status, "waitlisted")))
      .get();

    const nextPosition = (maxPos?.maxPos ?? 0) + 1;

    const result = await db
      .insert(rsvps)
      .values({
        eventId,
        userId,
        rsvpTime: now,
        effectiveTime: now,
        socialScoreAtRsvp: socialScore,
        status: "waitlisted",
        waitlistPosition: nextPosition,
      })
      .returning();

    // Audit trail
    await db.insert(rsvpHistory).values({
      rsvpId: result[0].id,
      eventId,
      userId,
      action: "rsvp_created",
      fromStatus: null,
      toStatus: "waitlisted",
    });

    return { success: true, status: "waitlisted", waitlistPosition: nextPosition };
  }
}

// ─── Cancel RSVP ─────────────────────────────────────────
export async function cancelRSVP(
  db: AppDatabase,
  eventId: number,
  userId: number
): Promise<{ success: boolean; error?: string; promoted?: string }> {
  const userRsvp = await db
    .select()
    .from(rsvps)
    .where(
      and(
        eq(rsvps.eventId, eventId),
        eq(rsvps.userId, userId)
      )
    )
    .get();

  if (!userRsvp || (userRsvp.status !== "confirmed" && userRsvp.status !== "waitlisted")) {
    return { success: false, error: "No active RSVP found" };
  }

  const wasConfirmed = userRsvp.status === "confirmed";
  const wasWaitlistPos = userRsvp.waitlistPosition;

  // Audit trail
  await db.insert(rsvpHistory).values({
    rsvpId: userRsvp.id,
    eventId,
    userId,
    action: "rsvp_cancelled",
    fromStatus: userRsvp.status,
    toStatus: "cancelled",
  });

  // Update status to cancelled
  await db
    .update(rsvps)
    .set({ status: "cancelled", waitlistPosition: null })
    .where(eq(rsvps.id, userRsvp.id));

  let promotedName: string | undefined;

  if (wasConfirmed) {
    // Promote first waitlisted person
    const firstWaitlisted = await db
      .select({
        id: rsvps.id,
        userId: rsvps.userId,
        waitlistPosition: rsvps.waitlistPosition,
      })
      .from(rsvps)
      .where(
        and(eq(rsvps.eventId, eventId), eq(rsvps.status, "waitlisted"))
      )
      .orderBy(asc(rsvps.waitlistPosition))
      .limit(1)
      .get() as { id: number; userId: number; waitlistPosition: number | null } | undefined;

    if (firstWaitlisted) {
      // Promote to confirmed
      await db
        .update(rsvps)
        .set({ status: "confirmed", waitlistPosition: null })
        .where(eq(rsvps.id, firstWaitlisted.id));

      // Audit
      await db.insert(rsvpHistory).values({
        rsvpId: firstWaitlisted.id,
        eventId,
        userId: firstWaitlisted.userId,
        action: "status_changed",
        fromStatus: "waitlisted",
        toStatus: "confirmed",
      });

      // Decrement all remaining waitlist positions
      await db.run(
        sql`UPDATE rsvps SET waitlist_position = waitlist_position - 1
            WHERE event_id = ${eventId}
            AND status = 'waitlisted'
            AND waitlist_position IS NOT NULL`
      );

      // Get promoted user's name
      const promotedUser = await db
        .select({ displayName: users.displayName })
        .from(users)
        .where(eq(users.id, firstWaitlisted.userId))
        .get();

      promotedName = promotedUser?.displayName;
    }
  } else {
    // Was waitlisted — decrement positions after this one
    if (wasWaitlistPos !== null && wasWaitlistPos !== undefined) {
      await db.run(
        sql`UPDATE rsvps SET waitlist_position = waitlist_position - 1
            WHERE event_id = ${eventId}
            AND status = 'waitlisted'
            AND waitlist_position > ${wasWaitlistPos}`
      );
    }
  }

  return { success: true, promoted: promotedName };
}
