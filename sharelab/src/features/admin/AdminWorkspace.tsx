import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ClipboardList,
  FileClock,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/EmptyState'
import { FormAlert } from '../../components/auth/FormAlert'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { Tabs } from '../../components/ui/Tabs'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useResources } from '../../hooks/useResources'
import {
  useAdminUsersQuery,
  useAuditLogQuery,
  useCredentialsQuery,
  useIncidentsQuery,
  useResolveIncident,
  useUpdateUserRole,
} from '../../hooks/useWorkspace'
import { getApiErrorMessage } from '../../lib/api-client'
import type { User } from '../../lib/api-client'
import type { Incident } from '../../lib/incidents'
import { formatDateTime } from '../../lib/format'
import { cn } from '../../lib/utils'

export type AdminTab = 'overview' | 'users' | 'audit' | 'incidents'

const roleTone = {
  admin: 'error',
  manager: 'warning',
  owner: 'bronze',
  user: 'neutral',
} as const

const roleOptions: User['role'][] = ['user', 'owner', 'manager', 'admin']

export const AdminWorkspace = ({
  initialTab = 'overview',
}: {
  initialTab?: AdminTab
}) => {
  usePageMeta({
    title: 'Platform administration — ShareLab',
    description:
      'Manage user roles, review audit history and resolve incidents across ShareLab.',
  })

  const [tab, setTab] = useState<AdminTab>(initialTab)
  const [roleDrafts, setRoleDrafts] = useState<
    Record<number, User['role'] | undefined>
  >({})
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)
  const [resolveTarget, setResolveTarget] = useState<Incident | null>(null)
  const [resolveNote, setResolveNote] = useState('')
  const [auditSearch, setAuditSearch] = useState('')

  const usersQuery = useAdminUsersQuery()
  const auditQuery = useAuditLogQuery()
  const incidentsQuery = useIncidentsQuery()
  const credentialsQuery = useCredentialsQuery()
  const resourcesQuery = useResources({ perPage: 1 })

  const updateRole = useUpdateUserRole()
  const resolveIncident = useResolveIncident()

  const users = usersQuery.data?.items ?? []
  const auditEntries = auditQuery.data?.items ?? []
  const incidents = incidentsQuery.data?.items ?? []
  const credentials = credentialsQuery.data?.items ?? []
  const openIncidents = incidents.filter(
    (incident) => incident.status === 'open',
  )
  const pendingCredentials = credentials.filter(
    (credential) => credential.status === 'pending',
  )
  const totalResources = resourcesQuery.data?.meta?.total ?? 0

  const saveRole = async (userId: number) => {
    const role = roleDrafts[userId]
    if (!role) return

    try {
      await updateRole.mutateAsync({ userId, role })
      setRoleDrafts((current) => {
        const next = { ...current }
        delete next[userId]
        return next
      })
      setFeedback({ tone: 'success', message: `Role updated to ${role}.` })
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: getApiErrorMessage(error, 'The role could not be updated.'),
      })
    }
  }

  const confirmResolve = async () => {
    if (!resolveTarget) return

    try {
      await resolveIncident.mutateAsync({
        incidentId: resolveTarget.id,
        note: resolveNote,
      })
      setFeedback({
        tone: 'success',
        message: `Incident #${resolveTarget.id} resolved.`,
      })
      setResolveTarget(null)
      setResolveNote('')
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: getApiErrorMessage(
          error,
          'The incident could not be resolved.',
        ),
      })
    }
  }

  const filteredAudit = auditEntries.filter((entry) => {
    const term = auditSearch.trim().toLowerCase()
    if (!term) return true
    return (
      entry.action.toLowerCase().includes(term) ||
      entry.actor?.name.toLowerCase().includes(term) ||
      entry.reason?.toLowerCase().includes(term) ||
      String(entry.booking_id ?? '').includes(term)
    )
  })

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Platform administration' },
        ]}
        eyebrow="Administration"
        title="Platform administration"
        description="The operational state of ShareLab: users, listings, credential review, incidents and the audit trail."
        actions={
          <Button asChild variant="secondary">
            <Link to="/credentials">Credential review</Link>
          </Button>
        }
      />

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
              ×
            </button>
          </div>
        </FormAlert>
      ) : null}

      <section
        aria-label="Platform summary"
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {usersQuery.isLoading || incidentsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-28 w-full rounded-[var(--radius-lg)]"
            />
          ))
        ) : (
          <>
            <StatCard
              label="Users"
              value={usersQuery.data?.total ?? users.length}
              hint="Accounts across every role"
              icon={Users}
            />
            <StatCard
              label="Resources"
              value={resourcesQuery.isSuccess ? totalResources : '—'}
              hint="Listings in the catalogue"
              icon={ClipboardList}
            />
            <StatCard
              label="Open incidents"
              value={openIncidents.length}
              hint="Awaiting resolution"
              icon={AlertTriangle}
            />
            <StatCard
              label="Pending credentials"
              value={pendingCredentials.length}
              hint="Waiting for verification"
              icon={ShieldCheck}
            />
          </>
        )}
      </section>

      <Tabs
        label="Administration sections"
        value={tab}
        onChange={setTab}
        className="mt-7"
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'users', label: 'Users', count: users.length },
          { value: 'audit', label: 'Audit log', count: auditEntries.length },
          {
            value: 'incidents',
            label: 'Incidents',
            count: openIncidents.length,
          },
        ]}
      />

      <div className="mt-5">
        {tab === 'overview' ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: 'User access',
                text: 'Review account roles. Role changes take effect immediately and are recorded.',
                action: () => setTab('users'),
                cta: 'Manage users',
              },
              {
                title: 'Audit trail',
                text: 'Every decision, check-in and credential change is written to an append-only log.',
                action: () => setTab('audit'),
                cta: 'Open audit log',
              },
              {
                title: 'Incidents',
                text: 'Resolve damage, delay and other incidents with a recorded note.',
                action: () => setTab('incidents'),
                cta: 'Review incidents',
              },
              {
                title: 'Credential review',
                text: 'Pending submissions wait for a verification decision before they count.',
                action: () => setTab('users'),
                cta: 'Review credentials',
              },
            ].map((card) => (
              <section
                key={card.title}
                className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5"
              >
                <h2 className="text-[0.9375rem] font-semibold text-[var(--charcoal)]">
                  {card.title}
                </h2>
                <p className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                  {card.text}
                </p>
                {card.title === 'Credential review' ? (
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="mt-4 self-start"
                  >
                    <Link to="/credentials">{card.cta}</Link>
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4 self-start"
                    onClick={card.action}
                  >
                    {card.cta}
                  </Button>
                )}
              </section>
            ))}
          </div>
        ) : null}

        {tab === 'users' ? (
          usersQuery.isLoading ? (
            <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : usersQuery.isError ? (
            <EmptyState
              icon={AlertTriangle}
              tone="error"
              title="Users could not be loaded"
              description="The API did not respond. Try again in a moment."
              action={
                <Button
                  variant="secondary"
                  onClick={() => void usersQuery.refetch()}
                >
                  Try again
                </Button>
              }
            />
          ) : users.length === 0 ? (
            <EmptyState icon={Users} title="No user accounts found" />
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)]">
              <div className="hidden grid-cols-[1.6fr_1.6fr_0.7fr_1fr_auto] gap-3 border-b border-[var(--border-subtle)] px-5 py-3 md:grid">
                {['Name', 'Email', 'Role', 'Change role', ''].map((heading) => (
                  <span
                    key={heading}
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]"
                  >
                    {heading}
                  </span>
                ))}
              </div>
              <ul className="divide-y divide-[var(--border-subtle)]">
                {users.map((account) => {
                  const draft = roleDrafts[account.id] ?? account.role
                  const changed = draft !== account.role

                  return (
                    <li
                      key={account.id}
                      className="grid gap-2 px-4 py-3.5 md:grid-cols-[1.6fr_1.6fr_0.7fr_1fr_auto] md:items-center md:gap-3 md:px-5"
                    >
                      <span className="text-[0.8125rem] font-medium text-[var(--charcoal)]">
                        {account.name}
                      </span>
                      <span className="truncate text-[0.75rem] text-[var(--muted)]">
                        {account.email}
                      </span>
                      <Badge tone={roleTone[account.role]} dot>
                        {account.role}
                      </Badge>
                      <select
                        aria-label={`Role for ${account.name}`}
                        value={draft}
                        onChange={(event) =>
                          setRoleDrafts((current) => ({
                            ...current,
                            [account.id]: event.target.value as User['role'],
                          }))
                        }
                        className="h-8 rounded-[0.375rem] border border-[var(--border-subtle)] bg-white px-2 text-[0.75rem] text-[var(--charcoal)] outline-none focus:border-[rgba(81,53,34,0.5)]"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant={changed ? 'default' : 'secondary'}
                        disabled={!changed || updateRole.isPending}
                        onClick={() => void saveRole(account.id)}
                        className="justify-self-start md:justify-self-end"
                      >
                        Save
                      </Button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        ) : null}

        {tab === 'audit' ? (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.75rem] text-[var(--muted)]">
                {auditQuery.isLoading
                  ? 'Loading audit entries…'
                  : `Showing ${filteredAudit.length} of ${auditEntries.length} recent entries`}
              </p>
              <input
                type="search"
                value={auditSearch}
                onChange={(event) => setAuditSearch(event.target.value)}
                placeholder="Filter by action, actor or booking"
                aria-label="Filter audit entries"
                className="h-8 w-full rounded-[0.375rem] border border-[var(--border-subtle)] bg-[var(--cream)] px-2.5 text-[0.75rem] text-[var(--charcoal)] outline-none placeholder:text-[rgba(113,104,95,0.7)] focus:border-[rgba(81,53,34,0.5)] sm:w-72"
              />
            </div>

            {auditQuery.isLoading ? (
              <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : auditQuery.isError ? (
              <EmptyState
                icon={AlertTriangle}
                tone="error"
                title="Audit history could not be loaded"
                description="The API did not respond. Nothing has been changed."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => void auditQuery.refetch()}
                  >
                    Try again
                  </Button>
                }
              />
            ) : filteredAudit.length === 0 ? (
              <EmptyState
                icon={FileClock}
                title="No audit entries match"
                description="Adjust the filter to see more of the recorded history."
              />
            ) : (
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)]">
                <ul className="divide-y divide-[var(--border-subtle)]">
                  {filteredAudit.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-start gap-x-4 gap-y-1 px-4 py-3 sm:px-5"
                    >
                      <span className="mono w-[8.5rem] shrink-0 text-[0.68rem] text-[var(--muted)]">
                        {entry.created_at
                          ? formatDateTime(entry.created_at)
                          : '—'}
                      </span>
                      <span className="w-[9rem] shrink-0 truncate text-[0.78rem] font-medium text-[var(--charcoal)]">
                        {entry.actor?.name ?? 'System'}
                      </span>
                      <span className="min-w-0 flex-1 text-[0.75rem] text-[var(--muted)]">
                        <span className="font-mono text-[0.7rem] text-[var(--bronze-deep)]">
                          {entry.action}
                        </span>
                        {entry.booking_id
                          ? ` · booking #${entry.booking_id}`
                          : ''}
                        {entry.reason ? ` — ${entry.reason}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {tab === 'incidents' ? (
          incidentsQuery.isLoading ? (
            <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4">
              {Array.from({ length: 5 }).map((_, index) => (
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
              icon={AlertTriangle}
              title="No incidents on record"
              description="Incidents raised against bookings will appear here."
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
                        <Badge
                          tone={
                            incident.type === 'damage'
                              ? 'error'
                              : incident.type === 'delay'
                                ? 'warning'
                                : 'neutral'
                          }
                        >
                          {incident.type}
                        </Badge>
                        <span className="font-mono text-[0.68rem] text-[var(--muted)]">
                          Booking #{incident.booking_id}
                        </span>
                        {incident.suggested_by_system ? (
                          <Badge tone="bronze">System suggested</Badge>
                        ) : null}
                        <Badge
                          tone={
                            incident.status === 'open' ? 'warning' : 'success'
                          }
                          dot
                        >
                          {incident.status}
                        </Badge>
                      </div>
                      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--charcoal)]">
                        {incident.description}
                      </p>
                      <p className="mt-1 font-mono text-[0.68rem] text-[var(--muted)]">
                        {incident.created_at
                          ? formatDateTime(incident.created_at)
                          : ''}
                        {incident.resolution_note
                          ? ` · ${incident.resolution_note}`
                          : ''}
                      </p>
                    </div>
                    {incident.status === 'open' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setResolveTarget(incident)
                          setResolveNote('')
                        }}
                      >
                        Resolve
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : null}
      </div>

      <p className="mt-5 text-[0.75rem] leading-relaxed text-[var(--muted)]">
        Destructive changes are confirmed before they are applied. The audit log
        cannot be edited or deleted.
      </p>

      <Modal
        open={Boolean(resolveTarget)}
        onClose={() => setResolveTarget(null)}
        title="Resolve incident"
        description={
          resolveTarget
            ? `Booking #${resolveTarget.booking_id} · ${resolveTarget.type}`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setResolveTarget(null)}
              disabled={resolveIncident.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void confirmResolve()}
              disabled={resolveIncident.isPending}
            >
              {resolveIncident.isPending ? 'Saving…' : 'Resolve incident'}
            </Button>
          </>
        }
      >
        <label
          htmlFor="resolve-note"
          className="block text-[0.75rem] font-semibold text-[var(--charcoal)]"
        >
          Resolution note
          <span className="ml-1 font-normal text-[var(--muted)]">
            (optional)
          </span>
        </label>
        <textarea
          id="resolve-note"
          rows={3}
          value={resolveNote}
          onChange={(event) => setResolveNote(event.target.value)}
          placeholder="What was agreed or repaired?"
          className={cn(
            'mt-1.5 w-full resize-none rounded-[0.5rem] border border-[var(--border-subtle)] bg-white px-3 py-2',
            'text-[0.8125rem] text-[var(--charcoal)] outline-none placeholder:text-[rgba(113,104,95,0.7)]',
            'focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]',
          )}
        />
      </Modal>
    </>
  )
}

export default AdminWorkspace
