import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
  secondaryAction?: ReactNode
  compact?: boolean
  tone?: 'neutral' | 'error'
  className?: string
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  compact,
  tone = 'neutral',
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[rgba(255,252,247,0.55)] text-center',
      compact ? 'px-5 py-8' : 'px-6 py-14',
      tone === 'error' && 'border-[rgba(164,69,59,0.3)] bg-[var(--error-soft)]',
      className,
    )}
  >
    <span
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full',
        tone === 'error'
          ? 'bg-[rgba(164,69,59,0.1)] text-[var(--error)]'
          : 'bg-[rgba(81,53,34,0.06)] text-[var(--bronze-deep)]',
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-[var(--charcoal)]">
      {title}
    </h3>
    {description ? (
      <p className="mt-1.5 max-w-md text-[0.8125rem] leading-relaxed text-[var(--muted)]">
        {description}
      </p>
    ) : null}
    {action || secondaryAction ? (
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {action}
        {secondaryAction}
      </div>
    ) : null}
  </div>
)

export default EmptyState
