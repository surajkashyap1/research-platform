"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { messages, projects, applications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import {
  getConversationContext,
  getOrCreatePairConversation,
  isParticipant,
  MESSAGE_MAX_CHARS,
} from "@/lib/queries/messaging";

// Open (or create) the DM between an applicant and a project's owner, then go
// to the thread. `otherId` is the participant who isn't the current user.
export async function openConversation(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const otherId = String(formData.get("otherId") ?? "");
  if (!projectId || !otherId) redirect("/messages");

  const [project] = await db
    .select({ ownerId: projects.ownerId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) redirect("/projects");

  // Exactly one side of the pair is the owner; the other is the applicant.
  const ownerId = project.ownerId;
  const applicantId = ownerId === user.id ? otherId : user.id;
  if (user.id !== ownerId && user.id !== applicantId) redirect("/messages");

  // DMs are post-application only: the applicant must have applied.
  const [appRow] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(
      and(
        eq(applications.projectId, projectId),
        eq(applications.applicantId, applicantId)
      )
    )
    .limit(1);
  if (!appRow) redirect(`/projects/${projectId}`);

  const conv = await getOrCreatePairConversation(projectId, applicantId, ownerId);
  redirect(`/messages/${conv.id}`);
}

export async function sendMessage(formData: FormData) {
  const user = await requireUser();
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!conversationId) redirect("/messages");

  const ctx = await getConversationContext(conversationId, user.id);
  if (!ctx) redirect("/messages");

  if (!body)
    redirect(`/messages/${conversationId}?error=${encodeURIComponent("Message can't be empty.")}`);
  if (body.length > MESSAGE_MAX_CHARS)
    redirect(`/messages/${conversationId}?error=${encodeURIComponent(`Keep messages under ${MESSAGE_MAX_CHARS} characters.`)}`);

  // One-message DM cap for applicants until shortlisted/accepted (plan §7).
  if (ctx.dmLocked)
    redirect(`/messages/${conversationId}?error=${encodeURIComponent("You can send one message until the lister shortlists you.")}`);

  await db.insert(messages).values({
    conversationId,
    senderId: user.id,
    body,
  });

  if (ctx.otherId) {
    await notify({
      profileId: ctx.otherId,
      actorId: user.id,
      type: "message",
      title: "New message",
      body: ctx.projectTitle ? `About “${ctx.projectTitle}”` : undefined,
      link: `/messages/${conversationId}`,
    });
  }

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  redirect(`/messages/${conversationId}`);
}

// Mark every message from the other party as read. Called from the thread on
// mount (client) so the unread badge clears.
export async function markConversationRead(conversationId: string) {
  const user = await requireUser();
  if (!(await isParticipant(conversationId, user.id))) return;

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderId, user.id),
        isNull(messages.readAt)
      )
    );
  revalidatePath("/messages");
}
