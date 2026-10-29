import { api } from './api-client'
import type { ApiResponse, User } from './api-client'

export interface ResourceOwner {
  id: number
  name: string
  email?: string
  role?: string
}

export interface ResourceRequirement {
  id: number
  name: string
  requires_verification: boolean
}

export interface AvailabilityWindow {
  weekday: number
  start: string
  end: string
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
  availability_windows?: AvailabilityWindow[] | null
  image_url?: string | null
  status: 'active' | 'inactive'
  owner?: ResourceOwner | null
  requirements?: ResourceRequirement[]
  managers?: User[]
  can_manage?: boolean
  created_at?: string
}

export interface ResourceEligibilityChecklistItem {
  name: string
  status: string
}

export interface ResourceEligibility {
  qualifies: boolean
  missing: string[]
  checklist: ResourceEligibilityChecklistItem[]
  message: string
}

export type ResourceDetail = Resource & {
  eligibility?: ResourceEligibility | null
}

export type ResourceDetailResponse = ApiResponse<ResourceDetail>

export interface ResourceListFilters {
  q?: string
  category?: string
  status?: string
  page?: number
  perPage?: number
  sort?: string
  direction?: 'asc' | 'desc'
  ownerId?: number
}

export interface AvailabilitySlot {
  start_at: string
  end_at: string
  available: boolean
  reason: string | null
}

export interface ResourceAvailability {
  date: string
  slots: AvailabilitySlot[]
  message: string | null
}

export interface ResourcePayload {
  name: string
  category: string
  location: string
  description?: string | null
  rules?: string | null
  max_hours_per_booking: number
  weekly_cap_hours: number
  status?: 'active' | 'inactive'
  availability_windows?: AvailabilityWindow[]
  requirements?: Array<{ name: string; requires_verification: boolean }>
}

const compactParams = (filters: ResourceListFilters) => {
  const params: Record<string, string | number> = {}

  if (filters.q?.trim()) params.q = filters.q.trim()
  if (filters.category && filters.category !== 'all')
    params.category = filters.category
  if (filters.status && filters.status !== 'all') params.status = filters.status
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.per_page = filters.perPage
  if (filters.sort) params.sort = filters.sort
  if (filters.direction) params.direction = filters.direction
  if (filters.ownerId) params.owner_id = filters.ownerId

  return params
}

export const fetchResources = async (
  filters: ResourceListFilters = {},
): Promise<ApiResponse<Resource[]>> => {
  return api.get<Resource[]>('/resources', { params: compactParams(filters) })
}

export const fetchResource = async (
  resourceId: number,
): Promise<ResourceDetailResponse> => {
  return api.get<ResourceDetail>(`/resources/${resourceId}`)
}

export const fetchResourceAvailability = async (
  resourceId: number,
  date: string,
): Promise<ApiResponse<ResourceAvailability>> => {
  return api.get<ResourceAvailability>(
    `/resources/${resourceId}/availability`,
    {
      params: { date },
    },
  )
}

export const fetchResourceEligibility = async (
  resourceId: number,
): Promise<ApiResponse<ResourceEligibility>> => {
  return api.get<ResourceEligibility>(`/resources/${resourceId}/eligibility`)
}

const localResourceImages: { match: RegExp; src: string }[] = [
  {
    match: /3d|print|resin|fdm|prototype/i,
    src: '/images/resources/3d-printer.webp',
  },
  {
    match: /solder|circuit|rework|repair/i,
    src: '/images/resources/soldering-station.webp',
  },
  {
    match: /oscillo|electronic|test|probe|signal|research/i,
    src: '/images/resources/oscilloscope.webp',
  },
  {
    match: /camera|photo|media|studio|documentary|podcast/i,
    src: '/images/resources/camera-kit.webp',
  },
  {
    match: /meeting|room|study|space|seminar|library|pod/i,
    src: '/images/resources/meeting-room.webp',
  },
  {
    match: /laser|fabrication|cnc|workshop|maker/i,
    src: '/images/resources/laser-cutter.webp',
  },
]

/** Category-level fallback keeps every seeded listing paired with a fitting image. */
const categoryImages: Record<string, string | undefined> = {
  Fabrication: '/images/resources/laser-cutter.webp',
  Electronics: '/images/resources/oscilloscope.webp',
  Media: '/images/resources/camera-kit.webp',
  Study: '/images/resources/meeting-room.webp',
}

const fallbackImage = '/images/resources/laser-cutter.webp'

/**
 * Prefer an uploaded/seeded image, then a bundled local image. No remote
 * placeholder URLs are used, so catalogue cards keep working offline.
 */
export const getResourceImage = (
  resource: Pick<Resource, 'name' | 'category'> & { image_url?: string | null },
) => {
  if (resource.image_url) return resource.image_url

  const source = `${resource.category} ${resource.name}`
  return (
    localResourceImages.find((entry) => entry.match.test(source))?.src ??
    categoryImages[resource.category] ??
    fallbackImage
  )
}
