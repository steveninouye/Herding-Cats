import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { users } from "~/db/schema";

export const useInviteData = routeLoader$(async (requestEvent) => {
  const token = requestEvent.params.token;
  const env = requestEvent.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);

  const invitedUser = await db
    .select({
      email: users.email,
      inviteStatus: users.inviteStatus,
      invitedBy: users.invitedBy,
    })
    .from(users)
    .where(eq(users.inviteToken, token))
    .get();

  if (!invitedUser) {
    return { valid: false, error: "Invalid invite link" };
  }

  if (invitedUser.inviteStatus === "accepted") {
    return { valid: false, error: "This invite has already been used" };
  }

  if (invitedUser.inviteStatus === "revoked") {
    return { valid: false, error: "This invite has been revoked" };
  }

  return {
    valid: true,
    email: invitedUser.email,
    token,
  };
});

export default component$(() => {
  const invite = useInviteData();

  if (!invite.value.valid) {
    return (
      <div class="invite-error">
        <h3>Invite Invalid</h3>
        <p>{invite.value.error}</p>
      </div>
    );
  }

  return (
    <div class="invite-page">
      <h3>You've been invited to Herding Cats! 🐈</h3>
      <p>
        An invite was sent to <strong>{invite.value.email}</strong>.
      </p>
      <a href={`/signup?token=${invite.value.token}`} class="btn-primary">
        Accept Invite & Sign Up
      </a>
    </div>
  );
});

export const head: DocumentHead = {
  title: "You're Invited — Herding Cats",
};