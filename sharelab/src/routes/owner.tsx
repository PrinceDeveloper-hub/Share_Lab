import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { OwnerDashboard } from '../features/owner/OwnerDashboard'

export const Route = createFileRoute('/owner')({
  component: OwnerRoute,
})

function OwnerRoute() {
  return (
    <SiteLayout>
      <RouteGuard roles={['owner']}>
        <div className="page-shell py-10 sm:py-14">
          <OwnerDashboard />
        </div>
      </RouteGuard>
    </SiteLayout>
  )
}
