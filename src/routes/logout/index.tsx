import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async (requestEvent) => {
  requestEvent.cookie.delete("userId", { path: "/" });
  throw requestEvent.redirect(302, "/login");
};