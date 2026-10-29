import { useState } from 'react'
import { Bell, CheckCheck, ExternalLink, Inbox } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '../../components/ui/button'
import { Pagination } from '../../components/ui/pagination'
import {
  EmptyState,
  ErrorNotice,
  LoadingRows,
  PageHeader,
  SectionCard,
} from '../../components/ui/workspace'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  usePrefetchNotifications,
} from '../../hooks/useNotifications'
import { getApiErrorMessage } from '../../lib/api-client'
import { cn } from '../../lib/utils'

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const notificationLabel = (type: string) =>
  type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const PER_PAGE = 10

export const NotificationsPage = () => {
  const [page, setPage] = useState(1)
  const notificationsQuery = useNotifications(page, PER_PAGE)
  const prefetch = usePrefetchNotifications(PER_PAGE)
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const notifications = notificationsQuery.data?.data ?? []
  const meta = notificationsQuery.data?.meta
  const unread = notifications.filter((notification) => !notification.read)
  const error = markRead.error ?? markAll.error

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        description="Decisions, waitlist offers, handover reminders, and incident updates appear here. Unread items also show a count in the account menu."
        actions={
          <Button
            variant="secondary"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || unread.length === 0}
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            {markAll.isPending ? 'Marking...' : 'Mark all read'}
          </Button>
        }
      />

      {error ? (
        <div className="mt-5">
          <ErrorNotice
            title="That update could not be saved"
            message={getApiErrorMessage(
              error,
              'Refresh the page and try again.',
            )}
          />
        </div>
      ) : null}

      <SectionCard className="mt-6 p-0 sm:p-0">
        <div className="flex items-center justify-between gap-3 border-b border-(--border-subtle) px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-(--espresso)" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-(--charcoal)">Inbox</h2>
          </div>
          <p className="text-xs font-medium text-(--muted)" aria-live="polite">
            {unread.length} unread on this page ·{' '}
            {meta?.total ?? notifications.length} total
          </p>
        </div>

        {notificationsQuery.isLoading ? (
          <div className="p-5">
            <LoadingRows rows={4} label="Loading notifications" />
          </div>
        ) : notificationsQuery.isError ? (
          <div className="p-5">
            <ErrorNotice
              title="Notifications could not be loaded"
              message="Refresh the page to try again."
              onRetry={() => void notificationsQuery.refetch()}
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Inbox}
              title="Nothing in your inbox"
              description="When a request is decided, a waitlist offer is sent, or an incident changes, the update will appear here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-(--border-subtle)">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={cn(
                  'flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between',
                  !notification.read && 'bg-(--warning-tint-soft)',
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        'text-sm text-(--charcoal)',
                        notification.read ? 'font-medium' : 'font-semibold',
                      )}
                    >
                      {notificationLabel(notification.type)}
                    </p>
                    {!notification.read ? (
                      <span className="rounded-full bg-(--warning-tint) px-2 py-0.5 text-[0.62rem] font-semibold text-(--warning)">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-(--muted)">
                    {notification.message}
                  </p>
                  <p className="mt-1.5 text-[0.68rem] text-(--muted)">
                    {formatDate(notification.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {notification.booking_id ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        to="/my-bookings/$bookingId"
                        params={{ bookingId: String(notification.booking_id) }}
                        onClick={() => {
                          if (!notification.read)
                            markRead.mutate(notification.id)
                        }}
                      >
                        Open booking
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                  ) : null}
                  {!notification.read ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => markRead.mutate(notification.id)}
                      disabled={markRead.isPending}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {notificationsQuery.data ? (
        <Pagination
          label="Notification pagination"
          page={page}
          lastPage={meta?.last_page ?? 1}
          total={meta?.total}
          perPage={meta?.per_page ?? PER_PAGE}
          isFetching={notificationsQuery.isFetching}
          onPageChange={setPage}
          onPrefetch={(nextPage) => void prefetch(nextPage)}
        />
      ) : null}
    </div>
  )
}

export default NotificationsPage
