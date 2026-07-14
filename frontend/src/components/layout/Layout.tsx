import { Activity, LayoutDashboard, Users } from 'lucide-react'
import type { ComponentType } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Visão Geral', icon: LayoutDashboard, end: true },
  { to: '/contatos', label: 'Gestão de Alunos', icon: Users },
]

function sidebarLinkClass({ isActive }: { isActive: boolean }): string {
  const base =
    'flex items-center gap-4 px-6 py-3.5 text-sm font-medium transition-colors duration-200'
  return isActive
    ? `${base} border-l-4 border-primary-bright bg-white/5 text-white`
    : `${base} border-l-4 border-transparent text-white/60 hover:bg-white/5 hover:text-white`
}

function Brand({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bright text-white shadow-md">
        <Activity className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <div className="leading-tight">
        <p className="font-display text-lg font-bold text-primary-dim">Vita Bem-Estar</p>
        <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
          Customer Experience
        </p>
      </div>
    </div>
  )
}

export function Layout() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed top-0 left-0 z-40 hidden h-full w-[280px] flex-col bg-sidebar shadow-xl md:flex">
        <div className="px-6 py-8">
          <Brand />
        </div>
        <nav className="mt-2 flex-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={sidebarLinkClass}>
              <Icon className="h-5 w-5" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-6 py-6">
          <p className="text-[11px] leading-relaxed text-white/40">
            Fonte única de verdade sobre a satisfação dos alunos da rede.
          </p>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-h-screen flex-col md:ml-[280px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface-1/90 px-4 backdrop-blur md:h-20 md:px-8">
          {/* Marca compacta no mobile (sidebar some) */}
          <div className="flex items-center gap-3 md:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bright text-white">
              <Activity className="h-4.5 w-4.5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-base font-bold text-primary">Vita Bem-Estar</span>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-ink">Equipe CX</p>
              <p className="text-[11px] text-muted">Vita Bem-Estar</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft font-display text-sm font-bold text-primary-strong ring-2 ring-primary-dim/50">
              CX
            </span>
          </div>
        </header>

        {/* Nav horizontal (mobile) */}
        <nav className="flex gap-1 border-b border-line bg-surface-1 px-4 py-2 md:hidden">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-muted hover:bg-surface-2'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="custom-scrollbar flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
