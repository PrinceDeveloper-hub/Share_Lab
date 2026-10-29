import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type BadgeTone =
  | 'neutral'
  | 'bronze'
  | 'success'
  | 'warning'
  | 'error'
  | 'espresso'
  | 'inverse'

interface BadgeProps {
  tone?: BadgeTone
  /** Optional leading icon (already sized by the caller, e.g. h-3.5 w-3.5). */
  icon?: ReactNode
  className?: string
  children: ReactNode
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-(--soft-beige) text-(--muted-strong) border-(--border-subtle)',
  bronze: 'bg-[rgba(167,130,96,0.12)] text-(--bronze-deep) border-[rgba(167,130,96,0.28)]',
  success: 'bg-[rgba(53,107,76,0.1)] text-(--success) border-[rgba(53,107,76,0.22)]',
  warning: 'bg-[rgba(154,107,34,0.1)] text-(--warning) border-[rgba(154,107,34,0.24)]',
  error: 'bg-[rgba(169,72,60,0.1)] text-(--error) border-[rgba(169,72,60,0.22)]',
  espresso: 'bg-(--espresso) text-(--cream) border-transparent',
  inverse: 'bg-[rgba(255,252,247,0.14)] text-(--cream) border-[rgba(255,252,247,0.24)]',
}

const Badge = ({ tone = 'neutral', icon, className, children }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-[0.4rem] border px-2 py-0.5 text-[0.6875rem] font-semibold tracking-[0.01em]',
      toneClasses[tone],
      className,
    )}
  >
    {icon}
    {children}
  </span>
)

export { Badge }
export type { BadgeProps, BadgeTone }
