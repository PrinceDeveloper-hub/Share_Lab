import { GlassPanel } from '../../components/glass/GlassPanel'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'

export const Login = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <GlassPanel className="p-6 md:p-12 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-charcoal mb-6">Log in</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[--muted] mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-[--muted] mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-espresso"
            placeholder="Password"
            required
          />
        </div>

        {error && (
          <p className="text-[--error] text-sm">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-espresso text-white px-6 py-3 rounded-full font-medium hover:bg-[--deep-brown] transition-colors"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </GlassPanel>
  )
}

export default Login
