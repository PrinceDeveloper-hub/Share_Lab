export const ResourceCardSkeleton = () => {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-[rgba(255,252,247,0.6)]"
    >
      <div className="aspect-[4/3] animate-pulse bg-[rgba(214,189,164,0.38)]" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded-full bg-[rgba(214,189,164,0.5)]" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-[rgba(214,189,164,0.5)]" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-[rgba(214,189,164,0.4)]" />
        <div className="h-3 w-full animate-pulse rounded-full bg-[rgba(214,189,164,0.35)]" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-[rgba(214,189,164,0.35)]" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-28 animate-pulse rounded-full bg-[rgba(214,189,164,0.4)]" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-[rgba(214,189,164,0.4)]" />
        </div>
      </div>
    </div>
  )
}
