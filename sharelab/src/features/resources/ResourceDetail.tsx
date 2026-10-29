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
import { useResource, useResourceAvailability } from '../../hooks/useResources'
import { api } from '../../lib/api-client'
import type { Booking, CreateBookingParams } from '../../lib/booking-service'
import { getResourceImage } from '../../lib/resources'
<<<<<<< HEAD
import { Skeleton } from '../../components/ui/Skeleton'
=======

const statusStyles: Record<Booking['status'], string> = {
  pending: 'bg-(--warning-tint) text-(--warning)',
  waitlisted: 'bg-(--warning-tint) text-(--warning)',
  approved: 'bg-(--success-tint) text-(--success)',
  rejected: 'bg-(--error-tint) text-(--error)',
  checked_in: 'bg-(--tint-3) text-(--espresso)',
  returned: 'bg-[rgba(130,119,109,0.12)] text-(--muted)',
  cancelled: 'bg-[rgba(130,119,109,0.1)] text-(--muted)',
}
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec

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

<<<<<<< HEAD
const formatDuration = (hours: number) => {
  if (!Number.isFinite(hours) || hours <= 0) return null
  const whole = Math.floor(hours)
  const minutes = Math.round((hours - whole) * 60)
  if (minutes === 0) return `${whole}h`
  return `${whole}h ${minutes}m`
=======
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
<<<<<<< HEAD
          <div className="mx-auto max-w-lg rounded-3xl border border-(--error-tint) bg-(--error-tint-soft) p-8 text-center">
=======
<<<<<<< HEAD
          <div className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-[rgba(164,69,59,0.24)] bg-[var(--error-soft)] p-8 text-center">
            <AlertTriangle
              className="mx-auto h-7 w-7 text-[var(--error)]"
              aria-hidden="true"
            />
            <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--charcoal)]">
=======
          <div className="mx-auto max-w-lg rounded-3xl border border-[rgba(169,72,60,0.25)] bg-[rgba(169,72,60,0.05)] p-8 text-center">
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
            <AlertTriangle className="mx-auto h-8 w-8 text-(--error)" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold text-(--charcoal)">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
<<<<<<< HEAD
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
=======
            className="mx-auto max-w-xl rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-8"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.5rem] bg-(--error-tint)">
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
<<<<<<< HEAD
      <div className="page-shell py-7 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.72rem] text-[var(--muted)]">
            <li>
              <Link to="/" className="hover:text-[var(--espresso)]">
=======
      <div className="page-shell py-8 sm:py-10 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-(--muted)">
            <li>
              <Link to="/" className="transition-colors hover:text-(--espresso)">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
<<<<<<< HEAD
              <Link to="/resources" className="hover:text-[var(--espresso)]">
=======
              <Link to="/resources" className="transition-colors hover:text-(--espresso)">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
<<<<<<< HEAD
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-(--espresso) transition-colors hover:text-(--espresso-hover)"
=======
<<<<<<< HEAD
          className="mb-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--bronze-deep)] hover:text-[var(--espresso)]"
=======
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-(--espresso) transition-colors hover:text-(--deep-brown)"
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          All resources
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:gap-10">
          <div className="min-w-0">
