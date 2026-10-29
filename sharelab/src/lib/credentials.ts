import { api } from './api-client'
<<<<<<< HEAD
=======
import type { ApiResponse, User } from './api-client'
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec

export type CredentialStatus = 'pending' | 'verified' | 'rejected'

export interface Credential {
  id: number
<<<<<<< HEAD
  requirement_name: string
  status: CredentialStatus
  file_path?: string | null
  review_note?: string | null
  created_at?: string | null
  verified_at?: string | null
  user?: { id: number; name: string; email?: string } | null
  requirement?: { id: number; name: string } | null
}

interface Paginated<T> {
  data?: T[]
  meta?: { total?: number }
  total?: number
  current_page?: number
  last_page?: number
  per_page?: number
}

export interface CredentialList {
  items: Credential[]
  total: number
}

const unwrap = (payload: unknown): CredentialList => {
  if (Array.isArray(payload))
    return { items: payload as Credential[], total: payload.length }

  if (payload && typeof payload === 'object') {
    const outer = payload as Paginated<Credential>
    if (Array.isArray(outer.data)) {
      return {
        items: outer.data,
        total: outer.total ?? outer.meta?.total ?? outer.data.length,
      }
    }

    const nested = outer.data as unknown as Paginated<Credential> | undefined
    if (nested && Array.isArray(nested.data)) {
      return {
        items: nested.data,
        total: nested.total ?? nested.meta?.total ?? nested.data.length,
      }
    }
  }

  return { items: [], total: 0 }
}

export const fetchCredentials = async (): Promise<CredentialList> => {
  const response = await api.get<Paginated<Credential>>('/credentials')
  return unwrap(response.data)
}

export const submitCredential = async (
  requirementName: string,
  file: File,
): Promise<void> => {
  const formData = new FormData()
  formData.append('requirement_name', requirementName)
  formData.append('file', file)

  await api.post('/credentials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const decideCredential = async (
  credentialId: number,
  decision: 'verify' | 'reject',
  note?: string,
): Promise<void> => {
  await api.patch(`/credentials/${credentialId}`, {
    decision,
    note: note?.trim() ? note.trim() : undefined,
  })
}

export const credentialStatusLabel: Record<CredentialStatus, string> = {
  pending: 'Pending review',
  verified: 'Verified',
  rejected: 'Rejected',
=======
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
}
