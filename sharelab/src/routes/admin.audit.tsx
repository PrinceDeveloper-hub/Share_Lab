import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { AppShell } from '../components/layout/AppShell'
import { AdminWorkspace } from '../features/admin/AdminWorkspace'

const AdminAuditRoute = () => (
  <RouteGuard roles={['admin']}>
    <AppShell>
      <AdminWorkspace initialTab="audit" />
    </AppShell>
  </RouteGuard>
)

export const Route = createFileRoute('/admin/audit')({
  component: AdminAuditRoute,
})
