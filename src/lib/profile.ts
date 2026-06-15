import type { InferSelectModel } from "drizzle-orm";
import type { profiles } from "@/db/schema";

export type Profile = InferSelectModel<typeof profiles>;

// Profile completeness (0–100) — drives the onboarding nudge (ROADMAP §1).
const COMPLETENESS_FIELDS: (keyof Profile)[] = [
  "fullName",
  "university",
  "specialty",
  "summary",
  "avatarUrl",
  "preferredProjectTypes",
  "preferredSpecialties",
];

export function computeCompleteness(p: Partial<Profile>): number {
  let filled = 0;
  for (const f of COMPLETENESS_FIELDS) {
    const v = p[f];
    if (typeof v === "string" && v.trim().length > 0) filled++;
  }
  if (
    typeof p.availabilityHoursPerWeek === "number" &&
    p.availabilityHoursPerWeek > 0
  ) {
    filled++;
  }
  // career stage chosen (not the default 'other') counts too
  if (p.careerStage && p.careerStage !== "other") filled++;
  const total = COMPLETENESS_FIELDS.length + 2;
  return Math.round((filled / total) * 100);
}

export function parseHoursPerWeek(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(80, Math.max(0, parsed));
}

export function parseListText(value: FormDataEntryValue | null): string | null {
  const items = String(value ?? "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (items.length === 0) return null;
  return Array.from(new Set(items)).join(", ");
}

export function parseSkillNames(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/[\n,]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index)
    .slice(0, 20);
}

// Labels for the career_stage enum, grouped for the onboarding dropdown.
export const CAREER_STAGES: { value: Profile["careerStage"]; label: string }[] = [
  { value: "medical_student", label: "Medical student" },
  { value: "dental_student", label: "Dental student" },
  { value: "nursing_student", label: "Nursing student" },
  { value: "other_student", label: "Other student" },
  { value: "foundation_doctor", label: "Foundation doctor" },
  { value: "junior_doctor", label: "Junior doctor" },
  { value: "registrar", label: "Registrar" },
  { value: "consultant", label: "Consultant" },
  { value: "dentist", label: "Dentist" },
  { value: "qualified_nurse", label: "Qualified nurse" },
  { value: "professor", label: "Professor" },
  { value: "postdoc", label: "Postdoctoral researcher" },
  { value: "staff_grade", label: "Staff grade" },
  { value: "other", label: "Other" },
];
