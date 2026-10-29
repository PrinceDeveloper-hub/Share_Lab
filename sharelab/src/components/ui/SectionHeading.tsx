import { cn } from '../../lib/utils'

export interface SectionHeadingProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  tone?: 'default' | 'inverse'
  className?: string
  id?: string
  actions?: React.ReactNode
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'default',
  className,
  id,
  actions,
}: SectionHeadingProps) => {
  return (
    <div
      className={cn(
<<<<<<< HEAD
        'flex flex-col gap-3',
=======
        'flex max-w-2xl flex-col gap-3.5',
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
<<<<<<< HEAD
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow ? (
          <span
            className={cn(
              'eyebrow',
              tone === 'inverse' && 'text-[rgba(248,245,239,0.62)]',
            )}
          >
            {eyebrow}
          </span>
        ) : null}
        <h2
          id={id}
          className={cn(
            'h-section text-[clamp(1.6rem,2.8vw,2.25rem)]',
            eyebrow && 'mt-3',
            tone === 'inverse' && 'text-[var(--cream)]',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              'mt-3 text-[0.9375rem] leading-relaxed text-[var(--muted)] sm:text-base',
              tone === 'inverse' && 'text-[rgba(248,245,239,0.66)]',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
=======
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
    </div>
  )
}
