import { component$, useSignal } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  zod$,
  z,
  Form,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { eq, and } from "drizzle-orm";
import { getDb } from "~/db";
import { users } from "~/db/schema";
import { hashPassword } from "~/lib/password";

/**
 * Validate the invite token from the query string on page load.
 */
export const useInviteCheck = routeLoader$(async (requestEvent) => {
  const token = requestEvent.url.searchParams.get("token");

  if (!token) {
    return { valid: false, error: "No invite token provided" };
  }

  const env = requestEvent.platform.env as { herding_cats_db: D1Database };
  const db = getDb(env.herding_cats_db);

  const invitedUser = await db
    .select({
      id: users.id,
      email: users.email,
      inviteStatus: users.inviteStatus,
    })
    .from(users)
    .where(and(eq(users.inviteToken, token), eq(users.inviteStatus, "pending")))
    .get();

  if (!invitedUser) {
    return { valid: false, error: "Invalid or expired invite token" };
  }

  return {
    valid: true,
    email: invitedUser.email,
    userId: invitedUser.id,
    token,
  };
});

/**
 * Signup action — validates input, hashes password, updates the user row.
 */
export const useSignup = routeAction$(
  async (data, requestEvent) => {
    const env = requestEvent.platform.env as { herding_cats_db: D1Database };
    const db = getDb(env.herding_cats_db);

    // 1. Validate the token again (prevent race conditions)
    const invitedUser = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.inviteToken, data.token),
          eq(users.inviteStatus, "pending")
        )
      )
      .get();

    if (!invitedUser) {
      return { success: false, error: "Invalid or expired invite token" };
    }

    // 2. Hash the password
    const passwordHashed = await hashPassword(data.password);

    // 3. Update the user row: set password, display name, mark as accepted
    await db
      .update(users)
      .set({
        displayName: data.displayName,
        passwordHash: passwordHashed,
        inviteStatus: "accepted",
        inviteToken: null, // clear token after use
        updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      })
      .where(eq(users.id, invitedUser.id));

    // 4. Set a session cookie (simple userId for now — replace with JWT later)
    requestEvent.cookie.set("userId", String(invitedUser.id), {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 5. Redirect to home/dashboard
    throw requestEvent.redirect(302, "/");
  },
  zod$({
    token: z.string().min(1),
    displayName: z
      .string()
      .min(2, "Display name must be at least 2 characters")
      .max(50),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string(),
  })
);

export default component$(() => {
  const invite = useInviteCheck();
  const signupAction = useSignup();
  const showPassword = useSignal(false);

  if (!invite.value.valid) {
    return (
      <div class="signup-error">
        <h3>Cannot Sign Up</h3>
        <p>{invite.value.error}</p>
        <p>You need a valid invite link to join Herding Cats.</p>
      </div>
    );
  }

  return (
    <div class="signup-page">
      <h3>Join Herding Cats 🐈</h3>
      <p>
        Signing up as <strong>{invite.value.email}</strong>
      </p>

      <Form action={signupAction}>
        <input type="hidden" name="token" value={invite.value.token} />

        <div class="form-field">
          <label for="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            required
            minLength={2}
            maxLength={50}
            placeholder="What should we call you?"
          />
          {signupAction.value?.fieldErrors?.displayName && (
            <p class="error">{signupAction.value.fieldErrors.displayName}</p>
          )}
        </div>

        <div class="form-field">
          <label for="password">Password</label>
          <input
            type={showPassword.value ? "text" : "password"}
            id="password"
            name="password"
            required
            minLength={8}
            maxLength={128}
            placeholder="Min 8 characters"
          />
          {signupAction.value?.fieldErrors?.password && (
            <p class="error">{signupAction.value.fieldErrors.password}</p>
          )}
        </div>

        <div class="form-field">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type={showPassword.value ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            required
          />
        </div>

        <label class="show-password">
          <input
            type="checkbox"
            bind:checked={showPassword}
          />
          Show passwords
        </label>

        {signupAction.value?.error && (
          <p class="error">{signupAction.value.error}</p>
        )}

        <button type="submit">Create Account</button>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Sign Up — Herding Cats",
};