import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Clock3,
  FlaskConical,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { ResourceCard } from '../../components/resources/ResourceCard'
import { ResourceCardSkeleton } from '../../components/resources/ResourceCardSkeleton'
import { Button } from '../../components/ui/button'
import { Pagination } from '../../components/ui/pagination'
import { usePageMeta } from '../../hooks/usePageMeta'
import {
  useDebouncedValue,
  usePrefetchResources,
  useResourceCategories,
  useResources,
} from '../../hooks/useResources'
import { cn } from '../../lib/utils'

export type SortOption = 'catalogue' | 'name' | 'location' | 'cap'

export interface ResourcesSearchParams {
  q?: string
  category?: string
  status?: string
  sort?: SortOption
  page?: number
}

export interface ResourcesPageProps {
  initialSearch?: ResourcesSearchParams
  onSearchChange?: (next: ResourcesSearchParams) => void
}

const sortLabels: Record<SortOption, string> = {
  catalogue: 'Catalogue order',
  name: 'Name (A–Z)',
  location: 'Location (A–Z)',
  cap: 'Longest single booking',
}

const filterLabel =
  'text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--muted)'

const selectClass =
  'mt-2 h-10 w-full cursor-pointer rounded-[0.5rem] border border-(--border-subtle) bg-(--surface) px-3 text-[0.8125rem] text-(--charcoal) transition-colors hover:border-(--border-strong) focus:border-(--espresso) focus:outline-none focus:ring-2 focus:ring-(--tint-3)'

