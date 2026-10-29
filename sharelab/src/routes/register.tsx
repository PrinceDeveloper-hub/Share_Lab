import { createFileRoute } from '@tanstack/react-router'
import { GuestGuard } from '../components/auth/GuestGuard'
import { Register } from '../features/auth/Register'

export interface RegisterSearch {
  redirect?: string
}

const parseRegisterSearch = (
  search: Record<string, unknown>,
): RegisterSearch => ({
  redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
})

const RegisterRoute = () => {
  const { redirect } = Route.useSearch()

  return (
    <GuestGuard redirect={redirect}>
      <Register redirect={redirect} />
    </GuestGuard>
  )
}

export const Route = createFileRoute('/register')({
  validateSearch: parseRegisterSearch,
  component: RegisterRoute,
})
