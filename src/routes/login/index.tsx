// src/routes/login/index.tsx
import { component$, useSignal } from "@builder.io/qwik";
import {
  routeAction$,
  routeLoader$,
  zod$,
  z,
  Form,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { users } from "~/db/schema";
import { verifyPassword } from "~/lib/password";
import { setSession } from "~/lib/session";
import { getSessionPayload } from "~/middleware/auth";
import styles from "./login.module.css";

/**
 * If the user is already logged in, redirect to home.
 */
export const useRedirectIfAuthed = routeLoader$(async (requestEvent) => {
  const payload = await getSessionPayload(requestEvent);
  if (payload) {
    throw requestEvent.redirect(302, "/");
  }
  return {};
});

/**
 * Login action — validates credentials, sets JWT session cookie.
 */
export const useLogin = routeAction$(
  async (data, requestEvent) => {
    const env = requestEvent.platform.env as { herding_cats_db: D1Database };
    const db = getDb(env.herding_cats_db);

    // 1. Find user by email (case-insensitive)
    const email = data.email.toLowerCase().trim();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user || !user.passwordHash) {
      return { success: false, error: "Invalid email or password" };
    }

    // 2. Must be an accepted, active, non-banned user
    if (user.inviteStatus !== "accepted") {
      return { success: false, error: "Account not yet activated. Please complete your invite signup first." };
    }
    if (!user.isActive) {
      return { success: false, error: "Account has been deactivated. Contact a platform admin." };
    }
    if (user.isPlatformBanned) {
      return { success: false, error: "Account has been suspended." };
    }

    // 3. Verify password
    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid email or password" };
    }

    // 4. Set session cookie
    await setSession(requestEvent, {
      id: user.id,
      email: user.email,
      isPlatformAdmin: user.isPlatformAdmin,
    });

    // 5. Redirect to dashboard
    throw requestEvent.redirect(302, "/");
  },
  zod$({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
  })
);

export default component$(() => {
  useRedirectIfAuthed(); // triggers the loader
  const loginAction = useLogin();
  const showPassword = useSignal(false);

  return (
    <div class={styles.loginPage}>
      <div class={styles.card}>
        {/* Logo */}
        <div class={styles.logo}>
          <span class={styles.logoEmoji}>🐱</span>
        </div>

        <h3 class={styles.heading}>Welcome Back</h3>
        <p class={styles.subtext}>
          Sign in to your Herding Cats account
        </p>

        {/* Server Error */}
        {loginAction.value?.error && (
          <div class={styles.formError}>
            {loginAction.value.error}
          </div>
        )}

        <Form action={loginAction}>
          {/* Email */}
          <div class={styles.fieldGroup}>
            <label class={styles.label} for="email">
              Email
            </label>
            <input
              class={[
                styles.input,
                loginAction.value?.fieldErrors?.email ? styles.inputError : "",
              ]}
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            {loginAction.value?.fieldErrors?.email && (
              <p class={styles.fieldError}>
                {loginAction.value.fieldErrors.email}
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
                  loginAction.value?.fieldErrors?.password
                    ? styles.inputError
                    : "",
                ]}
                id="password"
                name="password"
                type={showPassword.value ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                class={styles.passwordToggle}
                type="button"
                onClick$={() => {
                  showPassword.value = !showPassword.value;
                }}
                aria-label={showPassword.value ? "Hide password" : "Show password"}
              >
                {showPassword.value ? "Hide" : "Show"}
              </button>
            </div>
            {loginAction.value?.fieldErrors?.password && (
              <p class={styles.fieldError}>
                {loginAction.value.fieldErrors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            class={styles.submitBtn}
            type="submit"
            disabled={loginAction.isRunning}
          >
            {loginAction.isRunning ? (
              <>
                <span class={styles.spinner} />
                Signing in…
              </>
            ) : (
              "Log In"
            )}
          </button>
        </Form>

        {/* Divider */}
        <div class={styles.divider}>
          <span class={styles.dividerLine} />
          <span class={styles.dividerText}>New here?</span>
          <span class={styles.dividerLine} />
        </div>

        {/* Footer */}
        <p class={styles.footerLink}>
          Have an invite?{" "}
          <a href="/signup">Sign up here</a>
        </p>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Log In — Herding Cats",
  meta: [
    {
      name: "description",
      content: "Sign in to your Herding Cats account to manage events and earn Karma.",
    },
  ],
};