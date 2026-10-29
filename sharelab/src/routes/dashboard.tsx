import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { Dashboard } from '../features/dashboard/Dashboard'

const DashboardRoute = () => (
  <SiteLayout>
    <RouteGuard>
      <div className="page-shell py-10 sm:py-14">
        <Dashboard />
      </div>
    </RouteGuard>
  </SiteLayout>
)

export const Route = createFileRoute('/dashboard')({
  component: DashboardRoute,
})
