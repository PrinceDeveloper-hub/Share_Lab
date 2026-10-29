import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Clock3,
  FlaskConical,
  Layers,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Pagination } from '../../components/ui/pagination'
import { Reveal } from '../../components/ui/reveal'
import { TiltCard } from '../../components/ui/tilt-card'
import {
  EmptyState,
  ErrorNotice,
  LoadingRows,
  PageHeader,
  inputClass,
  selectClass,
} from '../../components/ui/workspace'
import { useAdminAudit, useAdminOverview, useAdminUsers, usePrefetchAdmin } from '../../hooks/useAdmin'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useDebouncedValue } from '../../hooks/useResources'
import { actionLabel } from '../../lib/admin'
import type { AdminAuditEntry, AdminRole, AdminUser } from '../../lib/admin'
import { cn } from '../../lib/utils'

type AdminTab = 'overview' | 'people' | 'audit'

const tabs: Array<{ value: AdminTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'people', label: 'People' },
  { value: 'audit', label: 'Audit log' },
]

const roleLabels: Record<AdminRole, string> = {
  user: 'Students & researchers',
  owner: 'Resource owners',
  manager: 'Managers',
  admin: 'Administrators',
}

const roleTone: Record<AdminRole, string> = {
  user: 'bg-(--tint-2) text-(--muted-strong)',
  owner: 'bg-(--warning-tint) text-(--warning)',
  manager: 'bg-(--success-tint) text-(--success)',
  admin: 'bg-(--espresso) text-(--accent-contrast)',
}

const glassCard =
  'rounded-(--radius-lg) border border-(--glass-border) bg-(--glass-light) shadow-(--glass-shadow) backdrop-blur-xl'

const dateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—'

const relativeTime = (value: string | null) => {
  if (!value) return '—'
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'Yesterday' : `${days}d ago`
}

const PercentBar = ({ value, total, tone }: { value: number; total: number; tone: string }) => (
  <span className="block h-1.5 w-full overflow-hidden rounded-full bg-(--tint-2)">
    <span
      className={cn('block h-full rounded-full transition-[width] duration-500', tone)}
      style={{ width: `${total > 0 ? Math.round((value / total) * 100) : 0}%` }}
    />
  </span>
)

const AdminUserRow = ({ user }: { user: AdminUser }) => (
  <tr className="border-t border-(--border-subtle) transition-colors hover:bg-(--tint-1)">
    <td className="px-4 py-3">
      <p className="text-sm font-semibold text-(--charcoal)">{user.name}</p>
      <p className="text-xs text-(--muted)">{user.email}</p>
    </td>
    <td className="px-4 py-3">
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em]',
          roleTone[user.role],
        )}
      >
        {user.role}
      </span>
    </td>
    <td className="px-4 py-3 text-sm tabular-nums text-(--muted-strong)">
      {user.bookings_count ?? 0}
    </td>
  </tr>
)

const AuditRow = ({ entry }: { entry: AdminAuditEntry }) => (
  <tr className="border-t border-(--border-subtle) transition-colors hover:bg-(--tint-1)">
    <td className="px-4 py-3">
      <p className="text-sm font-semibold text-(--charcoal)">{actionLabel(entry.action)}</p>
      <p className="text-xs text-(--muted)">{entry.actor ?? 'System'}</p>
    </td>
    <td className="max-w-[20rem] px-4 py-3 text-xs leading-relaxed text-(--muted)">
      {entry.reason ?? 'No reason recorded.'}
    </td>
    <td className="px-4 py-3 text-xs text-(--muted)">{dateTime(entry.created_at)}</td>
    <td className="px-4 py-3 text-right">
      {entry.booking_id ? (
        <Link
          to="/my-bookings/$bookingId"
          params={{ bookingId: String(entry.booking_id) }}
          className="text-xs font-semibold text-(--espresso) underline decoration-transparent underline-offset-4 hover:decoration-(--bronze)"
        >
          Booking #{entry.booking_id}
        </Link>
      ) : (
        <span className="text-xs text-(--muted)">—</span>
      )}
    </td>
  </tr>
)

