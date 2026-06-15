"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { validateApplication, type ApplicationStatus } from "@/lib/application-meta";
import { getApplicationAllowance, getMyApplication } from "@/lib/queries/applications";

function redirectWith(projectId: string, error: string): never {
  redirect(`/projects/${projectId}?error=${encodeURIComponent(error)}`);
}

export async function submitApplication(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  if (!projectId) redirect("/projects");

  const input = {
    motivation: String(formData.get("motivation") ?? "").trim(),
    suitability: String(formData.get("suitability") ?? "").trim(),
    skillsSummary: String(formData.get("skillsSummary") ?? "").trim(),
  };

  // The project must exist and be open, and you can't apply to your own.
  const [project] = await db
    .select({ id: projects.id, status: projects.status, ownerId: projects.ownerId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) redirect("/projects");
  if (project.ownerId === user.id)
    redirectWith(projectId, "You can't apply to your own project.");
  if (project.status !== "open")
    redirectWith(projectId, "This listing is no longer open.");

  // Duplicate guard (also enforced by the unique constraint).
  if (await getMyApplication(projectId, user.id))
    redirectWith(projectId, "You've already applied to this project.");

  const validationError = validateApplication(input);
  if (validationError) redirectWith(projectId, validationError);

  // Rate limit: 3 / rolling 7 days (+bonus). Enforced server-side.
  const allowance = await getApplicationAllowance(user.id);
  if (allowance.remaining <= 0) {
    const when = allowance.resetsAt
      ? ` Try again after ${allowance.resetsAt.toLocaleDateString("en-GB")}.`
      : "";
    redirectWith(
      projectId,
      `You've used all ${allowance.limit} applications for this week.${when}`
    );
  }

  try {
    await db.insert(applications).values({
      projectId,
      applicantId: user.id,
      motivation: input.motivation,
      suitability: input.suitability,
      skillsSummary: input.skillsSummary || null,
    });
  } catch {
    // Unique violation = concurrent duplicate; treat as already applied.
    redirectWith(projectId, "You've already applied to this project.");
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/applications");
  redirect(`/projects/${projectId}?applied=1`);
}

export async function withdrawApplication(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  // Owner guard via where clause; only the applicant can withdraw.
  await db
    .update(applications)
    .set({ status: "withdrawn" })
    .where(and(eq(applications.id, id), eq(applications.applicantId, user.id)));

  revalidatePath("/applications");
  redirect("/applications");
}

const LISTER_STATUSES: ApplicationStatus[] = ["shortlisted", "accepted", "rejected"];

// Lister decision: shortlist / accept / reject an applicant. Only the project
// owner may do this — enforced by joining on ownerId in the where clause.
export async function setApplicationStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const status = String(formData.get("status") ?? "") as ApplicationStatus;

  if (!LISTER_STATUSES.includes(status)) redirect(`/projects/${projectId}/applicants`);

  // Confirm the current user owns the project this application belongs to.
  const [owned] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id)))
    .limit(1);
  if (!owned) redirect("/dashboard");

  await db
    .update(applications)
    .set({ status })
    .where(and(eq(applications.id, id), eq(applications.projectId, projectId)));

  revalidatePath(`/projects/${projectId}/applicants`);
  redirect(`/projects/${projectId}/applicants`);
}
