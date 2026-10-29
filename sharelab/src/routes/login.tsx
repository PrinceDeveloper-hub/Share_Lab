import { createFileRoute } from '@tanstack/react-router'
import { GuestGuard } from '../components/auth/GuestGuard'
import { Login } from '../features/auth/Login'

export interface LoginSearch {
  redirect?: string
}

const parseLoginSearch = (search: Record<string, unknown>): LoginSearch => ({
  redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
})

const LoginRoute = () => {
  const { redirect } = Route.useSearch()

  return (
    <GuestGuard redirect={redirect}>
      <Login redirect={redirect} />
    </GuestGuard>
  )
}

export const Route = createFileRoute('/login')({
  validateSearch: parseLoginSearch,
  component: LoginRoute,
})
