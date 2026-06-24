import type { ReactNode } from 'react'
import { LayoutDashboard, IdCard, GitCommitVertical, MessageCircle, Lock, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/ui'

export type TabKey = 'dashboard' | 'perfil' | 'historico' | 'feedbacks' | 'seguranca'

const NAV: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
  { key: 'perfil', label: 'Perfil', icon: <IdCard size={17} /> },
  { key: 'historico', label: 'Histórico', icon: <GitCommitVertical size={17} /> },
  { key: 'feedbacks', label: 'Feedbacks', icon: <MessageCircle size={17} /> },
  { key: 'seguranca', label: 'Segurança', icon: <Lock size={17} /> },
]

export function Sidebar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <aside className="flex shrink-0 flex-col gap-1 border-line bg-sidebar text-sidebar-fg md:h-screen md:w-60 md:border-r md:sticky md:top-0">
      {/* Marca — topo esquerdo */}
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
          <ShieldCheck size={18} />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight text-white">CONSEJ</div>
          <div className="text-[11px] text-sidebar-fg">Dossiê Individual</div>
        </div>
      </div>

      {/* Navegação vertical (vira horizontal com scroll no mobile) */}
      <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-visible">
        {NAV.map((item) => (
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
