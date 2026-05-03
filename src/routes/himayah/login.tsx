import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { signIn } from '@/lib/auth'

export const Route = createFileRoute('/himayah/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await signIn(email, password)
    setLoading(false)
    if (authError) {
      setError('Incorrect email or password.')
      return
    }
    void navigate({ to: '/himayah' })
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-slate-800">Ma'rifah Hub</span>
          <p className="text-slate-500 text-sm mt-1">Admin access</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <h1 className="font-[family-name:var(--font-lora)] text-xl font-semibold text-slate-800 mb-6">Sign in</h1>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertIcon />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white font-medium text-sm py-3 px-4 rounded-xl transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function AlertIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
