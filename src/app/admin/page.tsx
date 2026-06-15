import { notFound } from "next/navigation";
import { requireUser, ensureProfile } from "@/lib/auth";
import { getMetrics } from "@/lib/queries/metrics";
import { Card, CardContent } from "@/components/ui/card";

// Admin-only metrics. Access is gated by the ADMIN_EMAILS env var (comma-
// separated). If unset, nobody can view it — returns 404 rather than leaking
// that the page exists.
export default async function AdminPage() {
  const user = await requireUser();
  const profile = await ensureProfile(user);
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!admins.includes(profile.email.toLowerCase())) notFound();

  const m = await getMetrics();

  const stats: { label: string; value: string | number; hint?: string }[] = [
    { label: "Total users", value: m.totalUsers },
    { label: "Verified users", value: m.verifiedUsers },
    { label: "Complete profiles", value: `${m.completeProfilePct}%`, hint: "≥ 80% complete" },
    { label: "Active listings", value: m.activeListings },
    { label: "Beginner-friendly (active)", value: m.beginnerFriendlyActive },
    { label: "Total applications", value: m.totalApplications },
    { label: "Accepted (matches)", value: m.acceptedApplications },
    { label: "Apps / active listing", value: m.avgApplicationsPerActiveListing },
    { label: "Reviews written", value: m.totalReviews },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Metrics</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Key launch indicators. Visible to admins only.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</p>
              {s.hint && (
                <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