export const AdminDashboard = () => {
  usePageMeta({
    title: 'Admin console — ShareLab',
    description:
      'Platform oversight for ShareLab administrators: accounts, resources, booking health, incidents, and the audit trail.',
  })

  const [tab, setTab] = useState<AdminTab>('overview')

  const overviewQuery = useAdminOverview()

  const [userPage, setUserPage] = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const [userRole, setUserRole] = useState<AdminRole | 'all'>('all')
  const debouncedSearch = useDebouncedValue(userSearch.trim(), 320)

  const usersQuery = useAdminUsers({
    page: userPage,
    q: debouncedSearch,
    role: userRole,
    perPage: 10,
  })

  const [auditPage, setAuditPage] = useState(1)
  const [auditAction, setAuditAction] = useState('all')
  const auditQuery = useAdminAudit({
    page: auditPage,
    action: auditAction,
    perPage: 12,
  })

  const prefetch = usePrefetchAdmin()

  const overview = overviewQuery.data?.data
  const users = usersQuery.data?.data ?? []
  const usersMeta = usersQuery.data?.meta
  const audit = auditQuery.data?.data ?? []
  const auditMeta = auditQuery.data?.meta
  const auditActions = (auditMeta?.actions as string[] | undefined) ?? []

  const bookingStatusRows = useMemo(() => {
    if (!overview) return []
    const total = overview.bookings.total || 1
    return Object.entries(overview.bookings.by_status)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => ({
        status,
        count,
        share: Math.round((count / total) * 100),
      }))
  }, [overview])

  const roleRows = useMemo(() => {
    if (!overview) return []
    const total = overview.users.total || 1
    return (Object.keys(roleLabels) as AdminRole[]).map((role) => ({
      role,
      count: overview.users.by_role[role],
      share: Math.round((overview.users.by_role[role] / total) * 100),
    }))
  }, [overview])

  const stats = overview
    ? [
        {
          label: 'Accounts',
          value: overview.users.total,
          detail: `${overview.users.new_last_7_days} joined this week`,
          icon: Users,
        },
        {
          label: 'Published resources',
          value: overview.resources.active,
          detail: `${overview.resources.total} total listings`,
          icon: FlaskConical,
        },
        {
          label: 'Bookings this week',
          value: overview.bookings.this_week,
          detail: `${overview.bookings.today} starting today`,
          icon: CalendarCheck,
        },
        {
          label: 'Open incidents',
          value: overview.incidents.open,
          detail: `${overview.credentials.pending} credential reviews`,
          icon: ShieldAlert,
        },
      ]
    : []

  return (
    <div>
      <PageHeader
        eyebrow="Administrator"
        title="Platform oversight"
        description="Accounts, resources, booking health, and the audit trail. Every figure below is aggregated from live records — no estimates."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/resources">
                <Layers className="h-4 w-4" aria-hidden="true" />
                Catalogue
              </Link>
            </Button>
            <Button asChild>
              <Link to="/incidents">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Incident queue
              </Link>
            </Button>
          </>
        }
      />

      <div
        role="tablist"
        aria-label="Admin sections"
        className="mt-6 inline-flex flex-wrap gap-1 rounded-full border border-(--border-subtle) bg-(--surface-sunken) p-1"
      >
        {tabs.map((item) => {
          const active = tab === item.value
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.value)}
              className={cn(
                'inline-flex min-h-9 items-center gap-2 rounded-full px-4 text-[0.8125rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)',
                active
                  ? 'bg-(--surface) text-(--espresso) shadow-(--shadow-xs)'
                  : 'text-(--muted) hover:text-(--charcoal)',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {tab === 'overview' ? (
        <>
          {overviewQuery.isError ? (
            <div className="mt-6">
              <ErrorNotice
                title="The platform summary could not be loaded"
                message="Refresh the page to try again."
                onRetry={() => void overviewQuery.refetch()}
              />
            </div>
          ) : null}

          <section
            aria-label="Platform statistics"
            className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            {overviewQuery.isLoading && !overview
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(glassCard, 'h-36 animate-pulse p-5')}
                    aria-hidden="true"
                  />
                ))
              : stats.map((stat, index) => (
                  <Reveal key={stat.label} delay={index * 0.05} className="h-full">
                    <TiltCard
                      as="div"
                      className={cn(glassCard, 'flex h-full flex-col p-5')}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-(--muted)">{stat.label}</p>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--tint-2) text-(--espresso)">
                          <stat.icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                      <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-(--charcoal) tabular-nums">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[0.7rem] leading-snug text-(--muted)">{stat.detail}</p>
                    </TiltCard>
                  </Reveal>
                ))}
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
            <div className="space-y-5">
              <Reveal>
                <section className={cn(glassCard, 'p-6')}>
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h2 className="font-display text-[1.4rem] font-semibold tracking-[-0.02em] text-(--charcoal)">
                        Booking pipeline
                      </h2>
                      <p className="mt-1 text-xs text-(--muted)">
                        {overview?.bookings.total ?? 0} bookings across every state.
                      </p>
                    </div>
                    <Link
                      to="/manager"
                      className="text-xs font-semibold text-(--espresso) underline decoration-transparent underline-offset-4 hover:decoration-(--bronze)"
                    >
                      Open manager queue
                    </Link>
                  </div>

                  {overviewQuery.isLoading && !overview ? (
                    <LoadingRows rows={3} label="Loading booking pipeline" />
                  ) : bookingStatusRows.length === 0 ? (
                    <p className="mt-4 text-sm text-(--muted)">No bookings recorded yet.</p>
                  ) : (
                    <ul className="mt-5 space-y-3.5">
                      {bookingStatusRows.map((row) => (
                        <li key={row.status}>
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold capitalize text-(--charcoal)">
                              {row.status.replace('_', ' ')}
                            </span>
                            <span className="font-mono text-(--muted)">
                              {row.count} · {row.share}%
                            </span>
                          </div>
                          <div className="mt-1.5">
                            <PercentBar
                              value={row.count}
                              total={overview?.bookings.total ?? 0}
                              tone={
                                row.status === 'returned' || row.status === 'approved'
                                  ? 'bg-(--success)'
                                  : row.status === 'pending' || row.status === 'waitlisted'
                                    ? 'bg-(--warning)'
                                    : row.status === 'rejected' || row.status === 'cancelled'
                                      ? 'bg-(--error)'
                                      : 'bg-(--espresso)'
                              }
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </Reveal>

              <Reveal delay={0.06}>
                <section className={cn(glassCard, 'p-6')}>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-[1.4rem] font-semibold tracking-[-0.02em] text-(--charcoal)">
                      Recent activity
                    </h2>
                    <Activity className="h-4 w-4 text-(--bronze)" aria-hidden="true" />
                  </div>

                  {overviewQuery.isLoading && !overview ? (
                    <LoadingRows rows={3} label="Loading activity" />
                  ) : (overview?.recent_activity.length ?? 0) === 0 ? (
                    <p className="mt-4 text-sm text-(--muted)">No audit entries yet.</p>
                  ) : (
                    <ol className="mt-4">
                      {overview?.recent_activity.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex gap-3 border-t border-(--border-subtle) py-3 first:border-t-0 first:pt-0 last:pb-0"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--tint-2) text-(--espresso)">
                            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-(--charcoal)">
                              {actionLabel(entry.action)}
                            </p>
                            <p className="text-xs text-(--muted)">
                              {entry.actor ?? 'System'} · {relativeTime(entry.created_at)}
                            </p>
                          </div>
                          {entry.booking_id ? (
                            <Link
                              to="/my-bookings/$bookingId"
                              params={{ bookingId: String(entry.booking_id) }}
                              aria-label={`Open booking ${entry.booking_id}`}
                              className="self-center rounded-full p-2 text-(--muted) transition-colors hover:bg-(--tint-2) hover:text-(--espresso)"
                            >
                              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </Reveal>
            </div>

            <div className="space-y-5">
              <Reveal delay={0.04}>
                <section className={cn(glassCard, 'p-6')}>
                  <h2 className="text-sm font-semibold text-(--charcoal)">Role composition</h2>
                  <ul className="mt-4 space-y-3">
                    {roleRows.map((row) => (
                      <li key={row.role}>
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-(--muted-strong)">{roleLabels[row.role]}</span>
                          <span className="font-mono text-(--muted)">{row.count}</span>
                        </div>
                        <div className="mt-1.5">
                          <PercentBar value={row.count} total={overview?.users.total ?? 0} tone="bg-(--bronze)" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>

              <Reveal delay={0.08}>
                <section className={cn(glassCard, 'p-6')}>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-(--charcoal)">Most-booked resources</h2>
                    <FlaskConical className="h-4 w-4 text-(--bronze)" aria-hidden="true" />
                  </div>
                  <ul className="mt-3 divide-y divide-(--border-subtle)">
                    {(overview?.top_resources ?? []).map((resource) => (
                      <li key={resource.id} className="py-2.5 first:pt-0 last:pb-0">
                        <Link
                          to="/resources/$resourceId"
                          params={{ resourceId: String(resource.id) }}
                          className="flex items-center justify-between gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[0.8125rem] font-medium text-(--charcoal)">
                              {resource.name}
                            </span>
                            <span className="block truncate text-[0.7rem] text-(--muted)">
                              {resource.category} · {resource.location}
                            </span>
                          </span>
                          <span className="shrink-0 font-mono text-xs text-(--muted)">
                            {resource.bookings_count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>

              <Reveal delay={0.12}>
                <section className={cn(glassCard, 'p-6')}>
                  <h2 className="text-sm font-semibold text-(--charcoal)">Reviews waiting</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="inline-flex items-center gap-2 text-(--muted)">
                        <BadgeCheck className="h-3.5 w-3.5 text-(--warning)" aria-hidden="true" />
                        Credentials
                      </dt>
                      <dd className="font-mono text-(--charcoal)">{overview?.credentials.pending ?? 0}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="inline-flex items-center gap-2 text-(--muted)">
                        <ShieldAlert className="h-3.5 w-3.5 text-(--error)" aria-hidden="true" />
                        Incidents
                      </dt>
                      <dd className="font-mono text-(--charcoal)">{overview?.incidents.open ?? 0}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/credentials">Review credentials</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/incidents">Open incidents</Link>
                    </Button>
                  </div>
                </section>
              </Reveal>
            </div>
          </div>
        </>
      ) : null}

      {tab === 'people' ? (
        <section className={cn(glassCard, 'mt-6 overflow-hidden p-0')}>
          <div className="flex flex-col gap-3 border-b border-(--border-subtle) p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-[1.35rem] font-semibold text-(--charcoal)">People</h2>
              <p className="text-xs text-(--muted)">
                {usersMeta?.total ?? 0} accounts · search by name or email.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--bronze)"
                  aria-hidden="true"
                />
                <label htmlFor="admin-user-search" className="sr-only">
                  Search accounts
                </label>
                <input
                  id="admin-user-search"
                  type="search"
                  value={userSearch}
                  onChange={(event) => {
                    setUserSearch(event.target.value)
                    setUserPage(1)
                  }}
                  placeholder="Search accounts…"
                  className={cn(inputClass, 'pl-9 sm:w-56')}
                />
              </div>
              <div>
                <label htmlFor="admin-role-filter" className="sr-only">
                  Filter by role
                </label>
                <select
                  id="admin-role-filter"
                  value={userRole}
                  onChange={(event) => {
                    setUserRole(event.target.value as AdminRole | 'all')
                    setUserPage(1)
                  }}
                  className={cn(selectClass, 'sm:w-40')}
                >
                  <option value="all">All roles</option>
                  {(Object.keys(roleLabels) as AdminRole[]).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {usersQuery.isError ? (
            <div className="p-5">
              <ErrorNotice
                title="Accounts could not be loaded"
                message="Refresh the page to try again."
                onRetry={() => void usersQuery.refetch()}
              />
            </div>
          ) : usersQuery.isLoading && users.length === 0 ? (
            <div className="p-5">
              <LoadingRows rows={5} label="Loading accounts" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Users}
                title="No accounts match"
                description="Try a different search term or clear the role filter."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setUserSearch('')
                      setUserRole('all')
                      setUserPage(1)
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-left">
                  <thead>
                    <tr className="bg-(--tint-1) text-[0.65rem] uppercase tracking-[0.12em] text-(--muted)">
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        Account
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        Role
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        Bookings
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <AdminUserRow key={user.id} user={user} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 pb-5">
                <Pagination
                  label="Account pagination"
                  page={userPage}
                  lastPage={usersMeta?.last_page ?? 1}
                  total={usersMeta?.total}
                  perPage={usersMeta?.per_page}
                  isFetching={usersQuery.isFetching}
                  onPageChange={setUserPage}
                  onPrefetch={(nextPage) =>
                    void prefetch.users({
                      page: nextPage,
                      perPage: 10,
                      q: debouncedSearch,
                      role: userRole,
                    })
                  }
                />
              </div>
            </>
          )}
        </section>
      ) : null}

      {tab === 'audit' ? (
        <section className={cn(glassCard, 'mt-6 overflow-hidden p-0')}>
          <div className="flex flex-col gap-3 border-b border-(--border-subtle) p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-[1.35rem] font-semibold text-(--charcoal)">Audit log</h2>
              <p className="text-xs text-(--muted)">
                Immutable record of every workflow action · {auditMeta?.total ?? 0} entries.
              </p>
            </div>
            <div>
              <label htmlFor="admin-action-filter" className="sr-only">
                Filter by action
              </label>
              <select
                id="admin-action-filter"
                value={auditAction}
                onChange={(event) => {
                  setAuditAction(event.target.value)
                  setAuditPage(1)
                }}
                className={cn(selectClass, 'sm:w-56')}
              >
                <option value="all">All actions</option>
                {auditActions.map((action) => (
                  <option key={action} value={action}>
                    {actionLabel(action)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {auditQuery.isError ? (
            <div className="p-5">
              <ErrorNotice
                title="The audit log could not be loaded"
                message="Refresh the page to try again."
                onRetry={() => void auditQuery.refetch()}
              />
            </div>
          ) : auditQuery.isLoading && audit.length === 0 ? (
            <div className="p-5">
              <LoadingRows rows={5} label="Loading audit entries" />
            </div>
          ) : audit.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={ShieldCheck}
                title="No audit entries in this view"
                description="Actions are recorded as bookings are requested, decided, checked in, and returned."
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] border-collapse text-left">
                  <thead>
                    <tr className="bg-(--tint-1) text-[0.65rem] uppercase tracking-[0.12em] text-(--muted)">
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        Action
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        Reason
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">
                        When
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                        Record
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.map((entry) => (
                      <AuditRow key={entry.id} entry={entry} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 pb-5">
                <Pagination
                  label="Audit pagination"
                  page={auditPage}
                  lastPage={auditMeta?.last_page ?? 1}
                  total={auditMeta?.total}
                  perPage={auditMeta?.per_page}
                  isFetching={auditQuery.isFetching}
                  onPageChange={setAuditPage}
                  onPrefetch={(nextPage) =>
                    void prefetch.audit({ page: nextPage, perPage: 12, action: auditAction })
                  }
                />
              </div>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}

export default AdminDashboard
