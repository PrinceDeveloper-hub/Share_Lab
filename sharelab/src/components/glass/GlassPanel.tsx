import { cn } from '../../lib/utils'

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'light' | 'strong' | 'subtle'
}

const sheen =
  'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,var(--glass-border),transparent)] before:content-[""]'

export const GlassPanel = ({
  className,
  children,
  variant = 'light',
  ...props
}: GlassPanelProps) => {
  const variants = {
    subtle:
      'border border-(--tint-2) bg-(--surface-muted) backdrop-blur-md shadow-(--shadow-xs)',
    light:
      'border border-(--glass-border) bg-(--glass-light) backdrop-blur-xl backdrop-saturate-150 shadow-(--glass-shadow)',
    strong:
      'border border-(--glass-border) bg-(--glass-light) backdrop-blur-2xl backdrop-saturate-150 shadow-(--shadow-lg)',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1rem]',
        variant !== 'subtle' && sheen,
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
