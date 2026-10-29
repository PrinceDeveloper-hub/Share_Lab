import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
<<<<<<< HEAD
import { AppShell } from '../components/layout/AppShell'
import { ManagerWorkspace } from '../features/manager/ManagerWorkspace'

const ManagerRoute = () => (
  <RouteGuard roles={['manager', 'admin']}>
    <AppShell>
      <ManagerWorkspace />
    </AppShell>
  </RouteGuard>
)
=======
import { SiteLayout } from '../components/layout/SiteLayout'
import { ManagerDashboard } from '../features/manager/ManagerDashboard'
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec

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
