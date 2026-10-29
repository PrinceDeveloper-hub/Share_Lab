import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/notifications'

export const useNotifications = () => {
  const { status } = useAuth()
  return useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => fetchNotifications(),
    enabled: status === 'authenticated',
    refetchInterval: 60_000,
  })
}

export const useUnreadNotificationCount = () => {
  const { status } = useAuth()
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: fetchUnreadNotificationCount,
    enabled: status === 'authenticated',
    refetchInterval: 60_000,
  })
}

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
