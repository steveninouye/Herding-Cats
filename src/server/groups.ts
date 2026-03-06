// src/server/groups.ts
import { eq, and, sql, count } from "drizzle-orm";
import { getDb, type AppDatabase } from "~/db";
import { groups, groupMembers, users, events, rsvps } from "~/db/schema";
import { generateInviteCode } from "~/lib/invite";

// ─── Create a new group ──────────────────────────────────
export async function createGroup(
  db: AppDatabase,
  data: { name: string; description?: string },
  userId: number
) {
  // Generate unique invite code (retry on collision)
  let inviteCode = generateInviteCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await db
      .select({ id: groups.id })
      .from(groups)
      .where(eq(groups.inviteCode, inviteCode))
      .get();
    if (!existing) break;
    inviteCode = generateInviteCode();
    attempts++;
  }

  // Insert group
  const result = await db
    .insert(groups)
    .values({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      inviteCode,
      createdBy: userId,
    })
    .returning();

  const group = result[0];

  // Add creator as owner
  await db.insert(groupMembers).values({
    groupId: group.id,
    userId,
    role: "owner",
  });

  return group;
}

// ─── Join a group by invite code ─────────────────────────
export async function joinGroupByCode(
  db: AppDatabase,
  inviteCode: string,
  userId: number
): Promise<{ success: boolean; error?: string; groupId?: number }> {
  const group = await db
    .select({ id: groups.id })
    .from(groups)
    .where(eq(groups.inviteCode, inviteCode.toUpperCase().trim()))
    .get();

  if (!group) {
    return { success: false, error: "Invalid invite code" };
  }

  // Check if already a member
  const existing = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, group.id),
        eq(groupMembers.userId, userId)
      )
    )
    .get();

  if (existing) {
    return { success: false, error: "You are already a member of this group" };
  }

  await db.insert(groupMembers).values({
    groupId: group.id,
    userId,
    role: "member",
  });

  return { success: true, groupId: group.id };
}

// ─── Get all groups for a user ───────────────────────────
export async function getUserGroups(db: AppDatabase, userId: number) {
  const results = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      inviteCode: groups.inviteCode,
      createdBy: groups.createdBy,
      visibility: groups.visibility,
      createdAt: groups.createdAt,
      role: groupMembers.role,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(
      and(
        eq(groupMembers.userId, userId),
        eq(groupMembers.isBanned, false)
      )
    );

  // Get member counts for each group
  const groupsWithCounts = await Promise.all(
    results.map(async (g) => {
      const memberCount = await db
        .select({ count: count() })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, g.id),
            eq(groupMembers.isBanned, false)
          )
        )
        .get();

      return {
        ...g,
        memberCount: memberCount?.count ?? 0,
      };
    })
  );

  return groupsWithCounts;
}

// ─── Get group detail by ID ─────────────────────────────
export async function getGroupDetail(
  db: AppDatabase,
  groupId: number,
  userId: number
) {
  // Check membership
  const membership = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId),
        eq(groupMembers.isBanned, false)
      )
    )
    .get();

  if (!membership) return null;

  // Get group
  const group = await db
    .select()
    .from(groups)
    .where(eq(groups.id, groupId))
    .get();

  if (!group) return null;

  // Get members
  const members = await db
    .select({
      userId: groupMembers.userId,
      role: groupMembers.role,
      displayName: users.displayName,
      groupDisplayName: groupMembers.groupDisplayName,
      joinedAt: groupMembers.joinedAt,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.isBanned, false)
      )
    );

  // Get upcoming events
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const upcomingEvents = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.groupId, groupId),
        eq(events.status, "open")
      )
    );

  // Filter to future events and get RSVP counts
  const eventsWithCounts = await Promise.all(
    upcomingEvents
      .filter((e) => e.startTime > now)
      .map(async (e) => {
        const confirmedCount = await db
          .select({ count: count() })
          .from(rsvps)
          .where(
            and(eq(rsvps.eventId, e.id), eq(rsvps.status, "confirmed"))
          )
          .get();

        // Get user's RSVP status
        const userRsvp = await db
          .select({ status: rsvps.status, waitlistPosition: rsvps.waitlistPosition })
          .from(rsvps)
          .where(
            and(eq(rsvps.eventId, e.id), eq(rsvps.userId, userId))
          )
          .get();

        return {
          ...e,
          confirmedCount: confirmedCount?.count ?? 0,
          userStatus: userRsvp?.status ?? null,
          waitlistPosition: userRsvp?.waitlistPosition ?? null,
        };
      })
  );

  // Sort by startTime
  eventsWithCounts.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    ...group,
    userRole: membership.role,
    members,
    memberCount: members.length,
    upcomingEvents: eventsWithCounts,
  };
}
