import { createFileRoute } from '@tanstack/react-router'
import { Register } from '../features/auth/Register'

export interface RegisterSearch {
  redirect?: string
}

const parseRegisterSearch = (search: Record<string, unknown>): RegisterSearch => ({
  redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
})

const RegisterRoute = () => {
  const { redirect } = Route.useSearch()

  return <Register redirect={redirect} />
}

export const Route = createFileRoute('/register')({
  validateSearch: parseRegisterSearch,
  component: RegisterRoute,
})
