import { api } from './api-client'
import type { ApiResponse, User } from './api-client'

export interface ProfileUpdatePayload {
  name: string
  email: string
}

export interface PasswordUpdatePayload {
  current_password: string
  password: string
  password_confirmation: string
}

export const fetchProfile = async (): Promise<ApiResponse<User>> => {
  return api.get<User>('/profile')
}

export const updateProfile = async (
  payload: ProfileUpdatePayload,
): Promise<ApiResponse<User>> => {
  return api.patch<ProfileUpdatePayload, User>('/profile', payload)
}

export const updatePassword = async (
  payload: PasswordUpdatePayload,
): Promise<ApiResponse<null>> => {
  return api.patch<PasswordUpdatePayload, null>('/profile/password', payload)
}
