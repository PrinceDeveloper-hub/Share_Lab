import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { NotificationsPage } from '../features/notifications/NotificationsPage'

export const Route = createFileRoute('/notifications')({
  component: NotificationsRoute,
})

function NotificationsRoute() {
  return (
    <SiteLayout>
      <RouteGuard>
        <div className="page-shell py-10 sm:py-14">
          <NotificationsPage />
        </div>
      </RouteGuard>
    </SiteLayout>
  )
}
