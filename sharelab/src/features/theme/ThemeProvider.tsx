import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'sharelab-theme'

const ThemeContext = createContext<ThemeContextValue | null>(null)

const systemTheme = (): ResolvedTheme =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

const readStoredTheme = (): ThemePreference => {
  if (typeof window === 'undefined') return 'system'

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system'
}

const applyTheme = (resolved: ResolvedTheme) => {
  const root = document.documentElement
  root.dataset.theme = resolved
  root.style.colorScheme = resolved

  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', resolved === 'dark' ? '#17110d' : '#4B2F1F')
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemePreference>(readStoredTheme)
  const [systemResolved, setSystemResolved] =
    useState<ResolvedTheme>(systemTheme)

  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? systemResolved : theme

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemResolved(query.matches ? 'dark' : 'light')

    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
