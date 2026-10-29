import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchProfile, updatePassword, updateProfile } from '../lib/profile'

export const useProfile = () => {
  const { status } = useAuth()
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: status === 'authenticated',
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export const useUpdatePassword = () => {
  return useMutation({ mutationFn: updatePassword })
}
