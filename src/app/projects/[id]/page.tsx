import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getProjectById } from "@/lib/queries/projects";
import { closeProject, reopenProject } from "@/app/projects/actions";
import { projectTypeLabel, experienceLabel } from "@/lib/project-meta";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const user = await getSessionUser();
  const isOwner = user?.id === project.ownerId;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Link
        href="/projects"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All projects
      </Link>

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
              {project.ownerName ?? "Unknown"}
              {project.ownerVerified && (
                <span className="ml-1 text-success" title="Verified">
                  ✓
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap gap-2">
        {isOwner ? (
          <>
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
          </>
        ) : user ? (
          project.status === "open" ? (
            <Button disabled title="Applications open in Phase 3">
              Apply (coming soon)
            </Button>
          ) : (
            <Button disabled>Listing closed</Button>
          )
        ) : (
          <Link href="/login" className={buttonVariants()}>
            Log in to apply
          </Link>
        )}
      </div>
    </main>
  );
}
