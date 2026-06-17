import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Server-side database client. Uses the Supabase connection string.
// IMPORTANT: only import this from server code (server actions, route
// handlers, server components) — never from a client component.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. See .env.example.");
}

// `prepare: false` is recommended when using Supabase's transaction pooler.
// Reuse a single client across hot reloads (dev) and warm serverless
// invocations (prod) so we don't pay the TCP+TLS handshake (~1s) on every
// request — that cold-connect cost was a big chunk of the per-action latency.
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__pgClient ?? postgres(connectionString, { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.__pgClient = client;

export const db = drizzle(client, { schema });
export { schema };
