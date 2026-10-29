import { cn } from '../../lib/utils'

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'light' | 'strong' | 'subtle'
}

export const GlassPanel = ({
  className,
  children,
  variant = 'light',
  ...props
}: GlassPanelProps) => {
  const variants = {
    subtle:
      'bg-[rgba(255,252,247,0.5)] backdrop-blur-md border border-[rgba(82,59,45,0.1)] shadow-[0_10px_40px_rgba(75,47,31,0.06)]',
    light:
      'bg-(--glass-light) backdrop-blur-xl saturate-110 border border-(--glass-border) shadow-(--glass-shadow)',
    strong:
      'bg-[rgba(255,255,255,0.82)] backdrop-blur-2xl saturate-115 border border-[rgba(255,255,255,0.72)] shadow-[0_16px_48px_rgba(75,47,31,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1rem]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
