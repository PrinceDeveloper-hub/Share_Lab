import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowUpRight,
  CalendarDays,
  FlaskConical,
  Loader2,
  MessageSquareText,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Pagination } from '../../components/ui/pagination'
import {
  useCancelBooking,
  useBookingList,
  usePrefetchBookings,
} from '../../hooks/useBookings'
import { usePageMeta } from '../../hooks/usePageMeta'
import { getApiErrorMessage } from '../../lib/api-client'
import {
  bookingStatusDetails,
  formatBookingWindow,
} from '../../lib/booking-display'
import { cn } from '../../lib/utils'

type BookingView = 'all' | 'open' | 'history'

const filterLabels: Record<BookingView, string> = {
  all: 'All',
  open: 'Open',
  history: 'History',
}

const PER_PAGE = 6

export const MyBookings = () => {
  usePageMeta({
    title: 'Your requests — ShareLab',
    description:
      'Track your ShareLab requests, approvals, waitlist positions, and the full handover record.',
  })

  const [view, setView] = useState<BookingView>('all')
  const [page, setPage] = useState(1)

  const query = useBookingList({ view, page, perPage: PER_PAGE })
  const prefetch = usePrefetchBookings()
  const cancelMutation = useCancelBooking()

  const bookings = query.data?.data ?? []
  const meta = query.data?.meta
  const counts = (meta?.counts as Record<string, number> | undefined) ?? {
    all: meta?.total ?? 0,
    open: 0,
    history: 0,
  }
  const total = meta?.total ?? bookings.length
  const lastPage = meta?.last_page ?? 1
  const isInitialLoading = query.isLoading && !query.data

  useEffect(() => {
    setPage(1)
  }, [view])

  useEffect(() => {
    if (meta?.last_page && page > meta.last_page) setPage(meta.last_page)
  }, [meta?.last_page, page])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[2.4rem] font-semibold leading-[1.03] tracking-[-0.035em] text-(--charcoal) sm:text-[3rem]">
            Your requests
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--muted) sm:text-base">
            Track decisions, waitlist positions, and every handover — from the
            first request to the final return.
          </p>
        </div>
        <Button asChild>
          <Link to="/resources">
            Book a resource
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {cancelMutation.isError ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-(--error-line) bg-(--error-tint-soft) px-4 py-3 text-sm text-(--error)"
        >
          {getApiErrorMessage(
            cancelMutation.error,
            'We could not cancel that request. Please try again.',
          )}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-(--border-subtle) pb-3">
        <div
          role="group"
          aria-label="Filter requests"
          className="flex flex-wrap gap-1"
        >
          {(Object.keys(filterLabels) as BookingView[]).map((filter) => {
            const active = view === filter

            return (
              <button
                key={filter}
                type="button"
                aria-pressed={active}
                onClick={() => setView(filter)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ivory)',
                  active
                    ? 'bg-(--espresso) text-(--accent-contrast)'
                    : 'text-(--muted) hover:bg-(--tint-2) hover:text-(--espresso)',
                )}
              >
                {filterLabels[filter]}
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[0.65rem] font-semibold',
                    active
                      ? 'bg-(--surface) text-(--espresso)'
                      : 'bg-(--tint-2)',
                  )}
                >
                  {counts[filter] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs font-medium text-(--muted)" aria-live="polite">
          {total} {total === 1 ? 'request' : 'requests'}
          {query.isFetching ? ' · updating…' : ''}
        </p>
      </div>

      {isInitialLoading ? (
        <div className="mt-5 space-y-3" role="status" aria-live="polite">
          <span className="sr-only">Loading your requests</span>
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="flex animate-pulse gap-4 rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-5"
            >
              <span className="h-11 w-11 shrink-0 rounded-full bg-(--tint-2)" />
              <div className="flex-1 space-y-3">
                <span className="block h-3 w-1/2 rounded-full bg-(--tint-2)" />
                <span className="block h-2.5 w-2/3 rounded-full bg-(--tint-2)" />
                <span className="block h-2.5 w-1/3 rounded-full bg-(--tint-2)" />
              </div>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <div className="mt-5 rounded-(--radius-lg) border border-(--error-line) bg-(--error-tint-soft) p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert
              className="mt-0.5 h-5 w-5 shrink-0 text-(--error)"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-semibold text-(--charcoal)">
                Your requests could not be loaded
              </h2>
              <p className="mt-1 text-sm text-(--muted)">
                Refresh the page to try again. If the problem continues, contact
                your lab manager.
              </p>
            </div>
          </div>
        </div>
      ) : total === 0 ? (
        <div className="mt-5 rounded-(--radius-lg) border border-dashed border-(--border-strong) bg-(--surface) px-6 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--tint-2)">
            <FlaskConical
              className="h-5 w-5 text-(--espresso)"
              aria-hidden="true"
            />
          </span>
          <h2 className="mt-4 font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-(--charcoal)">
            Nothing booked yet.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-(--muted)">
            Browse the catalogue, check the requirements, and request a window
            that fits your work.
          </p>
          <Button asChild className="mt-6">
            <Link to="/resources">Browse resources</Link>
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-5 rounded-(--radius-lg) border border-dashed border-(--tint-3) bg-(--surface) px-6 py-10 text-center">
          <h2 className="font-display text-xl font-semibold text-(--charcoal)">
            No requests in this view.
          </h2>
          <p className="mt-2 text-sm text-(--muted)">
            {view === 'history'
              ? 'Completed and cancelled requests will appear here.'
              : 'You have no open requests right now.'}
          </p>
          <Button
            variant="secondary"
            className="mt-5"
            onClick={() => setView('all')}
          >
            Show all requests
          </Button>
        </div>
      ) : (
        <>
          <ul className="mt-5 space-y-3">
            {bookings.map((booking) => {
              const resource = booking.resource
              const status = bookingStatusDetails[booking.status]
              const StatusIcon = status.icon
              const canCancel = ['pending', 'approved', 'waitlisted'].includes(
                booking.status,
              )
              const cancelling =
                cancelMutation.isPending &&
                cancelMutation.variables.bookingId === booking.id

              const handleCancel = () => {
                if (
                  window.confirm(
                    'Cancel this request? This cannot be undone, and the time will be released.',
                  )
                ) {
                  cancelMutation.mutate({ bookingId: booking.id })
                }
              }

              return (
                <li
                  key={booking.id}
                  className="rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-5 shadow-soft transition-shadow hover:shadow-(--shadow-md) sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <span
                        className={cn(
                          'mt-0.5 hidden h-11 w-11 shrink-0 items-center justify-center rounded-full sm:flex',
                          status.tone,
                        )}
                      >
                        <StatusIcon className="h-4 w-4" aria-hidden="true" />
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          {resource ? (
                            <Link
                              to="/resources/$resourceId"
                              params={{ resourceId: String(resource.id) }}
                              className="rounded-sm text-lg font-semibold text-(--charcoal) transition-colors hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
                            >
                              {resource.name}
                            </Link>
                          ) : (
                            <h2 className="text-lg font-semibold text-(--charcoal)">
                              Request #{booking.id}
                            </h2>
                          )}
                          <span
                            className={cn(
                              'inline-flex items-center rounded-[0.35rem] px-2 py-0.5 text-[0.6875rem] font-semibold',
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

                        {resource ? (
                          <p className="mt-1 text-xs font-medium text-(--muted)">
                            {resource.category} · {resource.location}
                          </p>
                        ) : null}

                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-(--charcoal)">
                          <CalendarDays
                            className="h-4 w-4 text-(--taupe)"
                            aria-hidden="true"
                          />
                          {formatBookingWindow(booking)}
                        </p>

                        {booking.purpose ? (
                          <p className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed text-(--muted)">
                            <MessageSquareText
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--taupe)"
                              aria-hidden="true"
                            />
                            {booking.purpose}
                          </p>
                        ) : null}

                        {booking.decision_reason ? (
                          <p className="mt-3 rounded-xl bg-(--tint-1) px-3 py-2 text-xs leading-relaxed text-(--muted)">
                            <span className="font-semibold text-(--charcoal)">
                              Manager note:
                            </span>{' '}
                            {booking.decision_reason}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                      <Button asChild>
                        <Link
                          to="/my-bookings/$bookingId"
                          params={{ bookingId: String(booking.id) }}
                        >
                          Open record
                          <ArrowUpRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </Link>
                      </Button>
                      {resource ? (
                        <Button asChild variant="outline">
                          <Link
                            to="/resources/$resourceId"
                            params={{ resourceId: String(resource.id) }}
                          >
                            View resource
                          </Link>
                        </Button>
                      ) : null}
                      {canCancel ? (
                        <Button
                          variant="ghost"
                          className="text-(--error) hover:bg-(--error-tint-soft) hover:text-(--error)"
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                        >
                          {cancelling ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : null}
                          {cancelling ? 'Cancelling...' : 'Cancel request'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <Pagination
            label="Request pagination"
            page={page}
            lastPage={lastPage}
            total={total}
            perPage={meta?.per_page ?? PER_PAGE}
            isFetching={query.isFetching}
            onPageChange={setPage}
            onPrefetch={(nextPage) =>
              void prefetch({ view, page: nextPage, perPage: PER_PAGE })
            }
          />
        </>
      )}
    </div>
  )
}

export default MyBookings
