import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

// Weekly ping (configured in vercel.json) that runs a trivial query so the free
// Supabase project never auto-pauses from inactivity (ROADMAP §7).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // If CRON_SECRET is set, require it (Vercel Cron sends it as a Bearer token).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  await db.execute(sql`select 1`);
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
