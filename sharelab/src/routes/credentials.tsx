import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { AppShell } from '../components/layout/AppShell'
import { Credentials } from '../features/credentials/Credentials'

const CredentialsRoute = () => (
  <RouteGuard>
    <AppShell>
      <Credentials />
    </AppShell>
  </RouteGuard>
)

export const Route = createFileRoute('/credentials')({
  component: CredentialsRoute,
})
