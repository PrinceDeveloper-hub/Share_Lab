import { api } from './api-client'
import type { ApiResponse } from './api-client'

export interface ResourceOwner {
  id: number
  name: string
  email?: string
  role?: string
}

export interface Resource {
  id: number
  name: string
  category: string
  location: string
  description: string | null
  rules: string | null
  max_hours_per_booking: number
  weekly_cap_hours: number
  status: 'active' | 'inactive'
  owner?: ResourceOwner | null
}

export interface ResourceEligibility {
  qualifies: boolean
  missing: string[]
  checklist: { name: string; status: string }[]
  message: string
}

export type ResourceDetailResponse = ApiResponse<Resource> & {
  eligibility?: ResourceEligibility | null
}

export interface ResourceListFilters {
  q?: string
  category?: string
  status?: string
  page?: number
  perPage?: number
}

const compactParams = (filters: ResourceListFilters) => {
  const params: Record<string, string | number> = {}

  if (filters.q?.trim()) params.q = filters.q.trim()
  if (filters.category && filters.category !== 'all') params.category = filters.category
  if (filters.status && filters.status !== 'all') params.status = filters.status
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.per_page = filters.perPage

  return params
}

export const fetchResources = async (
  filters: ResourceListFilters = {},
): Promise<ApiResponse<Resource[]>> => {
  return api.get<Resource[]>('/resources', { params: compactParams(filters) })
}

export const fetchResource = async (resourceId: number): Promise<ResourceDetailResponse> => {
  return api.get<Resource>(`/resources/${resourceId}`)
}

const categoryImages: { match: RegExp; src: string }[] = [
  {
    match: /3d|print|fab/i,
    src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
  },
  {
    match: /electronic|test|solder|circuit/i,
    src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    match: /photo|media|studio|camera/i,
    src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
  },
  {
    match: /study|meeting|room|space/i,
    src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  },
  {
    match: /fabrication|laser|cnc|workshop/i,
    src: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
  },
  {
    match: /bio|chem|laboratory|science/i,
    src: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
  },
]

const fallbackImage =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'

export const getResourceImage = (resource: Pick<Resource, 'name' | 'category'>) => {
  const source = `${resource.category} ${resource.name}`
  return categoryImages.find((entry) => entry.match.test(source))?.src ?? fallbackImage
}
