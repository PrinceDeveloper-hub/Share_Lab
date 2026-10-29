import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { AdminDashboard } from '../features/admin/AdminDashboard'

export const Route = createFileRoute('/admin')({
  component: AdminRoute,
})

function AdminRoute() {
  return (
    <SiteLayout>
      <RouteGuard roles={['admin']}>
        <div className="page-shell py-10 sm:py-14">
          <AdminDashboard />
        </div>
      </RouteGuard>
    </SiteLayout>
  )
}
