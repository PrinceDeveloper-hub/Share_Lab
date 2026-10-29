import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export const inputClass =
  'h-10 w-full rounded-[0.5rem] border border-(--border-subtle) bg-(--surface) px-3 text-sm text-(--charcoal) placeholder:text-[rgba(113,104,95,0.7)] transition-colors hover:border-(--border-strong) focus:border-(--espresso) focus:outline-none focus:ring-2 focus:ring-[rgba(81,53,34,0.14)] disabled:cursor-not-allowed disabled:opacity-60'

export const textareaClass =
  'w-full resize-y rounded-[0.5rem] border border-(--border-subtle) bg-(--surface) px-3 py-2.5 text-sm leading-relaxed text-(--charcoal) placeholder:text-[rgba(113,104,95,0.7)] transition-colors hover:border-(--border-strong) focus:border-(--espresso) focus:outline-none focus:ring-2 focus:ring-[rgba(81,53,34,0.14)] disabled:cursor-not-allowed disabled:opacity-60'

export const selectClass =
  'h-10 w-full cursor-pointer rounded-[0.5rem] border border-(--border-subtle) bg-(--surface) px-3 text-sm text-(--charcoal) transition-colors hover:border-(--border-strong) focus:border-(--espresso) focus:outline-none focus:ring-2 focus:ring-[rgba(81,53,34,0.14)] disabled:cursor-not-allowed disabled:opacity-60'

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) => (    <div className="flex flex-col gap-5 border-b border-(--border-subtle) pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="eyebrow">
            <span aria-hidden="true" className="h-px w-6 bg-(--bronze)" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="display-lg mt-2.5">{title}</h1>
        {description ? (
          <p className="mt-2.5 max-w-xl text-[0.9375rem] leading-relaxed text-(--muted)">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
)

export const SectionCard = ({
  children,
  className,
  as: Component = 'section',
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}) => (
  <Component
    className={cn(
      'rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-5 shadow-soft sm:p-6',
      className,
    )}
  >
    {children}
  </Component>
)

export const StatTile = ({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  detail?: string
  icon?: typeof AlertTriangle
}) => (
  <div className="bg-(--surface) p-5">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-(--muted)">
        {label}
      </p>
      {Icon ? <Icon className="h-4 w-4 text-(--bronze)" aria-hidden="true" /> : null}
    </div>
    <p className="mt-2 font-display text-[2rem] font-semibold leading-none tracking-[-0.04em] text-(--charcoal) tabular-nums">
      {value}
    </p>
    {detail ? <p className="mt-1.5 text-[0.7rem] leading-snug text-(--muted)">{detail}</p> : null}
  </div>
)

export const StatGrid = ({ children }: { children: ReactNode }) => (
  <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--border-subtle) shadow-(--shadow-xs) md:grid-cols-4">
    {children}
  </div>
)

export const ErrorNotice = ({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string
  message: string
  onRetry?: () => void
}) => (
  <div
    role="alert"
    className="rounded-(--radius-md) border border-[rgba(169,72,60,0.2)] bg-[rgba(169,72,60,0.06)] p-5"
  >
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-(--error)" aria-hidden="true" />
      <div>
        <h2 className="text-sm font-semibold text-(--charcoal)">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-(--muted)">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 text-sm font-semibold text-(--espresso) underline decoration-[rgba(81,53,34,0.3)] underline-offset-4 hover:decoration-(--espresso)"
          >
            Try again
          </button>
        ) : null}
      </div>
    </div>
  </div>
)

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof AlertTriangle
  title: string
  description: string
  action?: ReactNode
}) => (
  <div className="rounded-(--radius-lg) border border-dashed border-(--border-strong) bg-(--surface) px-6 py-10 text-center">
    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[0.55rem] bg-(--soft-beige)">
      <Icon className="h-[1.15rem] w-[1.15rem] text-(--espresso)" aria-hidden="true" />
    </span>
    <h2 className="mt-4 font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-(--charcoal)">
      {title}
    </h2>
    <p className="mx-auto mt-2 max-w-md text-[0.8125rem] leading-relaxed text-(--muted)">
      {description}
    </p>
    {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
  </div>
)

export const LoadingRows = ({ rows = 3, label = 'Loading' }: { rows?: number; label?: string }) => (
  <div className="space-y-3" role="status" aria-live="polite">
    <span className="sr-only">{label}</span>
    {Array.from({ length: rows }).map((_, index) => (
      <div
        key={index}
        className="flex animate-pulse items-center gap-4 rounded-(--radius-md) border border-(--border-subtle) bg-(--surface) p-4"
      >
        <span className="h-10 w-10 shrink-0 rounded-full bg-[rgba(81,53,34,0.08)]" />
        <span className="flex-1 space-y-2">
          <span className="block h-3 w-2/3 rounded-full bg-[rgba(81,53,34,0.08)]" />
          <span className="block h-2.5 w-1/2 rounded-full bg-[rgba(81,53,34,0.06)]" />
        </span>
      </div>
    ))}
  </div>
)

export const Field = ({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string
  hint?: string
  error?: string
  htmlFor?: string
  children: ReactNode
  className?: string
}) => (
  <div className={className}>
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold uppercase tracking-[0.1em] text-(--charcoal)"
    >
      {label}
    </label>
    {hint ? <p className="mt-1 text-[0.7rem] leading-relaxed text-(--muted)">{hint}</p> : null}
    <div className="mt-1.5">{children}</div>
    {error ? (
      <p role="alert" className="mt-1.5 text-xs font-medium text-(--error)">
        {error}
      </p>
    ) : null}
  </div>
)

export const InlineLoader = ({ label = 'Working' }: { label?: string }) => (
  <span className="inline-flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
    {label}
  </span>
)

export const Modal = ({
  open,
  title,
  description,
  onClose,
  children,
  size = 'md',
}: {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) => {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousActive = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    window.requestAnimationFrame(() => panelRef.current?.focus())

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      previousActive?.focus()
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-(--overlay-scrim) p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-5 shadow-(--shadow-lg) focus:outline-none sm:rounded-(--radius-lg) sm:p-6',
          size === 'sm' && 'sm:max-w-md',
          size === 'md' && 'sm:max-w-xl',
          size === 'lg' && 'sm:max-w-3xl',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="display-md">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-(--muted)">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-(--muted) transition-colors hover:bg-[rgba(81,53,34,0.07)] hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

export const Tabs = <T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: Array<{ value: T; label: string; count?: number }>
  value: T
  onChange: (value: T) => void
  label: string
}) => (
  <div
    role="tablist"
    aria-label={label}
    className="flex flex-wrap gap-1 border-b border-(--border-subtle) pb-2"
  >
    {tabs.map((tab) => {
      const active = tab.value === value
      return (
    <button
      key={tab.value}
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onChange(tab.value)}
      className={cn(
        'relative -mb-2 inline-flex min-h-10 items-center gap-2 border-b-2 px-1 pb-2 text-[0.8125rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2',
        active
          ? 'border-(--espresso) text-(--charcoal)'
          : 'border-transparent text-(--muted) hover:text-(--charcoal)',
      )}
    >
      {tab.label}
      {typeof tab.count === 'number' ? (
        <span
          className={cn(
            'rounded-[0.3rem] px-1.5 py-0.5 font-mono text-[0.625rem] font-medium',
            active ? 'bg-(--soft-beige) text-(--espresso)' : 'bg-(--surface-sunken) text-(--muted)',
          )}
        >
          {tab.count}
        </span>
      ) : null}
    </button>
      )
    })}
  </div>
)
