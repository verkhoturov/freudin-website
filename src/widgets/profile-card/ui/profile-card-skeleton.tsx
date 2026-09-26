import { Skeleton } from "@/shared/ui/skeleton";

export function ProfileCardSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
      <span className="sr-only">Loading…</span>
      <Skeleton className="size-24 rounded-full" />
      <div className="flex w-full flex-col items-center gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex w-full flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
