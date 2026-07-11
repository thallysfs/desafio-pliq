import { Activity, BarChart3, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base =
    'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors'
  return isActive
    ? `${base} bg-primary text-white`
    : `${base} text-slate-600 hover:bg-slate-100`
}

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Activity className="h-4.5 w-4.5" strokeWidth={2.25} />
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">Vita Bem-Estar</span>
              <span className="text-sm text-slate-400">· Customer Experience</span>
            </span>
          </div>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navLinkClass}>
              <BarChart3 className="h-4 w-4" />
              Resumo
            </NavLink>
            <NavLink to="/contatos" className={navLinkClass}>
              <Users className="h-4 w-4" />
              Contatos
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
