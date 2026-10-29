import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface FormAlertProps {
  children: React.ReactNode
  variant?: 'error' | 'success' | 'info'
  className?: string
}

export const FormAlert = ({
  children,
  variant = 'error',
  className,
}: FormAlertProps) => {
  const Icon =
    variant === 'success'
      ? CheckCircle2
      : variant === 'info'
        ? Info
        : AlertCircle

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed',
        variant === 'error' &&
          'border-[rgba(180,77,66,0.2)] bg-[rgba(180,77,66,0.07)] text-(--error)',
        variant === 'success' &&
          'border-[rgba(56,118,83,0.2)] bg-[rgba(56,118,83,0.07)] text-(--success)',
        variant === 'info' &&
          'border-[rgba(75,47,31,0.12)] bg-[rgba(75,47,31,0.045)] text-(--muted)',
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
