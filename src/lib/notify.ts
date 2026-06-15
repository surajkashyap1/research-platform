import { db } from "@/db";
import { notifications, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

type NotificationType = "application" | "message" | "review" | "match" | "system";

type NotifyInput = {
  profileId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  // Don't notify someone about their own action.
  actorId?: string;
};

// Create an in-app notification (and fire an email if Resend is configured).
// Best-effort: never let a notification failure break the calling action.
export async function notify(input: NotifyInput): Promise<void> {
  if (input.actorId && input.actorId === input.profileId) return;
  try {
    await db.insert(notifications).values({
      profileId: input.profileId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    });
    await maybeSendEmail(input);
  } catch (e) {
    console.error("notify failed", e);
  }
}

// Email is a Phase 4 roadmap item but gated on a paid/owned domain (Resend).
// Until RESEND_API_KEY is set this is a no-op, so the zero-budget setup keeps
// working and email "just turns on" later. No SDK dependency — plain fetch.
async function maybeSendEmail(input: NotifyInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) return;

  const [recipient] = await db
    .select({ email: profiles.email })
    .from(profiles)
    .where(eq(profiles.id, input.profileId))
    .limit(1);
  if (!recipient?.email) return;

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const link = input.link ? `${base}${input.link}` : base;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipient.email,
      subject: input.title,
      text: `${input.body ?? input.title}\n\n${link}`,
    }),
  });
}
