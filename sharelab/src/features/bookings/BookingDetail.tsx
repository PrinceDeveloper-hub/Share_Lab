import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  Check,
  ClipboardCheck,
  Clock3,
  FileText,
  Info,
  MapPin,
  MessageSquareWarning,
  Undo2,
  X,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/EmptyState'
import { FormAlert } from '../../components/auth/FormAlert'
import { Modal, ConfirmDialog } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useBookings } from '../../hooks/useBookings'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useResourceMap } from '../../hooks/useResources'
import { getApiErrorMessage } from '../../lib/api-client'
import type { Booking, ConditionLevel } from '../../lib/booking-service'
import { formatDateTime, formatDuration, formatRange } from '../../lib/format'
import { cn } from '../../lib/utils'

const CANCELLABLE: Booking['status'][] = ['pending', 'waitlisted', 'approved']
const REPORTABLE: Booking['status'][] = ['approved', 'checked_in', 'returned']

type HandoverMode = 'checkin' | 'return'

const conditionLevels: {
  value: ConditionLevel
  label: string
  hint: string
}[] = [
  { value: 'excellent', label: 'Excellent', hint: 'As new, nothing to note' },
  { value: 'good', label: 'Good', hint: 'Normal wear, fully usable' },
  { value: 'fair', label: 'Fair', hint: 'Worn but still serviceable' },
  { value: 'damaged', label: 'Damaged', hint: 'Broken, unsafe or incomplete' },
]

const conditionLabel = (condition: ConditionLevel) =>
  conditionLevels.find((level) => level.value === condition)?.label ?? condition

const incidentTypes = [
  {
    value: 'damage',
    label: 'Damage',
    hint: 'Broken, missing or unsafe equipment',
  },
  { value: 'delay', label: 'Delay', hint: 'Late handover or return' },
  { value: 'other', label: 'Other', hint: 'Anything else worth recording' },
] as const

type IncidentType = (typeof incidentTypes)[number]['value']

const lifecycleFor = (booking: Booking) => {
  const decided = ['approved', 'rejected', 'waitlisted', 'cancelled'].includes(
    booking.status,
  )
  const checkedIn = ['checked_in', 'returned'].includes(booking.status)
  const returned = booking.status === 'returned'

  return [
    {
      key: 'requested',
      label: 'Request submitted',
      text: 'The request was recorded with its time window and purpose.',
      state: 'done' as const,
    },
    {
      key: 'decision',
      label: 'Manager decision',
      text: decided
        ? (booking.decision_reason ??
          'A decision was recorded by the resource team.')
        : 'Waiting for a resource owner or manager to review this request.',
      state: decided ? ('done' as const) : ('current' as const),
    },
    {
      key: 'checkin',
      label: 'Check-in and condition',
      text: checkedIn
        ? 'A condition report was recorded when the resource was collected.'
        : booking.status === 'approved'
          ? 'Available within the check-in window for an approved booking.'
          : 'Check-in becomes available once the request is approved.',
      state: checkedIn
        ? ('done' as const)
        : booking.status === 'approved'
          ? ('current' as const)
          : ('upcoming' as const),
    },
    {
      key: 'return',
      label: 'Return and close-out',
      text: returned
        ? 'The resource was returned and the handover record was closed.'
        : 'A return condition report completes the booking record.',
      state: returned ? ('done' as const) : ('upcoming' as const),
    },
  ]
}

const stepStyles = {
  done: 'border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]',
  current:
    'border-[var(--bronze)] bg-[var(--warning-soft)] text-[var(--warning)]',
  upcoming:
    'border-[var(--border-strong)] bg-[var(--cream)] text-[var(--muted)]',
}

export interface BookingDetailProps {
  bookingId: string
}

