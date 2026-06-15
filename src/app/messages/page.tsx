import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/queries/messaging";
import { Badge } from "@/components/ui/badge";

export default async function MessagesPage() {
  const user = await requireUser();
  const conversations = await getConversationsForUser(user.id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No conversations yet. Apply to a project and message the lister, or
            message an applicant once they apply to your project.
          </p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col divide-y rounded-lg border">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex items-start justify-between gap-4 p-4 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">
                      {c.otherName ?? "Member"}
                    </p>
                    {c.type === "application_dm" && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        DM
                      </Badge>
                    )}
                  </div>
                  {c.projectTitle && (
                    <p className="truncate text-xs text-muted-foreground">
                      {c.projectTitle}
                    </p>
                  )}
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {c.lastBody ?? "No messages yet"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {c.lastAt && (
                    <span className="text-xs text-muted-foreground">
                      {c.lastAt.toLocaleDateString("en-GB")}
                    </span>
                  )}
                  {c.unread > 0 && (
                    <Badge className="border-transparent bg-primary text-primary-foreground">
                      {c.unread}
                    </Badge>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
