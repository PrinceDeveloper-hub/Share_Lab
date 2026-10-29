import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { AppShell } from '../components/layout/AppShell'
import { ManagerWorkspace } from '../features/manager/ManagerWorkspace'

const ManagerRoute = () => (
  <RouteGuard roles={['manager', 'admin']}>
    <AppShell>
      <ManagerWorkspace />
    </AppShell>
  </RouteGuard>
)

export const Route = createFileRoute('/manager')({
  component: ManagerRoute,
})
