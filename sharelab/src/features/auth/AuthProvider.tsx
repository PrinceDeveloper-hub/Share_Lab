import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api, getApiErrorMessage, getApiFieldErrors } from '../../lib/api-client'
import type { AuthSession, User } from '../../lib/api-client'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export type AuthActionResult =
  | { success: true; user: User }
  | { success: false; error: string; fieldErrors: Record<string, string> }

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  loading: boolean
  login: (email: string, password: string) => Promise<AuthActionResult>
  register: (payload: RegisterPayload) => Promise<AuthActionResult>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let active = true

    const restoreSession = async () => {
      try {
        const response = await api.get<User>('/me')
        if (!active) return
        setUser(response.data)
        setStatus('authenticated')
      } catch {
        if (!active) return
        setUser(null)
        setStatus('anonymous')
      }
    }

    void restoreSession()

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    try {
      const response = await api.post<LoginPayload, AuthSession>('/login', {
        email,
        password,
      })

      setUser(response.data.user)
      setStatus('authenticated')

      return { success: true, user: response.data.user }
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error, 'Sign in failed. Please check your details and try again.'),
        fieldErrors: getApiFieldErrors(error),
      }
    }
  }, [])

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthActionResult> => {
    try {
      const response = await api.post<RegisterPayload, AuthSession>('/register', payload)

      setUser(response.data.user)
      setStatus('authenticated')

      return { success: true, user: response.data.user }
    } catch (error) {
      return {
        success: false,
        error: getApiErrorMessage(error, 'Account creation failed. Please try again.'),
        fieldErrors: getApiFieldErrors(error),
      }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch {
      // The local UI still needs to end the session; the cookie will expire or
      // be cleared by the server on the next successful request.
    } finally {
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  const refreshSession = useCallback(async () => {
    setStatus('loading')

    try {
      const response = await api.get<User>('/me')
      setUser(response.data)
      setStatus('authenticated')
    } catch {
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      loading: status === 'loading',
      login,
      register,
      logout,
      refreshSession,
    }),
    [login, logout, refreshSession, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
