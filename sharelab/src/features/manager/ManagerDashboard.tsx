import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  FlaskConical,
  Inbox,
  ShieldAlert,
  Timer,
  Wrench,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  EmptyState,
  ErrorNotice,
  LoadingRows,
  PageHeader,
  SectionCard,
  StatGrid,
  StatTile,
  Tabs,
} from '../../components/ui/workspace'
import { BookingQueueCard } from '../bookings/BookingQueueCard'
import { useBookingList } from '../../hooks/useBookings'
import { useManagerDashboard, useManagerResources } from '../../hooks/useWorkspace'
import { usePageMeta } from '../../hooks/usePageMeta'

type QueueTab = 'pending' | 'waitlisted' | 'approved' | 'incidents'

const tabLabels: Array<{ value: QueueTab; label: string }> = [
  { value: 'pending', label: 'Needs a decision' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'approved', label: 'Upcoming' },
  { value: 'incidents', label: 'Incidents' },
]

export const ManagerDashboard = () => {
  usePageMeta({
    title: 'Manager workspace — ShareLab',
    description:
      'Review requests, decisions, credentials, and incidents for the resources assigned to you.',
  })

  const [tab, setTab] = useState<QueueTab>('pending')
  const summaryQuery = useManagerDashboard()
  const resourcesQuery = useManagerResources()
  const requestsQuery = useBookingList({ perPage: 100 }, '/manager/requests')

  const requests = useMemo(() => requestsQuery.data?.data ?? [], [requestsQuery.data])
  const summary = summaryQuery.data?.data
  const resources = resourcesQuery.data?.data ?? []

  const counts = {
    pending: requests.filter((booking) => booking.status === 'pending').length,
    waitlisted: requests.filter((booking) => booking.status === 'waitlisted').length,
    approved: requests.filter((booking) => booking.status === 'approved').length,
    incidents: summary?.open_incidents ?? 0,
  }

  const visibleRequests = requests.filter((booking) => {
    if (tab === 'incidents') return false
    return booking.status === tab
  })

  return (
    <div>
      <PageHeader
        eyebrow="Manager workspace"
        title="Requests, handovers, and resource care"
        description="You can act on the resources assigned to you. Every decision needs a reason and is visible to the person who requested the booking."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/incidents">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                Incident queue
              </Link>
            </Button>
            <Button asChild>
              <Link to="/credentials" search={{ tab: 'review' }}>
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                Review credentials
              </Link>
            </Button>
          </>
        }
      />

      {summaryQuery.isError ? (
        <div className="mt-5">
          <ErrorNotice
            title="Your workspace summary could not be loaded"
            message="The request queue below may still work. Refresh the page to try again."
            onRetry={() => void summaryQuery.refetch()}
          />
        </div>
      ) : null}

      <StatGrid>
        <StatTile
          label="Assigned resources"
          value={summary?.assigned_resources ?? resources.length}
          icon={FlaskConical}
        />
        <StatTile
          label="Pending requests"
          value={summary?.pending_requests ?? counts.pending}
          icon={ClipboardList}
        />
        <StatTile
          label="Bookings today"
          value={summary?.bookings_today ?? '—'}
          icon={CalendarCheck}
        />
        <StatTile
          label="Open incidents"
          value={summary?.open_incidents ?? '—'}
          icon={Wrench}
        />
      </StatGrid>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section>
          <Tabs
            label="Request queue"
            value={tab}
            onChange={setTab}
            tabs={tabLabels.map((item) => ({
              ...item,
              count: counts[item.value],
            }))}
          />

          <div className="mt-5">
            {tab === 'incidents' ? (
              <EmptyState
                icon={ShieldAlert}
                title="Incident work lives in its own queue"
                description="Open the incident queue to confirm system suggestions, investigate reports, and record resolutions. Open incidents are counted above."
                action={
                  <Button asChild>
                    <Link to="/incidents">Open incident queue</Link>
                  </Button>
                }
              />
            ) : requestsQuery.isLoading ? (
              <LoadingRows rows={3} label="Loading request queue" />
            ) : requestsQuery.isError ? (
              <ErrorNotice
                title="The request queue could not be loaded"
                message="Refresh the page to try again."
                onRetry={() => void requestsQuery.refetch()}
              />
            ) : visibleRequests.length === 0 ? (
              <EmptyState
                icon={tab === 'pending' ? BadgeCheck : Inbox}
                title={
                  tab === 'pending'
                    ? 'No requests waiting for a decision'
                    : tab === 'waitlisted'
                      ? 'Nobody is waiting for a slot'
                      : 'No approved bookings are coming up'
                }
                description={
                  tab === 'pending'
                    ? 'New requests for your assigned resources will appear here.'
                    : 'This view updates as bookings change state.'
                }
              />
            ) : (
              <div className="space-y-4">
                {visibleRequests
                  .slice()
                  .sort((a, b) => {
                    if (tab === 'pending') {
                      return (b.priority_score ?? 0) - (a.priority_score ?? 0)
                    }
                    return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
                  })
                  .map((booking) => (
                    <BookingQueueCard key={booking.id} booking={booking} showRequester />
                  ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <SectionCard>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-(--charcoal)">Your resources</h2>
              <span className="rounded-full bg-(--tint-2) px-2 py-0.5 text-[0.65rem] font-semibold text-(--espresso)">
                {resources.length}
              </span>
            </div>

            {resourcesQuery.isLoading ? (
              <div className="mt-4">
                <LoadingRows rows={2} label="Loading assigned resources" />
              </div>
            ) : resources.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-(--muted)">
                No resources are assigned to you yet. A resource owner assigns managers.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-(--border-subtle)">
                {resources.map((resource) => (
                  <li key={resource.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      to="/resources/$resourceId"
                      params={{ resourceId: String(resource.id) }}
                      className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
                    >
                      <p className="text-sm font-semibold text-(--charcoal) hover:text-(--espresso)">
                        {resource.name}
                      </p>
                      <p className="mt-0.5 text-[0.7rem] text-(--muted)">
                        {resource.category} · {resource.location}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard>
            <h2 className="text-sm font-semibold text-(--charcoal)">Manager boundaries</h2>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-(--muted)">
              <li className="flex gap-2">
                <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--taupe)" aria-hidden="true" />
                You can decide and close handovers only for assigned resources.
              </li>
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--taupe)" aria-hidden="true" />
                Credential reviews are limited to requirements on those resources.
              </li>
              <li className="flex gap-2">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--taupe)" aria-hidden="true" />
                You cannot change resource rules, assign other managers, or override an owner.
              </li>
            </ul>
          </SectionCard>
        </aside>
      </div>
    </div>
  )
}

export default ManagerDashboard
