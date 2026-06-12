import { notFound, redirect } from "next/navigation";
import { requireUser, ensureProfile } from "@/lib/auth";
import { getProjectRow } from "@/lib/queries/projects";
import { updateProject } from "@/app/projects/actions";
import { ProjectForm } from "@/components/project-form";
import { SupervisorRequired } from "@/components/supervisor-required";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await requireUser();
  const profile = await ensureProfile(user);

  if (!profile.canSupervise) return <SupervisorRequired />;

  const project = await getProjectRow(id);
  if (!project) notFound();
  if (project.ownerId !== user.id) redirect(`/projects/${id}`);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit project</CardTitle>
          <CardDescription>Update the details of your listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            action={updateProject}
            project={project}
            error={error}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </main>
  );
}
