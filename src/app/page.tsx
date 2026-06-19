import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-20">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        UK · students &amp; healthcare professionals
      </span>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Bringing research to you
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted-foreground">
        Find opportunities, build networks, and advance your career.
      </p>

      <div className="mt-8 flex gap-3">
        {user ? (
          <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              Get started
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Log in
            </Link>
          </>
        )}
      </div>

      <dl className="mt-16 grid gap-6 border-t pt-10 sm:grid-cols-3">
        {[
          ["Find opportunities", "Audits, reviews, case studies and posters, filtered by experience level."],
          ["Built for beginners", "Beginner-friendly roles and a New Researcher badge. Everyone starts somewhere."],
          ["Build trust", "Reviews and reliability scores from real projects, shown on your profile."],
        ].map(([title, body]) => (
          <div key={title}>
            <dt className="text-sm font-semibold text-foreground">{title}</dt>
            <dd className="mt-1.5 text-sm text-muted-foreground">{body}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
