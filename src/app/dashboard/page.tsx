import Link from "next/link";
import { requireUser, ensureProfile } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { CAREER_STAGES } from "@/lib/profile";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await ensureProfile(user);

  const stageLabel =
    CAREER_STAGES.find((s) => s.value === profile.careerStage)?.label ??
    "Not set";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi, {profile.fullName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Verification status */}
      <div className="mt-8 flex flex-wrap gap-2">
        {profile.isVerified ? (
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            ✓ Verified
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Unverified — sign up with a .ac.uk or NHS email to verify
          </span>
        )}
        {profile.canSupervise && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Can supervise
          </span>
        )}
        {profile.isNewResearcher && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            New researcher
          </span>
        )}
      </div>

      {/* Profile completeness */}
      <div className="mt-8 rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Profile completeness</h2>
          <span className="text-sm text-gray-500">
            {profile.profileCompleteness}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-900 transition-all"
            style={{ width: `${profile.profileCompleteness}%` }}
          />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500">Career stage</dt>
            <dd className="font-medium">{stageLabel}</dd>
          </div>
          <div>
            <dt className="text-gray-500">University</dt>
            <dd className="font-medium">{profile.university ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Specialty</dt>
            <dd className="font-medium">{profile.specialty ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Availability</dt>
            <dd className="font-medium">{profile.availability ?? "—"}</dd>
          </div>
        </dl>
        <Link
          href="/onboarding"
          className="mt-5 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Edit profile
        </Link>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Next: browse and post research projects (Phase 2).
      </p>
    </main>
  );
}
