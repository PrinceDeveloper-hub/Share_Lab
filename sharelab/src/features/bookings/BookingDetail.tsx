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
  open: 'bg-(--warning-tint) text-(--warning)',
  confirmed: 'bg-(--error-tint) text-(--error)',
  resolved: 'bg-(--success-tint) text-(--success)',
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
    <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-muted) p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-(--charcoal)">{title}</p>
        <span className="rounded-full bg-(--tint-2) px-2.5 py-1 text-[0.66rem] font-semibold capitalize text-(--espresso)">
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
  <li className="rounded-2xl border border-(--border-subtle) bg-(--surface-muted) p-4">
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
      <p className="mt-2 rounded-xl bg-(--tint-1) px-3 py-2 text-xs leading-relaxed text-(--muted)">
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
    cancelMutation,
    checkInMutation,
    returnMutation,
    reportIncidentMutation,
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
            <span className="inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--surface-muted) px-3 py-1.5 text-xs font-medium text-(--muted)">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              Requested by {booking.user.name}
              {booking.user.email ? ` · ${booking.user.email}` : ''}
            </span>
          ) : null}
          {booking.is_late ? (
            <span className="rounded-full bg-(--error-tint) px-3 py-1.5 text-xs font-semibold text-(--error)">
              Returned late
            </span>
          ) : null}
        </div>
      ) : null}

      {booking.is_offer && booking.confirm_by ? (
        <div className="mt-6 rounded-(--radius-lg) border border-(--success-tint) bg-(--success-tint-soft) p-5">
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
                      className="font-semibold underline decoration-(--tint-3) underline-offset-4 hover:decoration-(--espresso)"
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
              <div className="mt-5 rounded-2xl bg-(--tint-1) p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-(--muted)">
                  Decision note
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-(--charcoal)">
                  {booking.decision_reason}
                </p>
              </div>
            ) : null}

            {booking.recommendation ? (
              <div className="mt-4 rounded-2xl border border-(--warning-tint) bg-(--warning-tint-soft) p-4">
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
                    <span className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) bg-(--surface)">
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
                    className="text-(--error) hover:bg-(--error-tint-soft) hover:text-(--error)"
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
                  className="text-(--error) hover:bg-(--error-tint-soft) hover:text-(--error)"
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

          <div className="rounded-(--radius-md) border border-(--warning-tint) bg-(--warning-tint-soft) p-4">
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
              className="block w-full cursor-pointer rounded-xl border border-(--border-subtle) bg-(--surface) px-3 py-2.5 text-sm text-(--muted) file:mr-3 file:rounded-full file:border-0 file:bg-(--espresso) file:px-4 file:py-2 file:text-sm file:font-semibold file:text-(--accent-contrast)"
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
  )
}

export default BookingDetail
