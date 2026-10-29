import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  FlaskConical,
  Search,
  X,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { ConfirmDialog } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { FormAlert } from '../../components/auth/FormAlert'
import { PageHeader } from '../../components/ui/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Tabs } from '../../components/ui/Tabs'
import { useBookings } from '../../hooks/useBookings'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useResourceMap } from '../../hooks/useResources'
import { getApiErrorMessage } from '../../lib/api-client'
import type { Booking } from '../../lib/booking-service'
import { formatDuration, formatRange } from '../../lib/format'

type BookingView = 'all' | 'open' | 'history'

const OPEN_STATUSES: Booking['status'][] = [
  'pending',
  'waitlisted',
  'approved',
  'checked_in',
]
const HISTORY_STATUSES: Booking['status'][] = [
  'returned',
  'rejected',
  'cancelled',
]
const CANCELLABLE: Booking['status'][] = ['pending', 'waitlisted', 'approved']

export const MyBookings = () => {
  usePageMeta({
    title: 'My bookings — ShareLab',
    description:
      'Track open requests, approved bookings and completed handovers in one place.',
  })

  const { bookings, isLoading, isError, cancelMutation } = useBookings()
  const { resourceMap } = useResourceMap()
  const [view, setView] = useState<BookingView>('all')
  const [search, setSearch] = useState('')
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)

  const list = bookings ?? []

  const resourceName = (booking: Booking) =>
    resourceMap.get(booking.resource_id)?.name ??
    `Resource #${booking.resource_id}`

  const counts = {
    all: list.length,
    open: list.filter((booking) => OPEN_STATUSES.includes(booking.status))
      .length,
    history: list.filter((booking) => HISTORY_STATUSES.includes(booking.status))
      .length,
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return list
      .filter((booking) => {
        if (view === 'open') return OPEN_STATUSES.includes(booking.status)
        if (view === 'history') return HISTORY_STATUSES.includes(booking.status)
        return true
      })
      .filter((booking) => {
        if (!term) return true
        const resource = resourceMap.get(booking.resource_id)
        return (
          resource?.name.toLowerCase().includes(term) ||
          resource?.location.toLowerCase().includes(term) ||
          booking.purpose?.toLowerCase().includes(term)
        )
      })
      .sort(
        (a, b) =>
          new Date(b.start_at).getTime() - new Date(a.start_at).getTime(),
      )
  }, [list, resourceMap, search, view])

  const confirmCancel = async () => {
    if (!cancelTarget) return

    try {
      await cancelMutation.mutateAsync(cancelTarget.id)
      setFeedback({
        tone: 'success',
        message:
          'Booking cancelled. Any waitlist promotion has been handled by the server.',
      })
      setCancelTarget(null)
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: getApiErrorMessage(
          error,
          'The booking could not be cancelled.',
        ),
      })
      setCancelTarget(null)
    }
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'My bookings' },
        ]}
        eyebrow="Requests"
        title="My bookings"
        description="Every request you have submitted, the decision attached to it, and the handover record that follows."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/dashboard">Overview</Link>
            </Button>
            <Button asChild>
              <Link to="/resources">Request a resource</Link>
            </Button>
          </>
        }
      />

      {feedback ? (
        <FormAlert
          className="mt-5"
          variant={feedback.tone === 'success' ? 'success' : 'error'}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
              className="shrink-0 opacity-70 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </FormAlert>
      ) : null}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Tabs
          label="Filter bookings"
          value={view}
          onChange={setView}
          items={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'open', label: 'Open', count: counts.open },
            { value: 'history', label: 'History', count: counts.history },
          ]}
          className="flex-1"
        />

        <div className="relative sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter by resource or purpose"
            aria-label="Filter bookings"
            className="h-9 w-full rounded-[0.5rem] border border-[var(--border-subtle)] bg-[var(--cream)] pl-9 pr-3 text-[0.8125rem] text-[var(--charcoal)] outline-none placeholder:text-[rgba(113,104,95,0.7)] focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
          />
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-1.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            tone="error"
            title="Your bookings could not be loaded"
            description="The ShareLab API did not respond. Nothing has been changed — try again in a moment."
            action={
              <Button asChild variant="secondary">
                <Link to="/dashboard">Back to overview</Link>
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={view === 'history' ? FlaskConical : CalendarDays}
            title={
              search
                ? 'No bookings match that filter'
                : view === 'open'
                  ? 'No open requests'
                  : view === 'history'
                    ? 'No completed bookings yet'
                    : 'No bookings yet'
            }
            description={
              search
                ? 'Try a different resource name or clear the filter.'
                : 'Once you request a resource, it will appear here with its review status.'
            }
            action={
              search ? (
                <Button variant="secondary" onClick={() => setSearch('')}>
                  Clear filter
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/resources">Browse resources</Link>
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    {['Resource', 'Time window', 'Status', 'Decision', ''].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => {
                    const resource = resourceMap.get(booking.resource_id)

                    return (
                      <tr
                        key={booking.id}
                        className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[rgba(239,230,217,0.28)]"
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-[0.8125rem] font-medium text-[var(--charcoal)]">
                            {resourceName(booking)}
                          </p>
                          <p className="mt-0.5 text-[0.7rem] text-[var(--muted)]">
                            {resource?.location ?? 'Location unavailable'}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-[0.78rem] text-[var(--charcoal)]">
                            {formatRange(booking.start_at, booking.end_at)}
                          </p>
                          <p className="mt-0.5 font-mono text-[0.68rem] text-[var(--muted)]">
                            {formatDuration(booking.start_at, booking.end_at)}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="max-w-[16rem] px-5 py-3.5">
                          <p className="truncate text-[0.75rem] text-[var(--muted)]">
                            {booking.decision_reason ??
                              (booking.waitlist_position
                                ? `Waitlist position ${booking.waitlist_position}`
                                : '—')}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {CANCELLABLE.includes(booking.status) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[var(--muted)] hover:text-[var(--error)]"
                                onClick={() => setCancelTarget(booking)}
                              >
                                Cancel
                              </Button>
                            ) : null}
                            <Button asChild variant="secondary" size="sm">
                              <Link
                                to="/my-bookings/$bookingId"
                                params={{ bookingId: String(booking.id) }}
                              >
                                View
                                <ChevronRight
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ul className="space-y-2.5 md:hidden">
              {filtered.map((booking) => (
                <li
                  key={booking.id}
                  className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[0.875rem] font-semibold text-[var(--charcoal)]">
                        {resourceName(booking)}
                      </p>
                      <p className="mt-0.5 text-[0.72rem] text-[var(--muted)]">
                        {formatRange(booking.start_at, booking.end_at)}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} dot={false} />
                  </div>

                  {booking.decision_reason ? (
                    <p className="mt-2.5 rounded-[0.375rem] bg-[rgba(239,230,217,0.45)] px-2.5 py-1.5 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                      {booking.decision_reason}
                    </p>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
                    {CANCELLABLE.includes(booking.status) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--muted)] hover:text-[var(--error)]"
                        onClick={() => setCancelTarget(booking)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <span className="font-mono text-[0.68rem] text-[var(--muted)]">
                        {formatDuration(booking.start_at, booking.end_at)}
                      </span>
                    )}
                    <Button asChild variant="secondary" size="sm">
                      <Link
                        to="/my-bookings/$bookingId"
                        params={{ bookingId: String(booking.id) }}
                      >
                        View booking
                        <ChevronRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => void confirmCancel()}
        title="Cancel this booking?"
        description={
          cancelTarget
            ? `${resourceName(cancelTarget)} · ${formatRange(cancelTarget.start_at, cancelTarget.end_at)}. Cancelling can offer the slot to the next eligible waitlisted request. This cannot be undone.`
            : ''
        }
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        tone="danger"
        loading={cancelMutation.isPending}
      />
    </>
  )
}

export default MyBookings
