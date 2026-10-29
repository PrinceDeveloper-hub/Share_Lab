import { useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { ResourcesSearchParams } from '../features/resources/ResourcesPage'
import { ResourcesPage } from '../features/resources/ResourcesPage'

const sortValues = ['catalogue', 'name', 'location', 'cap'] as const

const parseResourcesSearch = (
  search: Record<string, unknown>,
): ResourcesSearchParams => ({
  q: typeof search.q === 'string' && search.q ? search.q : undefined,
  category:
    typeof search.category === 'string' && search.category
      ? search.category
      : undefined,
  status:
    typeof search.status === 'string' && search.status ? search.status : undefined,
  sort: sortValues.find((value) => value === search.sort),
  page: typeof search.page === 'number' && search.page > 1 ? search.page : undefined,
})

const ResourcesRoute = () => {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const handleSearchChange = useCallback(
    (next: ResourcesSearchParams) => {
      void navigate({ to: '/resources', search: next, replace: true })
    },
    [navigate],
  )

  return (
    <ResourcesPage initialSearch={search} onSearchChange={handleSearchChange} />
  )
}

export const Route = createFileRoute('/resources/')({
  validateSearch: parseResourcesSearch,
  component: ResourcesRoute,
})
