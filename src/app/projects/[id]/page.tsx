import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getProjectById } from "@/lib/queries/projects";
import {
  getApplicationAllowance,
  getMyApplication,
} from "@/lib/queries/applications";
import { getQuestionsForProject } from "@/lib/queries/questions";
import { closeProject, reopenProject, completeProject } from "@/app/projects/actions";
import { openConversation } from "@/app/messages/actions";
import { projectTypeLabel, experienceLabel } from "@/lib/project-meta";
import { STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/application-meta";
import { ApplicationForm } from "@/components/application-form";
import { ListingQA } from "@/components/listing-qa";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; applied?: string }>;
}) {
  const { id } = await params;
  const { error, applied } = await searchParams;
  const project = await getProjectById(id);
  if (!project) notFound();

  const user = await getSessionUser();
  const isOwner = user?.id === project.ownerId;

  const [myApplication, allowance, questions] = await Promise.all([
    user && !isOwner ? getMyApplication(id, user.id) : Promise.resolve(null),
    user && !isOwner ? getApplicationAllowance(user.id) : Promise.resolve(null),
    getQuestionsForProject(id),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Link
        href="/projects"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All projects
      </Link>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {applied && (
        <div className="mt-4 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Application submitted. Track it in{" "}
          <Link href="/applications" className="underline">
            My applications
          </Link>
          .
        </div>
      )}

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
        {project.status !== "open" && (
          <Badge variant="secondary" className="shrink-0 capitalize">
            {project.status.replace("_", " ")}
          </Badge>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.isBeginnerFriendly && (
          <Badge className="border-transparent bg-success text-success-foreground">
            Beginner friendly
          </Badge>
        )}
        <Badge variant="secondary">{projectTypeLabel(project.projectType)}</Badge>
        <Badge variant="outline">{experienceLabel(project.experienceLevel)}</Badge>
        {project.specialty && <Badge variant="outline">{project.specialty}</Badge>}
        {project.roleCategory && (
          <Badge variant="outline">{project.roleCategory}</Badge>
        )}
      </div>

      <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {project.description}
      </p>

      <Card className="mt-8">
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Applications</p>
            <p className="mt-0.5 font-semibold">{project.applicationCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Positions</p>
            <p className="mt-0.5 font-semibold">{project.positionsAvailable}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Deadline</p>
            <p className="mt-0.5 font-semibold">
              {project.applicationDeadline ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Posted by</p>
            <p className="mt-0.5 font-semibold">
              <Link href={`/profile/${project.ownerId}`} className="hover:underline">
                {project.ownerName ?? "Unknown"}
              </Link>
              {project.ownerVerified && (
                <span className="ml-1 text-success" title="Verified">
                  ✓
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Owner controls */}
      {isOwner ? (
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href={`/projects/${project.id}/applicants`}
            className={buttonVariants()}
          >
            View applicants ({project.applicationCount})
          </Link>
          <Link
            href={`/projects/${project.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            Edit
          </Link>
          {project.status === "open" ? (
            <form action={closeProject}>
              <input type="hidden" name="id" value={project.id} />
              <Button type="submit" variant="outline">
                Close listing
              </Button>
            </form>
          ) : (
            <form action={reopenProject}>
              <input type="hidden" name="id" value={project.id} />
              <Button type="submit" variant="outline">
                Reopen listing
              </Button>
            </form>
          )}
          {project.status !== "completed" && (
            <form action={completeProject}>
              <input type="hidden" name="id" value={project.id} />
              <Button type="submit" variant="outline">
                Mark completed
              </Button>
            </form>
          )}
        </div>
      ) : (
        /* Applicant flow */
        <div className="mt-8">
          {!user ? (
            <Link href="/login" className={buttonVariants()}>
              Log in to apply
            </Link>
          ) : myApplication ? (
            <div className="rounded-lg border p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Your application</p>
                <Badge className={STATUS_BADGE_CLASS[myApplication.status]}>
                  {STATUS_LABELS[myApplication.status]}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Submitted {myApplication.createdAt.toLocaleDateString("en-GB")}.
                Track it in{" "}
                <Link href="/applications" className="underline">
                  My applications
                </Link>
                .
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={openConversation}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="otherId" value={project.ownerId} />
                  <Button type="submit" variant="outline" size="sm">
                    Message the lister
                  </Button>
                </form>
                {myApplication.status === "accepted" && (
                  <Link
                    href={`/projects/${project.id}/review/${project.ownerId}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Review supervisor
                  </Link>
                )}
              </div>
            </div>
          ) : project.status !== "open" ? (
            <Button disabled>Listing closed</Button>
          ) : allowance && allowance.remaining <= 0 ? (
            <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
              You&apos;ve used all {allowance.limit} of your applications this week.
              {allowance.resetsAt &&
                ` More open up on ${allowance.resetsAt.toLocaleDateString("en-GB")}.`}
            </div>
          ) : (
            <div className="rounded-lg border p-5">
              <h2 className="text-base font-semibold">Apply to this project</h2>
              <p className="mt-1 mb-4 text-sm text-muted-foreground">
                A focused application stands out. Be specific.
              </p>
              <ApplicationForm
                projectId={project.id}
                remaining={allowance?.remaining ?? 0}
                limit={allowance?.limit ?? 3}
              />
            </div>
          )}
        </div>
      )}

      <ListingQA
        projectId={project.id}
        questions={questions}
        isOwner={isOwner}
        isSignedIn={!!user}
        isOpen={project.status === "open"}
      />
    </main>
  );
}
