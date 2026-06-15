import type { InferSelectModel } from "drizzle-orm";
import type { reviews } from "@/db/schema";

export type Review = InferSelectModel<typeof reviews>;
export type ReviewDirection = "supervisor_to_member" | "member_to_supervisor";

export const RATING_MIN = 1;
export const RATING_MAX = 5;

// Dimensions a supervisor rates a team member on (ROADMAP §5).
export const MEMBER_DIMENSIONS = [
  { key: "reliability", label: "Reliability", hint: "Showed up and followed through" },
  { key: "communication", label: "Communication", hint: "Responsive and clear" },
  { key: "contribution", label: "Contribution", hint: "Quality and quantity of work" },
  { key: "meetsDeadlines", label: "Meets deadlines", hint: "Delivered on time" },
] as const;

// Dimensions a member rates a supervisor on (ROADMAP §5 / plan §11).
export const SUPERVISOR_DIMENSIONS = [
  { key: "communication", label: "Communication", hint: "Responsive and clear" },
  { key: "supervision", label: "Supervision", hint: "Helpful guidance and support" },
  { key: "teaching", label: "Teaching", hint: "Helped you learn" },
  { key: "fairAuthorship", label: "Fair authorship", hint: "Fair credit and authorship" },
] as const;

export type Dimension =
  | (typeof MEMBER_DIMENSIONS)[number]
  | (typeof SUPERVISOR_DIMENSIONS)[number];

export function dimensionsFor(direction: ReviewDirection): readonly Dimension[] {
  return direction === "supervisor_to_member"
    ? MEMBER_DIMENSIONS
    : SUPERVISOR_DIMENSIONS;
}

export function directionLabel(direction: ReviewDirection): string {
  return direction === "supervisor_to_member"
    ? "Review of team member"
    : "Review of supervisor";
}
