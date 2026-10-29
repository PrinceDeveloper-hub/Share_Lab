import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { ManagerDashboard } from '../features/manager/ManagerDashboard'

export const Route = createFileRoute('/manager')({
  component: ManagerRoute,
})

function ManagerRoute() {
  return (
    <SiteLayout>
      <RouteGuard roles={['manager']}>
        <div className="page-shell py-10 sm:py-14">
          <ManagerDashboard />
        </div>
      </RouteGuard>
    </SiteLayout>
  )
}
