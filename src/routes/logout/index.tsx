import type { RequestHandler } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";
import { clearSession } from "~/lib/session";

export const onGet: RequestHandler = async (requestEvent) => {
    clearSession(requestEvent);
    throw requestEvent.redirect(302, "/login");
};