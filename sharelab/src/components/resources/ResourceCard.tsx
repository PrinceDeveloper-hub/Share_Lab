import { useState } from 'react'
import { Link } from '@tanstack/react-router'
<<<<<<< HEAD
import { motion, useReducedMotion } from 'framer-motion'
=======
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
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
  const reduceMotion = Boolean(useReducedMotion())

  return (
    <motion.article
      initial={false}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -4, rotateX: 1.2, rotateY: -1.2, scale: 1.008 }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 22,
        mass: 0.7,
      }}
      style={{ transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      className={cn(
<<<<<<< HEAD
        'group flex h-full flex-col overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) transition-[border-color,box-shadow] duration-300 hover:border-(--border-strong) hover:shadow-(--shadow-md)',
=======
<<<<<<< HEAD
        'group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]',
=======
        'group flex h-full flex-col overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-(--border-strong) hover:shadow-(--shadow-md)',
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
        className,
      )}
    >
      {/* Fixed 3:2 media ratio keeps every card in the grid aligned. */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-(--surface-sunken)">
        {imageFailed ? (
<<<<<<< HEAD
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,var(--soft-beige),var(--cream))]">
            <FlaskConical
              className="h-9 w-9 text-[rgba(81,53,34,0.28)]"
              aria-hidden="true"
            />
=======
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(150deg,var(--soft-beige),var(--surface))]">
<<<<<<< HEAD
            <FlaskConical
              className="h-8 w-8 text-(--taupe)"
              aria-hidden="true"
            />
=======
            <FlaskConical className="h-8 w-8 text-[rgba(81,53,34,0.28)]" aria-hidden="true" />
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
          </div>
        ) : (
          <img
            src={getResourceImage(resource)}
            alt={`${resource.name} at ${resource.location}`}
<<<<<<< HEAD
            className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
            loading={eager ? 'eager' : 'lazy'}
=======
            width={960}
            height={640}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            loading="lazy"
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
<<<<<<< HEAD
          <span className="rounded-[0.35rem] bg-(--surface) px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-(--charcoal)">
=======
<<<<<<< HEAD
          <span className="rounded-[0.375rem] bg-[rgba(43,29,20,0.72)] px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--cream)] backdrop-blur-sm">
=======
          <span className="rounded-[0.35rem] bg-[rgba(255,252,247,0.94)] px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-(--espresso)">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
            {resource.category}
          </span>
          <span
            className={cn(
<<<<<<< HEAD
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
=======
              'inline-flex items-center gap-1.5 rounded-[0.35rem] px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em]',
              isActive
                ? 'bg-[rgba(53,107,76,0.92)] text-white'
                : 'bg-[rgba(34,24,18,0.88)] text-(--cream)',
            )}
          >
            <span
              className="h-1 w-1 rounded-full bg-current"
              aria-hidden="true"
            />
            {isActive ? 'Active' : 'Paused'}
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
          </span>
        </div>
      </div>

<<<<<<< HEAD
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
=======
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
            <MapPin
              className="h-3.5 w-3.5 text-(--bronze)"
              aria-hidden="true"
            />
            {resource.location}
          </p>
        </div>

        {resource.description ? (
          <p className="line-clamp-2 text-[0.8125rem] leading-relaxed text-(--muted)">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
            {resource.description}
          </p>
        ) : null}

<<<<<<< HEAD
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
=======
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.75rem] text-(--muted)">
          <span className="inline-flex items-center gap-1.5">
            <Clock3
              className="h-3.5 w-3.5 text-(--bronze)"
              aria-hidden="true"
            />
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
          <span className="text-[0.75rem] text-(--muted)">
            Weekly cap {resource.weekly_cap_hours}h
          </span>
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
