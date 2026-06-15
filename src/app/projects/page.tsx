import Link from "next/link";
import { getSessionUser, getProfile } from "@/lib/auth";
import {
  listOpenProjects,
  type ProjectTab,
} from "@/lib/queries/projects";
import { ProjectCard } from "@/components/project-card";
import {
  PROJECT_TYPES,
  EXPERIENCE_LEVELS,
  PROJECT_TYPE_VALUES,
  EXPERIENCE_VALUES,
  type ProjectType,
  type ExperienceLevel,
} from "@/lib/project-meta";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";

type SP = {
  q?: string;
  specialty?: string;
  type?: string;
  experience?: string;
  tab?: string;
};

const TABS: { value: ProjectTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "beginner", label: "Beginner roles" },
  { value: "competitive", label: "Competitive roles" },
];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const user = await getSessionUser();
  const canSupervise = user ? (await getProfile(user.id))?.canSupervise ?? false : false;

  const tab: ProjectTab = (["all", "beginner", "competitive"] as const).includes(
    sp.tab as ProjectTab
  )
    ? (sp.tab as ProjectTab)
    : "all";
  const type = PROJECT_TYPE_VALUES.has(sp.type as ProjectType)
    ? (sp.type as ProjectType)
    : undefined;
  const experience = EXPERIENCE_VALUES.has(sp.experience as ExperienceLevel)
    ? (sp.experience as ExperienceLevel)
    : undefined;
  const q = sp.q?.trim() || undefined;
  const specialty = sp.specialty?.trim() || undefined;

  const projects = await listOpenProjects({ q, specialty, type, experience, tab });

  const tabHref = (t: ProjectTab) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (specialty) params.set("specialty", specialty);
    if (type) params.set("type", type);
    if (experience) params.set("experience", experience);
    if (t !== "all") params.set("tab", t);
    const qs = params.toString();
    return qs ? `/projects?${qs}` : "/projects";
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Research projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse open opportunities. {projects.length} shown.
          </p>
        </div>
        {canSupervise && (
          <Link href="/projects/new" className={buttonVariants()}>
            Post a project
          </Link>
        )}
      </div>

      {/* Tabs */}
      <nav className="mt-6 flex gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={tabHref(t.value)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* Filters (GET form) */}
      <form className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input type="hidden" name="tab" value={tab} />
        <Input name="q" placeholder="Search title or description" defaultValue={q ?? ""} />
        <Input name="specialty" placeholder="Specialty" defaultValue={specialty ?? ""} />
        <Select
          name="type"
          defaultValue={type ?? ""}
          options={[{ value: "", label: "Any type" }, ...PROJECT_TYPES]}
        />
        <div className="flex gap-2">
          <Select
            name="experience"
            defaultValue={experience ?? ""}
            className="flex-1"
            options={[{ value: "", label: "Any level" }, ...EXPERIENCE_LEVELS]}
          />
          <Button type="submit" variant="outline">
            Filter
          </Button>
        </div>
      </form>

      {/* Results */}
      {projects.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No projects match. Try clearing filters
            {canSupervise ? " — or be the first to post one." : "."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}
