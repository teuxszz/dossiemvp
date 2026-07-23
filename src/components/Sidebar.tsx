import type { ReactNode } from 'react'
import { LayoutDashboard, IdCard, GitCommitVertical, MessageCircle, Lock, ShieldCheck, ShieldAlert, PackageCheck, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/ui'

export type TabKey = 'dashboard' | 'perfil' | 'pdaa' | 'historico' | 'feedbacks' | 'entregas' | 'seguranca'

const NAV: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
  { key: 'perfil', label: 'Perfil', icon: <IdCard size={17} /> },
  { key: 'pdaa', label: 'PDAA', icon: <ShieldAlert size={17} /> },
  { key: 'historico', label: 'Histórico', icon: <GitCommitVertical size={17} /> },
  { key: 'feedbacks', label: 'Feedbacks', icon: <MessageCircle size={17} /> },
  { key: 'entregas', label: 'Entregas', icon: <PackageCheck size={17} /> },
  { key: 'seguranca', label: 'Segurança', icon: <Lock size={17} /> },
]

export function Sidebar({ active, onChange, isAdmin, cicloAtual }: { active: TabKey; onChange: (t: TabKey) => void; isAdmin: boolean; cicloAtual: { ano: number; ciclo: string } }) {
  const items = NAV
  return (
    <aside className="flex shrink-0 flex-col gap-1 border-line bg-sidebar text-sidebar-fg md:h-screen md:w-60 md:border-r md:sticky md:top-0">
      {/* Marca — topo esquerdo */}
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
          <ShieldCheck size={18} />
        </div>
        <div className="leading-tight">
          <div className="font-display text-[15px] font-semibold tracking-tight text-white">CONSEJ</div>
          <div className="text-[11px] text-sidebar-fg">{isAdmin ? 'Dossiê Individual' : 'Meu dossiê'}</div>
        </div>
      </div>

      {/* Ciclo ativo — bem visível, canto superior esquerdo */}
      <div className="px-5 pt-3">
        <span className="flex w-fit items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
          <CalendarClock size={13} /> {cicloAtual.ano} · {cicloAtual.ciclo}
        </span>
      </div>

      {/* Navegação vertical (vira horizontal com scroll no mobile) */}
      <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-visible">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={cn(
              'flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
              active === item.key
                ? 'bg-brand text-white shadow-card'
                : 'text-sidebar-fg hover:bg-sidebar-accent hover:text-white',
            )}
          >
            <span className={active === item.key ? 'text-white' : 'text-sidebar-fg'}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto hidden border-t border-sidebar-border px-5 py-3 text-[10px] text-sidebar-fg md:block">
        CONSEJ · Empresa Júnior · MVP
      </div>
    </aside>
  )
}
