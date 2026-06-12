import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { projectTypeLabel, experienceLabel } from "@/lib/project-meta";
import type { ProjectListItem } from "@/lib/queries/projects";

export function ProjectCard({ p }: { p: ProjectListItem }) {
  return (
    <Link
      href={`/projects/${p.id}`}
      className="block rounded-lg border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug text-card-foreground">
          {p.title}
        </h3>
        {p.isBeginnerFriendly && (
          <Badge className="shrink-0 border-transparent bg-emerald-600 text-white">
            Beginner
          </Badge>
        )}
      </div>

      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
        {p.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary">{projectTypeLabel(p.projectType)}</Badge>
        <Badge variant="outline">{experienceLabel(p.experienceLevel)}</Badge>
        {p.specialty && <Badge variant="outline">{p.specialty}</Badge>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{p.ownerName ?? "Unknown"}</span>
        <span>
          {p.applicationCount} application{p.applicationCount === 1 ? "" : "s"}
          {" · "}
          {p.positionsAvailable} spot{p.positionsAvailable === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}
