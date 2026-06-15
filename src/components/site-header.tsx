import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { getUnreadMessageCount } from "@/lib/queries/messaging";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getSessionUser();
  const [unreadMessages, unreadNotifications] = user
    ? await Promise.all([
        getUnreadMessageCount(user.id),
        getUnreadNotificationCount(user.id),
      ])
    : [0, 0];

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="shrink-0 font-heading text-xl font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          Incipit
        </Link>
        <nav className="flex items-center gap-1.5 overflow-x-auto [&>*]:shrink-0">
          <Link
            href="/projects"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Projects
          </Link>
          {user ? (
            <>
              <Link
                href="/applications"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Applications
              </Link>
              <Link
                href="/messages"
                className={`relative ${buttonVariants({ variant: "ghost", size: "sm" })}`}
              >
                Messages
                {unreadMessages > 0 && (
                  <Badge className="ml-1.5 border-transparent bg-primary px-1.5 text-primary-foreground">
                    {unreadMessages}
                  </Badge>
                )}
              </Link>
              <Link
                href="/notifications"
                aria-label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ""}`}
                className={`relative ${buttonVariants({ variant: "ghost", size: "icon" })}`}
              >
                <span aria-hidden>🔔</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Dashboard
              </Link>
              <form action={signOut}>
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
