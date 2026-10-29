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
  success: 'bg-(--success-tint) text-(--success) border-(--success-tint)',
  warning: 'bg-(--warning-tint) text-(--warning) border-(--warning-tint)',
  error: 'bg-(--error-tint) text-(--error) border-(--error-tint)',
  espresso: 'bg-(--espresso) text-(--accent-contrast) border-transparent',
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
