import { requireUser, ensureProfile } from "@/lib/auth";
import { createProject } from "@/app/projects/actions";
import { ProjectForm } from "@/components/project-form";
import { SupervisorRequired } from "@/components/supervisor-required";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const profile = await ensureProfile(user);
  const { error } = await searchParams;

  if (!profile.isVerified) return <SupervisorRequired />;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Post a project</CardTitle>
          <CardDescription>
            Listing is free. Be clear about the work and what collaborators get out
            of it — beginner-friendly projects get more visibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            action={createProject}
            error={error}
            submitLabel="Post project"
          />
        </CardContent>
      </Card>
    </main>
  );
}
