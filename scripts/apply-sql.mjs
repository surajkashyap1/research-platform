// Apply a raw .sql file to the database (for manual/cross-schema migrations
// that drizzle-kit can't generate). Uses the session pooler connection.
//   node scripts/apply-sql.mjs drizzle/manual/0001_profiles_auth_fk.sql
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-sql.mjs <path-to.sql>");
  process.exit(1);
}

const url = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
const sql = postgres(url, { prepare: false });

try {
  const text = readFileSync(file, "utf8");
  await sql.unsafe(text);
  console.log(`Applied ${file} ✓`);
} catch (e) {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
