import { Skeleton } from '../ui/Skeleton'

export const ResourceCardSkeleton = () => (
  <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)]">
    <Skeleton className="aspect-[4/3] w-full rounded-none bg-[rgba(167,130,96,0.14)]" />
    <div className="flex flex-col gap-3 p-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <div className="mt-2 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
)

export default ResourceCardSkeleton
