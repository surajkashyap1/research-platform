import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getReviewableContext } from "@/lib/queries/reviews";
import { submitReview } from "@/app/reviews/actions";
import { dimensionsFor, directionLabel, RATING_MAX, RATING_MIN } from "@/lib/review-meta";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const selectClass =
  "flex h-9 w-28 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; revieweeId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, revieweeId } = await params;
  const { error } = await searchParams;
  const user = await requireUser();

  const ctx = await getReviewableContext(id, user.id, revieweeId);
  if (!ctx) redirect(`/projects/${id}`);
  if (ctx.alreadyReviewed) redirect(`/profile/${revieweeId}`);

  const dims = dimensionsFor(ctx.direction);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
      <Link
        href={`/profile/${revieweeId}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{directionLabel(ctx.direction)}</CardTitle>
          <CardDescription>
            Reviewing {ctx.revieweeName ?? "this user"} for “{ctx.projectTitle}”.
            Rate each from {RATING_MIN} (poor) to {RATING_MAX} (excellent).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <form action={submitReview} className="flex flex-col gap-5">
            <input type="hidden" name="projectId" value={id} />
            <input type="hidden" name="revieweeId" value={revieweeId} />

            {dims.map((d) => (
              <div key={d.key} className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor={d.key}>{d.label}</Label>
                  <p className="text-xs text-muted-foreground">{d.hint}</p>
                </div>
                <select id={d.key} name={d.key} required defaultValue="" className={selectClass}>
                  <option value="" disabled>
                    Rate…
                  </option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="grid gap-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                name="comment"
                rows={3}
                placeholder="Anything that would help others know what it's like to work with them."
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isAnonymous" className="h-4 w-4" />
              Post this review anonymously
            </label>

            <Button type="submit" className="self-start">
              Submit review
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
