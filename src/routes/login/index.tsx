// src/routes/login/index.tsx
import { component$, useSignal } from "@builder.io/qwik";
import {
  routeLoader$,
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
import { setSession } from "~/lib/session";

export const useRedirectIfAuthed = routeLoader$(async (requestEvent) => {
  const token = requestEvent.cookie.get("session")?.value;
  if (token) {
    throw requestEvent.redirect(302, "/dashboard");
  }
  return {};
});

export const useLogin = routeAction$(
  async (data, requestEvent) => {
    const env = requestEvent.platform.env as { herding_cats_db: D1Database };
    const db = getDb(env.herding_cats_db);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase().trim()))
      .get();

    if (!user || !user.passwordHash) {
      return { success: false, error: "Invalid email or password" };
    }

    if (user.inviteStatus !== "accepted") {
      return { success: false, error: "Account not yet activated. Please complete signup via your invite link." };
    }

    if (user.isPlatformBanned) {
      return { success: false, error: "Your account has been suspended." };
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid email or password" };
    }

    await setSession(requestEvent, {
      id: user.id,
      email: user.email,
      isPlatformAdmin: user.isPlatformAdmin ?? false,
    });

    throw requestEvent.redirect(302, "/dashboard");
  },
  zod$({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
  })
);

export default component$(() => {
  useRedirectIfAuthed();
  const loginAction = useLogin();
  const showPassword = useSignal(false);

  return (
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          {/* Logo */}
          <div class="text-center mb-6">
            <span class="text-5xl block mb-2">🐱</span>
            <h1 class="text-2xl font-bold text-slate-800 m-0">Welcome Back</h1>
            <p class="text-slate-500 text-sm mt-1 m-0">Log in to Herding Cats</p>
          </div>

          {/* Error */}
          {loginAction.value?.error && (
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              {loginAction.value.error}
            </div>
          )}

          <Form action={loginAction} class="space-y-4">
            {/* Email */}
            <div class="space-y-1">
              <label class="block text-sm font-medium text-slate-700" for="email">
                Email
              </label>
              <input
                class={`w-full px-4 py-2.5 border rounded-xl text-slate-800 placeholder-slate-400
                  focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all
                  ${loginAction.value?.fieldErrors?.email ? "border-red-400" : "border-slate-300"}`}
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              {loginAction.value?.fieldErrors?.email && (
                <p class="text-red-500 text-sm">{loginAction.value.fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div class="space-y-1">
              <label class="block text-sm font-medium text-slate-700" for="password">
                Password
              </label>
              <div class="relative">
                <input
                  class={`w-full px-4 py-2.5 border rounded-xl text-slate-800 placeholder-slate-400
                    focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all pr-16
                    ${loginAction.value?.fieldErrors?.password ? "border-red-400" : "border-slate-300"}`}
                  id="password"
                  name="password"
                  type={showPassword.value ? "text" : "password"}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-amber-600 font-medium cursor-pointer bg-transparent border-none"
                  type="button"
                  onClick$={() => {
                    showPassword.value = !showPassword.value;
                  }}
                >
                  {showPassword.value ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              class="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-none text-base disabled:opacity-50"
              type="submit"
              disabled={loginAction.isRunning}
            >
              {loginAction.isRunning ? (
                <span class="flex items-center justify-center gap-2">
                  <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in…
                </span>
              ) : (
                "Log In"
              )}
            </button>
          </Form>

          {/* Divider */}
          <div class="flex items-center gap-3 my-6">
            <div class="flex-1 h-px bg-slate-200" />
            <span class="text-xs text-slate-400">New here?</span>
            <div class="flex-1 h-px bg-slate-200" />
          </div>

          <p class="text-center text-sm text-slate-500 m-0">
            You need an invite to join.{" "}
            <a href="/signup" class="text-amber-600 hover:text-amber-700 font-medium">
              Register with invite →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Log In — Herding Cats",
  meta: [
    {
      name: "description",
      content: "Log in to your Herding Cats account.",
    },
  ],
};
