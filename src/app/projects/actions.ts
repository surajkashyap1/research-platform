"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireUser, requireSupervisor } from "@/lib/auth";
import {
  PROJECT_TYPE_VALUES,
  EXPERIENCE_VALUES,
  type ProjectType,
  type ExperienceLevel,
} from "@/lib/project-meta";

function parseProjectForm(formData: FormData) {
  const typeRaw = String(formData.get("projectType") ?? "other");
  const expRaw = String(formData.get("experienceLevel") ?? "beginner_welcome");

  const projectType = (
    PROJECT_TYPE_VALUES.has(typeRaw as ProjectType) ? typeRaw : "other"
  ) as ProjectType;
  const experienceLevel = (
    EXPERIENCE_VALUES.has(expRaw as ExperienceLevel) ? expRaw : "beginner_welcome"
  ) as ExperienceLevel;

  const deadline = String(formData.get("applicationDeadline") ?? "").trim();
  const positions = parseInt(
    String(formData.get("positionsAvailable") ?? "1"),
    10
  );

  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    projectType,
    experienceLevel,
    specialty: String(formData.get("specialty") ?? "").trim() || null,
    roleCategory: String(formData.get("roleCategory") ?? "").trim() || null,
    isBeginnerFriendly:
      formData.get("isBeginnerFriendly") === "on" ||
      experienceLevel === "beginner_welcome",
    positionsAvailable: Number.isFinite(positions) && positions > 0 ? positions : 1,
    applicationDeadline: deadline || null,
  };
}

export async function createProject(formData: FormData) {
  const { user } = await requireSupervisor();
  const data = parseProjectForm(formData);

  if (!data.title || !data.description) {
    redirect("/projects/new?error=Title+and+description+are+required");
  }

  const [created] = await db
    .insert(projects)
    .values({ ownerId: user.id, status: "open", ...data })
    .returning({ id: projects.id });

  revalidatePath("/projects");
  redirect(`/projects/${created.id}`);
}

export async function updateProject(formData: FormData) {
  const { user } = await requireSupervisor();
  const id = String(formData.get("id") ?? "");
  const data = parseProjectForm(formData);

  if (!id || !data.title || !data.description) {
    redirect(`/projects/${id}/edit?error=Title+and+description+are+required`);
  }

  // Owner guard: the where clause only matches if this user owns the project.
  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)));

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  redirect(`/projects/${id}`);
}

export async function closeProject(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  await db
    .update(projects)
    .set({ status: "closed", updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)));

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  redirect(`/projects/${id}`);
}

export async function reopenProject(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  await db
    .update(projects)
    .set({ status: "open", updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.ownerId, user.id)));

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  redirect(`/projects/${id}`);
}
