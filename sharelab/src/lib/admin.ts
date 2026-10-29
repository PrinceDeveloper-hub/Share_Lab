import { api } from './api-client'
import type { User } from './api-client'

export interface AdminUser extends User {
  status?: string | null
}

export interface AuditActor {
  id: number
  name: string
  email?: string
}

export interface AuditEntry {
  id: number
  action: string
  actor_id?: number | null
  actor?: AuditActor | null
  booking_id?: number | null
  subject_type?: string | null
  subject_id?: number | null
  reason?: string | null
  created_at?: string | null
}

interface Paginated<T> {
  data?: T[]
  total?: number
  current_page?: number
  last_page?: number
  per_page?: number
}

export interface AuditList {
  items: AuditEntry[]
  total: number
}

export interface UserList {
  items: AdminUser[]
  total: number
}

export const fetchAdminUsers = async (): Promise<UserList> => {
  const response = await api.get<AdminUser[]>('/admin/users', {
    params: { per_page: 50 },
  })
  const items = response.data
  return { items, total: response.meta?.total ?? items.length }
}

export const updateUserRole = async (
  userId: number,
  role: User['role'],
): Promise<void> => {
  await api.patch(`/admin/users/${userId}/role`, { role })
}

export const fetchAuditLog = async (): Promise<AuditList> => {
  const response = await api.get<Paginated<AuditEntry> | AuditEntry[]>(
    '/admin/audit',
    {
      params: { per_page: 50 },
    },
  )

  const payload = response.data

  if (Array.isArray(payload)) return { items: payload, total: payload.length }

  if (Array.isArray(payload.data)) {
    return { items: payload.data, total: payload.total ?? payload.data.length }
  }

  return { items: [], total: 0 }
}
