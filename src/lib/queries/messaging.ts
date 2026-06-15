import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  conversations,
  conversationParticipants,
  messages,
  profiles,
  projects,
} from "@/db/schema";

export type ConversationType = "application_dm" | "project_chat";
export const MESSAGE_MAX_CHARS = 2000;

// ---- Conversation lifecycle ----------------------------------------------

// One conversation per (project, applicant) pair. The owner is the other
// participant. Starts as an application_dm and is upgraded to project_chat
// when the applicant is shortlisted/accepted.
export async function findPairConversation(projectId: string, applicantId: string) {
  const rows = await db
    .select({ id: conversations.id, type: conversations.type })
    .from(conversations)
    .innerJoin(
      conversationParticipants,
      eq(conversationParticipants.conversationId, conversations.id)
    )
    .where(
      and(
        eq(conversations.projectId, projectId),
        eq(conversationParticipants.profileId, applicantId)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function getOrCreatePairConversation(
  projectId: string,
  applicantId: string,
  ownerId: string,
  type: ConversationType = "application_dm"
) {
  const existing = await findPairConversation(projectId, applicantId);
  if (existing) return existing;

  const [conv] = await db
    .insert(conversations)
    .values({ projectId, type })
    .returning({ id: conversations.id, type: conversations.type });
  await db
    .insert(conversationParticipants)
    .values([
      { conversationId: conv.id, profileId: applicantId },
      { conversationId: conv.id, profileId: ownerId },
    ])
    .onConflictDoNothing();
  return conv;
}

// Called when a lister shortlists/accepts: unlocks unlimited chat.
export async function upgradeConversationToChat(
  projectId: string,
  applicantId: string,
  ownerId: string
) {
  const conv = await getOrCreatePairConversation(
    projectId,
    applicantId,
    ownerId,
    "project_chat"
  );
  if (conv.type !== "project_chat") {
    await db
      .update(conversations)
      .set({ type: "project_chat" })
      .where(eq(conversations.id, conv.id));
  }
  return conv;
}

// ---- Reading conversations -----------------------------------------------

export async function isParticipant(conversationId: string, userId: string) {
  const rows = await db
    .select({ profileId: conversationParticipants.profileId })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.profileId, userId)
      )
    )
    .limit(1);
  return rows.length > 0;
}

export type ConversationContext = {
  id: string;
  type: ConversationType;
  projectId: string | null;
  projectTitle: string | null;
  ownerId: string | null;
  isOwner: boolean;
  otherId: string | null;
  otherName: string | null;
  myMessageCount: number;
  // In an application_dm the applicant (non-owner) gets exactly one message.
  dmLocked: boolean;
};

export async function getConversationContext(
  conversationId: string,
  userId: string
): Promise<ConversationContext | null> {
  const [conv] = await db
    .select({
      id: conversations.id,
      type: conversations.type,
      projectId: conversations.projectId,
      projectTitle: projects.title,
      ownerId: projects.ownerId,
    })
    .from(conversations)
    .leftJoin(projects, eq(projects.id, conversations.projectId))
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (!conv) return null;
  if (!(await isParticipant(conversationId, userId))) return null;

  const [other] = await db
    .select({ id: profiles.id, name: profiles.fullName })
    .from(conversationParticipants)
    .innerJoin(profiles, eq(profiles.id, conversationParticipants.profileId))
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        ne(conversationParticipants.profileId, userId)
      )
    )
    .limit(1);

  const [{ value: myMessageCount }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(messages)
    .where(
      and(eq(messages.conversationId, conversationId), eq(messages.senderId, userId))
    );

  const isOwner = !!conv.ownerId && conv.ownerId === userId;
  const dmLocked =
    conv.type === "application_dm" && !isOwner && myMessageCount >= 1;

  return {
    id: conv.id,
    type: conv.type,
    projectId: conv.projectId,
    projectTitle: conv.projectTitle,
    ownerId: conv.ownerId,
    isOwner,
    otherId: other?.id ?? null,
    otherName: other?.name ?? null,
    myMessageCount,
    dmLocked,
  };
}

export type ThreadMessage = {
  id: string;
  body: string;
  senderId: string;
  senderName: string | null;
  createdAt: Date;
};

export async function getThread(conversationId: string): Promise<ThreadMessage[]> {
  return db
    .select({
      id: messages.id,
      body: messages.body,
      senderId: messages.senderId,
      senderName: profiles.fullName,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .leftJoin(profiles, eq(profiles.id, messages.senderId))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export type ConversationListItem = {
  id: string;
  type: ConversationType;
  projectId: string | null;
  projectTitle: string | null;
  otherName: string | null;
  lastBody: string | null;
  lastAt: Date | null;
  unread: number;
};

export async function getConversationsForUser(
  userId: string
): Promise<ConversationListItem[]> {
  const lastBody = sql<string | null>`(
    select m.body from ${messages} m
    where m.conversation_id = ${conversations.id}
    order by m.created_at desc limit 1
  )`.as("last_body");
  const lastAt = sql<Date | null>`(
    select m.created_at from ${messages} m
    where m.conversation_id = ${conversations.id}
    order by m.created_at desc limit 1
  )`.as("last_at");
  const unread = sql<number>`(
    select count(*)::int from ${messages} m
    where m.conversation_id = ${conversations.id}
      and m.sender_id <> ${userId} and m.read_at is null
  )`.as("unread");
  const otherName = sql<string | null>`(
    select pr.full_name from ${conversationParticipants} cp2
    join ${profiles} pr on pr.id = cp2.profile_id
    where cp2.conversation_id = ${conversations.id}
      and cp2.profile_id <> ${userId} limit 1
  )`.as("other_name");

  return db
    .select({
      id: conversations.id,
      type: conversations.type,
      projectId: conversations.projectId,
      projectTitle: projects.title,
      otherName,
      lastBody,
      lastAt,
      unread,
    })
    .from(conversations)
    .innerJoin(
      conversationParticipants,
      and(
        eq(conversationParticipants.conversationId, conversations.id),
        eq(conversationParticipants.profileId, userId)
      )
    )
    .leftJoin(projects, eq(projects.id, conversations.projectId))
    .orderBy(sql`last_at desc nulls last`);
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const [{ value }] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(messages)
    .innerJoin(
      conversationParticipants,
      and(
        eq(conversationParticipants.conversationId, messages.conversationId),
        eq(conversationParticipants.profileId, userId)
      )
    )
    .where(and(ne(messages.senderId, userId), sql`${messages.readAt} is null`));
  return value;
}
