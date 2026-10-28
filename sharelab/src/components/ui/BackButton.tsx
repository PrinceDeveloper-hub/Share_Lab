import { ArrowLeft } from 'lucide-react'
import { useCanGoBack, useRouter } from '@tanstack/react-router'
import { cn } from '../../lib/utils'

export interface BackButtonProps {
  fallback?: string
  label?: string
  className?: string
}

export const BackButton = ({
  fallback = '/',
  label = 'Back',
  className,
}: BackButtonProps) => {
  const canGoBack = useCanGoBack()
  const router = useRouter()

  const goBack = () => {
    if (canGoBack) {
      router.history.back()
      return
    }

    router.history.push(fallback)
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:bg-[rgba(75,47,31,0.06)] hover:text-[var(--espresso)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ivory)]',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  )
}
