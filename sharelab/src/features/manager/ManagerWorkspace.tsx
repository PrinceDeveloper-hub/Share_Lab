import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ClipboardCheck,
  MessageSquareWarning,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { BookingQueue } from '../../components/bookings/BookingQueue'
import { Button } from '../../components/ui/button'
import { CredentialQueue } from '../../components/credentials/CredentialQueue'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { Tabs } from '../../components/ui/Tabs'
import { useAuth } from '../../hooks/useAuth'
import { usePageMeta } from '../../hooks/usePageMeta'
import {
  useBookingQueueQuery,
  useCredentialsQuery,
  useIncidentsQuery,
} from '../../hooks/useWorkspace'
import type { Incident } from '../../lib/incidents'
import { formatDateTime } from '../../lib/format'

type ManagerTab = 'requests' | 'credentials' | 'incidents'

const incidentTone = {
  damage: 'error',
  delay: 'warning',
  other: 'neutral',
} as const

const incidentTypeLabel: Record<Incident['type'], string> = {
  damage: 'Damage',
  delay: 'Delay',
  other: 'Other',
}

const incidentsFor = (incidents: Incident[], status: Incident['status']) =>
  incidents.filter((incident) => incident.status === status)

export const ManagerWorkspace = ({
  initialTab = 'requests',
}: {
  initialTab?: ManagerTab
}) => {
  usePageMeta({
    title: 'Manager tools — ShareLab',
    description:
      'Review credential submissions and follow incidents for the resources you manage.',
  })

  const { user } = useAuth()
  const credentialsQuery = useCredentialsQuery()
  const incidentsQuery = useIncidentsQuery()
  const pendingQueue = useBookingQueueQuery({
    status: 'pending',
    perPage: 1,
    sort: 'priority',
  })
  const [tab, setTab] = useState<ManagerTab>(initialTab)

  const credentials = credentialsQuery.data?.items ?? []
  const incidents = incidentsQuery.data?.items ?? []

  const pendingCredentials = credentials.filter(
    (credential) => credential.status === 'pending',
  )
  const openIncidents = incidentsFor(incidents, 'open')
  const resolvedIncidents = incidentsFor(incidents, 'resolved')

  const pendingRequests = pendingQueue.data?.total ?? 0
  const isLoading =
    credentialsQuery.isLoading ||
    incidentsQuery.isLoading ||
    pendingQueue.isLoading
  const hasError =
    credentialsQuery.isError || incidentsQuery.isError || pendingQueue.isError

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Manager tools' },
        ]}
        eyebrow="Operations"
        title="Manager tools"
        description="Review the credentials attached to your resources and follow every incident through to resolution. Booking decisions remain tied to the request queue."
        actions={
          <Button asChild variant="secondary">
            <Link to="/resources">Resource catalogue</Link>
          </Button>
        }
      />{' '}
      <section
        aria-label="Manager summary"
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-28 w-full rounded-[var(--radius-lg)]"
            />
          ))
        ) : (
          <>
            <StatCard
              label="Pending requests"
              value={pendingQueue.isLoading ? '—' : pendingRequests}
              hint="Waiting for a booking decision"
              icon={ClipboardCheck}
            />
            <StatCard
              label="Pending credentials"
              value={pendingCredentials.length}
              hint="Waiting for a verification decision"
              icon={ShieldCheck}
            />
            <StatCard
              label="Open incidents"
              value={openIncidents.length}
              hint="Recorded and still unresolved"
              icon={MessageSquareWarning}
            />
            <StatCard
              label="Resolved"
              value={resolvedIncidents.length}
              hint="Closed incidents on record"
              icon={ClipboardCheck}
            />
          </>
        )}
      </section>
      {hasError ? (
        <p className="mt-5 flex items-start gap-2 rounded-[var(--radius-md)] border border-[rgba(164,69,59,0.22)] bg-[var(--error-soft)] px-4 py-3 text-[0.78rem] leading-relaxed text-[var(--error)]">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          Some manager data could not be loaded. Nothing has been changed — try
          again below.
        </p>
      ) : null}
      <Tabs
        label="Manager sections"
        value={tab}
        onChange={setTab}
        className="mt-7"
        items={[
          {
            value: 'requests',
            label: 'Booking requests',
            count: pendingRequests,
          },
          {
            value: 'credentials',
            label: 'Credential review',
            count: pendingCredentials.length,
          },
          { value: 'incidents', label: 'Incidents', count: incidents.length },
        ]}
      />
      <div className="mt-5">
        {tab === 'requests' ? (
          <BookingQueue />
        ) : tab === 'credentials' ? (
          isLoading ? (
            <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : credentialsQuery.isError ? (
            <EmptyState
              icon={AlertTriangle}
              tone="error"
              title="Credential queue could not be loaded"
              description="The API did not respond. Try again in a moment."
              action={
                <Button
                  variant="secondary"
                  onClick={() => void credentialsQuery.refetch()}
                >
                  Try again
                </Button>
              }
            />
          ) : (
            <CredentialQueue
              credentials={credentials}
              emptyTitle="No credentials waiting for review"
              emptyDescription="Pending submissions for the resources you manage will appear here."
            />
          )
        ) : incidentsQuery.isLoading ? (
          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : incidentsQuery.isError ? (
          <EmptyState
            icon={AlertTriangle}
            tone="error"
            title="Incidents could not be loaded"
            description="The API did not respond. Try again in a moment."
            action={
              <Button
                variant="secondary"
                onClick={() => void incidentsQuery.refetch()}
              >
                Try again
              </Button>
            }
          />
        ) : incidents.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No incidents on record"
            description="Incidents raised against bookings for your resources will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)]">
            <ul className="divide-y divide-[var(--border-subtle)]">
              {incidents.map((incident) => (
                <li
                  key={incident.id}
                  className="flex flex-wrap items-start gap-x-4 gap-y-2 px-4 py-3.5 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={incidentTone[incident.type]}>
                        {incidentTypeLabel[incident.type]}
                      </Badge>
                      <span className="font-mono text-[0.68rem] text-[var(--muted)]">
                        Booking #{incident.booking_id}
                      </span>
                      {incident.suggested_by_system ? (
                        <Badge tone="bronze">System suggested</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--charcoal)]">
                      {incident.description}
                    </p>
                    <p className="mt-1 font-mono text-[0.68rem] text-[var(--muted)]">
                      {incident.created_at
                        ? formatDateTime(incident.created_at)
                        : 'Recorded'}
                      {incident.resolution_note
                        ? ` · ${incident.resolution_note}`
                        : ''}
                    </p>
                  </div>
                  <Badge
                    tone={incident.status === 'open' ? 'warning' : 'success'}
                    dot
                  >
                    {incident.status === 'open' ? 'Open' : 'Resolved'}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {user?.role === 'admin' ? (
        <p className="mt-5 text-[0.75rem] text-[var(--muted)]">
          Incidents are resolved from{' '}
          <Link
            to="/admin"
            className="font-semibold text-[var(--espresso)] hover:underline"
          >
            platform administration
          </Link>
          .
        </p>
      ) : (
        <p className="mt-5 text-[0.75rem] leading-relaxed text-[var(--muted)]">
          Incidents are reviewed here. Resolution is recorded by an
          administrator so the audit trail stays consistent.
        </p>
      )}
    </>
  )
}

export default ManagerWorkspace
