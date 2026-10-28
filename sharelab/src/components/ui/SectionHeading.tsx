import { cn } from '../../lib/utils'

export interface SectionHeadingProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
  id?: string
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  id,
}: SectionHeadingProps) => {
  return (
    <div
      className={cn(
        'flex max-w-2xl flex-col gap-3',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 id={id} className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-[var(--muted)] sm:text-lg">{description}</p>
      ) : null}
    </div>
  )
}
