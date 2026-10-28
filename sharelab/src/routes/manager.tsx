import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { Dashboard } from '../features/dashboard/Dashboard'

const ManagerRoute = () => (
  <SiteLayout>
    <RouteGuard roles={['manager', 'admin']}>
      <div className="page-shell py-10 sm:py-14">
        <Dashboard />
      </div>
    </RouteGuard>
  </SiteLayout>
)

export const Route = createFileRoute('/manager')({
  component: ManagerRoute,
})
