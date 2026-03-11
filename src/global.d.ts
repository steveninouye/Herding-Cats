// src/global.d.ts

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  herding_cats_db: D1Database;
}

interface PlatformCloudflarePages {
  env: Env;
  cf: CfProperties;
  ctx: ExecutionContext;
}

declare module "@builder.io/qwik-city/middleware/cloudflare-pages" {
  export interface PlatformCloudflarePages {
    env: Env;
    cf: CfProperties;
    ctx: ExecutionContext;
  }
}
