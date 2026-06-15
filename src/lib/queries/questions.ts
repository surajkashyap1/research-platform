import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { listingQuestions, profiles } from "@/db/schema";

export type ListingQuestion = {
  id: string;
  question: string;
  answer: string | null;
  answeredAt: Date | null;
  createdAt: Date;
  askerId: string;
  askerName: string | null;
};

// Public Q&A on a listing (ROADMAP §3 / plan §7). Visible to everyone.
export async function getQuestionsForProject(
  projectId: string
): Promise<ListingQuestion[]> {
  return db
    .select({
      id: listingQuestions.id,
      question: listingQuestions.question,
      answer: listingQuestions.answer,
      answeredAt: listingQuestions.answeredAt,
      createdAt: listingQuestions.createdAt,
      askerId: listingQuestions.askerId,
      askerName: profiles.fullName,
    })
    .from(listingQuestions)
    .leftJoin(profiles, eq(profiles.id, listingQuestions.askerId))
    .where(eq(listingQuestions.projectId, projectId))
    .orderBy(asc(listingQuestions.createdAt));
}
