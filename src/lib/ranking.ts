// Fair applicant ranking (ROADMAP §6 / plan §10). Pure, transparent, server-
// side scoring — no ML. Every component is explainable to the lister, beginners
// are boosted, and prior experience is deliberately a minor factor (low weight).

export type RankingInput = {
  // applicant signals
  reliabilityScore: number | null; // 0..5, or null if never reviewed
  reviewCount: number; // supervisor reviews received (experience proxy)
  isNewResearcher: boolean;
  profileCompleteness: number; // 0..100
  hasAvailability: boolean;
  applicantSpecialty: string | null;
  skillsSummary: string | null; // from the application
  motivationWords: number; // words across motivation + suitability
  // project context
  beginnerFriendly: boolean;
  projectSpecialty: string | null;
  roleCategory: string | null;
};

export type RankingComponent = {
  key: string;
  label: string;
  weight: number; // 0..1, weights sum to 1
  value: number; // normalised 0..1
};

export type RankingResult = {
  score: number; // 0..100
  components: RankingComponent[];
};

const WEIGHTS = {
  reliability: 0.2,
  motivation: 0.2,
  skills: 0.15,
  beginnerBoost: 0.15,
  availability: 0.1,
  priorExperience: 0.1,
  profileCompleteness: 0.1,
} as const;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function tokenise(...parts: (string | null | undefined)[]): Set<string> {
  const text = parts.filter(Boolean).join(" ").toLowerCase();
  return new Set(
    text
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2)
  );
}

function skillMatch(input: RankingInput): number {
  const want = tokenise(input.projectSpecialty, input.roleCategory);
  if (want.size === 0) return 0.6; // nothing to match on → neutral
  const have = tokenise(input.skillsSummary, input.applicantSpecialty);
  let hit = 0;
  for (const t of want) if (have.has(t)) hit++;
  return clamp01(hit / want.size);
}

function beginnerBoost(input: RankingInput): number {
  if (input.isNewResearcher) return input.beginnerFriendly ? 1 : 0.6;
  return 0.3; // experienced applicants don't need the boost
}

export function scoreApplicant(input: RankingInput): RankingResult {
  const components: RankingComponent[] = [
    {
      key: "reliability",
      label: "Reliability",
      weight: WEIGHTS.reliability,
      // Unrated applicants get a fair neutral score, not a penalty.
      value: input.reliabilityScore != null ? clamp01(input.reliabilityScore / 5) : 0.6,
    },
    {
      key: "motivation",
      label: "Motivation",
      weight: WEIGHTS.motivation,
      value: clamp01(input.motivationWords / 80),
    },
    {
      key: "skills",
      label: "Relevant skills",
      weight: WEIGHTS.skills,
      value: skillMatch(input),
    },
    {
      key: "beginnerBoost",
      label: "Beginner boost",
      weight: WEIGHTS.beginnerBoost,
      value: beginnerBoost(input),
    },
    {
      key: "availability",
      label: "Availability",
      weight: WEIGHTS.availability,
      value: input.hasAvailability ? 1 : 0.4,
    },
    {
      key: "priorExperience",
      label: "Prior experience",
      weight: WEIGHTS.priorExperience,
      // Capped at 3 projects so experience never dominates (plan §10).
      value: clamp01(Math.min(input.reviewCount, 3) / 3),
    },
    {
      key: "profileCompleteness",
      label: "Profile completeness",
      weight: WEIGHTS.profileCompleteness,
      value: clamp01(input.profileCompleteness / 100),
    },
  ];

  const score = Math.round(
    100 * components.reduce((sum, c) => sum + c.weight * c.value, 0)
  );
  return { score, components };
}
