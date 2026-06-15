"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { listingQuestions, projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";

const MAX_QUESTION_CHARS = 500;
const MAX_ANSWER_CHARS = 1000;

function backTo(projectId: string, error?: string): never {
  const qs = error ? `?error=${encodeURIComponent(error)}#qa` : "#qa";
  redirect(`/projects/${projectId}${qs}`);
}

// Anyone signed in can ask a public question on an open listing.
export async function askQuestion(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  if (!projectId) redirect("/projects");
  if (!question) backTo(projectId, "Question can't be empty.");
  if (question.length > MAX_QUESTION_CHARS)
    backTo(projectId, `Keep questions under ${MAX_QUESTION_CHARS} characters.`);

  const [project] = await db
    .select({ id: projects.id, status: projects.status })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) redirect("/projects");
  if (project.status !== "open")
    backTo(projectId, "This listing is no longer open.");

  await db.insert(listingQuestions).values({
    projectId,
    askerId: user.id,
    question,
  });

  revalidatePath(`/projects/${projectId}`);
  backTo(projectId);
}

// Only the project owner can answer.
export async function answerQuestion(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const answer = String(formData.get("answer") ?? "").trim();
  if (!answer) backTo(projectId, "Answer can't be empty.");
  if (answer.length > MAX_ANSWER_CHARS)
    backTo(projectId, `Keep answers under ${MAX_ANSWER_CHARS} characters.`);

  // Confirm ownership of the project this question belongs to.
  const [owned] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, user.id)))
    .limit(1);
  if (!owned) redirect(`/projects/${projectId}`);

  await db
    .update(listingQuestions)
    .set({ answer, answeredAt: new Date() })
    .where(
      and(eq(listingQuestions.id, id), eq(listingQuestions.projectId, projectId))
    );

  revalidatePath(`/projects/${projectId}`);
  backTo(projectId);
}
