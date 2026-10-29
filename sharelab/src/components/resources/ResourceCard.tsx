import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Clock3, FlaskConical, MapPin, ShieldCheck } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getResourceImage } from '../../lib/resources'
import type { Resource } from '../../lib/resources'

export interface ResourceCardProps {
  resource: Resource
  className?: string
}

export const ResourceCard = ({ resource, className }: ResourceCardProps) => {
  const [imageFailed, setImageFailed] = useState(false)
  const isActive = resource.status === 'active'

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-(--border-strong) hover:shadow-(--shadow-md)',
        className,
      )}
    >
      {/* Fixed 3:2 media ratio keeps every card in the grid aligned. */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-(--surface-sunken)">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(150deg,var(--soft-beige),var(--surface))]">
            <FlaskConical className="h-8 w-8 text-[rgba(81,53,34,0.28)]" aria-hidden="true" />
          </div>
        ) : (
          <img
            src={getResourceImage(resource)}
            alt={`${resource.name} at ${resource.location}`}
            width={960}
            height={640}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="rounded-[0.35rem] bg-[rgba(255,252,247,0.94)] px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-(--espresso)">
            {resource.category}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[0.35rem] px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em]',
              isActive
                ? 'bg-[rgba(53,107,76,0.92)] text-white'
                : 'bg-[rgba(34,24,18,0.88)] text-(--cream)',
            )}
          >
            <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
            {isActive ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-[1.0625rem] font-semibold leading-snug tracking-[-0.015em] text-(--charcoal)">
            <Link
              to="/resources/$resourceId"
              params={{ resourceId: String(resource.id) }}
              className="rounded-sm transition-colors hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2"
            >
              {resource.name}
            </Link>
          </h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-(--muted)">
            <MapPin className="h-3.5 w-3.5 text-(--bronze)" aria-hidden="true" />
            {resource.location}
          </p>
        </div>

        {resource.description ? (
          <p className="line-clamp-2 text-[0.8125rem] leading-relaxed text-(--muted)">
            {resource.description}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.75rem] text-(--muted)">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-(--bronze)" aria-hidden="true" />
            Up to {resource.max_hours_per_booking}h per booking
          </span>
          {resource.rules ? (
            <span className="inline-flex items-center gap-1.5 text-(--bronze-deep)">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Requirements apply
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-(--border-subtle) pt-3.5">
          <span className="text-[0.75rem] text-(--muted)">Weekly cap {resource.weekly_cap_hours}h</span>
          <Link
            to="/resources/$resourceId"
            params={{ resourceId: String(resource.id) }}
            className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-(--espresso) transition-colors hover:text-(--bronze-deep)"
          >
            View details
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  )
}
