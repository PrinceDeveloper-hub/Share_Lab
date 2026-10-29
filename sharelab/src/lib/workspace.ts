import { api } from './api-client'
import type { ApiResponse } from './api-client'
import { fetchBookings } from './booking-service'
import type { Booking, BookingListFilters } from './booking-service'
import type {
  AvailabilityWindow,
  Resource,
  ResourcePayload,
  ResourceRequirement,
} from './resources'

export interface ManagerDashboardSummary {
  assigned_resources: number
  pending_requests: number
  pending_credentials: number
  open_incidents: number
  bookings_today: number
}

export interface OwnerDashboardSummary {
  resources: number
  pending_requests: number
  upcoming_bookings: number
  open_incidents: number
  pending_credentials: number
}

export interface ManagerAssignment {
  id: number
  name: string
  email: string
  role: string
}

export const fetchManagerDashboard = async (): Promise<
  ApiResponse<ManagerDashboardSummary>
> => {
  return api.get<ManagerDashboardSummary>('/manager/dashboard')
}

export const fetchManagerResources = async (): Promise<ApiResponse<Resource[]>> => {
  return api.get<Resource[]>('/manager/resources', { params: { per_page: 100 } })
}

export const fetchManagerRequests = async (
  filters: BookingListFilters = {},
): Promise<ApiResponse<Booking[]>> => {
  return fetchBookings(filters, '/manager/requests')
}

export const fetchOwnerDashboard = async (): Promise<ApiResponse<OwnerDashboardSummary>> => {
  return api.get<OwnerDashboardSummary>('/owner/dashboard')
}

export const fetchOwnerResources = async (): Promise<ApiResponse<Resource[]>> => {
  return api.get<Resource[]>('/owner/resources', { params: { per_page: 100 } })
}

export const fetchOwnerBookings = async (
  filters: BookingListFilters = {},
): Promise<ApiResponse<Booking[]>> => {
  return fetchBookings(filters, '/owner/bookings')
}

export const fetchOwnerManagers = async (
  resourceId: number,
): Promise<ApiResponse<ManagerAssignment[]>> => {
  return api.get<ManagerAssignment[]>(`/owner/resources/${resourceId}/managers`)
}

export const assignOwnerManager = async (
  resourceId: number,
  email: string,
): Promise<ApiResponse<ManagerAssignment[]>> => {
  return api.post<{ email: string }, ManagerAssignment[]>(
    `/owner/resources/${resourceId}/managers`,
    { email },
  )
}

export const removeOwnerManager = async (
  resourceId: number,
  managerId: number,
): Promise<ApiResponse<ManagerAssignment[]>> => {
  return api.delete<ManagerAssignment[]>(
    `/owner/resources/${resourceId}/managers/${managerId}`,
  )
}

const resourceForm = (
  payload: ResourcePayload,
  image?: File | null,
  method?: 'PATCH',
) => {
  const form = new FormData()

  if (method) form.append('_method', method)

  form.append('name', payload.name)
  form.append('category', payload.category)
  form.append('location', payload.location)
  form.append('max_hours_per_booking', String(payload.max_hours_per_booking))
  form.append('weekly_cap_hours', String(payload.weekly_cap_hours))
  form.append('status', payload.status ?? 'active')

  if (payload.description !== undefined) {
    form.append('description', payload.description ?? '')
  }
  if (payload.rules !== undefined) {
    form.append('rules', payload.rules ?? '')
  }

  payload.availability_windows?.forEach((window, index) => {
    form.append(`availability_windows[${index}][weekday]`, String(window.weekday))
    form.append(`availability_windows[${index}][start]`, window.start)
    form.append(`availability_windows[${index}][end]`, window.end)
  })

  payload.requirements?.forEach((requirement, index) => {
    form.append(`requirements[${index}][name]`, requirement.name)
    form.append(
      `requirements[${index}][requires_verification]`,
      requirement.requires_verification ? '1' : '0',
    )
  })

  if (image) form.append('image', image)

  return form
}

export const createResource = async (
  payload: ResourcePayload,
  image?: File | null,
): Promise<ApiResponse<Resource>> => {
  return api.postForm<Resource>('/resources', resourceForm(payload, image))
}

export const updateResource = async (
  resourceId: number,
  payload: ResourcePayload,
  image?: File | null,
): Promise<ApiResponse<Resource>> => {
  return api.patchForm<Resource>(
    `/resources/${resourceId}`,
    resourceForm(payload, image, 'PATCH'),
  )
}

export const deleteResource = async (resourceId: number): Promise<ApiResponse<null>> => {
  return api.delete<null>(`/resources/${resourceId}`)
}

export const availabilityDefaults: AvailabilityWindow[] = [
  { weekday: 1, start: '09:00', end: '17:00' },
  { weekday: 2, start: '09:00', end: '17:00' },
  { weekday: 3, start: '09:00', end: '17:00' },
  { weekday: 4, start: '09:00', end: '17:00' },
  { weekday: 5, start: '09:00', end: '17:00' },
]

export const requirementDefaults: ResourceRequirement[] = []
