import { GlassPanel } from '../../components/glass/GlassPanel'
import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export const Dashboard = () => {
  const { user, logout } = useAuth()

  useEffect(() => {
    // Dashboard initialization
  }, [user])

  if (!user) {
    return null
  }

  return (
    <GlassPanel className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-charcoal mb-4">
        Dashboard
      </h1>
      <p className="text-[--muted] text-sm">
        Welcome, {user.name}!
        <button
          onClick={logout}
          className="bg-transparent border-2 border-espresso text-espresso px-3 py-1 rounded text-sm hover:bg-espresso hover:text-white transition-colors mt-2"
        >
          Logout
        </button>
      </p>
    </GlassPanel>
  )
}