import { cn } from '../../lib/utils'

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      'animate-pulse rounded-md bg-[rgba(167,130,96,0.16)]',
      className,
    )}
  />
)

export const StatSkeleton = () => (
  <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-4 h-7 w-16" />
    <Skeleton className="mt-3 h-3 w-32" />
  </div>
)

export default Skeleton
