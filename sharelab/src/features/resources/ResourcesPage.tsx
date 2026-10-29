import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FlaskConical,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { ResourceCard } from '../../components/resources/ResourceCard'
import { ResourceCardSkeleton } from '../../components/resources/ResourceCardSkeleton'
import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Stagger, StaggerItem } from '../../components/ui/Reveal'
import { Skeleton } from '../../components/ui/Skeleton'
import { usePageMeta } from '../../hooks/usePageMeta'
import {
  useDebouncedValue,
  useResourceCategories,
  useResources,
} from '../../hooks/useResources'
import { cn } from '../../lib/utils'

type SortOption = 'catalogue' | 'name' | 'location' | 'cap'

const sortLabels: Record<SortOption, string> = {
  catalogue: 'Catalogue order',
  name: 'Name (A–Z)',
  location: 'Location (A–Z)',
  cap: 'Longest single booking',
}

const ResourcesPage = () => {
  usePageMeta({
    title: 'Resources — ShareLab',
    description:
      'Browse the live ShareLab catalogue, search by name, filter by category and listing status, and open a resource to review its requirements.',
  })

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<SortOption>('catalogue')
  const [page, setPage] = useState(1)
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

  const resources = resourcesQuery.data?.data ?? []
  const meta = resourcesQuery.data?.meta
  const total = meta?.total ?? resources.length
  const lastPage = meta?.last_page ?? 1
  const isFiltering =
    search.trim() !== debouncedSearch || resourcesQuery.isFetching

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, category, status])

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

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, Math.max(1, lastPage - 4)))
    const end = Math.min(lastPage, start + 4)
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [page, lastPage])

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
      <div className="page-shell py-8 sm:py-10 lg:py-12">
        <PageHeader
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Resources' }]}
          eyebrow="The catalogue"
          title="Find shared campus resources."
          description="Search live listings, compare locations and booking limits, and open a resource to review its requirements before you request a slot."
          actions={
            <Button asChild variant="secondary">
              <Link to="/how-it-works">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                How booking works
              </Link>
            </Button>
          }
          meta={
            <dl className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-[var(--border-subtle)] py-3">
              <div className="flex items-baseline gap-2">
                <dt className="text-[0.7rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                  Published
                </dt>
                <dd className="font-mono text-[0.8rem] font-medium text-[var(--charcoal)]">
                  {resourcesQuery.isSuccess ? total : '—'}
                </dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="text-[0.7rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                  Categories
                </dt>
                <dd className="font-mono text-[0.8rem] font-medium text-[var(--charcoal)]">
                  {categoryOptions.length || '—'}
                </dd>
              </div>
              <p className="ml-auto hidden items-center gap-1.5 text-[0.72rem] text-[var(--muted)] sm:flex">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--success)]"
                  aria-hidden="true"
                />
                Live from the campus catalogue
              </p>
            </dl>
          }
        />

        <section
          aria-label="Search and filter the catalogue"
          className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4 sm:p-5"
        >
          <form role="search" onSubmit={(event) => event.preventDefault()}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="resource-search"
                  className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]"
                >
                  Search
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
                    aria-hidden="true"
                  />
                  <input
                    id="resource-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name — printer, oscilloscope, camera, room…"
                    className="h-10 w-full rounded-[0.625rem] border border-[var(--border-subtle)] bg-white pl-10 pr-10 text-sm text-[var(--charcoal)] outline-none transition placeholder:text-[rgba(113,104,95,0.7)] focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      aria-label="Clear search"
                      className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[0.375rem] text-[var(--muted)] transition-colors hover:bg-[var(--soft-beige)] hover:text-[var(--charcoal)]"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:w-[24rem] lg:shrink-0">
                <div>
                  <label
                    htmlFor="status-filter"
                    className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]"
                  >
                    Status
                  </label>
                  <select
                    id="status-filter"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-10 w-full cursor-pointer rounded-[0.625rem] border border-[var(--border-subtle)] bg-white px-3 text-sm text-[var(--charcoal)] outline-none focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Published</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="sort-filter"
                    className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]"
                  >
                    Sort
                  </label>
                  <select
                    id="sort-filter"
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as SortOption)
                    }
                    className="h-10 w-full cursor-pointer rounded-[0.625rem] border border-[var(--border-subtle)] bg-white px-3 text-sm text-[var(--charcoal)] outline-none focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
                  >
                    {Object.entries(sortLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>

          <div className="mt-4 border-t border-[var(--border-subtle)] pt-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                Category
              </span>
              <button
                type="button"
                aria-pressed={category === 'all'}
                onClick={() => setCategory('all')}
                className={cn(
                  'rounded-full border px-3 py-1 text-[0.75rem] font-medium transition-colors',
                  category === 'all'
                    ? 'border-[var(--espresso)] bg-[var(--espresso)] text-white'
                    : 'border-[var(--border-subtle)] bg-white text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--charcoal)]',
                )}
              >
                All
              </button>
              {categoriesQuery.isLoading && categoryOptions.length === 0
                ? Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-[1.85rem] w-24 rounded-full"
                    />
                  ))
                : categoryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={category === option}
                      onClick={() => setCategory(option)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-[0.75rem] font-medium transition-colors',
                        category === option
                          ? 'border-[var(--espresso)] bg-[var(--espresso)] text-white'
                          : 'border-[var(--border-subtle)] bg-white text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--charcoal)]',
                      )}
                    >
                      {option}
                    </button>
                  ))}
              {hasActiveFilters || sort !== 'catalogue' ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="ml-auto inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-[var(--bronze-deep)] hover:text-[var(--espresso)]"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Reset
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <div ref={resultsTopRef} className="scroll-mt-24">
          <div className="mb-5 mt-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[1.125rem] font-semibold text-[var(--charcoal)]">
                Catalogue
              </h2>
              <p
                className="mt-1 text-[0.78rem] text-[var(--muted)]"
                aria-live="polite"
              >
                {resourcesQuery.isLoading
                  ? 'Loading resources…'
                  : resourcesQuery.isError
                    ? 'The catalogue could not be loaded.'
                    : total === 0
                      ? 'No resources match these filters.'
                      : `Showing ${resultRangeStart}–${resultRangeEnd} of ${total} ${
                          total === 1 ? 'resource' : 'resources'
                        }`}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[0.72rem] text-[var(--muted)]">
              {isFiltering ? (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--warning)]"
                    aria-hidden="true"
                  />
                  Updating results…
                </span>
              ) : null}
              {meta && lastPage > 1 ? (
                <span className="font-mono">
                  Page {page} / {lastPage}
                </span>
              ) : null}
            </div>
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
            <EmptyState
              icon={AlertTriangle}
              tone="error"
              title="We couldn’t load the catalogue"
              description="The ShareLab API did not respond. Check that the backend is running and that the API URL is configured, then try again. No results are being hidden."
              action={
                <Button onClick={() => void resourcesQuery.refetch()}>
                  Try again
                </Button>
              }
              secondaryAction={
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filters
                </Button>
              }
            />
          ) : sortedResources.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="No resources match your search"
              description="Try a broader search term, a different category, or clear the status filter to see the full catalogue again."
              action={
                <Button onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sortedResources.map((resource, index) => (
                <StaggerItem key={resource.id} className="h-full">
                  <ResourceCard resource={resource} eager={index < 3} />
                </StaggerItem>
              ))}
            </Stagger>
          )}

          {lastPage > 1 && !resourcesQuery.isError ? (
            <nav
              aria-label="Catalogue pagination"
              className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-5"
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1 || resourcesQuery.isFetching}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => goToPage(pageNumber)}
                    aria-label={`Go to page ${pageNumber}`}
                    aria-current={pageNumber === page ? 'page' : undefined}
                    className={cn(
                      'flex h-8 min-w-8 items-center justify-center rounded-[0.375rem] px-2 font-mono text-[0.78rem] transition-colors',
                      pageNumber === page
                        ? 'bg-[var(--espresso)] text-white'
                        : 'text-[var(--muted)] hover:bg-[var(--soft-beige)] hover:text-[var(--charcoal)]',
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
                onClick={() => goToPage(page + 1)}
                disabled={page >= lastPage || resourcesQuery.isFetching}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </nav>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[rgba(239,230,217,0.4)] px-5 py-4 text-[0.8125rem] text-[var(--muted)] sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2">
            <Clock3
              className="h-4 w-4 shrink-0 text-[var(--espresso)]"
              aria-hidden="true"
            />
            Booking limits and weekly caps are shown on each listing.
          </span>
          <Link
            to="/how-it-works"
            className="shrink-0 font-semibold text-[var(--espresso)] hover:underline"
          >
            Review the booking process
          </Link>
        </div>
      </div>
    </SiteLayout>
  )
}

export { ResourcesPage }
export default ResourcesPage
