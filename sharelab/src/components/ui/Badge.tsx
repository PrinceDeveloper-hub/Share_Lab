import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export type BadgeTone =
  'neutral' | 'bronze' | 'espresso' | 'success' | 'warning' | 'error' | 'info'

export interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  dot?: boolean
  icon?: ReactNode
  className?: string
}

const toneStyles: Record<BadgeTone, string> = {
  neutral:
    'border-[var(--border-subtle)] bg-[var(--soft-beige)] text-[var(--muted)]',
  bronze:
    'border-[rgba(167,130,96,0.32)] bg-[rgba(167,130,96,0.1)] text-[var(--bronze-deep)]',
  espresso:
    'border-[rgba(81,53,34,0.22)] bg-[rgba(81,53,34,0.08)] text-[var(--espresso)]',
  success:
    'border-[rgba(63,107,79,0.24)] bg-[var(--success-soft)] text-[var(--success)]',
  warning:
    'border-[rgba(156,107,36,0.26)] bg-[var(--warning-soft)] text-[var(--warning)]',
  error:
    'border-[rgba(164,69,59,0.24)] bg-[var(--error-soft)] text-[var(--error)]',
  info: 'border-[rgba(60,90,116,0.22)] bg-[var(--info-soft)] text-[var(--info)]',
}

const dotStyles: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--muted)]',
  bronze: 'bg-[var(--bronze-deep)]',
  espresso: 'bg-[var(--espresso)]',
  success: 'bg-[var(--success)]',
  warning: 'bg-[var(--warning)]',
  error: 'bg-[var(--error)]',
  info: 'bg-[var(--info)]',
}

export const Badge = ({
  children,
  tone = 'neutral',
  dot,
  icon,
  className,
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium leading-5',
        toneStyles[tone],
        className,
      )}
    >
      {dot ? (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotStyles[tone])}
          aria-hidden="true"
        />
      ) : null}
      {icon}
      {children}
    </span>
  )
}

export default Badge
