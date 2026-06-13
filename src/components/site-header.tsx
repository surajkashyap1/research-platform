import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { Button, buttonVariants } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          Incipit
        </Link>
        <nav className="flex items-center gap-1.5">
          <Link
            href="/projects"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Projects
          </Link>
          {user ? (
            <>
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
