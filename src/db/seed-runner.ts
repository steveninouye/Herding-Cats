import { seed } from "./seed";

/**
 * Cloudflare Worker script to run the seed.
 * Execute with: npx wrangler d1 execute herding-cats-db --local --file=src/db/seed-runner.ts
 *
 * OR more reliably, use it as a Pages function:
 */
export default {
  async fetch(_request: Request, env: { herding_cats_db: D1Database }) {
    await seed(env.herding_cats_db);
    return new Response("Seed complete ✅", { status: 200 });
  },
};