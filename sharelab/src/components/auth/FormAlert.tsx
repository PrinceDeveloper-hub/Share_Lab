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
        'flex items-start gap-2.5 rounded-[var(--radius-sm)] border px-3.5 py-2.5 text-[0.8125rem] leading-relaxed',
        variant === 'error' &&
<<<<<<< HEAD
          'border-[rgba(164,69,59,0.22)] bg-[var(--error-soft)] text-[var(--error)]',
        variant === 'success' &&
          'border-[rgba(63,107,79,0.22)] bg-[var(--success-soft)] text-[var(--success)]',
        variant === 'info' &&
          'border-[var(--border-subtle)] bg-[rgba(239,230,217,0.5)] text-[var(--muted)]',
=======
          'border-[rgba(169,72,60,0.2)] bg-[rgba(169,72,60,0.07)] text-(--error)',
        variant === 'success' &&
          'border-[rgba(53,107,76,0.2)] bg-[rgba(53,107,76,0.07)] text-(--success)',
        variant === 'info' &&
          'border-[rgba(81,53,34,0.12)] bg-[rgba(81,53,34,0.045)] text-(--muted)',
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

export default FormAlert
