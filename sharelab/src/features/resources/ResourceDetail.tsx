import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
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
import { useResource, useResourceAvailability } from '../../hooks/useResources'
import { api } from '../../lib/api-client'
import type { Booking, CreateBookingParams } from '../../lib/booking-service'
import { getResourceImage } from '../../lib/resources'

const statusStyles: Record<Booking['status'], string> = {
  pending: 'bg-[rgba(154,107,34,0.14)] text-(--warning)',
  waitlisted: 'bg-[rgba(154,107,34,0.14)] text-(--warning)',
  approved: 'bg-[rgba(53,107,76,0.14)] text-(--success)',
  rejected: 'bg-[rgba(169,72,60,0.12)] text-(--error)',
  checked_in: 'bg-[rgba(81,53,34,0.12)] text-(--espresso)',
  returned: 'bg-[rgba(130,119,109,0.12)] text-(--muted)',
  cancelled: 'bg-[rgba(130,119,109,0.1)] text-(--muted)',
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

const toLocalInput = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

const todayDateInput = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

type ResourceErrorKind = 'not_found' | 'unauthorized' | 'forbidden' | 'unavailable' | 'empty'

interface ResourceErrorInfo {
  kind: ResourceErrorKind
  title: string
  description: string
  status?: number
  requestId?: string
}

/**
 * Map the failure to something the visitor can act on. A single generic
 * message hides whether a listing is gone, needs a sign-in, or the API is
 * simply unreachable.
 */
const describeResourceError = (error: unknown, hasResource: boolean): ResourceErrorInfo => {
  if (hasResource) return { kind: 'unavailable', title: '', description: '' }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const requestId =
      (error.response?.headers['x-request-id'] as string | undefined) ?? undefined

    if (status === 404) {
      return {
        kind: 'not_found',
        status,
        requestId,
        title: 'This listing no longer exists',
        description:
          'The resource may have been removed or unpublished. Browse the catalogue for what is available now.',
      }
    }

    if (status === 401) {
      return {
        kind: 'unauthorized',
        status,
        requestId,
        title: 'Sign in to view this listing',
        description: 'This resource is only available to signed-in members of the campus.',
      }
    }

    if (status === 403) {
      return {
        kind: 'forbidden',
        status,
        requestId,
        title: 'You do not have access to this listing',
        description: 'Your account role does not permit viewing this resource.',
      }
    }

    if (status && status >= 500) {
      return {
        kind: 'unavailable',
        status,
        requestId,
        title: 'The server could not be reached. Try again.',
        description: 'The catalogue is temporarily unavailable. Nothing has been hidden.',
      }
    }

    return {
      kind: 'unavailable',
      status,
      requestId,
      title: 'The server could not be reached. Try again.',
      description:
        'Check your connection and confirm the ShareLab API is running, then retry.',
    }
  }

  return {
    kind: 'unavailable',
    title: 'The server could not be reached. Try again.',
    description: 'The catalogue did not return a usable response. Try again in a moment.',
  }
}

export interface ResourceDetailProps {
  resourceId: string
}

