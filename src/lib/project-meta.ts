import type { InferSelectModel } from "drizzle-orm";
import type { projects } from "@/db/schema";

export type Project = InferSelectModel<typeof projects>;
export type ProjectType = Project["projectType"];
export type ExperienceLevel = Project["experienceLevel"];
export type ProjectStatus = Project["status"];

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "audit", label: "Audit" },
  { value: "systematic_review", label: "Systematic review" },
  { value: "literature_review", label: "Literature review" },
  { value: "case_study", label: "Case study / report" },
  { value: "retrospective", label: "Retrospective study" },
  { value: "prospective_study", label: "Prospective study" },
  { value: "poster", label: "Poster / presentation" },
  { value: "teaching", label: "Teaching" },
  { value: "other", label: "Other" },
];

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner_welcome", label: "Beginner welcome" },
  { value: "some_experience", label: "Some experience preferred" },
  { value: "experienced_only", label: "Experienced only" },
];

// Entry-level role categories (ROADMAP §9). Empty value = not specified.
export const ROLE_CATEGORIES: string[] = [
  "Data extraction",
  "Literature screening",
  "Referencing",
  "Audit admin",
  "Formatting",
  "Poster creation",
  "Presentation slides",
  "Writing",
  "Statistics",
  "Other",
];

export function projectTypeLabel(value: ProjectType): string {
  return PROJECT_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function experienceLabel(value: ExperienceLevel): string {
  return EXPERIENCE_LEVELS.find((e) => e.value === value)?.label ?? value;
}

export const PROJECT_TYPE_VALUES = new Set(PROJECT_TYPES.map((t) => t.value));
export const EXPERIENCE_VALUES = new Set(EXPERIENCE_LEVELS.map((e) => e.value));
