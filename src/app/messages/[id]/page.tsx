import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getConversationContext, getThread } from "@/lib/queries/messaging";
import { sendMessage } from "@/app/messages/actions";
import { ConversationLive } from "@/components/conversation-live";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default async function ThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await requireUser();

  const ctx = await getConversationContext(id, user.id);
  if (!ctx) notFound();
  const thread = await getThread(id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-8">
      <ConversationLive conversationId={id} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/messages"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Messages
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {ctx.otherName ?? "Member"}
          </h1>
          {ctx.projectId && ctx.projectTitle && (
            <Link
              href={`/projects/${ctx.projectId}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {ctx.projectTitle}
            </Link>
          )}
        </div>
        <Badge variant={ctx.type === "project_chat" ? "default" : "outline"}>
          {ctx.type === "project_chat" ? "Project chat" : "Direct message"}
        </Badge>
      </div>

      {/* Thread */}
      <div className="mt-6 flex flex-1 flex-col gap-3">
        {thread.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No messages yet. Say hello.
          </p>
        ) : (
          thread.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
                <span className="mt-1 text-[11px] text-muted-foreground">
                  {m.createdAt.toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Composer */}
      <div className="mt-4 border-t pt-4">
        {ctx.dmLocked ? (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            You&apos;ve sent your one direct message. You&apos;ll be able to chat
            freely if the lister shortlists or accepts you.
          </p>
        ) : (
          <form action={sendMessage} className="flex flex-col gap-2">
            <input type="hidden" name="conversationId" value={id} />
            <Textarea
              name="body"
              rows={3}
              required
              placeholder={
                ctx.type === "application_dm" && !ctx.isOwner
                  ? "Send one short message to the lister…"
                  : "Write a message…"
              }
            />
            <Button type="submit" className="self-end">
              Send
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
