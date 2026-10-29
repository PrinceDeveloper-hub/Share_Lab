import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/notifications'

export const useNotifications = (page = 1, perPage = 12) => {
  const { status } = useAuth()
  return useQuery({
    queryKey: ['notifications', 'list', { page, perPage }],
    queryFn: () => fetchNotifications(perPage, page),
    enabled: status === 'authenticated',
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export const usePrefetchNotifications = (perPage = 12) => {
  const queryClient = useQueryClient()
  const { status } = useAuth()

  return (page: number) => {
    if (status !== 'authenticated') return Promise.resolve()
    return queryClient.prefetchQuery({
      queryKey: ['notifications', 'list', { page, perPage }],
      queryFn: () => fetchNotifications(perPage, page),
      staleTime: 30_000,
    })
  }
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
