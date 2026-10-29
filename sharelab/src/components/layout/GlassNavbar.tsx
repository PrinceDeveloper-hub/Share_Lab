import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

interface GlassNavbarProps {
  className?: string
}

export const GlassNavbar = ({ className }: GlassNavbarProps = {}) => {
  const { user, logout } = useAuth()

  return (
    <nav className={cn('glass-navbar', className)}>
      <div className="navbar-left">
        <span className="navbar-brand">ShareLab</span>
      </div>
      <div className="navbar-center">
        {/* Home link visible to all */}
        <a href="/" className="navbar-link">
          Home
        </a>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-user">Welcome, {user.name}</span>
            <button onClick={logout} className="navbar-logout btn-link">
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" className="navbar-link">
              Login
            </a>
            <a href="/register" className="navbar-link">
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  )
}
