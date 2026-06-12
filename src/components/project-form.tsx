import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PROJECT_TYPES,
  EXPERIENCE_LEVELS,
  ROLE_CATEGORIES,
  type Project,
} from "@/lib/project-meta";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function ProjectForm({
  action,
  project,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  project?: Project | null;
  error?: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      {project && <input type="hidden" name="id" value={project.id} />}

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-2">
        <Label htmlFor="title">Project title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="e.g. Retrospective audit of A&E waiting times"
          defaultValue={project?.title ?? ""}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={6}
          placeholder="What is the project, what will collaborators do, expected outputs and timeline?"
          defaultValue={project?.description ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="projectType">Type</Label>
          <select
            id="projectType"
            name="projectType"
            defaultValue={project?.projectType ?? "audit"}
            className={selectClass}
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="experienceLevel">Experience level</Label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            defaultValue={project?.experienceLevel ?? "beginner_welcome"}
            className={selectClass}
          >
            {EXPERIENCE_LEVELS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialty"
            name="specialty"
            placeholder="e.g. Cardiology"
            defaultValue={project?.specialty ?? ""}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="roleCategory">Entry-level role (optional)</Label>
          <select
            id="roleCategory"
            name="roleCategory"
            defaultValue={project?.roleCategory ?? ""}
            className={selectClass}
          >
            <option value="">— None —</option>
            {ROLE_CATEGORIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="positionsAvailable">Positions available</Label>
          <Input
            id="positionsAvailable"
            name="positionsAvailable"
            type="number"
            min={1}
            defaultValue={project?.positionsAvailable ?? 1}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="applicationDeadline">Application deadline (optional)</Label>
          <Input
            id="applicationDeadline"
            name="applicationDeadline"
            type="date"
            defaultValue={project?.applicationDeadline ?? ""}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isBeginnerFriendly"
          defaultChecked={project?.isBeginnerFriendly ?? false}
          className="size-4 rounded border-input accent-primary"
        />
        Mark as beginner-friendly (gets higher visibility)
      </label>

      <Button type="submit" className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
