<<<<<<< HEAD
=======
import { useMemo } from 'react'
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
<<<<<<< HEAD
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
=======
  Clock3,
  FlaskConical,
  ListOrdered,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../hooks/useAuth'
import { useBookings } from '../../hooks/useBookings'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useResources } from '../../hooks/useResources'
import { cn } from '../../lib/utils'
import { getResourceImage } from '../../lib/resources'
import {
  bookingStatusDetails,
  formatBookingWindow,
} from '../../lib/booking-display'
import type { Booking } from '../../lib/booking-service'

const todayFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const formatNextUp = (
  status: Booking['status'],
  waitlistPosition: number | null,
) => {
  if (status === 'approved') return 'Confirmed and ready'
  if (status === 'checked_in') return 'Currently in use'
  if (status === 'waitlisted') {
    return waitlistPosition
      ? `Position ${waitlistPosition} on the waitlist`
      : 'On the waitlist'
  }
  return 'Waiting for a manager'
}

const getRoleLabel = (role: string) => {
  if (role === 'admin') return 'Administrator'
  if (role === 'manager') return 'Lab manager'
  if (role === 'owner') return 'Resource owner'
  return 'Student access'
}

const getGreeting = (date: Date) => {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const QuickAction = ({
  to,
  icon: Icon,
  title,
  description,
}: {
  to:
    | '/resources'
    | '/my-bookings'
    | '/how-it-works'
    | '/manager'
    | '/owner'
    | '/credentials'
    | '/incidents'
  icon: typeof Search
  title: string
  description: string
}) => (
  <Link
    to={to}
    className="group -mx-2.5 flex items-start gap-3 rounded-xl border border-transparent px-2.5 py-3 transition-colors hover:border-(--border-subtle) hover:bg-[rgba(81,53,34,0.035)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)"
  >
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(81,53,34,0.07)] text-(--espresso)">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-(--charcoal)">
        {title}
      </span>
      <span className="mt-0.5 block text-xs leading-relaxed text-(--muted)">
        {description}
      </span>
    </span>
    <ArrowUpRight
      className="mt-1 h-4 w-4 shrink-0 text-(--taupe) transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      aria-hidden="true"
    />
  </Link>
)

