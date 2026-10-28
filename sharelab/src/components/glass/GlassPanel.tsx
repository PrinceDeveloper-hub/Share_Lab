import { cn } from '../../lib/utils'

export interface GlassPanelProps {
  className?: string
  children: React.ReactNode
}

export const GlassPanel = ({
  className,
  children,
}: GlassPanelProps) => {
  return (
    <div
      className={cn(
        'glass-panel',
        'bg-white/76 backdrop-blur-xl saturate-115',
        'border border-white/62',
        'shadow-[0_12px_36px_rgba(75,47,31,0.08)_inset_0_1px_0_rgba(255,255,255,0.68)]',
        'dark:bg-[rgba(48,34,25,0.76)]',
        'dark:border-white/40',
        'rounded-[12px]',
        'p-4',
        className,
      )}
    >
      {children}
    </div>
  )
}