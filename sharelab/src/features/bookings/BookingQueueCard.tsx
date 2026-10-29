import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  MessageSquareText,
  Sparkles,
  Timer,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  Field,
  InlineLoader,
  Modal,
  selectClass,
  textareaClass,
} from '../../components/ui/workspace'
import { getApiErrorMessage } from '../../lib/api-client'
import { decideBooking } from '../../lib/booking-service'
import type { Booking, BookingDecision } from '../../lib/booking-service'
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
    .min(5, 'Write a reason the requester can understand.')
    .max(2000),
})

type DecisionValues = z.infer<typeof decisionSchema>

const priorityLabel = (score: number | null) => {
  if (score === null) return null
  if (score >= 3) return 'High priority'
  if (score >= 1) return 'Elevated priority'
  return 'Standard priority'
}

export const BookingQueueCard = ({
  booking,
  showRequester = false,
}: {
  booking: Booking
  showRequester?: boolean
}) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const status = bookingStatusDetails[booking.status]
  const StatusIcon = status.icon
  const form = useForm<DecisionValues>({
    resolver: zodResolver(decisionSchema),
    defaultValues: { decision: 'approve', reason: '' },
  })

  const decisionMutation = useMutation({
    mutationFn: (values: DecisionValues) =>
      decideBooking(booking.id, {
        decision: values.decision,
        reason: values.reason.trim(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['booking'] })
      void queryClient.invalidateQueries({ queryKey: ['workspace'] })
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setOpen(false)
      form.reset({ decision: 'approve', reason: '' })
    },
  })

  const openDecision = (decision: BookingDecision) => {
    decisionMutation.reset()
    form.reset({ decision, reason: '' })
    setOpen(true)
  }

  const onSubmit = form.handleSubmit((values) => decisionMutation.mutate(values))

  return (
    <article className="rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-5 shadow-soft sm:p-6">
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
              <h3 className="text-lg font-semibold text-(--charcoal)">
                {booking.resource?.name ?? `Resource #${booking.resource_id}`}
              </h3>
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold',
                  status.tone,
                )}
              >
                {status.label}
                {booking.status === 'waitlisted' && booking.waitlist_position
                  ? ` · #${booking.waitlist_position}`
                  : ''}
              </span>
              {priorityLabel(booking.priority_score) ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-(--warning-tint) px-2.5 py-1 text-[0.66rem] font-semibold text-(--warning)">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {priorityLabel(booking.priority_score)}
                </span>
              ) : null}
            </div>

            {showRequester && booking.user ? (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-(--muted)">
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                {booking.user.name}
                {booking.user.email ? ` · ${booking.user.email}` : ''}
              </p>
            ) : null}

            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-(--charcoal)">
              <CalendarDays className="h-4 w-4 text-(--taupe)" aria-hidden="true" />
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

            {booking.priority_explanation ? (
              <p className="mt-2 text-xs leading-relaxed text-(--muted)">
                {booking.priority_explanation}
              </p>
            ) : null}

            {booking.recommendation ? (
              <div className="mt-3 rounded-xl border border-(--warning-tint) bg-(--warning-tint-soft) px-3 py-2">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-(--warning)">
                  {booking.recommendation.decision === 'approve'
                    ? 'Recommended: approve'
                    : booking.recommendation.decision === 'waitlist'
                      ? 'Recommended: waitlist'
                      : 'Recommended: reject'}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-(--muted)">
                  {booking.recommendation.reason}
                </p>
              </div>
            ) : null}

            {booking.decision_reason ? (
              <p className="mt-3 rounded-xl bg-(--tint-1) px-3 py-2 text-xs leading-relaxed text-(--muted)">
                <span className="font-semibold text-(--charcoal)">Decision note:</span>{' '}
                {booking.decision_reason}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
          <Button asChild variant="secondary">
            <Link to="/my-bookings/$bookingId" params={{ bookingId: String(booking.id) }}>
              Full record
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>

          {booking.permissions?.decide ? (
            <>
              <Button onClick={() => openDecision('approve')}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Approve
              </Button>
              <Button variant="secondary" onClick={() => openDecision('waitlist')}>
                <Timer className="h-4 w-4" aria-hidden="true" />
                Waitlist
              </Button>
              <Button
                variant="ghost"
                className="text-(--error) hover:bg-(--error-tint-soft) hover:text-(--error)"
                onClick={() => openDecision('reject')}
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Reject
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <Modal
        open={open}
        title="Record a decision"
        description="The requester receives this reason, and the booking timeline keeps a permanent record."
        onClose={() => setOpen(false)}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Decision" htmlFor={`decision-${booking.id}`}>
            <select
              id={`decision-${booking.id}`}
              className={selectClass}
              {...form.register('decision')}
            >
              <option value="approve">Approve</option>
              <option value="waitlist">Add to waitlist</option>
              <option value="reject">Reject</option>
            </select>
          </Field>

          <Field
            label="Reason"
            htmlFor={`reason-${booking.id}`}
            hint="Explain the decision in plain language. Avoid internal codes."
            error={form.formState.errors.reason?.message}
          >
            <textarea
              id={`reason-${booking.id}`}
              rows={4}
              className={textareaClass}
              placeholder="For example: The room is already reserved for a safety training session at this time."
              {...form.register('reason')}
            />
          </Field>

          {decisionMutation.isError ? (
            <p role="alert" className="rounded-xl bg-(--error-tint-soft) px-3 py-2 text-sm text-(--error)">
              {getApiErrorMessage(decisionMutation.error, 'The decision could not be saved.')}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={decisionMutation.isPending}>
              {decisionMutation.isPending ? (
                <InlineLoader label="Saving" />
              ) : (
                'Record decision'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </article>
  )
}

export default BookingQueueCard
