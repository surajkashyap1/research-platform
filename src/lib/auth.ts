import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { classifyEmail } from "@/lib/verification";
import type { Profile } from "@/lib/profile";

// Server-only auth helpers. Never import into a client component.

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

// Idempotently ensure a profile row exists for an authenticated user.
// Called after sign-in/sign-up instead of a DB trigger — pure TypeScript,
// easy to reason about, and safe to call repeatedly.
export async function ensureProfile(user: User): Promise<Profile> {
  const found = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);
  if (found.length) return found[0];

  const email = user.email ?? "";
  const cls = classifyEmail(email);
  const fullName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    email.split("@")[0] ||
    "New user";

  const [created] = await db
    .insert(profiles)
    .values({
      id: user.id,
      email,
      fullName,
      isVerified: cls.isVerified,
      canSupervise: cls.canSupervise,
    })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  // A concurrent request already created it — fetch and return that row.
  const again = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);
  return again[0];
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const found = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return found[0] ?? null;
}
