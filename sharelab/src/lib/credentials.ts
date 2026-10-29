import { api } from './api-client'
import type { ApiResponse, User } from './api-client'

export type CredentialStatus = 'pending' | 'verified' | 'rejected'

export interface Credential {
  id: number
  user_id: number
  requirement_name: string
  status: CredentialStatus
  review_note: string | null
  verified_by: number | null
  file_url: string | null
  user?: User
  created_at: string
}

export type CredentialDecision = 'verify' | 'reject'

export const fetchMyCredentials = async (
  perPage = 50,
): Promise<ApiResponse<Credential[]>> => {
  return api.get<Credential[]>('/credentials', { params: { per_page: perPage } })
}

export const fetchCredentialQueue = async (
  scope: 'manager' | 'owner',
  perPage = 50,
): Promise<ApiResponse<Credential[]>> => {
  return api.get<Credential[]>(`/${scope}/credentials`, {
    params: { per_page: perPage },
  })
}

export const submitCredential = async (payload: {
  requirementName: string
  file: File
}): Promise<ApiResponse<Credential>> => {
  const form = new FormData()
  form.append('requirement_name', payload.requirementName)
  form.append('file', payload.file)
  return api.postForm<Credential>('/credentials', form)
}

export const reviewCredential = async (
  credentialId: number,
  decision: CredentialDecision,
  note: string,
): Promise<ApiResponse<Credential>> => {
  return api.patch<{ decision: CredentialDecision; note: string }, Credential>(
    `/credentials/${credentialId}/review`,
    { decision, note },
  )
}
