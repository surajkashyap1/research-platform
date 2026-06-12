import { requireUser, ensureProfile } from "@/lib/auth";
import { updateProfile } from "@/app/auth/actions";
import { CAREER_STAGES } from "@/lib/profile";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await ensureProfile(user);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Tell supervisors who you are. You can edit this any time.
      </p>

      <form action={updateProfile} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Full name
          <input
            name="fullName"
            required
            defaultValue={profile.fullName ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-base font-normal focus:border-gray-900 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Career stage
          <select
            name="careerStage"
            defaultValue={profile.careerStage}
            className="rounded-md border border-gray-300 px-3 py-2 text-base font-normal focus:border-gray-900 focus:outline-none"
          >
            {CAREER_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          University / institution
          <input
            name="university"
            defaultValue={profile.university ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-base font-normal focus:border-gray-900 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Specialty / area of interest
          <input
            name="specialty"
            placeholder="e.g. Cardiology, Public health"
            defaultValue={profile.specialty ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-base font-normal focus:border-gray-900 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          About you
          <textarea
            name="summary"
            rows={4}
            placeholder="A short summary of your interests, skills, and what you're looking for."
            defaultValue={profile.summary ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-base font-normal focus:border-gray-900 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Availability
          <input
            name="availability"
            placeholder="e.g. ~5 hours/week"
            defaultValue={profile.availability ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-base font-normal focus:border-gray-900 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="mt-2 self-start rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Save profile
        </button>
      </form>
    </main>
  );
}
