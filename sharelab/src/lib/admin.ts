import { api } from './api-client'
import type { ApiResponse } from './api-client'
import type { Booking } from './booking-service'

export type AdminRole = 'user' | 'owner' | 'manager' | 'admin'

export interface AdminActivityEntry {
  id: number
  action: string
  reason: string | null
  actor: string | null
  booking_id: number | null
  created_at: string | null
}

export interface AdminOverview {
  users: {
    total: number
    by_role: Record<AdminRole, number>
    new_last_7_days: number
  }
  resources: {
    total: number
    active: number
    inactive: number
    by_category: Record<string, number>
  }
  bookings: {
    total: number
    by_status: Record<string, number>
    today: number
    this_week: number
  }
  credentials: {
    pending: number
    verified: number
  }
  incidents: {
    open: number
    resolved: number
  }
  top_resources: Array<{
    id: number
    name: string
    category: string
    location: string
    bookings_count: number
  }>
  recent_bookings: Booking[]
  recent_activity: AdminActivityEntry[]
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: AdminRole
  bookings_count?: number
}

export interface AdminUserFilters {
  q?: string
  role?: AdminRole | 'all'
  page?: number
  perPage?: number
}

export interface AdminAuditEntry {
  id: number
  action: string
  reason: string | null
  actor: string | null
  actor_role: string | null
  booking_id: number | null
  resource_id: number | null
  created_at: string | null
}

export interface AdminAuditFilters {
  action?: string
  page?: number
  perPage?: number
}

export const fetchAdminOverview = async (): Promise<ApiResponse<AdminOverview>> =>
  api.get<AdminOverview>('/admin/dashboard')

export const fetchAdminUsers = async (
  filters: AdminUserFilters,
): Promise<ApiResponse<AdminUser[]>> =>
  api.get<AdminUser[]>('/admin/users', {
    params: {
      page: filters.page ?? 1,
      per_page: filters.perPage ?? 10,
      ...(filters.q?.trim() ? { q: filters.q.trim() } : {}),
      ...(filters.role && filters.role !== 'all' ? { role: filters.role } : {}),
    },
  })

export const fetchAdminAudit = async (
  filters: AdminAuditFilters,
): Promise<ApiResponse<AdminAuditEntry[]>> =>
  api.get<AdminAuditEntry[]>('/admin/audit', {
    params: {
      page: filters.page ?? 1,
      per_page: filters.perPage ?? 12,
      ...(filters.action && filters.action !== 'all' ? { action: filters.action } : {}),
    },
  })

export const actionLabel = (action: string) =>
  action
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
