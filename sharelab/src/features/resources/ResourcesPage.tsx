import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronRight as CrumbChevron,
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
  const isFiltering = search.trim() !== debouncedSearch || resourcesQuery.isFetching

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
    return Array.from(new Set(resources.map((resource) => resource.category))).sort((a, b) =>
      a.localeCompare(b),
    )
  }, [categoriesQuery.data, resources])

  const sortedResources = useMemo(() => {
    const items = [...resources]

    switch (sort) {
      case 'name':
        return items.sort((a, b) => a.name.localeCompare(b.name))
      case 'location':
        return items.sort((a, b) => a.location.localeCompare(b.location))
      case 'cap':
        return items.sort((a, b) => b.max_hours_per_booking - a.max_hours_per_booking)
      default:
        return items
    }
  }, [resources, sort])

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, Math.max(1, lastPage - 4)))
    const end = Math.min(lastPage, start + 4)
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [page, lastPage])

  const hasActiveFilters = Boolean(search || category !== 'all' || status !== 'all')

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

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.requestAnimationFrame(() => {
      resultsTopRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  }

  const resultRangeStart = total === 0 ? 0 : (page - 1) * (meta?.per_page ?? 9) + 1
  const resultRangeEnd = Math.min(page * (meta?.per_page ?? 9), total)

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[rgba(255,252,247,0.48)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(198,165,138,0.24),transparent_70%)] blur-3xl"
        />
        <div className="page-shell relative py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
              <li>
                <Link to="/" className="transition-colors hover:text-[var(--espresso)]">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <CrumbChevron className="h-3.5 w-3.5" />
              </li>
              <li aria-current="page" className="text-[var(--charcoal)]">
                Resources
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <span className="eyebrow">The catalogue</span>
              <h1 className="mt-3 text-[clamp(2.2rem,4.8vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[var(--charcoal)]">
                Find shared campus resources.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                Search the live catalogue, compare locations and booking limits, and open a
                listing to review the requirements that apply before you request a slot.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--cream)] px-4 py-3 shadow-[var(--shadow-xs)]">
                <p className="text-2xl font-semibold tracking-tight text-[var(--charcoal)]">
                  {resourcesQuery.isSuccess ? total : '—'}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {total === 1 ? 'published resource' : 'published resources'}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--cream)] px-4 py-3 shadow-[var(--shadow-xs)]">
                <p className="text-2xl font-semibold tracking-tight text-[var(--charcoal)]">
                  {categoryOptions.length || '—'}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">categories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell py-8 sm:py-10">
        <div className="rounded-[1.35rem] border border-[var(--border-subtle)] bg-[rgba(255,252,247,0.75)] p-4 shadow-[var(--shadow-sm)] backdrop-blur-sm sm:p-5">
          <form role="search" onSubmit={(event) => event.preventDefault()}>
            <label
              htmlFor="resource-search"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
            >
              Search the catalogue
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
                  aria-hidden="true"
                />
                <input
                  id="resource-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name — printer, oscilloscope, camera, room…"
                  className="h-12 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--cream)] pl-11 pr-11 text-sm text-[var(--charcoal)] placeholder:text-[rgba(130,119,109,0.75)] focus:border-[rgba(75,47,31,0.38)] focus:outline-none focus:ring-2 focus:ring-[rgba(75,47,31,0.16)]"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[rgba(75,47,31,0.07)] hover:text-[var(--espresso)]"
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
                  className="h-12 shrink-0 justify-center"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </Button>
              ) : null}
            </div>
          </form>
          <p className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]" aria-live="polite">
            {isFiltering ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--warning)]" />
                Searching the live catalogue…
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Listing status shows whether a resource is published. Exact time-slot availability
                is checked when a booking request is submitted.
              </>
            )}
          </p>
        </div>

        <div ref={resultsTopRef} className="mt-8 scroll-mt-28 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <aside
            aria-label="Catalogue filters"
            className="mb-6 rounded-[1.35rem] border border-[var(--border-subtle)] bg-[rgba(255,252,247,0.7)] p-5 lg:sticky lg:top-24 lg:mb-0"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[var(--espresso)]" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-[var(--charcoal)]">Refine results</h2>
            </div>

            <fieldset className="mt-5 border-0 p-0">
              <legend className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Category
              </legend>
              <div className="mt-2.5 flex flex-col gap-1">
                <button
                  type="button"
                  aria-pressed={category === 'all'}
                  onClick={() => setCategory('all')}
                  className={cn(
                    'flex min-h-9 items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                    category === 'all'
                      ? 'bg-[var(--espresso)] text-white'
                      : 'text-[var(--charcoal)] hover:bg-[rgba(75,47,31,0.06)]',
                  )}
                >
                  All categories
                </button>
                {categoryOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={category === option}
                    onClick={() => setCategory(option)}
                    className={cn(
                      'flex min-h-9 items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                      category === option
                        ? 'bg-[var(--espresso)] text-white'
                        : 'text-[var(--charcoal)] hover:bg-[rgba(75,47,31,0.06)]',
                    )}
                  >
                    <span>{option}</span>
                  </button>
                ))}
              </div>
              {categoriesQuery.isLoading ? (
                <div className="mt-2 space-y-1.5" aria-hidden="true">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-8 animate-pulse rounded-lg bg-[rgba(214,189,164,0.32)]"
                    />
                  ))}
                </div>
              ) : null}
            </fieldset>

            <div className="mt-5">
              <label
                htmlFor="status-filter"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
              >
                Listing status
              </label>
              <select
                id="status-filter"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-[var(--border-subtle)] bg-[var(--cream)] px-3 text-sm text-[var(--charcoal)] focus:outline-none focus:ring-2 focus:ring-[rgba(75,47,31,0.16)]"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="mt-4">
              <label
                htmlFor="sort-filter"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
              >
                Sort
              </label>
              <select
                id="sort-filter"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-[var(--border-subtle)] bg-[var(--cream)] px-3 text-sm text-[var(--charcoal)] focus:outline-none focus:ring-2 focus:ring-[rgba(75,47,31,0.16)]"
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[0.7rem] leading-relaxed text-[var(--muted)]">
                Sorts the results on the current page.
              </p>
            </div>

            <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3"
                onClick={resetFilters}
                disabled={!hasActiveFilters && sort === 'catalogue'}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset filters
              </Button>
            </div>
          </aside>

          <section aria-labelledby="results-heading" className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="results-heading" className="text-xl font-semibold text-[var(--charcoal)]">
                  Resource catalogue
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]" aria-live="polite">
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
              {meta && lastPage > 1 ? (
                <p className="text-xs font-medium text-[var(--muted)]">
                  Page {page} of {lastPage}
                </p>
              ) : null}
            </div>

            {resourcesQuery.isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading resources">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ResourceCardSkeleton key={index} />
                ))}
              </div>
            ) : resourcesQuery.isError ? (
              <div
                role="alert"
                className="rounded-[1.35rem] border border-[rgba(180,77,66,0.25)] bg-[rgba(180,77,66,0.05)] p-6 sm:p-8"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(180,77,66,0.12)]">
                  <AlertTriangle className="h-5 w-5 text-[var(--error)]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--charcoal)]">
                  We couldn’t load the catalogue
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                  The ShareLab API did not respond. Check that the backend is running and that
                  the API URL is configured, then try again. No results are being hidden.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={() => void resourcesQuery.refetch()}>Try again</Button>
                  <Button variant="secondary" onClick={resetFilters}>
                    Reset filters
                  </Button>
                </div>
              </div>
            ) : sortedResources.length === 0 ? (
              <div className="rounded-[1.35rem] border border-dashed border-[var(--border-strong)] bg-[rgba(255,252,247,0.55)] px-6 py-12 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(75,47,31,0.07)]">
                  <FlaskConical className="h-7 w-7 text-[var(--taupe)]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--charcoal)]">
                  No resources match your search
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                  Try a broader search term, a different category, or clear the status filter to
                  see the full catalogue again.
                </p>
                <Button className="mt-5" onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
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

            {lastPage > 1 && !resourcesQuery.isError ? (
              <nav aria-label="Catalogue pagination" className="mt-8 flex flex-wrap items-center justify-between gap-3">
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
                        'flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-medium transition-colors',
                        pageNumber === page
                          ? 'bg-[var(--espresso)] text-white'
                          : 'text-[var(--charcoal)] hover:bg-[rgba(75,47,31,0.07)]',
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

            <div className="mt-10 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(233,217,198,0.28)] px-5 py-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 shrink-0 text-[var(--espresso)]" aria-hidden="true" />
                Booking limits and weekly caps are shown on each listing.
              </span>
              <Link
                to="/how-it-works"
                className="shrink-0 font-semibold text-[var(--espresso)] transition-colors hover:text-[var(--deep-brown)]"
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
