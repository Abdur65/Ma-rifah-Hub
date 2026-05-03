import { createFileRoute, Outlet, redirect, useNavigate, Link } from '@tanstack/react-router'
import { getSession, signOut } from '@/lib/auth'

export const Route = createFileRoute('/himayah')({
  beforeLoad: async ({ location }) => {
    // Login page is always accessible
    if (location.pathname === '/himayah/login') return
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/himayah/login' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    void navigate({ to: '/himayah/login' })
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/himayah" className="font-[family-name:var(--font-lora)] text-lg font-semibold text-slate-800 hover:text-slate-600 transition-colors">
              Ma'rifah Hub
            </Link>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
              View site
            </Link>
            <button
              onClick={() => void handleSignOut()}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
