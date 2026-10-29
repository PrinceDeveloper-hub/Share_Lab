import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getSafeRedirect } from '../../lib/auth'

export interface GuestGuardProps {
  children: React.ReactNode
  redirect?: string
}

const SessionCheck = () => (
  <div className="flex min-h-dvh items-center justify-center bg-[#f4eee5] px-6">
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-full border border-[rgba(82,59,45,0.14)] bg-[rgba(255,252,247,0.78)] px-5 py-3 text-sm font-medium text-(--muted) shadow-[0_18px_50px_-32px_rgba(75,47,31,0.5)] backdrop-blur-xl"
    >
      <Loader2
        className="h-4 w-4 animate-spin text-(--espresso)"
        aria-hidden="true"
      />
      Checking your session...
    </div>
  </div>
)

/**
 * Only anonymous visitors may see the sign-in and sign-up screens.
 * Signed-in visitors are sent to their intended destination.
 */
export const GuestGuard = ({ children, redirect }: GuestGuardProps) => {
  const { status } = useAuth()
  const router = useRouter()
  const destination = getSafeRedirect(redirect)

  useEffect(() => {
    if (status === 'authenticated') {
      router.history.replace(destination)
    }
  }, [destination, router, status])

  if (status === 'loading') return <SessionCheck />
  if (status === 'authenticated') return <SessionCheck />

  return <>{children}</>
}

export default GuestGuard