export const Dashboard = () => {
  usePageMeta({
    title: 'Dashboard — ShareLab',
    description:
      'Your ShareLab requests, approved lab time, and next steps in the campus resource commons.',
  })

  const { user } = useAuth()
  const {
    bookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useBookings()
  const { data: resourceResponse, isLoading: resourcesLoading } = useResources({
    perPage: 100,
    status: 'active',
  })

  const now = new Date()
  const bookingsList = bookings ?? []
  const resources = resourceResponse?.data ?? []
  const resourcesById = useMemo(
    () => new Map(resources.map((resource) => [resource.id, resource])),
    [resources],
  )

  const upcoming = useMemo(
    () =>
      bookingsList
        .filter((booking) =>
          ['pending', 'waitlisted', 'approved', 'checked_in'].includes(
            booking.status,
          ),
        )
        .sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at)),
    [bookingsList],
  )

  const nextBooking = upcoming.at(0)
  const nextResource = nextBooking
    ? resourcesById.get(nextBooking.resource_id)
    : undefined
  const pendingCount = bookingsList.filter((booking) =>
    ['pending', 'waitlisted'].includes(booking.status),
  ).length
  const approvedCount = bookingsList.filter((booking) =>
    ['approved', 'checked_in'].includes(booking.status),
  ).length
  const returnedCount = bookingsList.filter(
    (booking) => booking.status === 'returned',
  ).length

  if (!user) return null

  const firstName = user.name.trim().split(/\s+/)[0] || user.name
  const roleLabel = getRoleLabel(user.role)
  const greeting = getGreeting(now)
  const todayLabel = todayFormatter.format(now)

  const stats = [
    {
      label: 'Open requests',
      value: pendingCount,
      detail: 'Awaiting a decision',
      icon: Clock3,
    },
    {
      label: 'Approved',
      value: approvedCount,
      detail: 'Ready to use',
      icon: CalendarCheck,
    },
    {
      label: 'Catalogue',
      value: resources.length,
      detail: 'Shared resources',
      icon: FlaskConical,
    },
    {
      label: 'Returned',
      value: returnedCount,
      detail: 'On your record',
      icon: RotateCcw,
    },
  ]

  const quickActions = (
    <>
      <QuickAction
        to="/resources"
        icon={Search}
        title="Browse the catalogue"
        description="Compare locations, limits, and eligibility."
      />
      <QuickAction
        to="/my-bookings"
        icon={CalendarDays}
        title="Manage your requests"
        description="Review decisions and the full handover trail."
      />
      <QuickAction
        to="/credentials"
        icon={BadgeCheck}
        title="Manage your credentials"
        description="Upload safety inductions and track verification."
      />
      <QuickAction
        to="/incidents"
        icon={ShieldAlert}
        title="Incident reports"
        description="See reports linked to your bookings and their resolutions."
      />
      <QuickAction
        to="/how-it-works"
        icon={ShieldCheck}
        title="How ShareLab works"
        description="See how requests, priority, and returns are handled."
      />
      {user.role === 'manager' ? (
        <QuickAction
          to="/manager"
          icon={ListOrdered}
          title="Review the request queue"
          description="Approve, waitlist, or decline pending bookings."
        />
      ) : null}
      {user.role === 'owner' ? (
        <QuickAction
          to="/owner"
          icon={FlaskConical}
          title="Manage your resources"
          description="Keep availability and resource rules up to date."
        />
      ) : null}
    </>
  )

  return (
    <div>
      <section className="relative overflow-hidden rounded-(--radius-panel) bg-(--deep-brown) px-6 py-8 text-(--cream) shadow-(--shadow-lg) sm:px-9 sm:py-10 lg:px-11 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(214,189,164,0.26),transparent_65%)] blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(167,139,115,0.16),transparent_70%)] blur-3xl"
        />
        <FlaskConical
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 right-4 h-56 w-56 -rotate-12 text-[rgba(255,249,241,0.045)] sm:right-10"
          strokeWidth={0.8}
        />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-[0.35rem] border border-[rgba(255,249,241,0.16)] bg-[rgba(255,249,241,0.06)] px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[rgba(255,249,241,0.72)]">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#9fc4a8]"
                  aria-hidden="true"
                />
                {roleLabel}
              </span>
              <span
                aria-hidden="true"
                className="h-3 w-px bg-[rgba(255,249,241,0.2)]"
              />
              <span>{todayLabel}</span>
            </div>

            <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(2.1rem,4vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-(--cream)">
              {greeting}, {firstName}.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[rgba(255,249,241,0.7)] sm:text-base">
              Your requests, approved lab time, and the next thing on your bench
              — all in one accountable place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="inverse" size="lg">
                <Link to="/resources">
                  Browse resources
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Link
                to="/my-bookings"
                className="inline-flex h-11 items-center gap-2 rounded-[0.65rem] border border-[rgba(255,249,241,0.24)] px-5 text-[0.9375rem] font-semibold text-(--cream) transition-colors hover:bg-[rgba(255,249,241,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,249,241,0.75)] focus-visible:ring-offset-4 focus-visible:ring-offset-(--deep-brown)"
              >
                View requests
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <aside className="w-full rounded-(--radius-md) border border-[rgba(255,249,241,0.14)] bg-[rgba(255,249,241,0.06)] p-5 lg:w-76 lg:shrink-0">
            <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[rgba(255,249,241,0.48)]">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Next on your calendar
            </p>

            {nextBooking ? (
              <div className="mt-4">
                <p className="font-display text-[1.55rem] font-semibold leading-tight text-(--cream)">
                  {nextResource?.name ?? `Booking #${nextBooking.id}`}
                </p>
                <p className="mt-2 text-sm text-[rgba(255,249,241,0.68)]">
                  {formatBookingWindow(nextBooking)}
                </p>
                <p className="mt-4 text-xs font-medium text-[rgba(255,249,241,0.5)]">
                  {formatNextUp(
                    nextBooking.status,
                    nextBooking.waitlist_position,
                  )}
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <p className="font-display text-[1.35rem] font-semibold leading-tight text-(--cream)">
                  Your calendar is clear.
                </p>
                <p className="mt-2 text-sm text-[rgba(255,249,241,0.62)]">
                  Find a resource that fits your next idea.
                </p>
                <Link
                  to="/resources"
                  className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-(--cream) underline decoration-[rgba(255,249,241,0.35)] underline-offset-4 hover:decoration-(--cream)"
                >
                  Open the catalogue
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section
        aria-label="Account overview"
        className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--border-subtle) shadow-soft md:grid-cols-4"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[rgba(255,252,247,0.86)] p-5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-(--muted)">
                {stat.label}
              </p>
              <stat.icon
                className="h-4 w-4 text-(--taupe)"
                aria-hidden="true"
              />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-(--charcoal)">
              {stat.value}
            </p>
            <p className="mt-1 text-[0.7rem] text-(--muted)">
              {stat.detail}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <section className="rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-6 shadow-soft sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[1.7rem] font-semibold leading-tight tracking-[-0.02em] text-(--charcoal)">
                Your requests
              </h2>
              <p className="mt-1 text-sm text-(--muted)">
                Every decision and handover, in one trail.
              </p>
            </div>
            <Link
              to="/my-bookings"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-(--espresso) transition-colors hover:bg-[rgba(81,53,34,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="mt-6 space-y-3" role="status" aria-live="polite">
              <span className="sr-only">Loading your requests</span>
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4 rounded-xl border border-(--border-subtle) bg-[rgba(255,249,241,0.45)] p-4"
                >
                  <span className="h-10 w-10 rounded-full bg-[rgba(81,53,34,0.08)]" />
                  <span className="flex-1 space-y-2">
                    <span className="block h-3 w-2/3 rounded-full bg-[rgba(81,53,34,0.08)]" />
                    <span className="block h-2.5 w-1/2 rounded-full bg-[rgba(81,53,34,0.06)]" />
                  </span>
                </div>
              ))}
            </div>
          ) : bookingsError ? (
            <p className="mt-6 rounded-xl border border-[rgba(169,72,60,0.18)] bg-[rgba(169,72,60,0.06)] px-4 py-3 text-sm text-(--error)">
              We could not load your requests. Refresh the page to try again.
            </p>
          ) : bookingsList.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[rgba(81,53,34,0.2)] bg-[rgba(233,217,198,0.16)] px-6 py-9 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(81,53,34,0.07)]">
                <CalendarCheck
                  className="h-5 w-5 text-(--espresso)"
                  aria-hidden="true"
                />
              </span>
              <p className="mt-4 font-display text-[1.3rem] font-semibold text-(--charcoal)">
                Your first request starts in the catalogue.
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-(--muted)">
                Compare equipment and studios, check the requirements, and pick
                a window that works for you.
              </p>
              <Button asChild className="mt-5">
                <Link to="/resources">Browse resources</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-5">
              {bookingsList.slice(0, 4).map((booking) => {
                const resource = resourcesById.get(booking.resource_id)
                const status = bookingStatusDetails[booking.status]
                const StatusIcon = status.icon

                return (
                  <li
                    key={booking.id}
                    className="flex gap-3.5 border-t border-(--border-subtle) py-4 first:border-t-0 first:pt-2 last:pb-0 sm:gap-4"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        status.tone,
                      )}
                    >
                      <StatusIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {resource ? (
                          <Link
                            to="/resources/$resourceId"
                            params={{ resourceId: String(resource.id) }}
                            className="rounded-sm font-semibold text-(--charcoal) transition-colors hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
                          >
                            {resource.name}
                          </Link>
                        ) : (
                          <p className="font-semibold text-(--charcoal)">
                            Booking #{booking.id}
                          </p>
                        )}
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold',
                            status.tone,
                          )}
                        >
                          {status.label}
                          {booking.status === 'waitlisted' &&
                          booking.waitlist_position
                            ? ` · #${booking.waitlist_position}`
                            : ''}
                        </span>
                      </div>
                      <p className="mt-1.5 inline-flex flex-wrap items-center gap-x-1.5 text-xs font-medium text-(--muted)">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatBookingWindow(booking)}
                      </p>
                      {booking.purpose ? (
                        <p className="mt-1.5 line-clamp-1 text-sm text-(--muted)">
                          “{booking.purpose}”
                        </p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="grid gap-5">
          <section className="rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-6 shadow-soft">
            <h2 className="font-display text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] text-(--charcoal)">
              Quick actions
            </h2>
            <div className="mt-3 grid">{quickActions}</div>
          </section>

          <section className="rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] text-(--charcoal)">
                From the catalogue
              </h2>
              <Link
                to="/resources"
                aria-label="Browse all resources"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-(--muted) transition-colors hover:bg-[rgba(81,53,34,0.06)] hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
              >
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {resourcesLoading ? (
              <div className="mt-4 space-y-2" role="status" aria-live="polite">
                <span className="sr-only">Loading resources</span>
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-3 py-2"
                  >
                    <span className="h-12 w-14 rounded-lg bg-[rgba(81,53,34,0.08)]" />
                    <span className="flex-1 space-y-2">
                      <span className="block h-2.5 w-2/3 rounded-full bg-[rgba(81,53,34,0.08)]" />
                      <span className="block h-2 w-1/2 rounded-full bg-[rgba(81,53,34,0.06)]" />
                    </span>
                  </div>
                ))}
              </div>
            ) : resources.length === 0 ? (
              <p className="mt-4 text-sm text-(--muted)">
                The catalogue is being prepared. Check back shortly.
              </p>
            ) : (
              <ul className="mt-3 space-y-1">
                {resources.slice(0, 3).map((resource) => (
                  <li key={resource.id}>
                    <Link
                      to="/resources/$resourceId"
                      params={{ resourceId: String(resource.id) }}
                      className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[rgba(81,53,34,0.035)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
                    >
                      <span className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-(--soft-beige)">
                        <img
                          src={getResourceImage(resource)}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-(--charcoal)">
                          {resource.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-(--muted)">
                          {resource.category} · {resource.location}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-(--taupe) transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
<<<<<<< HEAD

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
=======
      </div>
    </div>
  )
}
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
