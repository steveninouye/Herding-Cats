// src/routes/api/seed/index.ts
import type { RequestHandler } from "@builder.io/qwik-city";
import { seed } from "~/db/seed";

/**
 * GET /api/seed — Run once to create the platform admin.
 * DELETE THIS FILE after seeding.
 */
export const onGet: RequestHandler = async (requestEvent) => {
  const env = requestEvent.platform.env as { herding_cats_db: D1Database };

  try {
    await seed(env.herding_cats_db);
    requestEvent.json(200, { message: "Seed complete ✅" });
  } catch (err) {
    requestEvent.json(500, {
      error: "Seed failed",
      details: String(err),
    });
  }
};