import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
<<<<<<< HEAD
import { AppShell } from '../components/layout/AppShell'
import { OwnerWorkspace } from '../features/owner/OwnerWorkspace'

const OwnerRoute = () => (
  <RouteGuard roles={['owner', 'admin']}>
    <AppShell>
      <OwnerWorkspace />
    </AppShell>
  </RouteGuard>
)
=======
import { SiteLayout } from '../components/layout/SiteLayout'
import { OwnerDashboard } from '../features/owner/OwnerDashboard'
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec

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
