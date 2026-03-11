// src/routes/layout.tsx
import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";
import { Header } from "~/components/Header";
import { getSessionUser } from "~/server/auth";

// Required by src/components/starter/footer/footer.tsx
export const useServerTimeLoader = routeLoader$(() => {
  return { date: new Date().toISOString() };
});

export const useCurrentUser = routeLoader$(async (requestEvent) => {
  const user = await getSessionUser(requestEvent);
  return user;
});

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({ staleWhileRevalidate: 60 * 60 * 24 * 7, maxAge: 5 });
};

export default component$(() => {
  const user = useCurrentUser();

  return (
    <>
      <Header user={user.value} />
      <main>
        <Slot />
      </main>
    </>
  );
});
