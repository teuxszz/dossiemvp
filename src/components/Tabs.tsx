import type { ReactNode } from 'react'
import { LayoutDashboard, GitCommitVertical, BarChart3, FileText, Lock } from 'lucide-react'
import { cn } from '@/lib/ui'

export type TabKey = 'visao' | 'historico' | 'analise' | 'detalhes' | 'seguranca'

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: 'visao', label: 'Visão geral', icon: <LayoutDashboard size={14} /> },
  { key: 'historico', label: 'Histórico', icon: <GitCommitVertical size={14} /> },
  { key: 'analise', label: 'Análise', icon: <BarChart3 size={14} /> },
  { key: 'detalhes', label: 'Detalhes', icon: <FileText size={14} /> },
  { key: 'seguranca', label: 'Segurança', icon: <Lock size={14} /> },
]

export function Tabs({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div className="flex gap-0 overflow-x-auto border-b border-line bg-bg-primary px-4 sm:px-6">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-[13px] transition-colors',
            active === t.key
              ? 'border-brand font-medium text-brand'
              : 'border-transparent text-ink-secondary hover:text-ink-primary',
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  )
}
