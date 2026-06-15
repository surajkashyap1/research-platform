import { and, count, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { applications, projects, profiles } from "@/db/schema";
import {
  APPLICATION_WINDOW_DAYS,
  BASE_APPLICATION_LIMIT,
  BONUS_APPLICATION_LIMIT,
  type ApplicationStatus,
} from "@/lib/application-meta";
import { projectTypeLabel } from "@/lib/project-meta";

function windowStart(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export type ApplicationAllowance = {
  used: number;
  limit: number;
  remaining: number;
  bonus: boolean;
  windowDays: number;
  resetsAt: Date | null;
};

// Rolling-window allowance (ROADMAP §3). Computed in app logic, not a table —
// see the applications_applicant_time_idx index that backs this lookup.
export async function getApplicationAllowance(
  applicantId: string
): Promise<ApplicationAllowance> {
  const since = windowStart(APPLICATION_WINDOW_DAYS);

  const [{ value: used }] = await db
    .select({ value: count() })
    .from(applications)
    .where(
      and(
        eq(applications.applicantId, applicantId),
        gte(applications.createdAt, since)
      )
    );

  // Bonus eligibility: the user has posted at least one project (plan §8).
  const [{ value: posted }] = await db
    .select({ value: count() })
    .from(projects)
    .where(eq(projects.ownerId, applicantId));

  const bonus = posted > 0;
  const limit =
    BASE_APPLICATION_LIMIT + (bonus ? BONUS_APPLICATION_LIMIT : 0);

  // When the oldest application in the window ages out, one slot frees up.
  let resetsAt: Date | null = null;
  if (used >= limit) {
    const [oldest] = await db
      .select({ createdAt: applications.createdAt })
      .from(applications)
      .where(
        and(
          eq(applications.applicantId, applicantId),
          gte(applications.createdAt, since)
        )
      )
      .orderBy(applications.createdAt)
      .limit(1);
    if (oldest) {
      resetsAt = new Date(
        oldest.createdAt.getTime() + APPLICATION_WINDOW_DAYS * 24 * 60 * 60 * 1000
      );
    }
  }

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    bonus,
    windowDays: APPLICATION_WINDOW_DAYS,
    resetsAt,
  };
}

// Has this user already applied to this project? (unique constraint backs this)
export async function getMyApplication(projectId: string, applicantId: string) {
  const rows = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.projectId, projectId),
        eq(applications.applicantId, applicantId)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export type MyApplicationItem = {
  id: string;
  status: ApplicationStatus;
  createdAt: Date;
  motivation: string;
  projectId: string;
  projectTitle: string;
  projectStatus: string;
  projectTypeLabel: string;
};

// Applicant dashboard: the current user's applications with project context.
export async function getApplicationsByApplicant(
  applicantId: string
): Promise<MyApplicationItem[]> {
  const rows = await db
    .select({
      id: applications.id,
      status: applications.status,
      createdAt: applications.createdAt,
      motivation: applications.motivation,
      projectId: projects.id,
      projectTitle: projects.title,
      projectStatus: projects.status,
      projectType: projects.projectType,
    })
    .from(applications)
    .innerJoin(projects, eq(projects.id, applications.projectId))
    .where(eq(applications.applicantId, applicantId))
    .orderBy(desc(applications.createdAt));

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    createdAt: r.createdAt,
    motivation: r.motivation,
    projectId: r.projectId,
    projectTitle: r.projectTitle,
    projectStatus: r.projectStatus,
    projectTypeLabel: projectTypeLabel(r.projectType),
  }));
}

export type ApplicantItem = {
  id: string;
  status: ApplicationStatus;
  createdAt: Date;
  motivation: string;
  suitability: string;
  skillsSummary: string | null;
  applicantId: string;
  applicantName: string | null;
  applicantUniversity: string | null;
  applicantCareerStage: string;
  applicantVerified: boolean;
  applicantNewResearcher: boolean;
};

// Lister view: everyone who applied to a project the current user owns.
// Shortlisted first, then pending, then decided — newest within each.
export async function getApplicantsForProject(
  projectId: string
): Promise<ApplicantItem[]> {
  return db
    .select({
      id: applications.id,
      status: applications.status,
      createdAt: applications.createdAt,
      motivation: applications.motivation,
      suitability: applications.suitability,
      skillsSummary: applications.skillsSummary,
      applicantId: profiles.id,
      applicantName: profiles.fullName,
      applicantUniversity: profiles.university,
      applicantCareerStage: profiles.careerStage,
      applicantVerified: profiles.isVerified,
      applicantNewResearcher: profiles.isNewResearcher,
    })
    .from(applications)
    .innerJoin(profiles, eq(profiles.id, applications.applicantId))
    .where(eq(applications.projectId, projectId))
    .orderBy(desc(applications.createdAt));
}
