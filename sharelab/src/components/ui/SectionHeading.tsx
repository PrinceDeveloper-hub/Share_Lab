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
        'flex max-w-2xl flex-col gap-3.5',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      {eyebrow ? (
        <span className="eyebrow">
          <span aria-hidden="true" className="h-px w-6 bg-(--bronze)" />
          {eyebrow}
        </span>
      ) : null}
      <h2 id={id} className="display-lg">
        {title}
      </h2>
      {description ? <p className="lede text-[0.9375rem] sm:text-base">{description}</p> : null}
    </div>
  )
}
