import Link from "next/link";
import { requireUser, ensureProfile } from "@/lib/auth";
import { CAREER_STAGES } from "@/lib/profile";
import { getProjectsByOwner } from "@/lib/queries/projects";
import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await ensureProfile(user);
  const myProjects = await getProjectsByOwner(user.id);

  const stageLabel =
    CAREER_STAGES.find((s) => s.value === profile.careerStage)?.label ?? "Not set";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi, {profile.fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/profile/${user.id}`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Public profile
          </Link>
          <Link href="/onboarding" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Edit profile
          </Link>
        </div>
      </div>

      {/* Verification + status badges */}
      <div className="mt-6 flex flex-wrap gap-2">
        {profile.isVerified ? (
          <Badge className="border-transparent bg-success text-success-foreground">
            ✓ Verified
          </Badge>
        ) : (
          <Badge variant="secondary">
            Unverified — use a .ac.uk or NHS email to verify
          </Badge>
        )}
        {profile.canSupervise && <Badge variant="outline">Can supervise</Badge>}
        {profile.isNewResearcher && (
          <Badge variant="secondary">New researcher</Badge>
        )}
      </div>

      {/* Profile completeness */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Profile completeness</CardTitle>
            <span className="text-sm font-medium text-muted-foreground">
              {profile.profileCompleteness}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${profile.profileCompleteness}%` }}
            />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Career stage</dt>
              <dd className="mt-0.5 font-medium">{stageLabel}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">University</dt>
              <dd className="mt-0.5 font-medium">{profile.university ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Specialty</dt>
              <dd className="mt-0.5 font-medium">{profile.specialty ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Availability</dt>
              <dd className="mt-0.5 font-medium">{profile.availability ?? "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* My projects */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">My projects</h2>
          <div className="flex gap-2">
            <Link
              href="/projects"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Browse all
            </Link>
            {profile.canSupervise && (
              <Link
                href="/projects/new"
                className={buttonVariants({ size: "sm" })}
              >
                Post a project
              </Link>
            )}
          </div>
        </div>

        {myProjects.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {profile.canSupervise
              ? "You haven’t posted any projects yet."
              : "Browse open opportunities to find your first project."}
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {myProjects.map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
