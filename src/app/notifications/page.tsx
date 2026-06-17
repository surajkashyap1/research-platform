import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/queries/notifications";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/notifications/actions";
import { Button } from "@/components/ui/button";

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await getNotifications(user.id);
  const hasUnread = items.some((n) => !n.readAt);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        {hasUnread && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="outline" size="sm">
              Mark all read
            </Button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col divide-y rounded-lg border">
          {items.map((n) => {
            const inner = (
              <div
                className={`flex items-start gap-3 p-4 ${
                  n.readAt ? "" : "bg-primary/5"
                }`}
              >
                {!n.readAt && (
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                    aria-label="Unread"
                  />
                )}
                <div className={n.readAt ? "pl-5" : ""}>
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {n.createdAt.toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                <form action={markNotificationRead}>
                  <input type="hidden" name="id" value={n.id} />
                  {n.link && (
                    <input type="hidden" name="link" value={n.link} />
                  )}
                  <button
                    type="submit"
                    className="block w-full text-left hover:bg-muted/50"
                  >
                    {inner}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