export const BookingDetail = ({ bookingId }: BookingDetailProps) => {
  const {
    bookings,
    isLoading,
    isError,
    cancelMutation,
    checkInMutation,
    returnMutation,
    reportIncidentMutation,
  } = useBookings()
  const { resourceMap } = useResourceMap()

  const [cancelOpen, setCancelOpen] = useState(false)
  const [incidentOpen, setIncidentOpen] = useState(false)
  const [incidentType, setIncidentType] = useState<IncidentType>('damage')
  const [incidentDescription, setIncidentDescription] = useState('')
  const [incidentError, setIncidentError] = useState<string | null>(null)
  const [handoverMode, setHandoverMode] = useState<HandoverMode | null>(null)
  const [reportCondition, setReportCondition] = useState<ConditionLevel>('good')
  const [reportNotes, setReportNotes] = useState('')
  const [reportError, setReportError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)

  const numericId = Number(bookingId)
  const booking = bookings?.find((item) => item.id === numericId)
  const resource = booking ? resourceMap.get(booking.resource_id) : undefined
  const resourceName =
    resource?.name ?? (booking ? `Resource #${booking.resource_id}` : 'Booking')

  usePageMeta({
    title: booking
      ? `${resourceName} booking — ShareLab`
      : 'Booking — ShareLab',
    description:
      'Review a booking request, its decision and its handover record.',
  })

  const openHandover = (mode: HandoverMode) => {
    setHandoverMode(mode)
    setReportCondition('good')
    setReportNotes('')
    setReportError(null)
  }

  const closeHandover = () => {
    if (checkInMutation.isPending || returnMutation.isPending) return
    setHandoverMode(null)
  }

  const submitHandover = async () => {
    if (!booking || !handoverMode) return

    const notes = reportNotes.trim()

    try {
      if (handoverMode === 'checkin') {
        await checkInMutation.mutateAsync({
          bookingId: booking.id,
          condition: reportCondition,
          notes: notes || undefined,
        })
        setFeedback({
          tone: 'success',
          message: `Checked in with a ${reportCondition} condition report.`,
        })
      } else {
        const updated = await returnMutation.mutateAsync({
          bookingId: booking.id,
          condition: reportCondition,
          notes: notes || undefined,
        })
        setFeedback({
          tone: 'success',
          message: updated.is_late
            ? `Returned with a ${reportCondition} condition report. The return was after the booking window, so it is flagged as late.`
            : `Returned with a ${reportCondition} condition report. The booking is closed out.`,
        })
      }
      setHandoverMode(null)
    } catch (error) {
      setReportError(
        getApiErrorMessage(
          error,
          handoverMode === 'checkin'
            ? 'The check-in could not be recorded.'
            : 'The return could not be recorded.',
        ),
      )
    }
  }

  const confirmCancel = async () => {
    if (!booking) return

    try {
      await cancelMutation.mutateAsync(booking.id)
      setCancelOpen(false)
      setFeedback({
        tone: 'success',
        message: 'Booking cancelled. The slot is now released.',
      })
    } catch (error) {
      setCancelOpen(false)
      setFeedback({
        tone: 'error',
        message: getApiErrorMessage(
          error,
          'The booking could not be cancelled.',
        ),
      })
    }
  }

  const submitIncident = async () => {
    if (!booking) return

    if (incidentDescription.trim().length < 5) {
      setIncidentError('Describe what happened in a little more detail.')
      return
    }

    setIncidentError(null)

    try {
      await reportIncidentMutation.mutateAsync({
        bookingId: booking.id,
        type: incidentType,
        description: incidentDescription.trim(),
      })
      setIncidentOpen(false)
      setIncidentDescription('')
      setIncidentType('damage')
      setFeedback({
        tone: 'success',
        message: 'Incident reported. A manager will review it.',
      })
    } catch (error) {
      setIncidentError(
        getApiErrorMessage(error, 'The incident could not be reported.'),
      )
    }
  }

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        tone="error"
        title="That booking link is not valid"
        description="Return to your bookings and choose a request from the list."
        action={
          <Button asChild>
            <Link to="/my-bookings">Back to bookings</Link>
          </Button>
        }
      />
    )
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-4 h-9 w-2/3" />
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <Skeleton className="h-48 w-full rounded-[var(--radius-lg)]" />
            <Skeleton className="h-64 w-full rounded-[var(--radius-lg)]" />
          </div>
          <Skeleton className="h-64 w-full rounded-[var(--radius-lg)]" />
        </div>
      </div>
    )
  }

  if (isError || !booking) {
    return (
      <EmptyState
        icon={AlertTriangle}
        tone={isError ? 'error' : 'neutral'}
        title={
          isError ? 'This booking could not be loaded' : 'Booking not found'
        }
        description={
          isError
            ? 'The API did not respond. Nothing has been changed — try again in a moment.'
            : 'It may belong to a different account, or the link may be out of date.'
        }
        action={
          <Button asChild>
            <Link to="/my-bookings">Back to my bookings</Link>
          </Button>
        }
      />
    )
  }

  const lifecycle = lifecycleFor(booking)
  const canCancel = CANCELLABLE.includes(booking.status)
  const canReport = REPORTABLE.includes(booking.status)
  const canCheckIn = booking.status === 'approved'
  const canReturn = booking.status === 'checked_in'
  const handoverPending = checkInMutation.isPending || returnMutation.isPending
  const reports = [
    booking.check_in_report
      ? { ...booking.check_in_report, label: 'Check-in report' }
      : null,
    booking.return_report
      ? { ...booking.return_report, label: 'Return report' }
      : null,
  ].filter((report) => report !== null)

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--bronze-deep)] hover:text-[var(--espresso)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          All bookings
        </Link>
        <span className="mono text-[0.7rem] text-[var(--muted)]">
          Booking #{booking.id}
        </span>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div className="min-w-0">
          <span className="eyebrow">Booking request</span>
          <h1 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-tight tracking-[-0.03em] text-[var(--charcoal)]">
            {resourceName}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin
                className="h-3.5 w-3.5 text-[var(--bronze-deep)]"
                aria-hidden="true"
              />
              {resource?.location ?? 'Location unavailable'}
            </span>
            <span aria-hidden="true" className="text-[var(--border-strong)]">
              ·
            </span>
            <span>{formatRange(booking.start_at, booking.end_at)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} />
          {canCancel ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCancelOpen(true)}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </header>

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

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-5">
          <section
            aria-labelledby="booking-summary"
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5"
          >
            <h2
              id="booking-summary"
              className="text-[0.9375rem] font-semibold text-[var(--charcoal)]"
            >
              Booking details
            </h2>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="label">Time window</dt>
                <dd className="mt-1 text-[0.8125rem] text-[var(--charcoal)]">
                  {formatRange(booking.start_at, booking.end_at)}
                </dd>
              </div>
              <div>
                <dt className="label">Duration</dt>
                <dd className="mt-1 text-[0.8125rem] text-[var(--charcoal)]">
                  {formatDuration(booking.start_at, booking.end_at)}
                </dd>
              </div>
              <div>
                <dt className="label">Resource</dt>
                <dd className="mt-1 text-[0.8125rem] text-[var(--charcoal)]">
                  <Link
                    to="/resources/$resourceId"
                    params={{ resourceId: String(booking.resource_id) }}
                    className="font-medium text-[var(--espresso)] hover:underline"
                  >
                    {resourceName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="label">Purpose</dt>
                <dd className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--charcoal)]">
                  {booking.purpose ||
                    'No purpose was provided with this request.'}
                </dd>
              </div>
            </dl>

            {booking.is_late ? (
              <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-sm)] border border-[rgba(156,107,36,0.22)] bg-[var(--warning-soft)] px-3 py-2 text-[0.75rem] leading-relaxed text-[var(--warning)]">
                <Clock3
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                This return was recorded after the booking window ended.
              </p>
            ) : null}
          </section>

          <section
            aria-labelledby="decision-context"
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5"
          >
            <h2
              id="decision-context"
              className="flex items-center gap-2 text-[0.9375rem] font-semibold text-[var(--charcoal)]"
            >
              <FileText
                className="h-4 w-4 text-[var(--bronze-deep)]"
                aria-hidden="true"
              />
              Decision context
            </h2>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="label">Decision reason</dt>
                <dd className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--charcoal)]">
                  {booking.decision_reason ||
                    'No decision reason is attached yet.'}
                </dd>
              </div>
              <div>
                <dt className="label">Priority score</dt>
                <dd className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--charcoal)]">
                  {booking.priority_score ?? '—'}
                  {booking.priority_explanation ? (
                    <span className="mt-0.5 block text-[0.72rem] text-[var(--muted)]">
                      {booking.priority_explanation}
                    </span>
                  ) : null}
                </dd>
              </div>
              {booking.waitlist_position ? (
                <div>
                  <dt className="label">Waitlist position</dt>
                  <dd className="mt-1 font-mono text-[0.8125rem] text-[var(--charcoal)]">
                    #{booking.waitlist_position}
                  </dd>
                </div>
              ) : null}
              {booking.confirm_by ? (
                <div>
                  <dt className="label">Confirm by</dt>
                  <dd className="mt-1 text-[0.8125rem] text-[var(--charcoal)]">
                    {formatDateTime(booking.confirm_by)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section
            aria-labelledby="booking-lifecycle"
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5"
          >
            <h2
              id="booking-lifecycle"
              className="text-[0.9375rem] font-semibold text-[var(--charcoal)]"
            >
              Lifecycle
            </h2>

            <ol className="mt-4">
              {lifecycle.map((step, index) => (
                <li
                  key={step.key}
                  className="relative flex gap-3 pb-5 last:pb-0"
                >
                  {index < lifecycle.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-[0.6875rem] top-6 h-[calc(100%-1rem)] w-px bg-[var(--border-subtle)]"
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative z-10 flex h-[1.4rem] w-[1.4rem] shrink-0 items-center justify-center rounded-full border',
                      stepStyles[step.state],
                    )}
                  >
                    {step.state === 'done' ? (
                      <Check
                        className="h-2.5 w-2.5"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-current"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-[0.8125rem] font-semibold',
                        step.state === 'upcoming'
                          ? 'text-[var(--muted)]'
                          : 'text-[var(--charcoal)]',
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-[0.75rem] leading-relaxed text-[var(--muted)]">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {booking.status === 'cancelled' ? (
              <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--soft-beige)] px-3 py-2 text-[0.75rem] leading-relaxed text-[var(--muted)]">
                <Info
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                This booking was cancelled. The handover steps no longer apply.
              </p>
            ) : null}
          </section>

          <section
            aria-labelledby="condition-reports"
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5"
          >
            <h2
              id="condition-reports"
              className="flex items-center gap-2 text-[0.9375rem] font-semibold text-[var(--charcoal)]"
            >
              <ClipboardCheck
                className="h-4 w-4 text-[var(--bronze-deep)]"
                aria-hidden="true"
              />
              Condition reports
            </h2>
            <p className="mt-1 text-[0.75rem] leading-relaxed text-[var(--muted)]">
              The condition recorded at handover, kept with the booking record.
            </p>

            {reports.length === 0 ? (
              <p className="mt-4 rounded-[var(--radius-sm)] bg-[var(--soft-beige)] px-3 py-2.5 text-[0.75rem] leading-relaxed text-[var(--muted)]">
                No condition report has been recorded yet. One is captured at
                check-in and again at return.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reports.map((report) => (
                  <li
                    key={report.id}
                    className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--ivory)] p-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[0.8125rem] font-semibold text-[var(--charcoal)]">
                        {report.label}
                      </p>
                      <span className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--cream)] px-2.5 py-0.5 text-[0.68rem] font-semibold text-[var(--espresso)]">
                        {conditionLabel(report.condition)}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[0.68rem] text-[var(--muted)]">
                      {report.reported_at
                        ? formatDateTime(report.reported_at)
                        : 'Time not recorded'}
                      {report.reporter?.name
                        ? ` · ${report.reporter.name}`
                        : ''}
                    </p>
                    <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--charcoal)]">
                      {report.notes || 'No notes were added to this report.'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5">
            <h2 className="text-[0.9375rem] font-semibold text-[var(--charcoal)]">
              Actions
            </h2>
            <p className="mt-1 text-[0.75rem] leading-relaxed text-[var(--muted)]">
              Only actions allowed by the booking state are shown.
            </p>

            <div className="mt-4 grid gap-2">
              {canCheckIn ? (
                <Button onClick={() => openHandover('checkin')}>
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  Check in
                </Button>
              ) : null}
              {canReturn ? (
                <Button onClick={() => openHandover('return')}>
                  <Undo2 className="h-4 w-4" aria-hidden="true" />
                  Return items
                </Button>
              ) : null}
              {canReport ? (
                <Button
                  variant="secondary"
                  onClick={() => setIncidentOpen(true)}
                >
                  <MessageSquareWarning
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Report an incident
                </Button>
              ) : null}
              {canCancel ? (
                <Button variant="danger" onClick={() => setCancelOpen(true)}>
                  Cancel booking
                </Button>
              ) : null}
              {!canReport && !canCancel && !canCheckIn && !canReturn ? (
                <p className="rounded-[var(--radius-sm)] bg-[var(--soft-beige)] px-3 py-2 text-[0.75rem] leading-relaxed text-[var(--muted)]">
                  This booking is closed. No further actions are available.
                </p>
              ) : null}
              {canCheckIn ? (
                <p className="text-[0.7rem] leading-relaxed text-[var(--muted)]">
                  Check-in opens 30 minutes before the start time and closes at
                  the end of the slot.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[rgba(239,230,217,0.4)] p-5">
            <h2 className="text-[0.8125rem] font-semibold text-[var(--charcoal)]">
              Handover notes
            </h2>
            <ul className="mt-3 space-y-2.5 text-[0.75rem] leading-relaxed text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <CalendarCheck
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--bronze-deep)]"
                  aria-hidden="true"
                />
                Check-in is available for approved bookings, within the check-in
                window.
              </li>
              <li className="flex items-start gap-2">
                <ClipboardCheck
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--bronze-deep)]"
                  aria-hidden="true"
                />
                Condition reports are required at check-in and return.
              </li>
              <li className="flex items-start gap-2">
                <Undo2
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--bronze-deep)]"
                  aria-hidden="true"
                />
                A return worse than check-in can raise a system-suggested damage
                incident.
              </li>
            </ul>
            <Link
              to="/how-it-works"
              className="mt-4 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-[var(--espresso)] hover:underline"
            >
              Read the full process
            </Link>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => void confirmCancel()}
        title="Cancel this booking?"
        description={`${resourceName} · ${formatRange(booking.start_at, booking.end_at)}. Cancelling can offer the slot to the next eligible waitlisted request. This cannot be undone.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        tone="danger"
        loading={cancelMutation.isPending}
      />

      <Modal
        open={incidentOpen}
        onClose={() => setIncidentOpen(false)}
        title="Report an incident"
        description="Recorded against this booking and reviewed by a manager."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIncidentOpen(false)}
              disabled={reportIncidentMutation.isPending}
            >
              Close
            </Button>
            <Button
              onClick={() => void submitIncident()}
              disabled={reportIncidentMutation.isPending}
            >
              {reportIncidentMutation.isPending
                ? 'Reporting…'
                : 'Report incident'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <fieldset>
            <legend className="text-[0.75rem] font-semibold text-[var(--charcoal)]">
              Incident type
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {incidentTypes.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'cursor-pointer rounded-[var(--radius-sm)] border p-2.5 transition-colors',
                    incidentType === option.value
                      ? 'border-[var(--espresso)] bg-[rgba(81,53,34,0.05)]'
                      : 'border-[var(--border-subtle)] bg-white hover:border-[var(--border-strong)]',
                  )}
                >
                  <input
                    type="radio"
                    name="incident-type"
                    value={option.value}
                    checked={incidentType === option.value}
                    onChange={() => setIncidentType(option.value)}
                    className="sr-only"
                  />
                  <span className="block text-[0.75rem] font-semibold text-[var(--charcoal)]">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[0.65rem] leading-snug text-[var(--muted)]">
                    {option.hint}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="incident-description"
              className="block text-[0.75rem] font-semibold text-[var(--charcoal)]"
            >
              Description
            </label>
            <textarea
              id="incident-description"
              rows={4}
              value={incidentDescription}
              onChange={(event) => setIncidentDescription(event.target.value)}
              placeholder="What happened, and what condition was the resource in?"
              className="mt-1.5 w-full resize-none rounded-[0.5rem] border border-[var(--border-subtle)] bg-white px-3 py-2 text-[0.8125rem] text-[var(--charcoal)] outline-none placeholder:text-[rgba(113,104,95,0.7)] focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
            />
          </div>

          {incidentError ? (
            <p className="flex items-start gap-2 rounded-[0.5rem] bg-[var(--error-soft)] px-3 py-2 text-[0.72rem] leading-relaxed text-[var(--error)]">
              <AlertTriangle
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              {incidentError}
            </p>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={handoverMode !== null}
        onClose={closeHandover}
        title={handoverMode === 'return' ? 'Return this resource' : 'Check in'}
        description={
          handoverMode === 'return'
            ? 'Record the condition on return. A condition worse than check-in can raise a system-suggested damage incident.'
            : 'Record the condition on collection. The report is kept with the booking.'
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeHandover}
              disabled={handoverPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void submitHandover()}
              disabled={handoverPending}
            >
              {handoverPending
                ? 'Recording…'
                : handoverMode === 'return'
                  ? 'Record return'
                  : 'Record check-in'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <fieldset>
            <legend className="text-[0.75rem] font-semibold text-[var(--charcoal)]">
              Condition
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {conditionLevels.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'cursor-pointer rounded-[var(--radius-sm)] border p-2.5 transition-colors',
                    reportCondition === option.value
                      ? 'border-[var(--espresso)] bg-[rgba(81,53,34,0.05)]'
                      : 'border-[var(--border-subtle)] bg-white hover:border-[var(--border-strong)]',
                  )}
                >
                  <input
                    type="radio"
                    name="report-condition"
                    value={option.value}
                    checked={reportCondition === option.value}
                    onChange={() => setReportCondition(option.value)}
                    className="sr-only"
                  />
                  <span className="block text-[0.75rem] font-semibold text-[var(--charcoal)]">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[0.65rem] leading-snug text-[var(--muted)]">
                    {option.hint}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="report-notes"
              className="block text-[0.75rem] font-semibold text-[var(--charcoal)]"
            >
              Notes{' '}
              <span className="font-normal text-[var(--muted)]">
                (optional)
              </span>
            </label>
            <textarea
              id="report-notes"
              rows={4}
              value={reportNotes}
              onChange={(event) => setReportNotes(event.target.value)}
              placeholder="Anything the next person should know about the resource."
              className="mt-1.5 w-full resize-none rounded-[0.5rem] border border-[var(--border-subtle)] bg-white px-3 py-2 text-[0.8125rem] text-[var(--charcoal)] outline-none placeholder:text-[rgba(113,104,95,0.7)] focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
            />
          </div>

          {reportError ? (
            <p className="flex items-start gap-2 rounded-[0.5rem] bg-[var(--error-soft)] px-3 py-2 text-[0.72rem] leading-relaxed text-[var(--error)]">
              <AlertTriangle
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              {reportError}
            </p>
          ) : null}
        </div>
      </Modal>
    </>
  )
}

export default BookingDetail
