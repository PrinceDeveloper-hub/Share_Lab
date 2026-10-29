import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  FlaskConical,
  Inbox,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  UsersRound,
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
import { ResourceFormModal } from './ResourceFormModal'
import { OwnerManagerModal } from './OwnerManagerModal'
import { useBookingList } from '../../hooks/useBookings'
import {
  useDeleteResource,
  useOwnerDashboard,
  useOwnerResources,
} from '../../hooks/useWorkspace'
import { usePageMeta } from '../../hooks/usePageMeta'
import { getApiErrorMessage } from '../../lib/api-client'
import { getResourceImage } from '../../lib/resources'
import type { Resource } from '../../lib/resources'
import { cn } from '../../lib/utils'

type OwnerTab = 'requests' | 'resources'
type RequestTab = 'pending' | 'waitlisted' | 'approved' | 'all'

const requestTabs: Array<{ value: RequestTab; label: string }> = [
  { value: 'pending', label: 'Needs a decision' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'approved', label: 'Upcoming' },
  { value: 'all', label: 'All requests' },
]

export const OwnerDashboard = () => {
  usePageMeta({
    title: 'Owner workspace — ShareLab',
    description:
      'Manage owned resources, assigned managers, booking decisions, credentials, and incidents.',
  })

  const [tab, setTab] = useState<OwnerTab>('requests')
  const [requestTab, setRequestTab] = useState<RequestTab>('pending')
  const [formOpen, setFormOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [managerResource, setManagerResource] = useState<Resource | null>(null)

  const summaryQuery = useOwnerDashboard()
  const resourcesQuery = useOwnerResources()
  const requestsQuery = useBookingList({ perPage: 100 }, '/owner/bookings')
  const deleteMutation = useDeleteResource()

  const summary = summaryQuery.data?.data
  const resources = resourcesQuery.data?.data ?? []
  const requests = useMemo(() => requestsQuery.data?.data ?? [], [requestsQuery.data])

  const requestCounts = useMemo(
    () => ({
      pending: requests.filter((booking) => booking.status === 'pending').length,
      waitlisted: requests.filter((booking) => booking.status === 'waitlisted').length,
      approved: requests.filter((booking) => booking.status === 'approved').length,
      all: requests.length,
    }),
    [requests],
  )

  const visibleRequests = requests.filter((booking) =>
    requestTab === 'all' ? true : booking.status === requestTab,
  )

  const openCreate = () => {
    setEditingResource(null)
    setFormOpen(true)
  }

  const openEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingResource(null)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Owner workspace"
        title="Your resources, your decisions"
        description="Create resources, set the rules people book under, assign managers you trust, and resolve escalations."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/credentials" search={{ tab: 'review' }}>
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                Credential queue
              </Link>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add resource
            </Button>
          </>
        }
      />

      {summaryQuery.isError ? (
        <div className="mt-5">
          <ErrorNotice
            title="Your workspace summary could not be loaded"
            message="Other sections may still work. Refresh the page to try again."
            onRetry={() => void summaryQuery.refetch()}
          />
        </div>
      ) : null}

      {deleteMutation.isError ? (
        <div className="mt-5">
          <ErrorNotice
            title="The resource was not deleted"
            message={getApiErrorMessage(
              deleteMutation.error,
              'A resource with active bookings cannot be deleted.',
            )}
          />
        </div>
      ) : null}

      <StatGrid>
        <StatTile
          label="Owned resources"
          value={summary?.resources ?? resources.length}
          icon={FlaskConical}
        />
        <StatTile
          label="Pending requests"
          value={summary?.pending_requests ?? requestCounts.pending}
          icon={ClipboardList}
        />
        <StatTile
          label="Upcoming bookings"
          value={summary?.upcoming_bookings ?? '—'}
          icon={CalendarCheck}
        />
        <StatTile
          label="Open incidents"
          value={summary?.open_incidents ?? '—'}
          icon={Wrench}
        />
      </StatGrid>

      <div className="mt-8">
        <Tabs
          label="Owner workspace sections"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'requests', label: 'Bookings', count: requestCounts.pending },
            { value: 'resources', label: 'Resources', count: resources.length },
          ]}
        />
      </div>

      {tab === 'requests' ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Filter requests"
              className="flex flex-wrap gap-1"
            >
              {requestTabs.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={requestTab === item.value}
                  onClick={() => setRequestTab(item.value)}
                  className={cn(
                    'inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold transition-colors',
                    requestTab === item.value
                      ? 'bg-(--espresso) text-white'
                      : 'text-(--muted) hover:bg-[rgba(81,53,34,0.06)] hover:text-(--espresso)',
                  )}
                >
                  {item.label}
                  <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[0.6rem]">
                    {requestCounts[item.value]}
                  </span>
                </button>
              ))}
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link to="/incidents">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Incident queue
              </Link>
            </Button>
          </div>

          <div className="mt-5">
            {requestsQuery.isLoading ? (
              <LoadingRows rows={3} label="Loading owned bookings" />
            ) : requestsQuery.isError ? (
              <ErrorNotice
                title="Bookings for your resources could not be loaded"
                message="Refresh the page to try again."
                onRetry={() => void requestsQuery.refetch()}
              />
            ) : visibleRequests.length === 0 ? (
              <EmptyState
                icon={requestTab === 'pending' ? BadgeCheck : Inbox}
                title={
                  requestTab === 'pending'
                    ? 'No requests need your decision'
                    : 'No bookings in this view'
                }
                description={
                  requestTab === 'pending'
                    ? 'New requests for your resources will appear here. Managers can also make a first decision.'
                    : 'Bookings update here as their state changes.'
                }
              />
            ) : (
              <div className="space-y-4">
                {visibleRequests
                  .slice()
                  .sort((a, b) => {
                    if (requestTab === 'pending') {
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
        </div>
      ) : (
        <div className="mt-5">
          {resourcesQuery.isLoading ? (
            <LoadingRows rows={3} label="Loading owned resources" />
          ) : resourcesQuery.isError ? (
            <ErrorNotice
              title="Your resources could not be loaded"
              message="Refresh the page to try again."
              onRetry={() => void resourcesQuery.refetch()}
            />
          ) : resources.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="Add your first resource"
              description="Set its location, booking limits, availability, and any safety requirements people must satisfy before booking."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add resource
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {resources.map((resource) => (
                <li key={resource.id}>
                  <SectionCard className="flex h-full flex-col p-0 sm:p-0">
                    <div className="relative h-36 overflow-hidden rounded-t-[1.35rem] bg-[rgba(81,53,34,0.08)]">
                      <img
                        src={getResourceImage(resource)}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span
                        className={cn(
                          'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.66rem] font-semibold',
                          resource.status === 'active'
                            ? 'bg-[rgba(255,252,247,0.92)] text-(--success)'
                            : 'bg-[rgba(255,252,247,0.92)] text-(--muted)',
                        )}
                      >
                        {resource.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-display text-[1.35rem] font-semibold text-(--charcoal)">
                            {resource.name}
                          </h2>
                          <p className="mt-0.5 text-xs text-(--muted)">
                            {resource.category} · {resource.location}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] font-medium text-(--muted)">
                        <span className="rounded-full bg-[rgba(81,53,34,0.06)] px-2.5 py-1">
                          Max {resource.max_hours_per_booking}h / booking
                        </span>
                        <span className="rounded-full bg-[rgba(81,53,34,0.06)] px-2.5 py-1">
                          {resource.weekly_cap_hours}h weekly cap
                        </span>
                        <span className="rounded-full bg-[rgba(81,53,34,0.06)] px-2.5 py-1">
                          {resource.requirements?.length ?? 0} requirements
                        </span>
                        <span className="rounded-full bg-[rgba(81,53,34,0.06)] px-2.5 py-1">
                          {resource.managers?.length ?? 0} managers
                        </span>
                      </div>

                      <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(resource)}>
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setManagerResource(resource)}
                        >
                          <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
                          Managers
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link
                            to="/resources/$resourceId"
                            params={{ resourceId: String(resource.id) }}
                          >
                            View
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-(--error) hover:bg-[rgba(169,72,60,0.07)] hover:text-(--error)"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete ${resource.name}? Resources with active bookings cannot be deleted.`,
                              )
                            ) {
                              deleteMutation.mutate(resource.id)
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </SectionCard>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ResourceFormModal open={formOpen} resource={editingResource} onClose={closeForm} />
      <OwnerManagerModal resource={managerResource} onClose={() => setManagerResource(null)} />
    </div>
  )
}

export default OwnerDashboard
