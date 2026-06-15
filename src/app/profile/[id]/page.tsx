import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile, getSessionUser } from "@/lib/auth";
import {
  getRatingSummary,
  getReviewsForProfile,
} from "@/lib/queries/reviews";
import { getBadgesForProfile } from "@/lib/badges";
import { CAREER_STAGES } from "@/lib/profile";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span aria-hidden className="text-amber-500">
      {"★".repeat(rounded)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const [profile, viewer] = await Promise.all([getProfile(id), getSessionUser()]);
  if (!profile) notFound();

  const [summary, badges, reviews] = await Promise.all([
    getRatingSummary(id),
    getBadgesForProfile(id, profile.isNewResearcher),
    getReviewsForProfile(id),
  ]);

  const stageLabel =
    CAREER_STAGES.find((s) => s.value === profile.careerStage)?.label ?? "—";
  const isSelf = viewer?.id === id;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            {profile.fullName}
            {profile.isVerified && (
              <span className="text-success" title="Verified">
                ✓
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stageLabel}
            {profile.university ? ` · ${profile.university}` : ""}
            {profile.specialty ? ` · ${profile.specialty}` : ""}
          </p>
        </div>
        {isSelf && (
          <Link
            href="/onboarding"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Edit profile
          </Link>
        )}
      </div>

      {profile.summary && (
        <p className="mt-4 text-sm leading-relaxed">{profile.summary}</p>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {badges.map((b) => (
            <Badge
              key={b.code}
              variant={b.active ? "default" : "outline"}
              title={b.description ?? undefined}
              className={b.active ? "" : "opacity-60"}
            >
              {b.name}
              {!b.active && " (past)"}
            </Badge>
          ))}
        </div>
      )}

      {/* Ratings */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">As a team member</p>
            {summary.memberAvg != null ? (
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
                {summary.memberAvg.toFixed(1)} <Stars value={summary.memberAvg} />
                <span className="text-sm font-normal text-muted-foreground">
                  ({summary.memberCount})
                </span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No reviews yet</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">As a supervisor</p>
            {summary.supervisorAvg != null ? (
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
                {summary.supervisorAvg.toFixed(1)}{" "}
                <Stars value={summary.supervisorAvg} />
                <span className="text-sm font-normal text-muted-foreground">
                  ({summary.supervisorCount})
                </span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No reviews yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {Number(r.ratingOverall).toFixed(1)}{" "}
                    <Stars value={Number(r.ratingOverall)} />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r.createdAt.toLocaleDateString("en-GB")}
                  </span>
                </div>
                {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.direction === "supervisor_to_member"
                    ? "From a supervisor"
                    : "From a team member"}
                  {r.reviewerName ? ` · ${r.reviewerName}` : " · anonymous"}
                  {r.projectTitle ? ` · ${r.projectTitle}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
