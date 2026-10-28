import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { Dashboard } from '../features/dashboard/Dashboard'

const OwnerRoute = () => (
  <SiteLayout>
    <RouteGuard roles={['owner', 'admin']}>
      <div className="page-shell py-10 sm:py-14">
        <Dashboard />
      </div>
    </RouteGuard>
  </SiteLayout>
)

export const Route = createFileRoute('/owner')({
  component: OwnerRoute,
})
