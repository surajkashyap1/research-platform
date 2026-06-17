import { type NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { profiles, verifications } from "@/db/schema";

// Confirms the link emailed by requestVerification: a valid, unexpired, pending
// token flips the profile to verified. Verification grants posting rights only —
// supervisor status is chosen per project, not implied here.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");

  if (token) {
    const [row] = await db
      .select({ id: verifications.id, profileId: verifications.profileId })
      .from(verifications)
      .where(
        and(
          eq(verifications.token, token),
          eq(verifications.status, "pending"),
          or(isNull(verifications.expiresAt), gt(verifications.expiresAt, new Date()))
        )
      )
      .limit(1);

    if (row) {
      const now = new Date();
      await db
        .update(verifications)
        .set({ status: "verified", verifiedAt: now, token: null })
        .where(eq(verifications.id, row.id));
      await db
        .update(profiles)
        .set({ isVerified: true, updatedAt: now })
        .where(eq(profiles.id, row.profileId));

      return NextResponse.redirect(new URL("/dashboard?verified=1", origin));
    }
  }

  return NextResponse.redirect(
    new URL("/onboarding?verify=invalid#verify", origin)
  );
}
