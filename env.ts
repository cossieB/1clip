
// The typed env schema (probed by the plugin from the project root): plain
// objects of Standard Schema validators — valibot here, but zod, arktype, or
// any compliant library works, even mixed per key.
//
// `server` vars come through `virtual:solid-env/server` (server modules only;
// importing it from client code fails the build) and are read from
// process.env at BOOT, validated then: secrets rotate without a rebuild and
// never appear in build artifacts. `client` vars must carry the public
// VITE_ prefix and come through `virtual:solid-env/client` as validated values

import z from "zod";

// baked into the bundle. Generated types land in solid-env.d.ts.
export default {
  server: {
    DATABASE_URL: z.string(),
    JANITOR_KEY: z.string(),

    // Better Auth
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string(),

    RESEND_KEY: z.string(),

    // Cloudflare
    CLOUDFLARE_TOKEN: z.string(),
    ACCESS_KEY_ID: z.string(),
    SECRET_ACCESS_KEY: z.string(),
    CLOUDFLARE_ENDPOINT: z.string(),
    R2_DOMAIN: z.string()
  },
  client: {
    VITE_STORAGE_DOMAIN: z.string(),
    VITE_SITE_URL: z.string()
  },
};