export const ResourceDetail = ({ resourceId }: ResourceDetailProps) => {
  const numericId = Number(resourceId)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const resourceQuery = useResource(numericId)
  const resource = resourceQuery.data?.data
  const eligibility = resource?.eligibility
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [purpose, setPurpose] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [imageFailed, setImageFailed] = useState(false)
  const [availabilityDate, setAvailabilityDate] = useState(todayDateInput)
  const availabilityQuery = useResourceAvailability(numericId, availabilityDate)

  usePageMeta({
    title: resource ? `${resource.name} — ShareLab` : 'Resource — ShareLab',
    description: resource?.description ?? undefined,
  })

  // Development diagnostics: surface the status and request id so a failing
  // call can be traced without guessing from the UI message.
  useEffect(() => {
    if (!import.meta.env.DEV || !resourceQuery.isError) return

    const info = describeResourceError(resourceQuery.error, false)
    console.warn('[resource-detail] request failed', {
      resourceId: numericId,
      status: info.status ?? 'network',
      requestId: info.requestId ?? 'n/a',
    })
  }, [numericId, resourceQuery.error, resourceQuery.isError])

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
          <div className="mx-auto max-w-lg rounded-3xl border border-[rgba(169,72,60,0.25)] bg-[rgba(169,72,60,0.05)] p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-(--error)" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold text-(--charcoal)">
              That resource link is not valid
            </h1>
            <p className="mt-2 text-sm text-(--muted)">
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
              <div className="aspect-[16/10] animate-pulse rounded-3xl bg-[rgba(214,189,164,0.38)]" />
              <div className="h-9 w-2/3 animate-pulse rounded-full bg-[rgba(214,189,164,0.5)]" />
              <div className="h-4 w-1/3 animate-pulse rounded-full bg-[rgba(214,189,164,0.4)]" />
              <div className="h-24 animate-pulse rounded-2xl bg-[rgba(214,189,164,0.3)]" />
            </div>
            <div className="h-80 animate-pulse rounded-3xl bg-[rgba(214,189,164,0.34)]" />
          </div>
        </div>
      </SiteLayout>
    )
  }

  if (resourceQuery.isError || !resource) {
    const info = describeResourceError(resourceQuery.error, Boolean(resource))

    return (
      <SiteLayout>
        <div className="page-shell py-16">
          <div
            role="alert"
            className="mx-auto max-w-xl rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-8"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.5rem] bg-[rgba(169,72,60,0.1)]">
              <AlertTriangle className="h-5 w-5 text-(--error)" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-(--charcoal)">
              {info.title}
            </h1>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-(--muted)">{info.description}</p>
            {import.meta.env.DEV && info.status ? (
              <p className="mono-meta mt-3">
                HTTP {info.status}
                {info.requestId ? ` · request ${info.requestId}` : ''}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              {info.kind === 'unauthorized' ? (
                <Button asChild>
                  <Link to="/login" search={{ redirect: pathname }}>
                    Sign in
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : info.kind === 'unavailable' ? (
                <Button onClick={() => void resourceQuery.refetch()}>Try again</Button>
              ) : null}
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
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-(--muted)">
            <li>
              <Link to="/" className="transition-colors hover:text-(--espresso)">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/resources" className="transition-colors hover:text-(--espresso)">
                Resources
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-(--charcoal)">
              {resource.name}
            </li>
          </ol>
        </nav>

        <Link
          to="/resources"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-(--espresso) transition-colors hover:text-(--deep-brown)"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All resources
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface-sunken) shadow-(--shadow-sm)">
              {imageFailed ? (
                <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(145deg,var(--soft-beige),var(--cream))]">
                  <FlaskConical className="h-12 w-12 text-[rgba(81,53,34,0.3)]" aria-hidden="true" />
                </div>
              ) : (
                <img
                  src={getResourceImage(resource)}
                  alt={`${resource.name} at ${resource.location}`}
                  className="aspect-[16/10] w-full object-cover"
                  width={1280}
                  height={800}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  loading="eager"
                  decoding="async"
                  onError={() => setImageFailed(true)}
                />
              )}
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-[0.35rem] bg-[rgba(255,252,247,0.94)] px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-(--espresso)">
                  {resource.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] shadow-sm backdrop-blur ${
                    isActive
                      ? 'bg-[rgba(53,107,76,0.92)] text-white'
                      : 'bg-[rgba(48,34,25,0.88)] text-(--cream)'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h1 className="display-lg">
                {resource.name}
              </h1>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-(--muted)">
                <MapPin className="h-4 w-4 text-(--espresso)" aria-hidden="true" />
                {resource.location}
                {resource.owner?.name ? (
                  <>
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-(--taupe)" />
                    <span>Managed by {resource.owner.name}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="border-l-2 border-(--bronze) bg-(--surface) px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-(--muted)">
                  Per booking
                </p>
                <p className="mt-1 text-lg font-semibold text-(--charcoal)">
                  {resource.max_hours_per_booking} hours max
                </p>
              </div>
              <div className="border-l-2 border-(--bronze) bg-(--surface) px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-(--muted)">
                  Weekly cap
                </p>
                <p className="mt-1 text-lg font-semibold text-(--charcoal)">
                  {resource.weekly_cap_hours} hours
                </p>
              </div>
              <div className="border-l-2 border-(--bronze) bg-(--surface) px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-(--muted)">
                  Listing
                </p>
                <p className="mt-1 text-lg font-semibold text-(--charcoal)">
                  {isActive ? 'Published' : 'Inactive'}
                </p>
              </div>
            </div>

            <section aria-labelledby="about-resource" className="mt-8">
              <h2 id="about-resource" className="text-xl font-semibold text-(--charcoal)">
                About this resource
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-(--muted) sm:text-base">
                {resource.description || 'No description has been added to this listing yet.'}
              </p>
            </section>

            <section
              aria-labelledby="resource-requirements"
              className="mt-6 rounded-(--radius-lg) border border-(--border-subtle) bg-[rgba(154,107,34,0.05)] p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(154,107,34,0.14)]">
                  <ShieldCheck className="h-4 w-4 text-(--warning)" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="resource-requirements"
                    className="text-base font-semibold text-(--charcoal)"
                  >
                    Requirements and rules
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-(--muted)">
                    {resource.rules ||
                      'No additional rules are listed for this resource. Standard eligibility, booking limits, and usage policies still apply.'}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-(--muted)">
                    Requirements are checked by the server when a booking request is submitted;
                    they are not a suggestion.
                  </p>

                  {resource.requirements && resource.requirements.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {resource.requirements.map((requirement) => {
                        const check = eligibility?.checklist.find(
                          (item) => item.name === requirement.name,
                        )
                        const met = check?.status === 'verified' || eligibility?.qualifies

                        return (
                          <li
                            key={requirement.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(154,107,34,0.14)] bg-[rgba(255,252,247,0.4)] px-3 py-2"
                          >
                            <span className="text-xs font-medium text-(--charcoal)">
                              {requirement.name}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold ${
                                met
                                  ? 'bg-[rgba(53,107,76,0.12)] text-(--success)'
                                  : 'bg-[rgba(154,107,34,0.12)] text-(--warning)'
                              }`}
                            >
                              {met ? (
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                              ) : (
                                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                              )}
                              {met ? 'Met' : check?.status ?? 'Needs verification'}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs font-medium text-(--success)">
                      No credential requirements are listed for this resource.
                    </p>
                  )}

                  {!eligibility?.qualifies && eligibility?.missing.length ? (
                    <Link
                      to="/credentials"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-(--espresso) underline decoration-[rgba(81,53,34,0.25)] underline-offset-4"
                    >
                      Submit the missing credentials
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>

            {resource.owner?.name ? (
              <section
                aria-labelledby="resource-owner"
                className="mt-6 flex items-center gap-3 rounded-2xl border border-(--border-subtle) bg-(--surface) px-4 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(81,53,34,0.07)]">
                  <UserRound className="h-4 w-4 text-(--espresso)" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="resource-owner"
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-(--muted)"
                  >
                    Resource owner
                  </h2>
                  <p className="text-sm font-medium text-(--charcoal)">{resource.owner.name}</p>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) shadow-(--shadow-sm)">
              <div className="border-b border-(--border-subtle) px-5 py-4 sm:px-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-(--charcoal)">
                  <CalendarPlus className="h-4 w-4 text-(--espresso)" aria-hidden="true" />
                  Request this resource
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-(--muted)">
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
                    <p className="text-sm leading-relaxed text-(--muted)">
                      Sign in to check your eligibility and submit a booking request. You can keep
                      browsing the catalogue without an account.
                    </p>
                    <Button asChild size="lg" className="mt-4 w-full">
                      <Link to="/login" search={{ redirect: pathname }}>
                        Sign in to check eligibility
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                ) : bookingMutation.isSuccess && bookingResult ? (
                  <div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(53,107,76,0.12)]">
                      <CheckCircle2 className="h-5 w-5 text-(--success)" aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-(--charcoal)">
                      Request submitted
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-(--muted)">
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
                      <p className="mt-2 text-xs leading-relaxed text-(--muted)">
                        The slot is currently held. A waitlist position is assigned by the platform’s
                        ranking rules; approval is not automatic.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs leading-relaxed text-(--muted)">
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
                            ? 'bg-[rgba(53,107,76,0.1)] text-(--success)'
                            : 'bg-[rgba(154,107,34,0.1)] text-(--warning)'
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
                      <div className="mb-4 flex items-start gap-2 rounded-xl bg-[rgba(81,53,34,0.05)] px-3.5 py-3 text-xs leading-relaxed text-(--muted)">
                        <ShieldCheck
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--espresso)"
                          aria-hidden="true"
                        />
                        Eligibility and required credentials are verified again when you submit
                        this request.
                      </div>
                    )}

                    <div className="mb-4 rounded-xl border border-(--border-subtle) bg-[rgba(255,252,247,0.58)] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="availability-date"
                          className="text-xs font-semibold text-(--charcoal)"
                        >
                          Check availability
                        </label>
                        <input
                          id="availability-date"
                          type="date"
                          value={availabilityDate}
                          onChange={(event) => setAvailabilityDate(event.target.value)}
                          className="h-9 rounded-lg border border-(--border-subtle) bg-(--surface) px-2 text-xs text-(--charcoal) focus:outline-none focus:ring-2 focus:ring-[rgba(81,53,34,0.16)]"
                        />
                      </div>

                      {availabilityQuery.isLoading ? (
                        <p className="mt-2 animate-pulse text-xs text-(--muted)">
                          Checking open slots…
                        </p>
                      ) : availabilityQuery.isError ? (
                        <p className="mt-2 text-xs text-(--error)">
                          Availability could not be checked. You can still choose times manually.
                        </p>
                      ) : (availabilityQuery.data?.data.slots.length ?? 0) === 0 ? (
                        <p className="mt-2 text-xs text-(--muted)">
                          {availabilityQuery.data?.data.message ??
                            'No open slots were found for this date.'}
                        </p>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {availabilityQuery.data?.data.slots.map((slot) => (
                            <button
                              key={slot.start_at}
                              type="button"
                              disabled={!slot.available}
                              title={slot.reason ?? undefined}
                              onClick={() => {
                                setStartAt(toLocalInput(slot.start_at))
                                setEndAt(toLocalInput(slot.end_at))
                                setFormError(null)
                              }}
                              className={`inline-flex min-h-8 items-center rounded-full border px-2.5 text-[0.68rem] font-semibold transition-colors ${
                                slot.available
                                  ? 'border-[rgba(53,107,76,0.22)] bg-[rgba(53,107,76,0.08)] text-(--success) hover:bg-[rgba(53,107,76,0.14)]'
                                  : 'cursor-not-allowed border-(--border-subtle) bg-[rgba(81,53,34,0.04)] text-(--muted) line-through'
                              }`}
                            >
                              {new Date(slot.start_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-[0.66rem] leading-relaxed text-(--muted)">
                        Tap a free slot to fill the times. The server always re-checks conflicts.
                      </p>
                    </div>

                    <form onSubmit={submitBooking} className="space-y-4">
                      <div>
                        <label
                          htmlFor="booking-start"
                          className="block text-xs font-semibold text-(--charcoal)"
                        >
                          Start
                        </label>
                        <input
                          id="booking-start"
                          type="datetime-local"
                          value={startAt}
                          onChange={(event) => setStartAt(event.target.value)}
                          required
                          className="mt-1.5 h-10 w-full rounded-xl border border-(--border-subtle) bg-(--surface) px-3 text-sm text-(--charcoal) focus:outline-none focus:ring-2 focus:ring-[rgba(81,53,34,0.16)]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="booking-end"
                          className="block text-xs font-semibold text-(--charcoal)"
                        >
                          End
                        </label>
                        <input
                          id="booking-end"
                          type="datetime-local"
                          value={endAt}
                          onChange={(event) => setEndAt(event.target.value)}
                          required
                          className="mt-1.5 h-10 w-full rounded-xl border border-(--border-subtle) bg-(--surface) px-3 text-sm text-(--charcoal) focus:outline-none focus:ring-2 focus:ring-[rgba(81,53,34,0.16)]"
                        />
                        <p className="mt-1.5 flex items-center gap-1.5 text-[0.7rem] text-(--muted)">
                          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                          Up to {resource.max_hours_per_booking} hours · {resource.weekly_cap_hours}h
                          weekly cap
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="booking-purpose"
                          className="block text-xs font-semibold text-(--charcoal)"
                        >
                          Purpose <span className="font-normal text-(--muted)">(optional)</span>
                        </label>
                        <textarea
                          id="booking-purpose"
                          rows={3}
                          value={purpose}
                          onChange={(event) => setPurpose(event.target.value)}
                          placeholder="What will you use the resource for?"
                          className="mt-1.5 w-full resize-none rounded-xl border border-(--border-subtle) bg-(--surface) px-3 py-2 text-sm text-(--charcoal) placeholder:text-[rgba(130,119,109,0.75)] focus:outline-none focus:ring-2 focus:ring-[rgba(81,53,34,0.16)]"
                        />
                      </div>

                      {formError ? (
                        <p role="alert" className="flex items-start gap-2 rounded-xl bg-[rgba(169,72,60,0.08)] px-3 py-2 text-xs leading-relaxed text-(--error)">
                          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {formError}
                        </p>
                      ) : null}

                      {bookingMutation.isError ? (
                        <p role="alert" className="flex items-start gap-2 rounded-xl bg-[rgba(169,72,60,0.08)] px-3 py-2 text-xs leading-relaxed text-(--error)">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {getErrorMessage(bookingMutation.error)}
                        </p>
                      ) : null}

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={
                          !isActive ||
                          bookingMutation.isPending ||
                          Boolean(eligibility && !eligibility.qualifies)
                        }
                      >
                        {bookingMutation.isPending
                          ? 'Submitting request…'
                          : !isActive
                            ? 'Listing is inactive'
                            : eligibility && !eligibility.qualifies
                              ? 'Complete requirements to request'
                              : 'Submit booking request'}
                      </Button>

                      <p className="text-center text-[0.68rem] leading-relaxed text-(--muted)">
                        The server checks eligibility, duration, weekly caps, and time conflicts
                        before recording the request.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-(--border-subtle) bg-[rgba(233,217,198,0.26)] px-4 py-3 text-xs leading-relaxed text-(--muted)">
              <Link
                to="/how-it-works"
                className="font-semibold text-(--espresso) transition-colors hover:text-(--deep-brown)"
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
