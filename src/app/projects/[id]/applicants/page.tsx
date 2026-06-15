import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProjectRow } from "@/lib/queries/projects";
import { getApplicantsForProject } from "@/lib/queries/applications";
import { setApplicationStatus } from "@/app/applications/actions";
import { openConversation } from "@/app/messages/actions";
import { STATUS_LABELS, STATUS_BADGE_CLASS } from "@/lib/application-meta";
import { CAREER_STAGES } from "@/lib/profile";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_ORDER = { shortlisted: 0, pending: 1, accepted: 2, rejected: 3, withdrawn: 4 };

function stageLabel(value: string) {
  return CAREER_STAGES.find((s) => s.value === value)?.label ?? value;
}

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectRow(id);
  if (!project) notFound();
  if (project.ownerId !== user.id) redirect(`/projects/${id}`);

  const applicants = (await getApplicantsForProject(id)).sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Link
        href={`/projects/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to listing
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Applicants</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {project.title} · {applicants.length} application
        {applicants.length === 1 ? "" : "s"}
      </p>

      {applicants.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {applicants.map((a) => (
            <li key={a.id}>
              <Card>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        <Link
                          href={`/profile/${a.applicantId}`}
                          className="hover:underline"
                        >
                          {a.applicantName ?? "Member"}
                        </Link>
                        {a.applicantVerified && (
                          <span className="ml-1 text-success" title="Verified">
                            ✓
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {stageLabel(a.applicantCareerStage)}
                        {a.applicantUniversity ? ` · ${a.applicantUniversity}` : ""}
                        {" · applied "}
                        {a.createdAt.toLocaleDateString("en-GB")}
                      </p>
                      {a.applicantNewResearcher && (
                        <Badge variant="secondary" className="mt-2">
                          New researcher
                        </Badge>
                      )}
                    </div>
                    <Badge className={STATUS_BADGE_CLASS[a.status]}>
                      {STATUS_LABELS[a.status]}
                    </Badge>
                  </div>

                  <dl className="flex flex-col gap-3 text-sm">
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">
                        Motivation
                      </dt>
                      <dd className="mt-0.5 whitespace-pre-wrap">{a.motivation}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">
                        Suitability
                      </dt>
                      <dd className="mt-0.5 whitespace-pre-wrap">{a.suitability}</dd>
                    </div>
                    {a.skillsSummary && (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">
                          Skills
                        </dt>
                        <dd className="mt-0.5 whitespace-pre-wrap">
                          {a.skillsSummary}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {a.status !== "withdrawn" && (
                    <div className="flex flex-wrap gap-2">
                      {a.status !== "shortlisted" && a.status !== "accepted" && (
                        <StatusButton id={a.id} projectId={id} status="shortlisted" label="Shortlist" />
                      )}
                      {a.status !== "accepted" && (
                        <StatusButton id={a.id} projectId={id} status="accepted" label="Accept" />
                      )}
                      {a.status !== "rejected" && (
                        <StatusButton id={a.id} projectId={id} status="rejected" label="Reject" variant="ghost" />
                      )}
                      <form action={openConversation}>
                        <input type="hidden" name="projectId" value={id} />
                        <input type="hidden" name="otherId" value={a.applicantId} />
                        <Button type="submit" size="sm" variant="ghost">
                          Message
                        </Button>
                      </form>
                      {a.status === "accepted" && (
                        <Link
                          href={`/projects/${id}/review/${a.applicantId}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Review
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function StatusButton({
  id,
  projectId,
  status,
  label,
  variant = "outline",
}: {
  id: string;
  projectId: string;
  status: string;
  label: string;
  variant?: "outline" | "ghost";
}) {
  return (
    <form action={setApplicationStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant}>
        {label}
      </Button>
    </form>
  );
}
