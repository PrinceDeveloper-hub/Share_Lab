import type { InputHTMLAttributes, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  icon?: LucideIcon
  trailing?: ReactNode
}

export const AuthField = ({
  id,
  label,
  error,
  hint,
  icon: Icon,
  trailing,
  className,
  ...props
}: AuthFieldProps) => {
  const describedBy = [
    hint ? `${id}-hint` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--charcoal)]">
        {label}
      </label>
      <div className="relative mt-2">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-[var(--taupe)]"
            aria-hidden="true"
          />
        ) : null}
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            'h-11 w-full rounded-xl border bg-[rgba(255,252,247,0.88)] px-3.5 text-sm text-[var(--charcoal)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none transition placeholder:text-[rgba(117,103,94,0.7)] focus:border-[rgba(75,47,31,0.45)] focus:ring-4 focus:ring-[rgba(75,47,31,0.1)]',
            Icon ? 'pl-11' : '',
            trailing ? 'pr-12' : '',
            error
              ? 'border-[rgba(180,77,66,0.55)] bg-[rgba(180,77,66,0.035)]'
              : 'border-[rgba(82,59,45,0.16)]',
            className,
          )}
          {...props}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>
        ) : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-start gap-1.5 text-xs font-medium leading-relaxed text-[var(--error)]"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
