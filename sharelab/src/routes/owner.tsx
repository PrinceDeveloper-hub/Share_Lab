import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { AppShell } from '../components/layout/AppShell'
import { OwnerWorkspace } from '../features/owner/OwnerWorkspace'

const OwnerRoute = () => (
  <RouteGuard roles={['owner', 'admin']}>
    <AppShell>
      <OwnerWorkspace />
    </AppShell>
  </RouteGuard>
)

export const Route = createFileRoute('/owner')({
  component: OwnerRoute,
})