<<<<<<< HEAD
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--soft-beige)]">
              {imageFailed ? (
                <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(145deg,var(--soft-beige),var(--cream))]">
                  <FlaskConical
                    className="h-11 w-11 text-[rgba(81,53,34,0.26)]"
                    aria-hidden="true"
                  />
=======
            <div className="relative overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface-sunken) shadow-(--shadow-sm)">
              {imageFailed ? (
                <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(145deg,var(--soft-beige),var(--cream))]">
<<<<<<< HEAD
                  <FlaskConical className="h-12 w-12 text-(--tint-3)" aria-hidden="true" />
=======
                  <FlaskConical className="h-12 w-12 text-[rgba(81,53,34,0.3)]" aria-hidden="true" />
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
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
<<<<<<< HEAD
              <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3.5">
                <span className="rounded-[0.375rem] bg-[rgba(43,29,20,0.72)] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--cream)] backdrop-blur-sm">
                  {resource.category}
                </span>
                <Badge
                  tone={isActive ? 'success' : 'neutral'}
                  dot
                  className="bg-[rgba(255,252,247,0.94)]"
=======
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-[0.35rem] bg-(--surface) px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-(--charcoal)">
                  {resource.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] shadow-sm backdrop-blur ${
                    isActive
                      ? 'bg-[rgba(53,107,76,0.92)] text-white'
                      : 'bg-[rgba(48,34,25,0.88)] text-(--cream)'
                  }`}
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                >
                  {isActive ? 'Published' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="mt-6">
<<<<<<< HEAD
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
=======
              <h1 className="display-lg">
                {resource.name}
              </h1>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-(--muted)">
                <MapPin className="h-4 w-4 text-(--espresso)" aria-hidden="true" />
                {resource.location}
                {resource.owner?.name ? (
                  <>
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-(--taupe)" />
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                    <span>Managed by {resource.owner.name}</span>
                  </>
                ) : null}
              </p>
            </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
              </p>
            </section>

            <section
              aria-labelledby="resource-requirements"
<<<<<<< HEAD
              className="mt-6 rounded-(--radius-lg) border border-(--border-subtle) bg-(--warning-tint-soft) p-5 sm:p-6"
=======
<<<<<<< HEAD
              className="mt-6 rounded-[var(--radius-lg)] border border-[rgba(156,107,36,0.22)] bg-[rgba(248,240,225,0.55)] p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.45rem] bg-[rgba(156,107,36,0.12)]">
                  <ShieldCheck
                    className="h-4 w-4 text-[var(--warning)]"
                    aria-hidden="true"
                  />
=======
              className="mt-6 rounded-(--radius-lg) border border-(--border-subtle) bg-[rgba(154,107,34,0.05)] p-5 sm:p-6"
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--warning-tint)">
                  <ShieldCheck className="h-4 w-4 text-(--warning)" aria-hidden="true" />
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                </span>
                <div>
                  <h2
                    id="resource-requirements"
<<<<<<< HEAD
                    className="text-[0.9375rem] font-semibold text-[var(--charcoal)]"
=======
                    className="text-base font-semibold text-(--charcoal)"
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                  >
                    Requirements and safety
                  </h2>
<<<<<<< HEAD
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                    {resource.rules ||
                      'No additional rules are listed for this resource. Standard eligibility, booking limits, and usage policies still apply.'}
                  </p>
                  <p className="mt-2 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                    Requirements are checked by the server when a request is
                    submitted; they are not a suggestion. Follow the owner’s
                    safety instructions while using the resource.
=======
                  <p className="mt-1.5 text-sm leading-relaxed text-(--muted)">
                    {resource.rules ||
                      'No additional rules are listed for this resource. Standard eligibility, booking limits, and usage policies still apply.'}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-(--muted)">
                    Requirements are checked by the server when a booking request is submitted;
                    they are not a suggestion.
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
                            className="flex items-center justify-between gap-3 rounded-xl border border-(--warning-tint) bg-(--surface-muted) px-3 py-2"
                          >
                            <span className="text-xs font-medium text-(--charcoal)">
                              {requirement.name}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold ${
                                met
                                  ? 'bg-(--success-tint) text-(--success)'
                                  : 'bg-(--warning-tint) text-(--warning)'
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
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-(--espresso) underline decoration-(--tint-3) underline-offset-4"
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
<<<<<<< HEAD
                className="mt-6 flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--cream)] px-4 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--soft-beige)]">
                  <UserRound
                    className="h-4 w-4 text-[var(--espresso)]"
                    aria-hidden="true"
                  />
=======
                className="mt-6 flex items-center gap-3 rounded-2xl border border-(--border-subtle) bg-(--surface) px-4 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--tint-2)">
                  <UserRound className="h-4 w-4 text-(--espresso)" aria-hidden="true" />
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                </span>
                <div>
                  <h2
                    id="resource-owner"
<<<<<<< HEAD
                    className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
                  >
                    Resource owner
                  </h2>
                  <p className="text-[0.8125rem] font-medium text-[var(--charcoal)]">
                    {resource.owner.name}
                  </p>
=======
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-(--muted)"
                  >
                    Resource owner
                  </h2>
                  <p className="text-sm font-medium text-(--charcoal)">{resource.owner.name}</p>
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                </div>
              </section>
            ) : null}
          </div>

<<<<<<< HEAD
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
=======
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) shadow-(--shadow-sm)">
              <div className="border-b border-(--border-subtle) px-5 py-4 sm:px-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-(--charcoal)">
                  <CalendarPlus className="h-4 w-4 text-(--espresso)" aria-hidden="true" />
                  Request this resource
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-(--muted)">
                  Requests are reviewed by a manager. Submitting one does not guarantee approval.
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
<<<<<<< HEAD
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
=======
                    <p className="text-sm leading-relaxed text-(--muted)">
                      Sign in to check your eligibility and submit a booking request. You can keep
                      browsing the catalogue without an account.
                    </p>
                    <Button asChild size="lg" className="mt-4 w-full">
                      <Link to="/login" search={{ redirect: pathname }}>
                        Sign in to check eligibility
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                ) : bookingMutation.isSuccess && bookingResult ? (
                  <div>
<<<<<<< HEAD
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--success-tint)">
=======
<<<<<<< HEAD
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
=======
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(53,107,76,0.12)]">
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
                      <CheckCircle2 className="h-5 w-5 text-(--success)" aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-(--charcoal)">
                      Request submitted
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-(--muted)">
                      {bookingResult.message || 'Your booking request has been recorded.'}
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                    </p>
                    <div className="mt-3">
                      <StatusBadge status={bookingResult.data.status} />
                    </div>
<<<<<<< HEAD
                    <p className="mt-2.5 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                      {bookingResult.data.status === 'waitlisted'
                        ? 'The slot is currently held. A waitlist position is assigned by the ranking rules; approval is not automatic.'
                        : 'A manager will review the request. Follow the outcome from your bookings.'}
                    </p>
=======
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
<<<<<<< HEAD
                            ? 'bg-(--success-tint) text-(--success)'
                            : 'bg-(--warning-tint) text-(--warning)'
=======
<<<<<<< HEAD
                            ? 'border-[rgba(63,107,79,0.2)] bg-[var(--success-soft)]'
                            : 'border-[rgba(156,107,36,0.22)] bg-[var(--warning-soft)]'
=======
                            ? 'bg-[rgba(53,107,76,0.1)] text-(--success)'
                            : 'bg-[rgba(154,107,34,0.1)] text-(--warning)'
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
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
<<<<<<< HEAD
                      <div className="mb-4 flex items-start gap-2 rounded-xl bg-(--tint-1) px-3.5 py-3 text-xs leading-relaxed text-(--muted)">
=======
<<<<<<< HEAD
                      <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[rgba(239,230,217,0.4)] px-3.5 py-3 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                        <Info
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--bronze-deep)]"
=======
                      <div className="mb-4 flex items-start gap-2 rounded-xl bg-[rgba(81,53,34,0.05)] px-3.5 py-3 text-xs leading-relaxed text-(--muted)">
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
                        <ShieldCheck
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--espresso)"
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                          aria-hidden="true"
                        />
                        Eligibility and required credentials are verified again
                        when you submit this request.
                      </div>
                    )}

                    <div className="mb-4 rounded-xl border border-(--border-subtle) bg-(--surface-muted) p-3.5">
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
                          className="h-9 rounded-lg border border-(--border-subtle) bg-(--surface) px-2 text-xs text-(--charcoal) focus:outline-none focus:ring-2 focus:ring-(--tint-3)"
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
                                  ? 'border-(--success-tint) bg-(--success-tint-soft) text-(--success) hover:bg-(--success-tint)'
                                  : 'cursor-not-allowed border-(--border-subtle) bg-(--tint-1) text-(--muted) line-through'
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
<<<<<<< HEAD
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
=======
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
                          className="mt-1.5 h-10 w-full rounded-xl border border-(--border-subtle) bg-(--surface) px-3 text-sm text-(--charcoal) focus:outline-none focus:ring-2 focus:ring-(--tint-3)"
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
                          className="mt-1.5 h-10 w-full rounded-xl border border-(--border-subtle) bg-(--surface) px-3 text-sm text-(--charcoal) focus:outline-none focus:ring-2 focus:ring-(--tint-3)"
                        />
                        <p className="mt-1.5 flex items-center gap-1.5 text-[0.7rem] text-(--muted)">
                          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                          Up to {resource.max_hours_per_booking} hours · {resource.weekly_cap_hours}h
                          weekly cap
                        </p>
                      </div>
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec

                      <div>
                        <label
                          htmlFor="booking-purpose"
<<<<<<< HEAD
                          className="flex items-baseline justify-between text-[0.75rem] font-semibold text-[var(--charcoal)]"
                        >
                          Purpose
                          <span className="text-[0.68rem] font-normal text-[var(--muted)]">
                            Optional
                          </span>
=======
                          className="block text-xs font-semibold text-(--charcoal)"
                        >
                          Purpose <span className="font-normal text-(--muted)">(optional)</span>
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                        </label>
                        <textarea
                          id="booking-purpose"
                          rows={3}
                          value={purpose}
                          onChange={(event) => setPurpose(event.target.value)}
                          placeholder="What will you use the resource for?"
<<<<<<< HEAD
                          className="mt-1.5 w-full resize-none rounded-xl border border-(--border-subtle) bg-(--surface) px-3 py-2 text-sm text-(--charcoal) placeholder:text-[rgba(130,119,109,0.75)] focus:outline-none focus:ring-2 focus:ring-(--tint-3)"
=======
<<<<<<< HEAD
                          className="mt-1.5 w-full resize-none rounded-[0.5rem] border border-[var(--border-subtle)] bg-white px-3 py-2 text-[0.8125rem] text-[var(--charcoal)] outline-none placeholder:text-[rgba(113,104,95,0.7)] focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
=======
                          className="mt-1.5 w-full resize-none rounded-xl border border-(--border-subtle) bg-(--surface) px-3 py-2 text-sm text-(--charcoal) placeholder:text-[rgba(130,119,109,0.75)] focus:outline-none focus:ring-2 focus:ring-[rgba(81,53,34,0.16)]"
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
                        />
                      </div>

                      {formError ? (
<<<<<<< HEAD
                        <p role="alert" className="flex items-start gap-2 rounded-xl bg-(--error-tint-soft) px-3 py-2 text-xs leading-relaxed text-(--error)">
=======
<<<<<<< HEAD
                        <p
                          role="alert"
                          className="flex items-start gap-2 rounded-[0.5rem] bg-[var(--error-soft)] px-3 py-2 text-[0.72rem] leading-relaxed text-[var(--error)]"
                        >
                          <XCircle
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
=======
                        <p role="alert" className="flex items-start gap-2 rounded-xl bg-[rgba(169,72,60,0.08)] px-3 py-2 text-xs leading-relaxed text-(--error)">
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
                          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                          {formError}
                        </p>
                      ) : null}

                      {bookingMutation.isError ? (
<<<<<<< HEAD
                        <p role="alert" className="flex items-start gap-2 rounded-xl bg-(--error-tint-soft) px-3 py-2 text-xs leading-relaxed text-(--error)">
=======
<<<<<<< HEAD
                        <p
                          role="alert"
                          className="flex items-start gap-2 rounded-[0.5rem] bg-[var(--error-soft)] px-3 py-2 text-[0.72rem] leading-relaxed text-[var(--error)]"
                        >
                          <AlertTriangle
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
=======
                        <p role="alert" className="flex items-start gap-2 rounded-xl bg-[rgba(169,72,60,0.08)] px-3 py-2 text-xs leading-relaxed text-(--error)">
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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

<<<<<<< HEAD
                      <p className="text-center text-[0.68rem] leading-relaxed text-[var(--muted)]">
                        The server checks eligibility, duration, weekly caps,
                        and time conflicts before recording the request.
=======
                      <p className="text-center text-[0.68rem] leading-relaxed text-(--muted)">
                        The server checks eligibility, duration, weekly caps, and time conflicts
                        before recording the request.
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

<<<<<<< HEAD
            <div className="mt-4 rounded-2xl border border-(--border-subtle) bg-(--beige-tint-2) px-4 py-3 text-xs leading-relaxed text-(--muted)">
              <Link
                to="/how-it-works"
                className="font-semibold text-(--espresso) transition-colors hover:text-(--espresso-hover)"
=======
<<<<<<< HEAD
            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[rgba(239,230,217,0.35)] px-4 py-3 text-[0.72rem] leading-relaxed text-[var(--muted)]">
              <Link
                to="/how-it-works"
                className="font-semibold text-[var(--espresso)] hover:underline"
=======
            <div className="mt-4 rounded-2xl border border-(--border-subtle) bg-[rgba(233,217,198,0.26)] px-4 py-3 text-xs leading-relaxed text-(--muted)">
              <Link
                to="/how-it-works"
                className="font-semibold text-(--espresso) transition-colors hover:text-(--deep-brown)"
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
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
