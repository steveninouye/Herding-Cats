import { component$, useSignal } from "@builder.io/qwik";
import {
  routeAction$,
  zod$,
  z,
  Form,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { eq } from "drizzle-orm";
import { getDb } from "~/db";
import { users } from "~/db/schema";
import { verifyPassword } from "~/lib/password";

export const useLogin = routeAction$(
  async (data, requestEvent) => {
    const env = requestEvent.platform.env as { herding_cats_db: D1Database };
    const db = getDb(env.herding_cats_db);

    // 1. Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .get();

    if (!user || !user.passwordHash) {
      return { success: false, error: "Invalid email or password" };
    }

    // 2. Must be an accepted, active, non-banned user
    if (user.inviteStatus !== "accepted") {
      return { success: false, error: "Account not yet activated" };
    }

    if (!user.isActive) {
      return { success: false, error: "Account has been deactivated" };
    }

    if (user.isPlatformBanned) {
      return { success: false, error: "Account has been banned" };
    }

    // 3. Verify password
    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid email or password" };
    }

    // 4. Set session cookie
    requestEvent.cookie.set("userId", String(user.id), {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
  const loginAction = useLogin();
  const showPassword = useSignal(false);

  return (
    <div class="login-page">
      <h3>Welcome Back 🐈</h3>

      <Form action={loginAction}>
        <div class="form-field">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="you@example.com"
          />
          {loginAction.value?.fieldErrors?.email && (
            <p class="error">{loginAction.value.fieldErrors.email}</p>
          )}
        </div>

        <div class="form-field">
          <label for="password">Password</label>
          <input
            type={showPassword.value ? "text" : "password"}
            id="password"
            name="password"
            required
            placeholder="Your password"
          />
          {loginAction.value?.fieldErrors?.password && (
            <p class="error">{loginAction.value.fieldErrors.password}</p>
          )}
        </div>

        <label class="show-password">
          <input type="checkbox" bind:checked={showPassword} />
          Show password
        </label>

        {loginAction.value?.error && (
          <p class="error">{loginAction.value.error}</p>
        )}

        <button type="submit">Log In</button>
      </Form>

      <p class="signup-link">
        Have an invite? <a href="/signup">Sign up here</a>
      </p>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Log In — Herding Cats",
};