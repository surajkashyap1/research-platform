
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local (Next.js convention) for drizzle-kit CLI commands.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Prefer the session pooler for migrations (supports introspection);
    // fall back to DATABASE_URL if not set.
    url: process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL!,
  },
  // We only manage the `public` schema; Supabase owns `auth`, `storage`, etc.
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
