import { server$ } from "@builder.io/qwik-city";
import { eq, and } from "drizzle-orm";
import { getDb } from "~/db";
import { users } from "~/db/schema";
import { generateInviteToken } from "./crypto";

/**
 * Create an invite — generates a token and inserts a pending user row.
 * Only existing, active users can invite.
 */
export const createInvite = server$(async function (email: string) {
  const env = this.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);

  // 1. Get the inviter from session (we'll wire this up with auth later)
  //    For now, pass inviterId as a param or pull from cookie/session
  const inviterId = this.cookie.get("userId")?.value;
  if (!inviterId) {
    return { success: false, error: "Not authenticated" };
  }

  // 2. Verify inviter is a valid, active user
  const inviter = await db
    .select()
    .from(users)
    .where(and(eq(users.id, Number(inviterId)), eq(users.isActive, true)))
    .get();

  if (!inviter) {
    return { success: false, error: "Inviter not found or inactive" };
  }

  // 3. Check if email is already registered
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing && existing.inviteStatus === "accepted") {
    return { success: false, error: "User already exists" };
  }

  // 4. If there's already a pending invite for this email, revoke it
  if (existing && existing.inviteStatus === "pending") {
    await db
      .update(users)
      .set({ inviteStatus: "revoked" })
      .where(eq(users.id, existing.id));
  }

  // 5. Generate token and create pending user
  const token = generateInviteToken();

  await db.insert(users).values({
    email,
    displayName: email.split("@")[0], // placeholder until signup
    inviteToken: token,
    invitedBy: Number(inviterId),
    inviteStatus: "pending",
  });

  return {
    success: true,
    inviteToken: token,
    inviteLink: `/invite/${token}`,
  };
});

/**
 * Validate an invite token — used on the signup page to verify the token is legit.
 */
export const validateInviteToken = server$(async function (token: string) {
  const env = this.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);

  const invitedUser = await db
    .select()
    .from(users)
    .where(and(eq(users.inviteToken, token), eq(users.inviteStatus, "pending")))
    .get();

  if (!invitedUser) {
    return { valid: false, error: "Invalid or expired invite" };
  }

  return {
    valid: true,
    email: invitedUser.email,
    userId: invitedUser.id,
  };
});

/**
 * Revoke an invite — only the inviter or a platform admin can do this.
 */
export const revokeInvite = server$(async function (inviteUserId: number) {
  const env = this.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);

  const currentUserId = this.cookie.get("userId")?.value;
  if (!currentUserId) {
    return { success: false, error: "Not authenticated" };
  }

  // Get the invited user
  const invitedUser = await db
    .select()
    .from(users)
    .where(
      and(eq(users.id, inviteUserId), eq(users.inviteStatus, "pending"))
    )
    .get();

  if (!invitedUser) {
    return { success: false, error: "Invite not found or already used" };
  }

  // Check permission: must be the inviter or a platform admin
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(currentUserId)))
    .get();

  if (
    !currentUser ||
    (invitedUser.invitedBy !== Number(currentUserId) &&
      !currentUser.isPlatformAdmin)
  ) {
    return { success: false, error: "Not authorized to revoke this invite" };
  }

  await db
    .update(users)
    .set({ inviteStatus: "revoked" })
    .where(eq(users.id, inviteUserId));

  return { success: true };
});

/**
 * Accept an invite — called during signup to mark the invite as accepted.
 */
export const acceptInvite = server$(async function (token: string) {
  const env = this.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);

  const result = await db
    .update(users)
    .set({
      inviteStatus: "accepted",
      inviteToken: null, // clear the token after use
      updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
    })
    .where(
      and(eq(users.inviteToken, token), eq(users.inviteStatus, "pending"))
    );

  if (result.rowsAffected === 0) {
    return { success: false, error: "Invalid or already used invite" };
  }

  return { success: true };
});