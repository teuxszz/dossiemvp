import { Lock, ShieldCheck, Download, Sparkles, Sun, Moon, ChevronDown, Database, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/ui'
import type { Colaborador } from '@/lib/types'
import type { DataSource } from '@/hooks/useDossie'
import { FarolBadge } from './Farol'

interface Props {
  colaborador: Colaborador
  colaboradores: Pick<Colaborador, 'id' | 'nome' | 'cargo' | 'iniciais'>[]
  selectedId: string | null
  onSelect: (id: string) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  source: DataSource
  pontosPdaa: number
}

export function Header({ colaborador, colaboradores, selectedId, onSelect, theme, onToggleTheme, source, pontosPdaa }: Props) {
  const multiplos = colaboradores.length > 1

  return (
    <header className="border-b border-line bg-bg-primary px-4 py-4 sm:px-6">
      <div className="flex items-start gap-3">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-brand-dark text-[15px] font-medium text-brand-soft" style={{ height: 52, width: 52 }}>
          {colaborador.iniciais}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {multiplos ? (
              <div className="relative">
                <select
                  value={selectedId ?? ''}
                  onChange={(e) => onSelect(e.target.value)}
                  className="appearance-none rounded-md border border-line bg-bg-secondary py-1 pl-2 pr-7 text-base font-medium text-ink-primary"
                  aria-label="Selecionar colaborador"
                >
                  {colaboradores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-tertiary" size={14} />
              </div>
            ) : (
              <span className="text-base font-semibold text-ink-primary">{colaborador.nome}</span>
            )}

            {colaborador.acessoRestrito && (
              <span className="inline-flex items-center gap-1 rounded-md border border-bad/40 bg-bad-soft px-2 py-0.5 text-[11px] font-medium text-bad">
                <Lock size={11} /> Acesso restrito
              </span>
            )}
            {colaborador.ssoMfa && (
              <span className="inline-flex items-center gap-1 rounded-md border border-good/40 bg-good-soft px-2 py-0.5 text-[11px] text-good">
                <ShieldCheck size={11} /> SSO + MFA ativo
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-ink-secondary">
            {colaborador.cargo} · {colaborador.area} · Matrícula: {colaborador.matricula}
          </div>
        </div>

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
