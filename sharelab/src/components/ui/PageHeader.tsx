import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface Crumb {
  label: string
  to?: string
}

export interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  breadcrumbs?: Crumb[]
  meta?: ReactNode
  className?: string
  titleAs?: 'h1' | 'h2'
}

export const Breadcrumbs = ({ crumbs }: { crumbs: Crumb[] }) => {
  if (crumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem] text-[var(--muted)]">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1

          return (
            <li
              key={`${crumb.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {index > 0 ? (
                <ChevronRight
                  className="h-3 w-3 opacity-60"
                  aria-hidden="true"
                />
              ) : null}
              {crumb.to && !last ? (
                <Link
                  to={crumb.to}
                  className="transition-colors hover:text-[var(--espresso)]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className={cn(last && 'text-[var(--charcoal)]')}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  breadcrumbs,
  meta,
  className,
  titleAs: Title = 'h1',
}: PageHeaderProps) => {
  return (
    <header className={cn('flex flex-col gap-4', className)}>
      {breadcrumbs ? <Breadcrumbs crumbs={breadcrumbs} /> : null}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="min-w-0 max-w-3xl">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <Title className={cn('display-2', eyebrow && 'mt-2.5')}>
            {title}
          </Title>
          {description ? (
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--muted)] sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {meta}
    </header>
  )
}

export default PageHeader
