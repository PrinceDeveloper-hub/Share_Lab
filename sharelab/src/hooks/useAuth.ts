import { useEffect } from 'react'
import { api } from '../lib/api-client'
import type { User } from '../lib/api-client'

export const useAuth = () => {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get<ApiResponse<User>>('/me')
        setUser(response.data)
      } catch (error) {
        console.error('Failed to load user', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<User>>('/login', { email, password })
      api.setAuthToken(response.data.user.id?.toString() || '')
      setUser(response.data.user)
      return { success: true, user: response.data.user }
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      await api.post<ApiResponse>('/logout')
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      api.removeAuthToken()
      setUser(null)
    }
  }

  return { user, loading, login, logout }
}