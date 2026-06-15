import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  profileCertifications,
  profiles,
  profileSkills,
  skills,
} from "@/db/schema";

export type ProfileCertification = {
  id: string;
  name: string;
  proofUrl: string | null;
};

export async function getProfileSkills(profileId: string): Promise<string[]> {
  const rows = await db
    .select({ name: skills.name })
    .from(profileSkills)
    .innerJoin(skills, eq(skills.id, profileSkills.skillId))
    .where(eq(profileSkills.profileId, profileId))
    .orderBy(asc(skills.name));

  return rows.map((row) => row.name);
}

export async function getProfileCertifications(
  profileId: string
): Promise<ProfileCertification[]> {
  return db
    .select({
      id: profileCertifications.id,
      name: profileCertifications.name,
      proofUrl: profileCertifications.proofUrl,
    })
    .from(profileCertifications)
    .where(eq(profileCertifications.profileId, profileId))
    .orderBy(asc(profileCertifications.createdAt));
}

export async function getProfileEditorData(profileId: string) {
  const [profileRows, skillNames, certifications] = await Promise.all([
    db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1),
    getProfileSkills(profileId),
    getProfileCertifications(profileId),
  ]);

  return {
    profile: profileRows[0] ?? null,
    skillNames,
    certifications,
  };
}
