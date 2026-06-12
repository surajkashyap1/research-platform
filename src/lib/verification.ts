// Email-domain based verification (Phase 1).
// UK university emails (*.ac.uk) verify a student/academic.
// NHS emails (nhs.net or *.nhs.uk) verify a healthcare professional and make
// them *eligible* to supervise (final supervisor status also depends on their
// career stage, refined at onboarding — see docs/ROADMAP.md §4).

export type EmailClass = {
  isVerified: boolean;
  canSupervise: boolean;
  kind: "university" | "nhs" | null;
};

export function classifyEmail(email: string): EmailClass {
  const domain = (email.toLowerCase().trim().split("@")[1] ?? "");
  if (domain.endsWith(".ac.uk")) {
    return { isVerified: true, canSupervise: false, kind: "university" };
  }
  if (domain === "nhs.net" || domain.endsWith(".nhs.uk")) {
    return { isVerified: true, canSupervise: true, kind: "nhs" };
  }
  return { isVerified: false, canSupervise: false, kind: null };
}
