import { cn } from '../../lib/utils'

export interface TabItem<TValue extends string> {
  value: TValue
  label: string
  count?: number
}

export interface TabsProps<TValue extends string> {
  items: TabItem<TValue>[]
  value: TValue
  onChange: (value: TValue) => void
  label: string
  className?: string
}

export const Tabs = <TValue extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: TabsProps<TValue>) => {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'no-scrollbar -mb-px flex gap-1 overflow-x-auto border-b border-[var(--border-subtle)]',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative -mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-[0.8125rem] font-medium transition-colors',
              active
                ? 'border-[var(--espresso)] text-[var(--espresso)]'
                : 'border-transparent text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--charcoal)]',
            )}
          >
            {item.label}
            {typeof item.count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 font-mono text-[0.65rem] leading-none',
                  active
                    ? 'bg-[rgba(81,53,34,0.1)] text-[var(--espresso)]'
                    : 'bg-[rgba(113,104,95,0.1)] text-[var(--muted)]',
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
