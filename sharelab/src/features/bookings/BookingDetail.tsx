<<<<<<< HEAD
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
=======
import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileWarning,
  History,
  MessageSquareText,
  RotateCcw,
  ShieldAlert,
  Timer,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  ErrorNotice,
  Field,
  InlineLoader,
  LoadingRows,
  Modal,
  PageHeader,
  SectionCard,
  inputClass,
  selectClass,
  textareaClass,
} from '../../components/ui/workspace'
import { useAuth } from '../../hooks/useAuth'
import {
  useBooking,
  useBookingTimeline,
  useBookings,
} from '../../hooks/useBookings'
import { usePageMeta } from '../../hooks/usePageMeta'
import { getApiErrorMessage } from '../../lib/api-client'
import type {
  BookingDecision,
  ConditionReport,
  ConditionReportPayload,
  Incident,
} from '../../lib/booking-service'
import {
  bookingStatusDetails,
  formatBookingWindow,
} from '../../lib/booking-display'
import { cn } from '../../lib/utils'

const decisionSchema = z.object({
  decision: z.enum(['approve', 'reject', 'waitlist']),
  reason: z
    .string()
    .trim()
    .min(5, 'Write a clear reason for the person receiving this decision.')
    .max(2000),
})

const conditionSchema = z.object({
  condition: z.enum(['excellent', 'good', 'fair', 'damaged']),
  notes: z.string().trim().max(2000).optional(),
  photo: z
    .custom<FileList>((value) => typeof FileList !== 'undefined' && value instanceof FileList)
    .optional(),
})

const incidentSchema = z.object({
  type: z.enum(['damage', 'delay', 'other']),
  description: z
    .string()
    .trim()
    .min(10, 'Describe what happened so a manager can act on it.')
    .max(4000),
})

const extendSchema = z.object({
  end_at: z.string().min(1, 'Choose the new end time.'),
})

type DecisionValues = z.infer<typeof decisionSchema>
type ConditionValues = z.infer<typeof conditionSchema>
type IncidentValues = z.infer<typeof incidentSchema>
type ExtendValues = z.infer<typeof extendSchema>

const incidentTone = {
  open: 'bg-[rgba(154,107,34,0.12)] text-(--warning)',
  confirmed: 'bg-[rgba(169,72,60,0.1)] text-(--error)',
  resolved: 'bg-[rgba(53,107,76,0.12)] text-(--success)',
} as const

const toLocalInputValue = (iso: string | null | undefined) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

const formatDateTime = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—'

const ConditionSummary = ({
  title,
  report,
}: {
  title: string
  report: ConditionReport | null | undefined
}) => {
  if (!report) return null

  return (
    <div className="rounded-2xl border border-(--border-subtle) bg-[rgba(255,252,247,0.64)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-(--charcoal)">{title}</p>
        <span className="rounded-full bg-[rgba(81,53,34,0.07)] px-2.5 py-1 text-[0.66rem] font-semibold capitalize text-(--espresso)">
          {report.condition}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-(--muted)">{formatDateTime(report.at)}</p>
      {report.notes ? (
        <p className="mt-2 text-sm leading-relaxed text-(--muted)">{report.notes}</p>
      ) : null}
    </div>
  )
}

const IncidentSummary = ({ incident }: { incident: Incident }) => (
  <li className="rounded-2xl border border-(--border-subtle) bg-[rgba(255,252,247,0.64)] p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-semibold capitalize text-(--charcoal)">
        {incident.type.replace('_', ' ')} incident
      </p>
      <span
        className={cn(
          'rounded-full px-2.5 py-1 text-[0.66rem] font-semibold capitalize',
          incidentTone[incident.status],
        )}
      >
        {incident.status}
      </span>
    </div>
    <p className="mt-2 text-sm leading-relaxed text-(--muted)">{incident.description}</p>
    {incident.suggested_by_system ? (
      <p className="mt-2 text-[0.7rem] font-medium text-(--warning)">
        Suggested automatically from the condition or return time.
      </p>
    ) : null}
    {incident.resolution_note ? (
      <p className="mt-2 rounded-xl bg-[rgba(81,53,34,0.045)] px-3 py-2 text-xs leading-relaxed text-(--muted)">
        <span className="font-semibold text-(--charcoal)">Resolution:</span>{' '}
        {incident.resolution_note}
      </p>
    ) : null}
  </li>
)

