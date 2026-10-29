import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

export interface PaginationProps {
  page: number
  lastPage: number
  total?: number
  perPage?: number
  label: string
  isFetching?: boolean
  onPageChange: (page: number) => void
  /** Called on hover/focus so the next page is already cached before the click. */
  onPrefetch?: (page: number) => void
  className?: string
}

const buildPageNumbers = (page: number, lastPage: number) => {
  const windowSize = 5
  const start = Math.max(
    1,
    Math.min(page - 2, Math.max(1, lastPage - (windowSize - 1))),
  )
  const end = Math.min(lastPage, start + (windowSize - 1))
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

export const Pagination = ({
  page,
  lastPage,
  total,
  perPage,
  label,
  isFetching = false,
  onPageChange,
  onPrefetch,
  className,
}: PaginationProps) => {
  if (lastPage <= 1) return null

  const pageNumbers = buildPageNumbers(page, lastPage)
  const rangeStart = total === 0 ? 0 : (page - 1) * (perPage ?? 1) + 1
  const rangeEnd =
    total !== undefined ? Math.min(page * (perPage ?? 1), total) : undefined

  return (
    <nav
      aria-label={label}
      className={cn(
        'mt-6 flex flex-col items-center justify-between gap-3 border-t border-(--border-subtle) pt-5 sm:flex-row',
        className,
      )}
    >
      <p className="text-xs font-medium text-(--muted)" aria-live="polite">
        {total !== undefined && perPage !== undefined
          ? `Showing ${rangeStart}–${rangeEnd} of ${total}`
          : `Page ${page} of ${lastPage}`}
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          onMouseEnter={() => page > 1 && onPrefetch?.(page - 1)}
          onFocus={() => page > 1 && onPrefetch?.(page - 1)}
          disabled={page <= 1 || isFetching}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              onMouseEnter={() => onPrefetch?.(pageNumber)}
              onFocus={() => onPrefetch?.(pageNumber)}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={pageNumber === page ? 'page' : undefined}
              className={cn(
                'flex h-9 min-w-9 items-center justify-center rounded-[0.45rem] border px-2 font-mono text-[0.8125rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)',
                pageNumber === page
                  ? 'border-(--espresso) bg-(--espresso) text-(--accent-contrast)'
                  : 'border-(--border-subtle) bg-(--surface) text-(--muted-strong) hover:border-(--border-strong) hover:text-(--espresso)',
              )}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          onMouseEnter={() => page < lastPage && onPrefetch?.(page + 1)}
          onFocus={() => page < lastPage && onPrefetch?.(page + 1)}
          disabled={page >= lastPage || isFetching}
        >
          <span className="sr-only sm:not-sr-only">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}

export default Pagination
