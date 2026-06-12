import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // We only manage the `public` schema; Supabase owns `auth`, `storage`, etc.
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
