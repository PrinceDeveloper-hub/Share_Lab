import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowUpRight,
  Clock3,
  FlaskConical,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { getResourceImage } from '../../lib/resources'
import type { Resource } from '../../lib/resources'

export interface ResourceCardProps {
  resource: Resource
  className?: string
  eager?: boolean
}

export const ResourceCard = ({
  resource,
  className,
  eager,
}: ResourceCardProps) => {
  const [imageFailed, setImageFailed] = useState(false)
  const isActive = resource.status === 'active'

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--soft-beige)]">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,var(--soft-beige),var(--cream))]">
            <FlaskConical
              className="h-9 w-9 text-[rgba(81,53,34,0.28)]"
              aria-hidden="true"
            />
          </div>
        ) : (
          <img
            src={getResourceImage(resource)}
            alt={`${resource.name} at ${resource.location}`}
            className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="rounded-[0.375rem] bg-[rgba(43,29,20,0.72)] px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--cream)] backdrop-blur-sm">
            {resource.category}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] backdrop-blur-sm',
              isActive
                ? 'bg-[rgba(248,245,239,0.92)] text-[var(--success)]'
                : 'bg-[rgba(43,29,20,0.72)] text-[rgba(248,245,239,0.82)]',
            )}
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-current"
              aria-hidden="true"
            />
            {isActive ? 'Published' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-[0.7rem] font-medium text-[var(--muted)]">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          {resource.location}
        </p>

        <h3 className="mt-1.5 font-display text-[1.0625rem] font-semibold leading-snug text-[var(--charcoal)]">
          <Link
            to="/resources/$resourceId"
            params={{ resourceId: String(resource.id) }}
            className="rounded-sm transition-colors hover:text-[var(--espresso)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {resource.name}
          </Link>
        </h3>

        {resource.description ? (
          <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            {resource.description}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.7rem] text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock3
              className="h-3.5 w-3.5 text-[var(--bronze-deep)]"
              aria-hidden="true"
            />
            {resource.max_hours_per_booking}h per booking
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck
              className={cn(
                'h-3.5 w-3.5',
                resource.rules
                  ? 'text-[var(--warning)]'
                  : 'text-[var(--bronze-deep)]',
              )}
              aria-hidden="true"
            />
            {resource.rules ? 'Requirements apply' : 'Open access'}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3.5">
          <span className="font-mono text-[0.68rem] text-[var(--muted)]">
            {resource.weekly_cap_hours}h weekly cap
          </span>
          <Link
            to="/resources/$resourceId"
            params={{ resourceId: String(resource.id) }}
            className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--espresso)] transition-colors hover:text-[var(--bronze-deep)]"
          >
            View
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
