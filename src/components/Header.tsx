import { ChevronLeft, Download, Sparkles, Sun, Moon, Database, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/ui'
import type { Colaborador } from '@/lib/types'
import type { DataSource } from '@/hooks/useDossie'
import { FarolBadge } from './Farol'

interface Props {
  colaborador: Colaborador
  onBack: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  source: DataSource
  pontosPdaa: number
}

export function Header({ colaborador, onBack, theme, onToggleTheme, source, pontosPdaa }: Props) {
  return (
    <header className="border-b border-line bg-bg-primary px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Botão voltar */}
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-bg-secondary text-ink-tertiary hover:text-brand"
          title="Voltar à lista"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Avatar */}
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-brand-dark text-[15px] font-medium text-brand-soft">
          {colaborador.iniciais}
        </div>

        {/* Nome + cargo */}
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-ink-primary">{colaborador.nome}</p>
          <p className="mt-0.5 text-xs text-ink-secondary">{colaborador.cargo} · {colaborador.area}</p>
        </div>

        {/* Ações */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden sm:inline-flex">
            <FarolBadge pontos={pontosPdaa} />
          </span>
          <span
            className={cn(
              'hidden items-center gap-1 rounded-md border px-2 py-1 text-[11px] sm:inline-flex',
              source === 'supabase'
                ? 'border-good/40 bg-good-soft text-good'
                : 'border-warn/40 bg-warn-soft text-warn',
            )}
            title={source === 'supabase' ? 'Lendo do Supabase' : 'Dados de exemplo (Supabase não configurado)'}
          >
            {source === 'supabase' ? <Database size={12} /> : <FlaskConical size={12} />}
            {source === 'supabase' ? 'Supabase' : 'Dados de exemplo'}
          </span>

          <button
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-bg-secondary text-ink-secondary hover:text-ink-primary"
            aria-label="Alternar tema"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <button className="hidden items-center gap-1.5 rounded-md border border-line bg-bg-secondary px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary sm:inline-flex">
            <Download size={13} /> Exportar
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark">
            <Sparkles size={13} /> Análise IA
          </button>
        </div>
      </div>
    </header>
  )
}
