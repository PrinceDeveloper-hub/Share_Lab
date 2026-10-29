import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  api,
  AUTH_EXPIRED_EVENT,
  getApiErrorMessage,
  getApiFieldErrors,
} from '../../lib/api-client'
import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from '../../lib/api-client'

export type { LoginPayload, RegisterPayload }

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

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

  const clearSession = useCallback(() => {
    setUser(null)
    setStatus('anonymous')
  }, [])

  const loadSession = useCallback(async () => {
    try {
      const response = await api.get<User>('/me')
      setUser(response.data)
      setStatus('authenticated')
    } catch {
      clearSession()
    }
  }, [clearSession])

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
        clearSession()
      }
    }

    void restoreSession()

    const onExpired = () => {
      if (active) clearSession()
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)

    return () => {
      active = false
      window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
    }
  }, [clearSession])

  const login = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      try {
        const response = await api.post<LoginPayload, AuthSession>('/login', {
          email: email.trim().toLowerCase(),
          password,
        })

        setUser(response.data.user)
        setStatus('authenticated')

        return { success: true, user: response.data.user }
      } catch (error) {
        return {
          success: false,
          error: getApiErrorMessage(
            error,
            'Sign in failed. Check your details and try again.',
          ),
          fieldErrors: getApiFieldErrors(error),
        }
      }
    },
    [],
  )

  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthActionResult> => {
      try {
        const response = await api.post<RegisterPayload, AuthSession>(
          '/register',
          {
            ...payload,
            email: payload.email.trim().toLowerCase(),
            name: payload.name.trim(),
          },
        )

        setUser(response.data.user)
        setStatus('authenticated')

        return { success: true, user: response.data.user }
      } catch (error) {
        return {
          success: false,
          error: getApiErrorMessage(
            error,
            'Account creation failed. Please try again.',
          ),
          fieldErrors: getApiFieldErrors(error),
        }
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch {
      // Clearing the local session is still the right outcome if the network
      // or the already-expired cookie prevents a clean server logout.
    } finally {
      clearSession()
    }
  }, [clearSession])

  const refreshSession = useCallback(async () => {
    await loadSession()
  }, [loadSession])

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
    [login, logout, refreshSession, register, status, user],
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
