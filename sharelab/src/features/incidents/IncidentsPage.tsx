import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileWarning,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  EmptyState,
  ErrorNotice,
  Field,
  InlineLoader,
  LoadingRows,
  Modal,
  PageHeader,
  SectionCard,
  Tabs,
  textareaClass,
} from '../../components/ui/workspace'
import { useAuth } from '../../hooks/useAuth'
import {
  useConfirmIncident,
  useIncidents,
  useResolveIncident,
} from '../../hooks/useIncidents'
import { getApiErrorMessage } from '../../lib/api-client'
import type { Incident } from '../../lib/booking-service'
import { cn } from '../../lib/utils'

const resolveSchema = z.object({
  note: z
    .string()
    .trim()
    .min(5, 'Explain how the incident was resolved.')
    .max(2000),
})

type ResolveValues = z.infer<typeof resolveSchema>

const incidentTone = {
  open: 'bg-(--warning-tint) text-(--warning)',
  confirmed: 'bg-(--error-tint) text-(--error)',
  resolved: 'bg-(--success-tint) text-(--success)',
} as const

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

export const IncidentsPage = () => {
  const { user } = useAuth()
  const canManage = user?.role === 'manager' || user?.role === 'owner'
  const [status, setStatus] = useState<'all' | 'open' | 'confirmed' | 'resolved'>('all')
  const [resolving, setResolving] = useState<Incident | null>(null)
  const incidentsQuery = useIncidents({ status, perPage: 100 })
  const confirmMutation = useConfirmIncident()
  const resolveMutation = useResolveIncident()

  const resolveForm = useForm<ResolveValues>({
    resolver: zodResolver(resolveSchema),
    defaultValues: { note: '' },
  })

  const incidents = incidentsQuery.data?.data ?? []
  const counts = {
    all: incidents.length,
    open: incidents.filter((incident) => incident.status === 'open').length,
    confirmed: incidents.filter((incident) => incident.status === 'confirmed').length,
    resolved: incidents.filter((incident) => incident.status === 'resolved').length,
  }
  const actionError = confirmMutation.error ?? resolveMutation.error

  const openResolve = (incident: Incident) => {
    resolveMutation.reset()
    resolveForm.reset({ note: '' })
    setResolving(incident)
  }

  const onResolve = resolveForm.handleSubmit((values) => {
    if (!resolving) return
    resolveMutation.mutate(
      { incidentId: resolving.id, note: values.note.trim() },
      {
        onSuccess: () => {
          setResolving(null)
          resolveForm.reset({ note: '' })
        },
      },
    )
  })

  return (
    <div>
      <PageHeader
        eyebrow={canManage ? 'Resource care' : 'Your reports'}
        title={canManage ? 'Incident queue' : 'Your incidents'}
        description={
          canManage
            ? 'Confirm system suggestions, investigate reports, and close issues with a plain-language resolution note.'
            : 'Reports you submitted, plus incidents linked to your bookings. A manager reviews every report.'
        }
        actions={
          <Button asChild variant="secondary">
            <Link to="/my-bookings">
              <FileWarning className="h-4 w-4" aria-hidden="true" />
              Report from a booking
            </Link>
          </Button>
        }
      />

      <div className="mt-7">
        <Tabs
          label="Incident status"
          value={status}
          onChange={setStatus}
          tabs={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'open', label: 'Open', count: counts.open },
            { value: 'confirmed', label: 'Confirmed', count: counts.confirmed },
            { value: 'resolved', label: 'Resolved', count: counts.resolved },
          ]}
        />
      </div>

      {actionError ? (
        <div className="mt-5">
          <ErrorNotice
            title="The incident could not be updated"
            message={getApiErrorMessage(actionError, 'Refresh the page and try again.')}
          />
        </div>
      ) : null}

      <div className="mt-5">
        {incidentsQuery.isLoading ? (
          <LoadingRows rows={4} label="Loading incidents" />
        ) : incidentsQuery.isError ? (
          <ErrorNotice
            title="Incidents could not be loaded"
            message="Refresh the page to try again."
            onRetry={() => void incidentsQuery.refetch()}
          />
        ) : incidents.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title={status === 'all' ? 'No incidents reported' : `No ${status} incidents`}
            description={
              canManage
                ? 'There is nothing to review in this view. New damage, delay, or other reports will appear here.'
                : 'If something goes wrong during a booking, open the booking record and use “Report incident”.'
            }
          />
        ) : (
          <ul className="space-y-4">
            {incidents.map((incident) => {
              const resource = incident.resource ?? incident.booking?.resource
              const canConfirm = canManage && incident.status === 'open'
              const canResolve = canManage && incident.status !== 'resolved'

              return (
                <li key={incident.id}>
                  <SectionCard>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-1 text-[0.66rem] font-semibold capitalize',
                                incidentTone[incident.status],
                              )}
                            >
                              {incident.status}
                            </span>
                            <span className="rounded-full bg-(--tint-2) px-2.5 py-1 text-[0.66rem] font-semibold capitalize text-(--espresso)">
                              {String(incident.type).replace('_', ' ')}
                            </span>
                            {incident.suggested_by_system ? (
                              <span className="rounded-full bg-(--warning-tint-soft) px-2.5 py-1 text-[0.66rem] font-semibold text-(--warning)">
                                System suggested
                              </span>
                            ) : null}
                          </div>
                          <h2 className="mt-2 font-display text-[1.35rem] font-semibold text-(--charcoal)">
                            {resource?.name ?? `Booking #${incident.booking_id}`}
                          </h2>
                          <p className="mt-0.5 text-xs text-(--muted)">
                            Reported {formatDate(incident.created_at)}
                            {incident.reporter?.name ? ` by ${incident.reporter.name}` : ''}
                          </p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            to="/my-bookings/$bookingId"
                            params={{ bookingId: String(incident.booking_id) }}
                          >
                            Booking record
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>

                      <p className="rounded-2xl bg-(--tint-1) px-4 py-3 text-sm leading-relaxed text-(--charcoal)">
                        {incident.description}
                      </p>

                      {incident.resolution_note ? (
                        <div className="rounded-2xl border border-(--success-tint) bg-(--success-tint-soft) px-4 py-3">
                          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-(--success)">
                            Resolution
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-(--charcoal)">
                            {incident.resolution_note}
                          </p>
                        </div>
                      ) : null}

                      {canConfirm || canResolve ? (
                        <div className="flex flex-wrap gap-2 border-t border-(--border-subtle) pt-4">
                          {canConfirm ? (
                            <Button
                              size="sm"
                              onClick={() => confirmMutation.mutate(incident.id)}
                              disabled={confirmMutation.isPending}
                            >
                              {confirmMutation.isPending ? (
                                <InlineLoader label="Confirming" />
                              ) : (
                                <>
                                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                                  Confirm incident
                                </>
                              )}
                            </Button>
                          ) : null}
                          {canResolve ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openResolve(incident)}
                            >
                              <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                              Resolve with note
                            </Button>
                          ) : null}
                        </div>
                      ) : incident.status === 'confirmed' ? (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-(--error)">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Confirmed by lab staff. A manager will record the resolution.
                        </p>
                      ) : null}
                    </div>
                  </SectionCard>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Modal
        open={resolving !== null}
        title="Resolve incident"
        description="The resolution note is sent to the affected person and stored on the booking timeline."
        onClose={() => setResolving(null)}
      >
        <form onSubmit={onResolve} className="space-y-4">
          <Field
            label="Resolution"
            htmlFor="resolution-note"
            hint="Describe what was fixed, replaced, or agreed."
            error={resolveForm.formState.errors.note?.message}
          >
            <textarea
              id="resolution-note"
              rows={4}
              className={textareaClass}
              placeholder="For example: The damaged lens was replaced and the booking was closed with no charge."
              {...resolveForm.register('note')}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setResolving(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={resolveMutation.isPending}>
              {resolveMutation.isPending ? (
                <InlineLoader label="Resolving" />
              ) : (
                'Resolve incident'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default IncidentsPage
