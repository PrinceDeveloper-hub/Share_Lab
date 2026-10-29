import { api } from './api-client'
import type { ApiResponse } from './api-client'

export interface AppNotification {
  id: number
  type: string
  message: string
  booking_id: number | null
  read: boolean
  created_at: string
}

export const fetchNotifications = async (
  perPage = 12,
  page = 1,
): Promise<ApiResponse<AppNotification[]>> => {
  return api.get<AppNotification[]>('/notifications', {
    params: { per_page: perPage, page },
  })
}

export const fetchUnreadNotificationCount = async (): Promise<
  ApiResponse<{ unread: number }>
> => {
  return api.get<{ unread: number }>('/notifications/unread-count')
}

export const markNotificationRead = async (
  notificationId: number,
): Promise<ApiResponse<AppNotification>> => {
  return api.patch<undefined, AppNotification>(
    `/notifications/${notificationId}/read`,
  )
}

export const markAllNotificationsRead = async (): Promise<
  ApiResponse<{ updated: number }>
> => {
  return api.patch<undefined, { updated: number }>('/notifications/read-all')
}
