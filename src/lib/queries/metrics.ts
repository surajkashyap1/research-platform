import { sql } from "drizzle-orm";
import { db } from "@/db";
import { profiles, projects, applications, reviews } from "@/db/schema";

export type Metrics = {
  totalUsers: number;
  verifiedUsers: number;
  completeProfilePct: number;
  activeListings: number;
  beginnerFriendlyActive: number;
  totalApplications: number;
  acceptedApplications: number;
  avgApplicationsPerActiveListing: number;
  totalReviews: number;
};

// Key launch metrics (ROADMAP §7 / plan §14). Computed with filtered counts in
// a handful of aggregate queries.
export async function getMetrics(): Promise<Metrics> {
  const [u] = await db
    .select({
      total: sql<number>`count(*)::int`,
      verified: sql<number>`count(*) filter (where ${profiles.isVerified})::int`,
      complete: sql<number>`count(*) filter (where ${profiles.profileCompleteness} >= 80)::int`,
    })
    .from(profiles);

  const [pr] = await db
    .select({
      active: sql<number>`count(*) filter (where ${projects.status} = 'open')::int`,
      bf: sql<number>`count(*) filter (where ${projects.status} = 'open' and ${projects.isBeginnerFriendly})::int`,
    })
    .from(projects);

  const [ap] = await db
    .select({
      total: sql<number>`count(*)::int`,
      accepted: sql<number>`count(*) filter (where ${applications.status} = 'accepted')::int`,
    })
    .from(applications);

  const [rv] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(reviews);

  return {
    totalUsers: u.total,
    verifiedUsers: u.verified,
    completeProfilePct: u.total ? Math.round((u.complete / u.total) * 100) : 0,
    activeListings: pr.active,
    beginnerFriendlyActive: pr.bf,
    totalApplications: ap.total,
    acceptedApplications: ap.accepted,
    avgApplicationsPerActiveListing: pr.active
      ? Math.round((ap.total / pr.active) * 10) / 10
      : 0,
    totalReviews: rv.total,
  };
}
