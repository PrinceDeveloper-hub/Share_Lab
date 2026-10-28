import { createFileRoute } from '@tanstack/react-router'
import { Login } from '../features/auth/Login'

export interface LoginSearch {
  redirect?: string
}

const parseLoginSearch = (search: Record<string, unknown>): LoginSearch => ({
  redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
})

const LoginRoute = () => {
  const { redirect } = Route.useSearch()

  return <Login redirect={redirect} />
}

export const Route = createFileRoute('/login')({
  validateSearch: parseLoginSearch,
  component: LoginRoute,
})
