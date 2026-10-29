import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Clock3,
  FlaskConical,
  Gauge,
  ShieldCheck,
  Undo2,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageFade } from '../../components/ui/Reveal'
import { StatCard } from '../../components/ui/StatCard'
import { StatSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { useBookings } from '../../hooks/useBookings'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useResourceMap } from '../../hooks/useResources'
import type { Booking } from '../../lib/booking-service'
import { formatLongDate, formatRange, isUpcoming } from '../../lib/format'
import type { User } from '../../lib/api-client'

const greetingFor = (name: string) => {
  const hour = new Date().getHours()
  const part =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return `${part}, ${name.split(' ')[0]}.`
}

const workspaceFor = (role: User['role']) => {
  if (role === 'admin') {
    return {
      to: '/admin',
      label: 'Platform administration',
      text: 'Users, audit history, credentials and incidents.',
    }
  }
  if (role === 'manager') {
    return {
      to: '/manager',
      label: 'Manager tools',
      text: 'Credential review and incidents for your resources.',
    }
  }
  if (role === 'owner') {
    return {
      to: '/owner',
      label: 'My resources',
      text: 'Publish listings and review what you own.',
    }
  }
  return {
    to: '/credentials',
    label: 'Your credentials',
    text: 'Submit and track the training a resource requires.',
  }
}

const OPEN_STATUSES: Booking['status'][] = ['pending', 'waitlisted']
const ACTIVE_STATUSES: Booking['status'][] = ['approved', 'checked_in']

const quickActions: {
  to: string
  label: string
  hint: string
  icon: LucideIcon
}[] = [
  {
    to: '/resources',
    label: 'Browse the catalogue',
    hint: 'Find equipment and facilities',
    icon: FlaskConical,
  },
  {
    to: '/my-bookings',
    label: 'Manage bookings',
    hint: 'Requests, approvals and returns',
    icon: CalendarCheck,
  },
  {
    to: '/credentials',
    label: 'Credentials',
    hint: 'Training and verification',
    icon: ShieldCheck,
  },
  {
    to: '/how-it-works',
    label: 'How booking works',
    hint: 'Rules, limits and handovers',
    icon: ClipboardList,
  },
]

