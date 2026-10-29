import { Moon, Sun } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../features/theme/ThemeProvider'

interface ThemeToggleProps {
  className?: string
  /** Renders a labelled row instead of the compact icon button. */
  withLabel?: boolean
}

export const ThemeToggle = ({
  className,
  withLabel = false,
}: ThemeToggleProps) => {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        className={cn(
          'flex min-h-11 w-full items-center gap-3 rounded-[0.5rem] border border-(--border-subtle) bg-(--surface) px-3 text-sm font-medium text-(--charcoal) transition-colors hover:bg-(--surface-sunken) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)',
          className,
        )}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-(--bronze)" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4 text-(--bronze)" aria-hidden="true" />
        )}
        {isDark ? 'Light mode' : 'Dark mode'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md text-(--muted-strong) transition-colors hover:bg-(--surface-sunken) hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)',
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
      ) : (
        <Moon className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
      )}
    </button>
  )
}

export default ThemeToggle
