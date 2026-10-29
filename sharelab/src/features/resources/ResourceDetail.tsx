import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Info,
  MapPin,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useResource } from '../../hooks/useResources'
import { api } from '../../lib/api-client'
import type { Booking, CreateBookingParams } from '../../lib/booking-service'
import { getResourceImage } from '../../lib/resources'
import { Skeleton } from '../../components/ui/Skeleton'

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    return (
      data?.message ||
      error.message ||
      'The booking request could not be submitted.'
    )
  }

  if (error instanceof Error) return error.message

  return 'The booking request could not be submitted.'
}

const formatDateTimeInput = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const formatDuration = (hours: number) => {
  if (!Number.isFinite(hours) || hours <= 0) return null
  const whole = Math.floor(hours)
  const minutes = Math.round((hours - whole) * 60)
  if (minutes === 0) return `${whole}h`
  return `${whole}h ${minutes}m`
}

export interface ResourceDetailProps {
  resourceId: string
}

export const ResourceDetail = ({ resourceId }: ResourceDetailProps) => {
  const numericId = Number(resourceId)
  const resourceQuery = useResource(numericId)
  const resource = resourceQuery.data?.data
  const eligibility = resourceQuery.data?.eligibility
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [purpose, setPurpose] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [imageFailed, setImageFailed] = useState(false)

  usePageMeta({
    title: resource ? `${resource.name} — ShareLab` : 'Resource — ShareLab',
    description: resource?.description ?? undefined,
  })

  const bookingMutation = useMutation({
    mutationFn: async (payload: CreateBookingParams) =>
      await api.post<CreateBookingParams, Booking>('/bookings', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  const submitBooking = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!resource) return

    if (!startAt || !endAt) {
      setFormError('Choose both a start and end time.')
      return
    }

    const startIso = formatDateTimeInput(startAt)
    const endIso = formatDateTimeInput(endAt)

    if (!startIso || !endIso) {
      setFormError('Choose valid start and end times.')
      return
    }

    const durationHours =
      (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000

    if (durationHours <= 0) {
      setFormError('The end time must be after the start time.')
      return
    }

    if (durationHours > resource.max_hours_per_booking) {
      setFormError(
        `This resource allows up to ${resource.max_hours_per_booking} hours per booking.`,
      )
      return
    }

    bookingMutation.mutate({
      resource_id: resource.id,
      start_at: startIso,
      end_at: endIso,
      purpose: purpose.trim() || undefined,
    })
  }

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return (
      <SiteLayout>
        <div className="page-shell py-16">
          <div className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-[rgba(164,69,59,0.24)] bg-[var(--error-soft)] p-8 text-center">
            <AlertTriangle
              className="mx-auto h-7 w-7 text-[var(--error)]"
              aria-hidden="true"
            />
            <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--charcoal)]">
              That resource link is not valid
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Return to the catalogue and choose a resource from the list.
            </p>
            <Button asChild className="mt-6">
              <Link to="/resources">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to resources
              </Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    )
  }

  if (resourceQuery.isLoading) {
    return (
      <SiteLayout>
        <div className="page-shell py-10">
          <Skeleton className="h-3 w-48" />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Skeleton className="aspect-[16/10] w-full rounded-[var(--radius-lg)]" />
              <Skeleton className="mt-6 h-8 w-2/3" />
              <Skeleton className="mt-3 h-4 w-1/3" />
              <Skeleton className="mt-6 h-24 w-full rounded-[var(--radius-md)]" />
            </div>
            <Skeleton className="h-96 w-full rounded-[var(--radius-lg)]" />
          </div>
        </div>
      </SiteLayout>
    )
  }

  if (resourceQuery.isError || !resource) {
    return (
      <SiteLayout>
        <div className="page-shell py-16">
          <div
            role="alert"
            className="mx-auto max-w-xl rounded-[var(--radius-lg)] border border-[rgba(164,69,59,0.24)] bg-[var(--error-soft)] p-8"
          >
            <AlertTriangle
              className="h-7 w-7 text-[var(--error)]"
              aria-hidden="true"
            />
            <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--charcoal)]">
              This resource could not be loaded
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              The catalogue may be temporarily unavailable, or this listing may
              no longer exist. Nothing has been hidden — try again or return to
              the catalogue.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => void resourceQuery.refetch()}>
                Try again
              </Button>
              <Button asChild variant="secondary">
                <Link to="/resources">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to resources
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </SiteLayout>
    )
  }

  const isActive = resource.status === 'active'
  const bookingResult = bookingMutation.data

  const durationHours =
    startAt && endAt
      ? (new Date(endAt).getTime() - new Date(startAt).getTime()) / 3_600_000
      : null

  return (
    <SiteLayout>
      <div className="page-shell py-7 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.72rem] text-[var(--muted)]">
            <li>
              <Link to="/" className="hover:text-[var(--espresso)]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/resources" className="hover:text-[var(--espresso)]">
                Resources
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[var(--charcoal)]">
              {resource.name}
            </li>
          </ol>
        </nav>

        <Link
          to="/resources"
          className="mb-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--bronze-deep)] hover:text-[var(--espresso)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          All resources
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--soft-beige)]">
              {imageFailed ? (
                <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(145deg,var(--soft-beige),var(--cream))]">
                  <FlaskConical
                    className="h-11 w-11 text-[rgba(81,53,34,0.26)]"
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <img
                  src={getResourceImage(resource)}
                  alt={`${resource.name} at ${resource.location}`}
                  className="aspect-[16/10] w-full object-cover"
                  loading="eager"
                  decoding="async"
                  onError={() => setImageFailed(true)}
                />
              )}
              <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3.5">
                <span className="rounded-[0.375rem] bg-[rgba(43,29,20,0.72)] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--cream)] backdrop-blur-sm">
                  {resource.category}
                </span>
                <Badge
                  tone={isActive ? 'success' : 'neutral'}
                  dot
                  className="bg-[rgba(255,252,247,0.94)]"
                >
                  {isActive ? 'Published' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="mt-6">
              <span className="eyebrow">Resource</span>
              <h1 className="mt-2.5 font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.06] tracking-[-0.034em] text-[var(--charcoal)]">
                {resource.name}
              </h1>
              <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin
                    className="h-3.5 w-3.5 text-[var(--bronze-deep)]"
                    aria-hidden="true"
                  />
                  {resource.location}
                </span>
                {resource.owner?.name ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="text-[var(--border-strong)]"
                    >
                      ·
                    </span>
                    <span>Managed by {resource.owner.name}</span>
                  </>
                ) : null}
              </p>
            </div>

            <dl className="mt-6 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-3">
              {[
                {
                  label: 'Per booking',
                  value: `${resource.max_hours_per_booking} hours max`,
                },
                {
                  label: 'Weekly cap',
                  value: `${resource.weekly_cap_hours} hours`,
                },
                {
                  label: 'Listing',
                  value: isActive ? 'Published' : 'Inactive',
                },
              ].map((item) => (
                <div key={item.label} className="bg-[var(--cream)] px-4 py-3">
                  <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-[0.875rem] font-semibold text-[var(--charcoal)]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <section aria-labelledby="about-resource" className="mt-8">
              <h2
                id="about-resource"
                className="font-display text-[1.0625rem] font-semibold text-[var(--charcoal)]"
              >
                About this resource
              </h2>
              <p className="mt-2 text-[0.875rem] leading-[1.75] text-[var(--muted)] sm:text-[0.9375rem]">
                {resource.description ||
                  'No description has been added to this listing yet.'}
              </p>
            </section>

            <section
              aria-labelledby="resource-requirements"
              className="mt-6 rounded-[var(--radius-lg)] border border-[rgba(156,107,36,0.22)] bg-[rgba(248,240,225,0.55)] p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.45rem] bg-[rgba(156,107,36,0.12)]">
                  <ShieldCheck
                    className="h-4 w-4 text-[var(--warning)]"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <h2
                    id="resource-requirements"
                    className="text-[0.9375rem] font-semibold text-[var(--charcoal)]"
                  >
                    Requirements and safety
                  </h2>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                    {resource.rules ||
                      'No additional rules are listed for this resource. Standard eligibility, booking limits, and usage policies still apply.'}
                  </p>
                  <p className="mt-2 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                    Requirements are checked by the server when a request is
                    submitted; they are not a suggestion. Follow the owner’s
                    safety instructions while using the resource.
                  </p>
                </div>
              </div>
            </section>

            {resource.owner?.name ? (
              <section
                aria-labelledby="resource-owner"
                className="mt-6 flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--cream)] px-4 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--soft-beige)]">
                  <UserRound
                    className="h-4 w-4 text-[var(--espresso)]"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <h2
                    id="resource-owner"
                    className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
                  >
                    Resource owner
                  </h2>
                  <p className="text-[0.8125rem] font-medium text-[var(--charcoal)]">
                    {resource.owner.name}
                  </p>
                </div>
              </section>
            ) : null}
          </div>

          <aside
            aria-label="Request this resource"
            className="lg:sticky lg:top-24"
          >
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] shadow-[var(--shadow-sm)]">
              <div className="border-b border-[var(--border-subtle)] px-5 py-4">
                <h2 className="flex items-center gap-2 font-display text-[1.0625rem] font-semibold text-[var(--charcoal)]">
                  <CalendarPlus
                    className="h-4 w-4 text-[var(--bronze-deep)]"
                    aria-hidden="true"
                  />
                  Request this resource
                </h2>
                <p className="mt-1 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                  Requests are reviewed by a manager. Submitting one does not
                  guarantee approval.
                </p>
              </div>

              <div className="p-5">
                {authLoading ? (
                  <div
                    className="space-y-3"
                    aria-label="Checking sign-in status"
                  >
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ) : !user ? (
                  <div>
                    <p className="text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                      Sign in to check your eligibility and submit a booking
                      request. You can keep browsing the catalogue without an
                      account.
                    </p>
                    <Button asChild size="lg" className="mt-4 w-full">
                      <Link
                        to="/login"
                        search={{ redirect: `/resources/${resource.id}` }}
                      >
                        Sign in to request
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                ) : bookingMutation.isSuccess && bookingResult ? (
                  <div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--success-soft)]">
                      <CheckCircle2
                        className="h-5 w-5 text-[var(--success)]"
                        aria-hidden="true"
                      />
                    </span>
                    <h3 className="mt-3 font-display text-[1.0625rem] font-semibold text-[var(--charcoal)]">
                      Request submitted
                    </h3>
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                      {bookingResult.message ||
                        'Your booking request has been recorded.'}
                    </p>
                    <div className="mt-3">
                      <StatusBadge status={bookingResult.data.status} />
                    </div>
                    <p className="mt-2.5 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                      {bookingResult.data.status === 'waitlisted'
                        ? 'The slot is currently held. A waitlist position is assigned by the ranking rules; approval is not automatic.'
                        : 'A manager will review the request. Follow the outcome from your bookings.'}
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      <Button asChild variant="secondary" className="w-full">
                        <Link to="/my-bookings">View my bookings</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          bookingMutation.reset()
                          setStartAt('')
                          setEndAt('')
                          setPurpose('')
                        }}
                      >
                        Request another time
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {eligibility ? (
                      <div
                        className={`mb-4 rounded-[var(--radius-md)] border p-3.5 ${
                          eligibility.qualifies
                            ? 'border-[rgba(63,107,79,0.2)] bg-[var(--success-soft)]'
                            : 'border-[rgba(156,107,36,0.22)] bg-[var(--warning-soft)]'
                        }`}
                      >
                        <p
                          className={`text-[0.72rem] font-semibold ${
                            eligibility.qualifies
                              ? 'text-[var(--success)]'
                              : 'text-[var(--warning)]'
                          }`}
                        >
                          {eligibility.qualifies
                            ? 'Your account meets the listed requirements.'
                            : 'Some requirements may still be missing.'}
                        </p>
                        <p className="mt-1 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                          {eligibility.message}
                        </p>
                        {eligibility.checklist.length > 0 ? (
                          <ul className="mt-2 space-y-1">
                            {eligibility.checklist.map((item) => (
                              <li
                                key={item.name}
                                className="flex items-center justify-between gap-2 text-[0.7rem] text-[var(--muted)]"
                              >
                                <span>{item.name}</span>
                                <span className="font-mono text-[0.65rem] uppercase">
                                  {item.status}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[rgba(239,230,217,0.4)] px-3.5 py-3 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                        <Info
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--bronze-deep)]"
                          aria-hidden="true"
                        />
                        Eligibility and required credentials are verified again
                        when you submit this request.
                      </div>
                    )}

                    <form onSubmit={submitBooking} className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <div>
                          <label
                            htmlFor="booking-start"
                            className="block text-[0.75rem] font-semibold text-[var(--charcoal)]"
                          >
                            Start
                          </label>
                          <input
                            id="booking-start"
                            type="datetime-local"
                            value={startAt}
                            onChange={(event) => setStartAt(event.target.value)}
                            required
                            className="mt-1.5 h-10 w-full rounded-[0.5rem] border border-[var(--border-subtle)] bg-white px-3 text-[0.8125rem] text-[var(--charcoal)] outline-none focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="booking-end"
                            className="block text-[0.75rem] font-semibold text-[var(--charcoal)]"
                          >
                            End
                          </label>
                          <input
                            id="booking-end"
                            type="datetime-local"
                            value={endAt}
                            onChange={(event) => setEndAt(event.target.value)}
                            required
                            className="mt-1.5 h-10 w-full rounded-[0.5rem] border border-[var(--border-subtle)] bg-white px-3 text-[0.8125rem] text-[var(--charcoal)] outline-none focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
                          />
                        </div>
                      </div>

                      <p className="flex items-center gap-1.5 text-[0.7rem] text-[var(--muted)]">
                        <Clock3
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {durationHours && durationHours > 0
                          ? `${formatDuration(durationHours)} requested · `
                          : ''}
                        Up to {resource.max_hours_per_booking}h per booking ·{' '}
                        {resource.weekly_cap_hours}h weekly cap
                      </p>

                      <div>
                        <label
                          htmlFor="booking-purpose"
                          className="flex items-baseline justify-between text-[0.75rem] font-semibold text-[var(--charcoal)]"
                        >
                          Purpose
                          <span className="text-[0.68rem] font-normal text-[var(--muted)]">
                            Optional
                          </span>
                        </label>
                        <textarea
                          id="booking-purpose"
                          rows={3}
                          value={purpose}
                          onChange={(event) => setPurpose(event.target.value)}
                          placeholder="What will you use the resource for?"
                          className="mt-1.5 w-full resize-none rounded-[0.5rem] border border-[var(--border-subtle)] bg-white px-3 py-2 text-[0.8125rem] text-[var(--charcoal)] outline-none placeholder:text-[rgba(113,104,95,0.7)] focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
                        />
                      </div>

                      {formError ? (
                        <p
                          role="alert"
                          className="flex items-start gap-2 rounded-[0.5rem] bg-[var(--error-soft)] px-3 py-2 text-[0.72rem] leading-relaxed text-[var(--error)]"
                        >
                          <XCircle
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          {formError}
                        </p>
                      ) : null}

                      {bookingMutation.isError ? (
                        <p
                          role="alert"
                          className="flex items-start gap-2 rounded-[0.5rem] bg-[var(--error-soft)] px-3 py-2 text-[0.72rem] leading-relaxed text-[var(--error)]"
                        >
                          <AlertTriangle
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          {getErrorMessage(bookingMutation.error)}
                        </p>
                      ) : null}

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={!isActive || bookingMutation.isPending}
                      >
                        {bookingMutation.isPending
                          ? 'Submitting request…'
                          : isActive
                            ? 'Submit booking request'
                            : 'Listing is inactive'}
                      </Button>

                      <p className="text-center text-[0.68rem] leading-relaxed text-[var(--muted)]">
                        The server checks eligibility, duration, weekly caps,
                        and time conflicts before recording the request.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[rgba(239,230,217,0.35)] px-4 py-3 text-[0.72rem] leading-relaxed text-[var(--muted)]">
              <Link
                to="/how-it-works"
                className="font-semibold text-[var(--espresso)] hover:underline"
              >
                Read the full booking process
              </Link>{' '}
              — including check-in, approval, and return expectations.
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  )
}

export default ResourceDetail