export const Dashboard = () => {
  usePageMeta({
    title: 'Workspace — ShareLab',
    description:
      'Your ShareLab overview: open requests, upcoming bookings and recent activity.',
  })

  const { user } = useAuth()
  const { bookings, isLoading, isError } = useBookings()
  const { resourceMap } = useResourceMap()

  if (!user) return null

  const list = bookings ?? []
  const openCount = list.filter((booking) =>
    OPEN_STATUSES.includes(booking.status),
  ).length
  const activeCount = list.filter((booking) =>
    ACTIVE_STATUSES.includes(booking.status),
  ).length
  const returnedCount = list.filter(
    (booking) => booking.status === 'returned',
  ).length

  const upcomingAll = list
    .filter(
      (booking) =>
        ACTIVE_STATUSES.includes(booking.status) &&
        isUpcoming(booking.start_at),
    )
    .sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    )
  const upcoming = upcomingAll.slice(0, 4).slice(0, 4)

  const recent = [...list]
    .sort(
      (a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime(),
    )
    .slice(0, 5)

  const workspace = workspaceFor(user.role)

  const resourceName = (booking: Booking) =>
    resourceMap.get(booking.resource_id)?.name ??
    `Resource #${booking.resource_id}`

  return (
    <PageFade>
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <span className="eyebrow">Workspace overview</span>
          <h1 className="mt-2 font-display text-[clamp(1.75rem,3.2vw,2.35rem)] font-semibold leading-tight tracking-[-0.032em] text-[var(--charcoal)]">
            {greetingFor(user.name)}
          </h1>
          <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-[var(--muted)]">
            Here is the current state of your resource requests and handovers.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="mono hidden text-[0.7rem] text-[var(--muted)] sm:inline">
            {formatLongDate(new Date().toISOString())}
          </span>
          <Button asChild size="sm">
            <Link to="/resources">
              New request
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <section
        aria-label="Account summary"
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatSkeleton key={index} />
          ))
        ) : (
          <>
            <StatCard
              label="Open requests"
              value={isError ? '—' : openCount}
              hint="Pending review or on a waitlist"
              icon={Clock3}
            />
            <StatCard
              label="Active bookings"
              value={isError ? '—' : activeCount}
              hint="Approved or checked in"
              icon={CalendarCheck}
            />
            <StatCard
              label="Upcoming"
              value={isError ? '—' : upcomingAll.length}
              hint="Next scheduled time windows"
              icon={CalendarDays}
            />
            <StatCard
              label="Returned"
              value={isError ? '—' : returnedCount}
              hint="Completed handovers on record"
              icon={Undo2}
            />
          </>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <div className="space-y-6">
          <section
            aria-labelledby="upcoming-bookings"
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-4">
              <div>
                <h2
                  id="upcoming-bookings"
                  className="text-[0.9375rem] font-semibold text-[var(--charcoal)]"
                >
                  Upcoming bookings
                </h2>
                <p className="mt-0.5 text-[0.72rem] text-[var(--muted)]">
                  Approved and checked-in time windows ahead of you.
                </p>
              </div>
              <Link
                to="/my-bookings"
                className="inline-flex shrink-0 items-center gap-1 text-[0.75rem] font-semibold text-[var(--espresso)] hover:underline"
              >
                View all
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : isError ? (
              <div className="p-5">
                <EmptyState
                  compact
                  tone="error"
                  icon={FlaskConical}
                  title="Bookings could not be loaded"
                  description="The API did not respond. Your data has not been changed."
                  action={
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/my-bookings">Open bookings</Link>
                    </Button>
                  }
                />
              </div>
            ) : upcoming.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  compact
                  icon={CalendarDays}
                  title="No upcoming bookings"
                  description="Browse the catalogue and submit a request for a time window that fits your work."
                  action={
                    <Button asChild size="sm">
                      <Link to="/resources">Explore resources</Link>
                    </Button>
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {upcoming.map((booking) => {
                  const start = new Date(booking.start_at)
                  const validDate = !Number.isNaN(start.getTime())

                  return (
                    <li key={booking.id}>
                      <Link
                        to="/my-bookings/$bookingId"
                        params={{ bookingId: String(booking.id) }}
                        className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[rgba(239,230,217,0.35)]"
                      >
                        <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[0.45rem] border border-[var(--border-subtle)] bg-[var(--ivory)]">
                          <span className="font-display text-[1.05rem] font-semibold leading-none text-[var(--charcoal)]">
                            {validDate ? start.getDate() : '—'}
                          </span>
                          <span className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                            {validDate
                              ? start.toLocaleString('en-GB', {
                                  month: 'short',
                                })
                              : ''}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.875rem] font-medium text-[var(--charcoal)]">
                            {resourceName(booking)}
                          </span>
                          <span className="mt-0.5 block truncate text-[0.72rem] text-[var(--muted)]">
                            {formatRange(booking.start_at, booking.end_at)}
                          </span>
                        </span>
                        <StatusBadge
                          status={booking.status}
                          dot={false}
                          className="hidden sm:inline-flex"
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="recent-requests"
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-4">
              <div>
                <h2
                  id="recent-requests"
                  className="text-[0.9375rem] font-semibold text-[var(--charcoal)]"
                >
                  Recent requests
                </h2>
                <p className="mt-0.5 text-[0.72rem] text-[var(--muted)]">
                  The latest booking windows attached to your account.
                </p>
              </div>
              <Link
                to="/my-bookings"
                className="inline-flex shrink-0 items-center gap-1 text-[0.75rem] font-semibold text-[var(--espresso)] hover:underline"
              >
                Booking history
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recent.length === 0 ? (
              <p className="px-5 py-8 text-center text-[0.8125rem] text-[var(--muted)]">
                Your first request will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {recent.map((booking) => (
                  <li key={booking.id}>
                    <Link
                      to="/my-bookings/$bookingId"
                      params={{ bookingId: String(booking.id) }}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 transition-colors hover:bg-[rgba(239,230,217,0.35)]"
                    >
                      <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-[var(--charcoal)]">
                        {resourceName(booking)}
                      </span>
                      <span className="font-mono text-[0.68rem] text-[var(--muted)]">
                        {formatRange(booking.start_at, booking.end_at)}
                      </span>
                      <StatusBadge status={booking.status} dot={false} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section
            aria-labelledby="quick-actions"
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5"
          >
            <h2
              id="quick-actions"
              className="text-[0.9375rem] font-semibold text-[var(--charcoal)]"
            >
              Quick actions
            </h2>
            <ul className="mt-3">
              {quickActions.map((action) => (
                <li key={action.to}>
                  <Link
                    to={action.to}
                    className="group flex items-center gap-3 border-b border-[var(--border-subtle)] py-2.5 last:border-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.45rem] border border-[var(--border-subtle)] bg-[var(--ivory)] text-[var(--espresso)]">
                      <action.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.8125rem] font-medium text-[var(--charcoal)] group-hover:text-[var(--espresso)]">
                        {action.label}
                      </span>
                      <span className="block text-[0.68rem] text-[var(--muted)]">
                        {action.hint}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-[var(--muted)]"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="access-card"
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--deep-brown)] p-5 text-[var(--cream)]"
          >
            <span className="inline-flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[rgba(248,245,239,0.5)]">
              <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              Your access
            </span>
            <h2
              id="access-card"
              className="mt-2 font-display text-[1.125rem] font-semibold text-[var(--cream)]"
            >
              {workspace.label}
            </h2>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-[rgba(248,245,239,0.62)]">
              {workspace.text}
            </p>
            <Link
              to={workspace.to}
              className="mt-4 inline-flex items-center gap-1.5 rounded-[0.45rem] bg-[rgba(248,245,239,0.1)] px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--cream)] ring-1 ring-[rgba(248,245,239,0.16)] transition-colors hover:bg-[rgba(248,245,239,0.16)]"
            >
              Open
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[rgba(239,230,217,0.35)] p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[0.45rem] bg-[rgba(81,53,34,0.07)] text-[var(--espresso)]">
              <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-[0.78rem] leading-relaxed text-[var(--muted)]">
              Every decision, check-in and return is recorded. If something
              looks wrong on a booking, open it and report an incident with the
              context attached.
            </p>
          </section>
        </div>
      </div>
    </PageFade>
  )
}

export default Dashboard
