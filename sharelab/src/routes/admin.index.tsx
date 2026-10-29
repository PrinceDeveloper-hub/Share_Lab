import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { AppShell } from '../components/layout/AppShell'
import { AdminWorkspace } from '../features/admin/AdminWorkspace'

const AdminRoute = () => (
  <RouteGuard roles={['admin']}>
    <AppShell>
      <AdminWorkspace />
    </AppShell>
  </RouteGuard>
)

export const Route = createFileRoute('/admin/')({
  component: AdminRoute,
})
