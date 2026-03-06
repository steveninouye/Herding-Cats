// src/routes/layout.tsx
import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";
import { Header } from "~/components/Header";
import { getSessionUser } from "~/server/auth";

export const useCurrentUser = routeLoader$(async (requestEvent) => {
  const user = await getSessionUser(requestEvent);
  return user;
});

export default component$(() => {
  const user = useCurrentUser();

  return (
    <div class="min-h-screen bg-slate-50">
      <Header user={user.value} />
      <main>
        <Slot />
      </main>
    </div>
  );
});

const PUBLIC_PATHS = ["/", "/login", "/signup", "/invite"];

export const onRequest: RequestHandler = async (requestEvent) => {
  const path = requestEvent.url.pathname;
  const isPublic = PUBLIC_PATHS.some((p) =>
    p === "/" ? path === "/" : path.startsWith(p)
  );

  if (!isPublic) {
    const user = await getSessionUser(requestEvent);
    if (!user) {
      throw requestEvent.redirect(302, "/login");
    }
  }
};
