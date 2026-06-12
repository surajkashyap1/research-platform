import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Shown to logged-in users who lack the can_supervise flag when they reach a
// page that posts/edits projects. Posting is gated to verified supervisors and
// healthcare professionals (set from a verified email — see plan §8).
export function SupervisorRequired() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Posting is for verified supervisors</CardTitle>
          <CardDescription>
            Projects can be posted by supervisors and healthcare professionals
            whose account is verified from a recognised email (e.g. an NHS trust
            or institutional address). Your account isn&apos;t verified to post
            yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/projects" className={buttonVariants()}>
            Browse projects
          </Link>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
