import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { AppShell } from '../components/layout/AppShell'
import { Dashboard } from '../features/dashboard/Dashboard'

const DashboardRoute = () => (
  <RouteGuard>
    <AppShell>
      <Dashboard />
    </AppShell>
  </RouteGuard>
)

export const Route = createFileRoute('/dashboard')({
  component: DashboardRoute,
})
