import { requireUser, ensureProfile } from "@/lib/auth";
import { updateProfile } from "@/app/auth/actions";
import { CAREER_STAGES } from "@/lib/profile";
import { getProfileEditorData } from "@/lib/queries/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  await ensureProfile(user);
  const [{ error }, editorData] = await Promise.all([
    searchParams,
    getProfileEditorData(user.id),
  ]);
  const profile = editorData.profile;
  if (!profile) throw new Error("Profile could not be loaded.");
  const certificationRows = [
    ...editorData.certifications,
    ...Array.from({ length: Math.max(1, 3 - editorData.certifications.length) }, (_, i) => ({
      id: `new-${i}`,
      name: "",
      proofUrl: null,
    })),
  ];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>
            Tell supervisors who you are. You can edit this any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="flex flex-col gap-5">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="avatar">Profile picture (optional)</Label>
              <input
                type="hidden"
                name="existingAvatarUrl"
                value={profile.avatarUrl ?? ""}
              />
              <div className="flex items-center gap-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="h-16 w-16 rounded-full border object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-muted text-lg font-semibold text-muted-foreground">
                    {profile.fullName?.slice(0, 1).toUpperCase() ?? "U"}
                  </div>
                )}
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                defaultValue={profile.fullName ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="careerStage">Career stage</Label>
              <Select
                id="careerStage"
                name="careerStage"
                defaultValue={profile.careerStage}
                options={CAREER_STAGES}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="university">University / institution</Label>
              <Input
                id="university"
                name="university"
                defaultValue={profile.university ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialty">Specialty / area of interest</Label>
              <Input
                id="specialty"
                name="specialty"
                placeholder="e.g. Cardiology, Public health"
                defaultValue={profile.specialty ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="summary">About you</Label>
              <Textarea
                id="summary"
                name="summary"
                rows={4}
                placeholder="A short summary of your interests, skills, and what you're looking for."
                defaultValue={profile.summary ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="availabilityHoursPerWeek">Availability (hours per week)</Label>
              <Input
                id="availabilityHoursPerWeek"
                name="availabilityHoursPerWeek"
                type="number"
                min="0"
                max="80"
                step="1"
                placeholder="e.g. 5"
                defaultValue={profile.availabilityHoursPerWeek ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                name="skills"
                rows={3}
                placeholder="e.g. literature screening, data extraction, statistics"
                defaultValue={editorData.skillNames.join(", ")}
              />
            </div>

            <div className="grid gap-3">
              <div>
                <Label>Certifications and proof</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add courses, certificates, or training and upload proof where useful.
                </p>
              </div>
              {certificationRows.map((certification, index) => (
                <div
                  key={certification.id}
                  className="grid gap-2 rounded-md border bg-muted/20 p-3 sm:grid-cols-[1fr_1fr]"
                >
                  <div className="grid gap-2">
                    <Label htmlFor={`certName-${index}`}>Certification</Label>
                    <Input
                      id={`certName-${index}`}
                      name="certName"
                      placeholder="e.g. GCP training"
                      defaultValue={certification.name}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`certProofFile-${index}`}>Proof upload</Label>
                    <input
                      type="hidden"
                      name="certProofUrl"
                      value={certification.proofUrl ?? ""}
                    />
                    <Input
                      id={`certProofFile-${index}`}
                      name="certProofFile"
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                    />
                    {certification.proofUrl && (
                      <a
                        href={certification.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Current proof
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preferredProjectTypes">Project types you are looking for</Label>
              <Textarea
                id="preferredProjectTypes"
                name="preferredProjectTypes"
                rows={2}
                placeholder="e.g. audit, retrospective study, poster"
                defaultValue={profile.preferredProjectTypes ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preferredSpecialties">Specialties you are looking for</Label>
              <Textarea
                id="preferredSpecialties"
                name="preferredSpecialties"
                rows={2}
                placeholder="e.g. cardiology, surgery, public health"
                defaultValue={profile.preferredSpecialties ?? ""}
              />
            </div>

            <Button type="submit" className="mt-2 self-start">
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