export const BookingDetail = ({ bookingId }: { bookingId: string }) => {
  const numericId = Number(bookingId)
  const { user } = useAuth()
  const bookingQuery = useBooking(numericId)
  const timelineQuery = useBookingTimeline(numericId)
  const {
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
    cancelMutation,
    checkInMutation,
    returnMutation,
    reportIncidentMutation,
<<<<<<< HEAD
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
=======
    decideMutation,
    confirmOfferMutation,
    extendMutation,
  } = useBookings()

  const [decisionOpen, setDecisionOpen] = useState(false)
  const [conditionMode, setConditionMode] = useState<'checkin' | 'return' | null>(null)
  const [incidentOpen, setIncidentOpen] = useState(false)
  const [extendOpen, setExtendOpen] = useState(false)

  const booking = bookingQuery.data?.data
  const status = booking ? bookingStatusDetails[booking.status] : null
  const StatusIcon = status?.icon
  const isOwnerOfResource = booking?.resource?.owner?.id === user?.id
  const isManager = user?.role === 'manager'
  const canManage = isManager || isOwnerOfResource

  usePageMeta({
    title: booking ? `${booking.resource?.name ?? 'Booking'} — ShareLab` : 'Booking — ShareLab',
    description:
      'Review the full booking record, decisions, conditions, incidents, and timeline.',
  })

  const decisionForm = useForm<DecisionValues>({
    resolver: zodResolver(decisionSchema),
    defaultValues: { decision: 'approve', reason: '' },
  })

  const checkInForm = useForm<ConditionValues>({
    resolver: zodResolver(conditionSchema),
    defaultValues: { condition: 'good', notes: '', photo: undefined },
  })

  const returnForm = useForm<ConditionValues>({
    resolver: zodResolver(conditionSchema),
    defaultValues: { condition: 'good', notes: '', photo: undefined },
  })

  const incidentForm = useForm<IncidentValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: { type: 'damage', description: '' },
  })

  const extendForm = useForm<ExtendValues>({
    resolver: zodResolver(extendSchema),
    defaultValues: { end_at: '' },
  })

  const actionError = useMemo(
    () =>
      [
        decideMutation,
        checkInMutation,
        returnMutation,
        reportIncidentMutation,
        extendMutation,
        cancelMutation,
        confirmOfferMutation,
      ].find((mutation) => mutation.isError)?.error,
    [
      cancelMutation,
      checkInMutation,
      confirmOfferMutation,
      decideMutation,
      extendMutation,
      reportIncidentMutation,
      returnMutation,
    ],
  )

  if (bookingQuery.isLoading) {
    return (
      <div>
        <PageHeader
          eyebrow="Booking record"
          title="Loading the booking record"
          description="Fetching decisions, handover reports, and the timeline."
        />
        <div className="mt-8">
          <LoadingRows rows={4} label="Loading booking" />
        </div>
      </div>
    )
  }

  if (bookingQuery.isError || !booking) {
    return (
      <div>
        <PageHeader
          eyebrow="Booking record"
          title="This booking could not be opened"
          description="It may not exist, or it may belong to a different account."
        />
        <div className="mt-6">
          <ErrorNotice
            title="Booking unavailable"
            message={getApiErrorMessage(
              bookingQuery.error,
              'Refresh the page or return to your requests.',
            )}
            onRetry={() => void bookingQuery.refetch()}
          />
        </div>
        <Button asChild variant="secondary" className="mt-5">
          <Link to="/my-bookings">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to your requests
          </Link>
        </Button>
      </div>
    )
  }

  const openDecision = (decision: BookingDecision = 'approve') => {
    decideMutation.reset()
    decisionForm.reset({ decision, reason: '' })
    setDecisionOpen(true)
  }

  const openCondition = (mode: 'checkin' | 'return') => {
    checkInMutation.reset()
    returnMutation.reset()
    const form = mode === 'checkin' ? checkInForm : returnForm
    form.reset({ condition: 'good', notes: '', photo: undefined })
    setConditionMode(mode)
  }

  const buildConditionPayload = (values: ConditionValues): ConditionReportPayload => ({
    condition: values.condition,
    notes: values.notes?.trim() || undefined,
    photo: values.photo?.[0] ?? null,
  })

  const onDecision = decisionForm.handleSubmit((values) => {
    decideMutation.mutate(
      {
        bookingId: booking.id,
        payload: { decision: values.decision, reason: values.reason.trim() },
      },
      {
        onSuccess: () => {
          setDecisionOpen(false)
          decisionForm.reset({ decision: 'approve', reason: '' })
        },
      },
    )
  })

  const onCondition = (mode: 'checkin' | 'return') =>
    (mode === 'checkin' ? checkInForm : returnForm).handleSubmit((values) => {
      const mutation = mode === 'checkin' ? checkInMutation : returnMutation
      mutation.mutate(
        { bookingId: booking.id, payload: buildConditionPayload(values) },
        {
          onSuccess: () => {
            setConditionMode(null)
          },
        },
      )
    })

  const onIncident = incidentForm.handleSubmit((values) => {
    reportIncidentMutation.mutate(
      {
        bookingId: booking.id,
        type: values.type,
        description: values.description.trim(),
      },
      {
        onSuccess: () => {
          setIncidentOpen(false)
          incidentForm.reset({ type: 'damage', description: '' })
        },
      },
    )
  })

  const onExtend = extendForm.handleSubmit((values) => {
    const endAt = new Date(values.end_at)
    if (Number.isNaN(endAt.getTime())) {
      extendForm.setError('end_at', { message: 'Choose a valid date and time.' })
      return
    }

    extendMutation.mutate(
      { bookingId: booking.id, endAt: endAt.toISOString() },
      {
        onSuccess: () => {
          setExtendOpen(false)
          extendForm.reset({ end_at: '' })
        },
      },
    )
  })

  const activeConditionForm = conditionMode === 'checkin' ? checkInForm : returnForm
  const activeConditionMutation = conditionMode === 'checkin' ? checkInMutation : returnMutation
  const incidents = booking.incidents ?? []
  const timeline = timelineQuery.data?.data ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Booking record"
        title={booking.resource?.name ?? `Booking #${booking.id}`}
        description={formatBookingWindow(booking)}
        actions={
          <Button asChild variant="secondary">
            <Link to={canManage ? (user?.role === 'owner' ? '/owner' : '/manager') : '/my-bookings'}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {canManage ? 'Back to workspace' : 'All requests'}
            </Link>
          </Button>
        }
      />

      {status && StatusIcon ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold',
              status.tone,
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {status.label}
            {booking.status === 'waitlisted' && booking.waitlist_position
              ? ` · position ${booking.waitlist_position}`
              : ''}
          </span>
          {canManage && booking.user ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-[rgba(255,252,247,0.7)] px-3 py-1.5 text-xs font-medium text-(--muted)">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              Requested by {booking.user.name}
              {booking.user.email ? ` · ${booking.user.email}` : ''}
            </span>
          ) : null}
          {booking.is_late ? (
            <span className="rounded-full bg-[rgba(169,72,60,0.1)] px-3 py-1.5 text-xs font-semibold text-(--error)">
              Returned late
            </span>
          ) : null}
        </div>
      ) : null}

      {booking.is_offer && booking.confirm_by ? (
        <div className="mt-6 rounded-(--radius-lg) border border-[rgba(53,107,76,0.25)] bg-[rgba(53,107,76,0.07)] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-(--success)" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-(--charcoal)">
                  A spot opened in this window
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-(--muted)">
                  Confirm by {formatDateTime(booking.confirm_by)} to keep it. If the offer expires,
                  the next person on the waitlist is invited.
                </p>
              </div>
            </div>
            <Button
              onClick={() => confirmOfferMutation.mutate(booking.id)}
              disabled={confirmOfferMutation.isPending}
              className="shrink-0"
            >
              {confirmOfferMutation.isPending ? (
                <InlineLoader label="Confirming" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Confirm booking
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}

      {actionError ? (
        <div className="mt-6">
          <ErrorNotice
            title="That action could not be completed"
            message={getApiErrorMessage(actionError, 'Refresh the page and try again.')}
          />
        </div>
      ) : null}

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)]">
        <div className="space-y-5">
          <SectionCard>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-(--muted)">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Booked window
                </p>
                <p className="mt-2 text-sm font-semibold text-(--charcoal)">
                  {formatBookingWindow(booking)}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-(--muted)">
                  <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                  Purpose
                </p>
                <p className="mt-2 text-sm leading-relaxed text-(--charcoal)">
                  {booking.purpose || 'No purpose provided.'}
                </p>
              </div>
              {booking.resource ? (
                <div className="sm:col-span-2">
                  <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-(--muted)">
                    <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Resource
                  </p>
                  <p className="mt-2 text-sm text-(--charcoal)">
                    <Link
                      to="/resources/$resourceId"
                      params={{ resourceId: String(booking.resource.id) }}
                      className="font-semibold underline decoration-[rgba(81,53,34,0.25)] underline-offset-4 hover:decoration-(--espresso)"
                    >
                      {booking.resource.name}
                    </Link>
                    {' · '}
                    {booking.resource.category} · {booking.resource.location}
                  </p>
                </div>
              ) : null}
            </div>

            {booking.decision_reason ? (
              <div className="mt-5 rounded-2xl bg-[rgba(81,53,34,0.045)] p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-(--muted)">
                  Decision note
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-(--charcoal)">
                  {booking.decision_reason}
                </p>
              </div>
            ) : null}

            {booking.recommendation ? (
              <div className="mt-4 rounded-2xl border border-[rgba(154,107,34,0.18)] bg-[rgba(154,107,34,0.05)] p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-(--warning)">
                  Priority recommendation
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-(--charcoal)">
                  {booking.recommendation.reason}
                </p>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[1.5rem] font-semibold text-(--charcoal)">
                  Handover and condition
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-(--muted)">
                  Check-in and return reports are compared automatically. Damage or lateness becomes
                  a suggested incident for a manager to confirm.
                </p>
              </div>
              <RotateCcw className="h-5 w-5 shrink-0 text-(--taupe)" aria-hidden="true" />
            </div>

            {booking.reports?.check_in || booking.reports?.return ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ConditionSummary title="Check-in condition" report={booking.reports.check_in} />
                <ConditionSummary title="Return condition" report={booking.reports.return} />
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-(--border-subtle) p-4 text-sm text-(--muted)">
                No condition reports have been recorded yet.
              </p>
            )}

            {booking.permissions?.check_in || booking.permissions?.return ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {booking.permissions.check_in ? (
                  <Button onClick={() => openCondition('checkin')}>
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                    Check in
                  </Button>
                ) : null}
                {booking.permissions.return ? (
                  <Button onClick={() => openCondition('return')}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Record return
                  </Button>
                ) : null}
              </div>
            ) : null}
          </SectionCard>

          <SectionCard>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[1.5rem] font-semibold text-(--charcoal)">
                  Incidents
                </h2>
                <p className="mt-1 text-sm text-(--muted)">
                  Damage, delay, and other problems linked to this booking.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIncidentOpen(true)}>
                <FileWarning className="h-3.5 w-3.5" aria-hidden="true" />
                Report incident
              </Button>
            </div>

            {incidents.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-(--border-subtle) p-4 text-sm text-(--muted)">
                No incidents have been reported for this booking.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {incidents.map((incident) => (
                  <IncidentSummary key={incident.id} incident={incident} />
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-(--taupe)" aria-hidden="true" />
              <h2 className="font-display text-[1.5rem] font-semibold text-(--charcoal)">
                Timeline
              </h2>
            </div>
            <p className="mt-1 text-sm text-(--muted)">
              Every request, decision, handover, and incident in order.
            </p>

            {timelineQuery.isLoading ? (
              <div className="mt-5">
                <LoadingRows rows={3} label="Loading timeline" />
              </div>
            ) : timelineQuery.isError ? (
              <div className="mt-5">
                <ErrorNotice
                  title="Timeline unavailable"
                  message="The booking record is available, but its timeline could not be loaded."
                  onRetry={() => void timelineQuery.refetch()}
                />
              </div>
            ) : timeline.length === 0 ? (
              <p className="mt-4 text-sm text-(--muted)">No timeline entries yet.</p>
            ) : (
              <ol className="mt-5 space-y-0">
                {timeline.map((entry, index) => (
                  <li key={entry.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {index < timeline.length - 1 ? (
                      <span
                        className="absolute left-[0.68rem] top-6 h-full w-px bg-(--border-subtle)"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) bg-(--cream)">
                      <span className="h-1.5 w-1.5 rounded-full bg-(--espresso)" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <p className="text-sm font-semibold text-(--charcoal)">{entry.label}</p>
                        <p className="text-[0.7rem] text-(--muted)">{formatDateTime(entry.at)}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-(--muted)">
                        {entry.actor?.name ? `By ${entry.actor.name}` : 'System'}
                      </p>
                      {entry.reason ? (
                        <p className="mt-1.5 text-sm leading-relaxed text-(--muted)">
                          {entry.reason}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <SectionCard>
            <h2 className="text-sm font-semibold text-(--charcoal)">Available actions</h2>
            <div className="mt-3 flex flex-col gap-2">
              {booking.permissions?.decide ? (
                <>
                  <Button onClick={() => openDecision('approve')}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Approve request
                  </Button>
                  <Button variant="secondary" onClick={() => openDecision('waitlist')}>
                    <Timer className="h-4 w-4" aria-hidden="true" />
                    Add to waitlist
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-(--error) hover:bg-[rgba(169,72,60,0.07)] hover:text-(--error)"
                    onClick={() => openDecision('reject')}
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Reject with reason
                  </Button>
                </>
              ) : null}

              {booking.permissions?.extend ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    extendMutation.reset()
                    extendForm.reset({ end_at: toLocalInputValue(booking.end_at) })
                    setExtendOpen(true)
                  }}
                >
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  Extend booking
                </Button>
              ) : null}

              {booking.permissions?.cancel ? (
                <Button
                  variant="ghost"
                  className="text-(--error) hover:bg-[rgba(169,72,60,0.07)] hover:text-(--error)"
                  disabled={cancelMutation.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Cancel this booking? The time will be released and waitlisted people may be offered the slot.',
                      )
                    ) {
                      cancelMutation.mutate({ bookingId: booking.id })
                    }
                  }}
                >
                  {cancelMutation.isPending ? (
                    <InlineLoader label="Cancelling" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      Cancel booking
                    </>
                  )}
                </Button>
              ) : null}

              {!booking.permissions?.decide &&
              !booking.permissions?.cancel &&
              !booking.permissions?.check_in &&
              !booking.permissions?.return &&
              !booking.permissions?.extend ? (
                <p className="text-sm leading-relaxed text-(--muted)">
                  No actions are available in this state.
                </p>
              ) : null}
            </div>
          </SectionCard>

          <div className="rounded-(--radius-md) border border-[rgba(154,107,34,0.18)] bg-[rgba(154,107,34,0.05)] p-4">
            <div className="flex gap-2.5">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-(--warning)" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-(--warning)">Permission note</p>
                <p className="mt-1 text-xs leading-relaxed text-(--muted)">
                  Access is enforced by the API. Managers only see resources assigned to them, and
                  owners only see resources they own.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Modal
        open={decisionOpen}
        title="Record a decision"
        description="The reason is sent to the requester, stored in the booking timeline, and included in the audit trail."
        onClose={() => setDecisionOpen(false)}
      >
        <form onSubmit={onDecision} className="space-y-4">
          <Field
            label="Decision"
            htmlFor="decision-type"
            error={decisionForm.formState.errors.decision?.message}
          >
            <select id="decision-type" className={selectClass} {...decisionForm.register('decision')}>
              <option value="approve">Approve</option>
              <option value="waitlist">Add to waitlist</option>
              <option value="reject">Reject</option>
            </select>
          </Field>

          <Field
            label="Plain-language reason"
            htmlFor="decision-reason"
            hint="Explain the decision without internal codes or jargon."
            error={decisionForm.formState.errors.reason?.message}
          >
            <textarea
              id="decision-reason"
              rows={4}
              className={textareaClass}
              placeholder="For example: Another group already has the laser cutter reserved for this slot."
              {...decisionForm.register('reason')}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDecisionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={decideMutation.isPending}>
              {decideMutation.isPending ? <InlineLoader label="Saving" /> : 'Record decision'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={conditionMode !== null}
        title={conditionMode === 'return' ? 'Record the return' : 'Check in to the resource'}
        description="Take a moment to record the condition honestly. This protects you and the next person using the resource."
        onClose={() => setConditionMode(null)}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (conditionMode) void onCondition(conditionMode)(event)
          }}
          className="space-y-4"
        >
          <Field
            label="Condition"
            htmlFor="condition-state"
            error={activeConditionForm.formState.errors.condition?.message}
          >
            <select
              id="condition-state"
              className={selectClass}
              {...activeConditionForm.register('condition')}
            >
              <option value="excellent">Excellent — as new</option>
              <option value="good">Good — normal wear</option>
              <option value="fair">Fair — noticeable wear</option>
              <option value="damaged">Damaged — needs attention</option>
            </select>
          </Field>

          <Field
            label="Notes"
            htmlFor="condition-notes"
            hint="Optional, but useful when the condition changed or an accessory is missing."
            error={activeConditionForm.formState.errors.notes?.message}
          >
            <textarea
              id="condition-notes"
              rows={3}
              className={textareaClass}
              placeholder="Anything the next user or manager should know."
              {...activeConditionForm.register('notes')}
            />
          </Field>

          <Field
            label="Photo"
            htmlFor="condition-photo"
            hint="Optional JPG, PNG, or WEBP up to 5 MB. Stored privately for the audit record."
            error={activeConditionForm.formState.errors.photo?.message}
          >
            <input
              id="condition-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full cursor-pointer rounded-xl border border-(--border-subtle) bg-(--surface) px-3 py-2.5 text-sm text-(--muted) file:mr-3 file:rounded-full file:border-0 file:bg-(--espresso) file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              {...activeConditionForm.register('photo')}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setConditionMode(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={activeConditionMutation.isPending}>
              {activeConditionMutation.isPending ? (
                <InlineLoader label="Saving" />
              ) : conditionMode === 'return' ? (
                'Record return'
              ) : (
                'Check in'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={incidentOpen}
        title="Report an incident"
        description="Managers are notified. Reports cannot be deleted, so describe what happened clearly."
        onClose={() => setIncidentOpen(false)}
      >
        <form onSubmit={onIncident} className="space-y-4">
          <Field
            label="Type"
            htmlFor="incident-type"
            error={incidentForm.formState.errors.type?.message}
          >
            <select id="incident-type" className={selectClass} {...incidentForm.register('type')}>
              <option value="damage">Damage</option>
              <option value="delay">Delay or late return</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <Field
            label="What happened?"
            htmlFor="incident-description"
            error={incidentForm.formState.errors.description?.message}
          >
            <textarea
              id="incident-description"
              rows={5}
              className={textareaClass}
              placeholder="Describe the issue, when it happened, and any immediate action you took."
              {...incidentForm.register('description')}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIncidentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={reportIncidentMutation.isPending}>
              {reportIncidentMutation.isPending ? (
                <InlineLoader label="Reporting" />
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Submit incident
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={extendOpen}
        title="Extend this booking"
        description="The extension is checked against resource limits, your weekly cap, and other reservations."
        onClose={() => setExtendOpen(false)}
      >
        <form onSubmit={onExtend} className="space-y-4">
          <Field
            label="New end time"
            htmlFor="extend-end"
            hint={`Current end: ${formatDateTime(booking.end_at)}`}
            error={extendForm.formState.errors.end_at?.message}
          >
            <input
              id="extend-end"
              type="datetime-local"
              className={inputClass}
              {...extendForm.register('end_at')}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setExtendOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={extendMutation.isPending}>
              {extendMutation.isPending ? (
                <InlineLoader label="Extending" />
              ) : (
                <>
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  Extend booking
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
  )
}

export default BookingDetail
