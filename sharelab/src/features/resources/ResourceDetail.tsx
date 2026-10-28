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
  MapPin,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../hooks/useAuth'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useResource } from '../../hooks/useResources'
import { api } from '../../lib/api-client'
import type { Booking, CreateBookingParams } from '../../lib/booking-service'
import { getResourceImage } from '../../lib/resources'

const statusStyles: Record<Booking['status'], string> = {
  pending: 'bg-[rgba(183,121,50,0.14)] text-[var(--warning)]',
  waitlisted: 'bg-[rgba(183,121,50,0.14)] text-[var(--warning)]',
  approved: 'bg-[rgba(56,118,83,0.14)] text-[var(--success)]',
  rejected: 'bg-[rgba(180,77,66,0.12)] text-[var(--error)]',
  checked_in: 'bg-[rgba(75,47,31,0.12)] text-[var(--espresso)]',
  returned: 'bg-[rgba(130,119,109,0.12)] text-[var(--muted)]',
  cancelled: 'bg-[rgba(130,119,109,0.1)] text-[var(--muted)]',
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    return data?.message || error.message || 'The booking request could not be submitted.'
  }

  if (error instanceof Error) return error.message

  return 'The booking request could not be submitted.'
}

const formatDateTimeInput = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
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

    const durationHours = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000

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
          <div className="mx-auto max-w-lg rounded-[1.5rem] border border-[rgba(180,77,66,0.25)] bg-[rgba(180,77,66,0.05)] p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-[var(--error)]" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold text-[var(--charcoal)]">
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
        <div className="page-shell py-10 sm:py-14">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[rgba(214,189,164,0.5)]" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="aspect-[16/10] animate-pulse rounded-[1.5rem] bg-[rgba(214,189,164,0.38)]" />
              <div className="h-9 w-2/3 animate-pulse rounded-full bg-[rgba(214,189,164,0.5)]" />
              <div className="h-4 w-1/3 animate-pulse rounded-full bg-[rgba(214,189,164,0.4)]" />
              <div className="h-24 animate-pulse rounded-2xl bg-[rgba(214,189,164,0.3)]" />
            </div>
            <div className="h-80 animate-pulse rounded-[1.5rem] bg-[rgba(214,189,164,0.34)]" />
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
            className="mx-auto max-w-xl rounded-[1.5rem] border border-[rgba(180,77,66,0.25)] bg-[rgba(180,77,66,0.05)] p-8"
          >
            <AlertTriangle className="h-8 w-8 text-[var(--error)]" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold text-[var(--charcoal)]">
              This resource could not be loaded
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              The catalogue may be temporarily unavailable, or this listing may no longer exist.
              Nothing has been hidden — try again or return to the catalogue.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => void resourceQuery.refetch()}>Try again</Button>
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

  return (
    <SiteLayout>
      <div className="page-shell py-8 sm:py-10 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
            <li>
              <Link to="/" className="transition-colors hover:text-[var(--espresso)]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/resources" className="transition-colors hover:text-[var(--espresso)]">
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
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--espresso)] transition-colors hover:text-[var(--deep-brown)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All resources
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--soft-beige)] shadow-[var(--shadow-md)]">
              {imageFailed ? (
                <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(145deg,var(--soft-beige),var(--cream))]">
                  <FlaskConical className="h-12 w-12 text-[rgba(75,47,31,0.3)]" aria-hidden="true" />
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
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[rgba(255,252,247,0.92)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--espresso)] shadow-sm backdrop-blur">
                  {resource.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] shadow-sm backdrop-blur ${
                    isActive
                      ? 'bg-[rgba(56,118,83,0.92)] text-white'
                      : 'bg-[rgba(48,34,25,0.88)] text-[var(--cream)]'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-[var(--charcoal)]">
                {resource.name}
              </h1>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                <MapPin className="h-4 w-4 text-[var(--espresso)]" aria-hidden="true" />
                {resource.location}
                {resource.owner?.name ? (
                  <>
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--taupe)]" />
                    <span>Managed by {resource.owner.name}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,252,247,0.66)] px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Per booking
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--charcoal)]">
                  {resource.max_hours_per_booking} hours max
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,252,247,0.66)] px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Weekly cap
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--charcoal)]">
                  {resource.weekly_cap_hours} hours
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,252,247,0.66)] px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Listing
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--charcoal)]">
                  {isActive ? 'Published' : 'Inactive'}
                </p>
              </div>
            </div>

            <section aria-labelledby="about-resource" className="mt-8">
              <h2 id="about-resource" className="text-xl font-semibold text-[var(--charcoal)]">
                About this resource
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {resource.description || 'No description has been added to this listing yet.'}
              </p>
            </section>

            <section
              aria-labelledby="resource-requirements"
              className="mt-6 rounded-[1.35rem] border border-[var(--border-subtle)] bg-[rgba(183,121,50,0.05)] p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(183,121,50,0.14)]">
                  <ShieldCheck className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="resource-requirements"
                    className="text-base font-semibold text-[var(--charcoal)]"
                  >
                    Requirements and rules
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                    {resource.rules ||
                      'No additional rules are listed for this resource. Standard eligibility, booking limits, and usage policies still apply.'}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                    Requirements are checked by the server when a booking request is submitted;
                    they are not a suggestion.
                  </p>
                </div>
              </div>
            </section>

            {resource.owner?.name ? (
              <section
                aria-labelledby="resource-owner"
                className="mt-6 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,252,247,0.55)] px-4 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(75,47,31,0.07)]">
                  <UserRound className="h-4 w-4 text-[var(--espresso)]" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="resource-owner"
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
                  >
                    Resource owner
                  </h2>
                  <p className="text-sm font-medium text-[var(--charcoal)]">{resource.owner.name}</p>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.6rem] border border-[var(--border-subtle)] bg-[var(--cream)] shadow-[var(--shadow-md)]">
              <div className="border-b border-[var(--border-subtle)] px-5 py-4 sm:px-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--charcoal)]">
                  <CalendarPlus className="h-4 w-4 text-[var(--espresso)]" aria-hidden="true" />
                  Request this resource
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                  Requests are reviewed by a manager. Submitting one does not guarantee approval.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                {authLoading ? (
                  <div className="space-y-3" aria-label="Checking sign-in status">
                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-[rgba(214,189,164,0.45)]" />
                    <div className="h-10 animate-pulse rounded-xl bg-[rgba(214,189,164,0.35)]" />
                    <div className="h-10 animate-pulse rounded-xl bg-[rgba(214,189,164,0.35)]" />
                  </div>
                ) : !user ? (
                  <div>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">
                      Sign in to check your eligibility and submit a booking request. You can keep
                      browsing the catalogue without an account.
                    </p>
                    <Button asChild size="lg" className="mt-4 w-full">
                      <Link to="/login">
                        Sign in to request
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                ) : bookingMutation.isSuccess && bookingResult ? (
                  <div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(56,118,83,0.12)]">
                      <CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-[var(--charcoal)]">
                      Request submitted
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                      {bookingResult.message || 'Your booking request has been recorded.'}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 ${
                          statusStyles[bookingResult.data.status]
                        }`}
                      >
                        {bookingResult.data.status.replace('_', ' ')}
                      </span>
                    </div>
                    {bookingResult.data.status === 'waitlisted' ? (
                      <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                        The slot is currently held. A waitlist position is assigned by the platform’s
                        ranking rules; approval is not automatic.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                        A manager will review the request. You can follow the outcome from your
                        bookings.
                      </p>
                    )}
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
                        className={`mb-4 rounded-xl px-3.5 py-3 text-xs leading-relaxed ${
                          eligibility.qualifies
                            ? 'bg-[rgba(56,118,83,0.1)] text-[var(--success)]'
                            : 'bg-[rgba(183,121,50,0.1)] text-[var(--warning)]'
                        }`}
                      >
                        <p className="font-semibold">
                          {eligibility.qualifies
                            ? 'Your account meets the listed requirements.'
                            : 'Some requirements may still be missing.'}
                        </p>
                        <p className="mt-1 opacity-90">{eligibility.message}</p>
                      </div>
                    ) : (
                      <div className="mb-4 flex items-start gap-2 rounded-xl bg-[rgba(75,47,31,0.05)] px-3.5 py-3 text-xs leading-relaxed text-[var(--muted)]">
                        <ShieldCheck
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--espresso)]"
                          aria-hidden="true"
                        />
                        Eligibility and required credentials are verified again when you submit
                        this request.
                      </div>
                    )}

                    <form onSubmit={submitBooking} className="space-y-4">
                      <div>
                        <label
                          htmlFor="booking-start"
                          className="block text-xs font-semibold text-[var(--charcoal)]"
                        >
                          Start
                        </label>
                        <input
                          id="booking-start"
                          type="datetime-local"
                          value={startAt}
                          onChange={(event) => setStartAt(event.target.value)}
                          required
                          className="mt-1.5 h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-3 text-sm text-[var(--charcoal)] focus:outline-none focus:ring-2 focus:ring-[rgba(75,47,31,0.16)]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="booking-end"
                          className="block text-xs font-semibold text-[var(--charcoal)]"
                        >
                          End
                        </label>
                        <input
                          id="booking-end"
                          type="datetime-local"
                          value={endAt}
                          onChange={(event) => setEndAt(event.target.value)}
                          required
                          className="mt-1.5 h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-3 text-sm text-[var(--charcoal)] focus:outline-none focus:ring-2 focus:ring-[rgba(75,47,31,0.16)]"
                        />
                        <p className="mt-1.5 flex items-center gap-1.5 text-[0.7rem] text-[var(--muted)]">
                          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                          Up to {resource.max_hours_per_booking} hours · {resource.weekly_cap_hours}h
                          weekly cap
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="booking-purpose"
                          className="block text-xs font-semibold text-[var(--charcoal)]"
                        >
                          Purpose <span className="font-normal text-[var(--muted)]">(optional)</span>
                        </label>
                        <textarea
                          id="booking-purpose"
                          rows={3}
                          value={purpose}
                          onChange={(event) => setPurpose(event.target.value)}
                          placeholder="What will you use the resource for?"
                          className="mt-1.5 w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--charcoal)] placeholder:text-[rgba(130,119,109,0.75)] focus:outline-none focus:ring-2 focus:ring-[rgba(75,47,31,0.16)]"
                        />
                      </div>

                      {formError ? (
                        <p role="alert" className="flex items-start gap-2 rounded-xl bg-[rgba(180,77,66,0.08)] px-3 py-2 text-xs leading-relaxed text-[var(--error)]">
                          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {formError}
                        </p>
                      ) : null}

                      {bookingMutation.isError ? (
                        <p role="alert" className="flex items-start gap-2 rounded-xl bg-[rgba(180,77,66,0.08)] px-3 py-2 text-xs leading-relaxed text-[var(--error)]">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
                        The server checks eligibility, duration, weekly caps, and time conflicts
                        before recording the request.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(233,217,198,0.26)] px-4 py-3 text-xs leading-relaxed text-[var(--muted)]">
              <Link
                to="/how-it-works"
                className="font-semibold text-[var(--espresso)] transition-colors hover:text-[var(--deep-brown)]"
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