const ResourcesPage = ({
  initialSearch,
  onSearchChange,
}: ResourcesPageProps) => {
  usePageMeta({
    title: 'Resources — ShareLab',
    description:
      'Browse the live ShareLab catalogue, search by name, filter by category and listing status, and open a resource to review its requirements.',
  })

  const [search, setSearch] = useState(initialSearch?.q ?? '')
  const [category, setCategory] = useState(initialSearch?.category ?? 'all')
  const [status, setStatus] = useState(initialSearch?.status ?? 'all')
  const [sort, setSort] = useState<SortOption>(
    initialSearch?.sort ?? 'catalogue',
  )
  const [page, setPage] = useState(initialSearch?.page ?? 1)
  const debouncedSearch = useDebouncedValue(search.trim(), 350)
  const resultsTopRef = useRef<HTMLDivElement>(null)

  const resourcesQuery = useResources({
    q: debouncedSearch,
    category,
    status,
    page,
    perPage: 9,
  })
  const categoriesQuery = useResourceCategories()
  const prefetchResources = usePrefetchResources()

  const resources = resourcesQuery.data?.data ?? []
  const meta = resourcesQuery.data?.meta
  const total = meta?.total ?? resources.length
  const lastPage = meta?.last_page ?? 1
  const isFiltering =
    search.trim() !== debouncedSearch || resourcesQuery.isFetching

  const firstFilterRun = useRef(true)

  useEffect(() => {
    if (firstFilterRun.current) {
      firstFilterRun.current = false
      return
    }
    setPage(1)
  }, [debouncedSearch, category, status])

  // Keep the address bar in step with the filters so links can be shared and
  // a refresh restores the same catalogue view.
  useEffect(() => {
    onSearchChange?.({
      q: debouncedSearch || undefined,
      category: category === 'all' ? undefined : category,
      status: status === 'all' ? undefined : status,
      sort: sort === 'catalogue' ? undefined : sort,
      page: page > 1 ? page : undefined,
    })
  }, [debouncedSearch, category, status, sort, page, onSearchChange])

  useEffect(() => {
    if (meta?.last_page && page > meta.last_page) {
      setPage(meta.last_page)
    }
  }, [meta?.last_page, page])

  const categoryOptions = useMemo(() => {
    if (categoriesQuery.data?.length) return categoriesQuery.data
    return Array.from(
      new Set(resources.map((resource) => resource.category)),
    ).sort((a, b) => a.localeCompare(b))
  }, [categoriesQuery.data, resources])

  const sortedResources = useMemo(() => {
    const items = [...resources]

    switch (sort) {
      case 'name':
        return items.sort((a, b) => a.name.localeCompare(b.name))
      case 'location':
        return items.sort((a, b) => a.location.localeCompare(b.location))
      case 'cap':
        return items.sort(
          (a, b) => b.max_hours_per_booking - a.max_hours_per_booking,
        )
      default:
        return items
    }
  }, [resources, sort])

  const hasActiveFilters = Boolean(
    search || category !== 'all' || status !== 'all',
  )

  const resetFilters = () => {
    setSearch('')
    setCategory('all')
    setStatus('all')
    setSort('catalogue')
    setPage(1)
  }

  const goToPage = (nextPage: number) => {
    const target = Math.min(Math.max(1, nextPage), lastPage)
    setPage(target)

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    window.requestAnimationFrame(() => {
      resultsTopRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  }

  const resultRangeStart =
    total === 0 ? 0 : (page - 1) * (meta?.per_page ?? 9) + 1
  const resultRangeEnd = Math.min(page * (meta?.per_page ?? 9), total)

  return (
    <SiteLayout>
      <section className="border-b border-(--border-subtle) bg-(--soft-beige)">
        <div className="page-shell py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-7">
            <ol className="flex items-center gap-2 text-[0.75rem] text-(--muted)">
              <li>
                <Link
                  to="/"
                  className="transition-colors hover:text-(--espresso)"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-(--border-strong)">
                /
              </li>
              <li aria-current="page" className="font-medium text-(--charcoal)">
                Resources
              </li>
            </ol>
          </nav>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">
                <span
                  aria-hidden="true"
                  className="h-px w-6 bg-(--bronze-deep)"
                />
                The catalogue
              </span>
              <h1 className="display-lg mt-4">Find shared campus resources.</h1>
              <p className="lede mt-4 text-[0.9375rem] sm:text-base">
                Search the live catalogue, compare locations and booking limits,
                and open a listing to review the requirements that apply before
                you request a slot.
              </p>
            </div>

            <dl className="flex shrink-0 divide-x divide-(--tint-3) rounded-(--radius-md) border border-(--tint-3) bg-(--surface-muted)">
              <div className="px-5 py-3">
                <dd className="font-display text-[1.5rem] font-semibold leading-none tracking-[-0.03em] text-(--charcoal) tabular-nums">
                  {resourcesQuery.isSuccess ? total : '—'}
                </dd>
                <dt className="mt-1.5 text-[0.6875rem] uppercase tracking-[0.1em] text-(--muted)">
                  Published
                </dt>
              </div>
              <div className="px-5 py-3">
                <dd className="font-display text-[1.5rem] font-semibold leading-none tracking-[-0.03em] text-(--charcoal) tabular-nums">
                  {categoryOptions.length || '—'}
                </dd>
                <dt className="mt-1.5 text-[0.6875rem] uppercase tracking-[0.1em] text-(--muted)">
                  Categories
                </dt>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="page-shell py-8 sm:py-10">
        <div className="rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-4 shadow-soft sm:p-5">
          <form role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="resource-search" className="sr-only">
              Search the catalogue
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--bronze)"
                  aria-hidden="true"
                />
                <input
                  id="resource-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name — printer, oscilloscope, camera, room…"
                  className="h-11 w-full rounded-[0.5rem] border border-(--border-subtle) bg-(--ivory) pl-10 pr-10 text-sm text-(--charcoal) placeholder:text-(--muted) transition-colors hover:border-(--border-strong) focus:border-(--espresso) focus:bg-(--surface) focus:outline-none focus:ring-2 focus:ring-(--tint-3)"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[0.4rem] text-(--muted) transition-colors hover:bg-(--soft-beige) hover:text-(--espresso)"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetFilters}
                  className="shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear filters
                </Button>
              ) : null}
            </div>
          </form>
          <p
            className="mt-3 flex items-start gap-2 text-[0.75rem] leading-relaxed text-(--muted)"
            aria-live="polite"
          >
            {isFiltering ? (
              <>
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-(--warning)" />
                Searching the live catalogue…
              </>
            ) : (
              <>
                <ShieldCheck
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--bronze)"
                  aria-hidden="true"
                />
                Listing status shows whether a resource is published. Exact
                time-slot availability is checked when a booking request is
                submitted.
              </>
            )}
          </p>
        </div>

        <div
          ref={resultsTopRef}
          className="mt-8 scroll-mt-24 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-8"
        >
          <aside
            aria-label="Catalogue filters"
            className="mb-6 rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-5 lg:sticky lg:top-24 lg:mb-0"
          >
            <div className="flex items-center gap-2 pb-4">
              <SlidersHorizontal
                className="h-4 w-4 text-(--bronze-deep)"
                aria-hidden="true"
              />
              <h2 className="text-[0.8125rem] font-semibold text-(--charcoal)">
                Refine results
              </h2>
            </div>

            <fieldset className="border-0 p-0">
              <legend className={filterLabel}>Category</legend>
              <div className="mt-2 flex flex-col">
                {[
                  { label: 'All categories', value: 'all' },
                  ...categoryOptions.map((option) => ({
                    label: option,
                    value: option,
                  })),
                ].map((option) => {
                  const active = category === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategory(option.value)}
                      className={cn(
                        'flex min-h-9 items-center border-l-2 py-1.5 pl-3 pr-2 text-left text-[0.8125rem] transition-colors',
                        active
                          ? 'border-(--espresso) bg-(--soft-beige) font-semibold text-(--espresso)'
                          : 'border-transparent text-(--muted-strong) hover:border-(--border-strong) hover:text-(--charcoal)',
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
              {categoriesQuery.isLoading ? (
                <div className="mt-2 space-y-1.5" aria-hidden="true">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-8 animate-pulse rounded-[0.35rem] bg-(--soft-beige)"
                    />
                  ))}
                </div>
              ) : null}
            </fieldset>

            <div className="mt-5 border-t border-(--border-subtle) pt-4">
              <label htmlFor="status-filter" className={filterLabel}>
                Listing status
              </label>
              <select
                id="status-filter"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={selectClass}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="mt-4">
              <label htmlFor="sort-filter" className={filterLabel}>
                Sort
              </label>
              <select
                id="sort-filter"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className={selectClass}
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-(--muted)">
                Sorts the results on the current page.
              </p>
            </div>

            <div className="mt-5 border-t border-(--border-subtle) pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start px-2"
                onClick={resetFilters}
                disabled={!hasActiveFilters && sort === 'catalogue'}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset filters
              </Button>
            </div>
          </aside>

          <section aria-labelledby="results-heading" className="min-w-0">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-(--border-subtle) pb-4">
              <div>
                <h2
                  id="results-heading"
                  className="font-display text-[1.125rem] font-semibold tracking-[-0.02em] text-(--charcoal)"
                >
                  Resource catalogue
                </h2>
                <p
                  className="mt-1 font-mono text-[0.6875rem] tracking-[0.02em] text-(--muted)"
                  aria-live="polite"
                >
                  {resourcesQuery.isLoading
                    ? 'Loading resources…'
                    : resourcesQuery.isError
                      ? 'The catalogue could not be loaded.'
                      : total === 0
                        ? 'No resources match these filters.'
                        : `${resultRangeStart}–${resultRangeEnd} of ${total} ${
                            total === 1 ? 'resource' : 'resources'
                          }`}
                </p>
              </div>
              {meta && lastPage > 1 ? (
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-(--muted)">
                  Page {page} / {lastPage}
                </p>
              ) : null}
            </div>

            {resourcesQuery.isLoading ? (
              <div
                className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                aria-label="Loading resources"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <ResourceCardSkeleton key={index} />
                ))}
              </div>
            ) : resourcesQuery.isError ? (
              <div
                role="alert"
                className="rounded-(--radius-lg) border border-(--error-tint) bg-(--surface) p-6 sm:p-8"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[0.5rem] bg-(--error-tint)">
                  <AlertTriangle
                    className="h-[1.15rem] w-[1.15rem] text-(--error)"
                    aria-hidden="true"
                  />
                </span>
                <h3 className="mt-4 font-display text-[1.125rem] font-semibold text-(--charcoal)">
                  We couldn’t load the catalogue
                </h3>
                <p className="mt-2 max-w-xl text-[0.8125rem] leading-relaxed text-(--muted)">
                  The ShareLab API did not respond. Check that the backend is
                  running and that the API URL is configured, then try again. No
                  results are being hidden.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={() => void resourcesQuery.refetch()}>
                    Try again
                  </Button>
                  <Button variant="secondary" onClick={resetFilters}>
                    Reset filters
                  </Button>
                </div>
              </div>
            ) : sortedResources.length === 0 ? (
              <div className="rounded-(--radius-lg) border border-dashed border-(--border-strong) bg-(--surface) px-6 py-14 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[0.55rem] bg-(--soft-beige)">
                  <FlaskConical
                    className="h-[1.15rem] w-[1.15rem] text-(--espresso)"
                    aria-hidden="true"
                  />
                </span>
                <h3 className="mt-4 font-display text-[1.125rem] font-semibold text-(--charcoal)">
                  No resources match your search
                </h3>
                <p className="mx-auto mt-2 max-w-md text-[0.8125rem] leading-relaxed text-(--muted)">
                  Try a broader search term, a different category, or clear the
                  status filter to see the full catalogue again.
                </p>
                <Button
                  className="mt-5"
                  variant="secondary"
                  onClick={resetFilters}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {sortedResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}

            {!resourcesQuery.isError ? (
              <Pagination
                className="mt-8"
                label="Catalogue pagination"
                page={page}
                lastPage={lastPage}
                total={total}
                perPage={meta?.per_page ?? 9}
                isFetching={resourcesQuery.isFetching}
                onPageChange={goToPage}
                onPrefetch={(nextPage) =>
                  void prefetchResources({
                    q: debouncedSearch,
                    category,
                    status,
                    page: nextPage,
                    perPage: 9,
                  })
                }
              />
            ) : null}

            <div className="mt-10 flex flex-col items-start justify-between gap-3 rounded-(--radius-md) border border-(--border-subtle) bg-(--soft-beige) px-5 py-4 text-[0.8125rem] text-(--muted-strong) sm:flex-row sm:items-center">
              <span className="inline-flex items-center gap-2">
                <Clock3
                  className="h-4 w-4 shrink-0 text-(--espresso)"
                  aria-hidden="true"
                />
                Booking limits and weekly caps are shown on each listing.
              </span>
              <Link
                to="/how-it-works"
                className="shrink-0 font-semibold text-(--espresso) underline decoration-transparent underline-offset-4 transition-colors hover:decoration-(--bronze)"
              >
                Review the booking process
              </Link>
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  )
}

export { ResourcesPage }
export default ResourcesPage
