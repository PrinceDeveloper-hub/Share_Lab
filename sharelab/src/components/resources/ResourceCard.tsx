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
        'group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[var(--border-subtle)] bg-[rgba(255,252,247,0.72)] shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(82,59,45,0.2)] hover:shadow-[var(--shadow-md)]',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--soft-beige)]">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,var(--soft-beige),var(--cream))]">
            <FlaskConical className="h-10 w-10 text-[rgba(75,47,31,0.32)]" aria-hidden="true" />
          </div>
        ) : (
          <img
            src={getResourceImage(resource)}
            alt={`${resource.name} at ${resource.location}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="rounded-full bg-[rgba(255,252,247,0.92)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--espresso)] shadow-sm backdrop-blur">
            {resource.category}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] shadow-sm backdrop-blur',
              isActive
                ? 'bg-[rgba(56,118,83,0.92)] text-white'
                : 'bg-[rgba(48,34,25,0.88)] text-[var(--cream)]',
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold leading-snug text-[var(--charcoal)]">
            <Link
              to="/resources/$resourceId"
              params={{ resourceId: String(resource.id) }}
              className="rounded-sm transition-colors hover:text-[var(--espresso)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              {resource.name}
            </Link>
          </h3>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {resource.location}
          </p>
        </div>

        {resource.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
            {resource.description}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 text-[0.7rem] font-medium text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(75,47,31,0.055)] px-2.5 py-1">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            Up to {resource.max_hours_per_booking}h per booking
          </span>
          {resource.rules ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(183,121,50,0.1)] px-2.5 py-1 text-[var(--warning)]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Requirements apply
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
          <span className="text-xs text-[var(--muted)]">Weekly cap: {resource.weekly_cap_hours}h</span>
          <Link
            to="/resources/$resourceId"
            params={{ resourceId: String(resource.id) }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--espresso)] transition-colors hover:text-[var(--deep-brown)]"
          >
            View resource
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
