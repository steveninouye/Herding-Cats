// src/routes/signup/index.tsx
import { component$, useSignal, useComputed$ } from "@builder.io/qwik";
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
import { setSession } from "~/lib/session";
import styles from "./signup.module.css";

/**
 * If the user is already logged in, redirect to home.
 */
export const useRedirectIfAuthed = routeLoader$(async (requestEvent) => {
  const token = requestEvent.cookie.get("session")?.value;
  if (token) {
    throw requestEvent.redirect(302, "/");
  }
  return {};
});

/**
 * Validate the invite token from the query string on page load.
 */
export const useInviteCheck = routeLoader$(async (requestEvent) => {
  const token = requestEvent.url.searchParams.get("token");

  if (!token) {
    return { valid: false as const, error: "No invite token provided" };
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
    return { valid: false as const, error: "Invalid or expired invite token" };
  }

  return {
    valid: true as const,
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
    // Password match check
    if (data.password !== data.confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

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
        displayName: data.displayName.trim(),
        passwordHash: passwordHashed,
        inviteStatus: "accepted",
        inviteToken: null,
        updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      })
      .where(eq(users.id, invitedUser.id));

    // 4. Set JWT session
    await setSession(requestEvent, {
      id: invitedUser.id,
      email: invitedUser.email,
      isPlatformAdmin: false,
    });

    // 5. Redirect to home
    throw requestEvent.redirect(302, "/");
  },
  zod$({
    token: z.string().min(1),
    displayName: z
      .string()
      .min(2, "Display name must be at least 2 characters")
      .max(50, "Display name must be 50 characters or less"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string(),
  })
);

/**
 * Compute password strength from a raw password string.
 * Returns 0–4 (weak → strong).
 */
function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"] as const;
const STRENGTH_CSS_SEGMENT = [
  "",
  styles.strengthWeak,
  styles.strengthFair,
  styles.strengthGood,
  styles.strengthStrong,
] as const;
const STRENGTH_CSS_LABEL = [
  "",
  styles.strengthLabelWeak,
  styles.strengthLabelFair,
  styles.strengthLabelGood,
  styles.strengthLabelStrong,
] as const;

export default component$(() => {
  useRedirectIfAuthed();
  const invite = useInviteCheck();
  const signupAction = useSignup();
  const showPassword = useSignal(false);
  const passwordValue = useSignal("");

  const strength = useComputed$(() => getPasswordStrength(passwordValue.value));

  // ─── Invalid / Missing Token State ───
  if (!invite.value.valid) {
    return (
      <div class={styles.signupPage}>
        <div class={[styles.card, styles.errorCard]}>
          <span class={styles.errorEmoji}>🔒</span>
          <h3 class={styles.errorHeading}>Invite Required</h3>
          <p class={styles.errorText}>{invite.value.error}</p>
          <div class={styles.errorNote}>
            Herding Cats is invite-only. You need a valid invite link from a
            current member to join.
            <br />
            <br />
            Already have an account?{" "}
            <a href="/login">Log in here</a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Valid Token — Show Signup Form ───
  return (
    <div class={styles.signupPage}>
      <div class={styles.card}>
        {/* Logo */}
        <div class={styles.logo}>
          <span class={styles.logoEmoji}>🐱</span>
        </div>

        <h3 class={styles.heading}>Join Herding Cats</h3>
        <p class={styles.subtext}>
          You've been invited! Signing up as
          <br />
          <span class={styles.emailHighlight}>{invite.value.email}</span>
        </p>

        {/* Server Error */}
        {signupAction.value?.error && (
          <div class={styles.formError}>{signupAction.value.error}</div>
        )}

        <Form action={signupAction}>
          {/* Hidden token */}
          <input type="hidden" name="token" value={invite.value.token} />

          {/* Display Name */}
          <div class={styles.fieldGroup}>
            <label class={styles.label} for="displayName">
              Display Name
            </label>
            <input
              class={[
                styles.input,
                signupAction.value?.fieldErrors?.displayName
                  ? styles.inputError
                  : "",
              ]}
              id="displayName"
              name="displayName"
              type="text"
              placeholder="What should people call you?"
              autoComplete="name"
              required
            />
            <p class={styles.fieldHint}>
              This is how you'll appear to other members
            </p>
            {signupAction.value?.fieldErrors?.displayName && (
              <p class={styles.fieldError}>
                {signupAction.value.fieldErrors.displayName}
              </p>
            )}
          </div>

          {/* Password */}
          <div class={styles.fieldGroup}>
            <label class={styles.label} for="password">
              Password
            </label>
            <div class={styles.passwordWrapper}>
              <input
                class={[
                  styles.input,
                  signupAction.value?.fieldErrors?.password
                    ? styles.inputError
                    : "",
                ]}
                id="password"
                name="password"
                type={showPassword.value ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                onInput$={(_, el) => {
                  passwordValue.value = (el as HTMLInputElement).value;
                }}
              />
              <button
                class={styles.passwordToggle}
                type="button"
                onClick$={() => {
                  showPassword.value = !showPassword.value;
                }}
                aria-label={
                  showPassword.value ? "Hide passwords" : "Show passwords"
                }
              >
                {showPassword.value ? "Hide" : "Show"}
              </button>
            </div>

            {/* Strength Meter */}
            {passwordValue.value.length > 0 && (
              <>
                <div class={styles.strengthBar}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      class={[
                        styles.strengthSegment,
                        i <= strength.value
                          ? STRENGTH_CSS_SEGMENT[strength.value]
                          : "",
                      ]}
                    />
                  ))}
                </div>
                <p
                  class={[
                    styles.strengthLabel,
                    STRENGTH_CSS_LABEL[strength.value],
                  ]}
                >
                  {STRENGTH_LABELS[strength.value]}
                </p>
              </>
            )}

            {signupAction.value?.fieldErrors?.password && (
              <p class={styles.fieldError}>
                {signupAction.value.fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div class={styles.fieldGroup}>
            <label class={styles.label} for="confirmPassword">
              Confirm Password
            </label>
            <div class={styles.passwordWrapper}>
              <input
                class={styles.input}
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword.value ? "text" : "password"}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            class={styles.submitBtn}
            type="submit"
            disabled={signupAction.isRunning}
          >
            {signupAction.isRunning ? (
              <>
                <span class={styles.spinner} />
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </Form>

        {/* Divider */}
        <div class={styles.divider}>
          <span class={styles.dividerLine} />
          <span class={styles.dividerText}>Already a member?</span>
          <span class={styles.dividerLine} />
        </div>

        {/* Footer */}
        <p class={styles.footerLink}>
          <a href="/login">Log in to your account</a>
        </p>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Sign Up — Herding Cats",
  meta: [
    {
      name: "description",
      content:
        "Accept your invite and join the Herding Cats community. Create your account and start earning Karma.",
    },
  ],
};