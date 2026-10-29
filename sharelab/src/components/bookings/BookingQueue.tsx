import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  MapPin,
  Search,
  X,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/button'
import { EmptyState } from '../ui/EmptyState'
import { FormAlert } from '../auth/FormAlert'
import { Modal } from '../ui/Modal'
import { Skeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'
import { Tabs } from '../ui/Tabs'
import { useDebouncedValue } from '../../hooks/useResources'
import {
  useBookingQueueQuery,
  useDecideBooking,
} from '../../hooks/useWorkspace'
import { getApiErrorMessage } from '../../lib/api-client'
import type { Booking, BookingDecision } from '../../lib/booking-service'
import { formatDuration, formatRange } from '../../lib/format'
import { cn } from '../../lib/utils'

type QueueStatus = 'pending' | 'waitlisted' | 'approved' | 'all'

const decisionCopy: Record<
  BookingDecision,
  {
    label: string
    title: string
    description: string
    tone: 'default' | 'danger'
  }
> = {
  approve: {
    label: 'Approve request',
    title: 'Approve this request',
    description:
      'The requester is notified and the slot is held for them. Conflicts are re-checked by the server.',
    tone: 'default',
  },
  waitlist: {
    label: 'Waitlist request',
    title: 'Place this request on the waitlist',
    description:
      'The request keeps its ranked position and can be promoted if the slot is released.',
    tone: 'default',
  },
  reject: {
    label: 'Reject request',
    title: 'Reject this request',
    description:
      'The requester sees the reason you record. This cannot be undone.',
    tone: 'danger',
  },
}

export const BookingQueue = () => {
  const [status, setStatus] = useState<QueueStatus>('pending')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const [page, setPage] = useState(1)
  const [decision, setDecision] = useState<{
    booking: Booking
    decision: BookingDecision
  } | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)

  const queueQuery = useBookingQueueQuery({
    status: status === 'all' ? undefined : status,
    q: debouncedSearch,
    page,
    perPage: 10,
    sort: status === 'pending' ? 'priority' : 'schedule',
  })
  const decideMutation = useDecideBooking()

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  const bookings = queueQuery.data?.items ?? []
  const total = queueQuery.data?.total ?? bookings.length
  const lastPage = queueQuery.data?.lastPage ?? 1

  const openDecision = (booking: Booking, next: BookingDecision) => {
    setDecision({ booking, decision: next })
    setReason('')
    setReasonError(null)
  }

  const submitDecision = async () => {
    if (!decision) return

    if (reason.trim().length < 3) {
      setReasonError('Record a short reason for this decision.')
      return
    }

    setReasonError(null)

    try {
      await decideMutation.mutateAsync({
        bookingId: decision.booking.id,
        decision: decision.decision,
        reason: reason.trim(),
      })
      setFeedback({
        tone: 'success',
        message:
          decision.decision === 'approve'
            ? 'Request approved. The requester has been notified.'
            : decision.decision === 'waitlist'
              ? 'Request moved to the waitlist.'
              : 'Request rejected with a recorded reason.',
      })
      setDecision(null)
      setReason('')
    } catch (error) {
      setReasonError(
        getApiErrorMessage(error, 'The decision could not be recorded.'),
      )
    }
  }

  return (
    <div>
      {feedback ? (
        <FormAlert
          className="mb-4"
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Tabs
          label="Filter booking requests"
          value={status}
          onChange={setStatus}
          items={[
            { value: 'pending', label: 'Pending' },
            { value: 'waitlisted', label: 'Waitlisted' },
            { value: 'approved', label: 'Approved' },
            { value: 'all', label: 'All requests' },
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
            placeholder="Search resource, requester or purpose"
            aria-label="Search booking requests"
            className="h-9 w-full rounded-[0.5rem] border border-[var(--border-subtle)] bg-[var(--cream)] pl-9 pr-3 text-[0.8125rem] text-[var(--charcoal)] outline-none placeholder:text-[rgba(113,104,95,0.7)] focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
          />
        </div>
      </div>

      <div className="mt-4">
        {queueQuery.isLoading ? (
          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : queueQuery.isError ? (
          <EmptyState
            icon={AlertTriangle}
            tone="error"
            title="The request queue could not be loaded"
            description="The API did not respond. Nothing has been changed — try again in a moment."
            action={
              <Button
                variant="secondary"
                onClick={() => void queueQuery.refetch()}
              >
                Try again
              </Button>
            }
          />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={
              debouncedSearch
                ? 'No requests match that search'
                : status === 'pending'
                  ? 'No requests are waiting for a decision'
                  : status === 'waitlisted'
                    ? 'No requests are waitlisted'
                    : status === 'approved'
                      ? 'No approved requests in this queue'
                      : 'No booking requests on record'
            }
            description={
              debouncedSearch
                ? 'Try a different resource name, requester, or clear the search.'
                : 'Requests for the resources you manage will appear here as they are submitted.'
            }
            action={
              debouncedSearch ? (
                <Button variant="secondary" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p
              className="mb-2.5 text-[0.75rem] text-[var(--muted)]"
              aria-live="polite"
            >
              {total === 1 ? '1 request' : `${total} requests`}
              {status === 'pending' ? ' · ranked by priority score' : ''}
            </p>

            <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] lg:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    {[
                      'Requester',
                      'Resource',
                      'Time window',
                      'Purpose',
                      'Priority',
                      'Status',
                      '',
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[rgba(239,230,217,0.28)]"
                    >
                      <td className="px-4 py-3">
                        <p className="text-[0.8125rem] font-medium text-[var(--charcoal)]">
                          {booking.user?.name ?? `User #${booking.user_id}`}
                        </p>
                        <p className="mt-0.5 text-[0.68rem] text-[var(--muted)]">
                          {booking.user?.email ?? ''}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to="/resources/$resourceId"
                          params={{ resourceId: String(booking.resource_id) }}
                          className="text-[0.8125rem] font-medium text-[var(--charcoal)] hover:text-[var(--espresso)]"
                        >
                          {booking.resource?.name ??
                            `Resource #${booking.resource_id}`}
                        </Link>
                        <p className="mt-0.5 flex items-center gap-1 text-[0.68rem] text-[var(--muted)]">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {booking.resource?.location ?? 'Location unavailable'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[0.75rem] text-[var(--charcoal)]">
                          {formatRange(booking.start_at, booking.end_at)}
                        </p>
                        <p className="mt-0.5 font-mono text-[0.68rem] text-[var(--muted)]">
                          {formatDuration(booking.start_at, booking.end_at)}
                        </p>
                      </td>
                      <td className="max-w-[14rem] px-4 py-3">
                        <p className="line-clamp-2 text-[0.75rem] leading-relaxed text-[var(--muted)]">
                          {booking.purpose || 'No purpose provided.'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-[0.78rem] text-[var(--charcoal)]">
                          {booking.priority_score ?? '—'}
                        </p>
                        {booking.priority_explanation ? (
                          <p className="mt-0.5 max-w-[10rem] text-[0.65rem] leading-snug text-[var(--muted)]">
                            {booking.priority_explanation}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {booking.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              onClick={() => openDecision(booking, 'approve')}
                            >
                              <Check
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openDecision(booking, 'waitlist')}
                            >
                              Waitlist
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[var(--error)] hover:bg-[var(--error-soft)]"
                              onClick={() => openDecision(booking, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Button asChild size="sm" variant="secondary">
                            <Link
                              to="/my-bookings/$bookingId"
                              params={{ bookingId: String(booking.id) }}
                            >
                              View
                              <ArrowUpRight
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                            </Link>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-2.5 lg:hidden">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[0.875rem] font-semibold text-[var(--charcoal)]">
                        {booking.resource?.name ??
                          `Resource #${booking.resource_id}`}
                      </p>
                      <p className="mt-0.5 text-[0.72rem] text-[var(--muted)]">
                        {booking.user?.name ?? `User #${booking.user_id}`} ·{' '}
                        {formatRange(booking.start_at, booking.end_at)}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} dot={false} />
                  </div>

                  {booking.purpose ? (
                    <p className="mt-2 line-clamp-2 text-[0.75rem] leading-relaxed text-[var(--muted)]">
                      {booking.purpose}
                    </p>
                  ) : null}

                  <div className="mt-2 flex items-center gap-3 text-[0.68rem] text-[var(--muted)]">
                    <span className="font-mono">
                      Priority {booking.priority_score ?? '—'}
                    </span>
                    <span className="font-mono">
                      {formatDuration(booking.start_at, booking.end_at)}
                    </span>
                  </div>

                  {booking.status === 'pending' ? (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--border-subtle)] pt-3">
                      <Button
                        size="sm"
                        onClick={() => openDecision(booking, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openDecision(booking, 'waitlist')}
                      >
                        Waitlist
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[var(--error)] hover:bg-[var(--error-soft)]"
                        onClick={() => openDecision(booking, 'reject')}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            {lastPage > 1 ? (
              <nav
                aria-label="Request queue pagination"
                className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || queueQuery.isFetching}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </Button>
                <span className="font-mono text-[0.72rem] text-[var(--muted)]">
                  Page {page} / {lastPage}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setPage((current) => Math.min(lastPage, current + 1))
                  }
                  disabled={page >= lastPage || queueQuery.isFetching}
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </nav>
            ) : null}
          </>
        )}
      </div>

      <Modal
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        title={decision ? decisionCopy[decision.decision].title : 'Decision'}
        description={
          decision ? (
            <span>
              {decision.booking.resource?.name ??
                `Resource #${decision.booking.resource_id}`}{' '}
              ·{' '}
              {decision.booking.user?.name ??
                `User #${decision.booking.user_id}`}{' '}
              ·{' '}
              {formatRange(decision.booking.start_at, decision.booking.end_at)}
            </span>
          ) : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDecision(null)}
              disabled={decideMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={
                decision ? decisionCopy[decision.decision].tone : 'default'
              }
              onClick={() => void submitDecision()}
              disabled={decideMutation.isPending}
            >
              {decideMutation.isPending
                ? 'Recording…'
                : decision
                  ? decisionCopy[decision.decision].label
                  : 'Confirm'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[rgba(239,230,217,0.45)] px-3 py-2 text-[0.75rem] leading-relaxed text-[var(--muted)]">
            <Clock3
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            {decision ? decisionCopy[decision.decision].description : ''}
          </p>

          <div>
            <label
              htmlFor="decision-reason"
              className="block text-[0.75rem] font-semibold text-[var(--charcoal)]"
            >
              Decision reason
              <span className="ml-1 text-[var(--error)]" aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              id="decision-reason"
              rows={3}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value)
                setReasonError(null)
              }}
              placeholder="Explain the outcome for the requester and the audit record."
              aria-invalid={reasonError ? 'true' : undefined}
              aria-describedby={
                reasonError ? 'decision-reason-error' : undefined
              }
              className={cn(
                'mt-1.5 w-full resize-none rounded-[0.5rem] border bg-white px-3 py-2 text-[0.8125rem] text-[var(--charcoal)]',
                'outline-none placeholder:text-[rgba(113,104,95,0.7)] focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]',
                reasonError
                  ? 'border-[rgba(164,69,59,0.55)]'
                  : 'border-[var(--border-subtle)]',
              )}
            />
            {reasonError ? (
              <p
                id="decision-reason-error"
                className="mt-1.5 flex items-start gap-1.5 text-[0.72rem] text-[var(--error)]"
              >
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                {reasonError}
              </p>
            ) : (
              <p className="mt-1.5 text-[0.68rem] text-[var(--muted)]">
                Reasons are visible to the requester and stored in the audit
                log.
              </p>
            )}
          </div>

          {decision?.booking.priority_explanation ? (
            <p className="text-[0.72rem] leading-relaxed text-[var(--muted)]">
              <Badge tone="bronze">Priority</Badge>{' '}
              {decision.booking.priority_explanation}
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}

export default BookingQueue
