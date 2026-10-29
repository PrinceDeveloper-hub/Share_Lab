import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface StatCardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: LucideIcon
  className?: string
}

export const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) => (
  <div
    className={cn(
      'flex flex-col justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4 sm:p-5',
      className,
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </span>
      {Icon ? (
        <Icon
          className="h-4 w-4 text-[var(--bronze-deep)]"
          aria-hidden="true"
        />
      ) : null}
    </div>
    <div>
      <p className="font-display text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-[var(--charcoal)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[0.75rem] leading-relaxed text-[var(--muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  </div>
)

export default StatCard
