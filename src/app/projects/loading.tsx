import { PageSkeleton } from "@/components/loading-skeleton";

export default function Loading() {
  return <PageSkeleton maxW="max-w-5xl" rows={6} />;
}
