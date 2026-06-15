import { requireUser, ensureProfile } from "@/lib/auth";
import { updateProfile } from "@/app/auth/actions";
import { CAREER_STAGES } from "@/lib/profile";
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

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await ensureProfile(user);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>
            Tell supervisors who you are. You can edit this any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="flex flex-col gap-5">
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
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                name="availability"
                placeholder="e.g. ~5 hours/week"
                defaultValue={profile.availability ?? ""}
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
