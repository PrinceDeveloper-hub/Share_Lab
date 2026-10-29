import { api } from './api-client'

export type CredentialStatus = 'pending' | 'verified' | 'rejected'

export interface Credential {
  id: number
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
}
