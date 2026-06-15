import { Skeleton } from "@/components/ui/skeleton";

// Shared loading fallback used by route-level loading.tsx files. Mirrors the
// page container so layout doesn't shift when content arrives.
export function PageSkeleton({
  maxW = "max-w-3xl",
  rows = 4,
}: {
  maxW?: string;
  rows?: number;
}) {
  return (
    <main className={`mx-auto w-full ${maxW} flex-1 px-6 py-10`}>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-8 flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </main>
  );
}
