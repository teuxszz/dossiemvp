import { useState } from 'react'
import { User, ListChecks, MessageCircle } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import type { CategoriaFeedback, Dossie } from '@/lib/types'

const FILTROS: { key: CategoriaFeedback | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'positivo', label: 'Positivo' },
  { key: 'desenvolvimento', label: 'Desenvolvimento' },
  { key: 'gestor', label: 'Do gestor' },
]

function barColor(p: number) {
  if (p >= 70) return 'bg-good-bar'
  if (p >= 50) return 'bg-good-bar'
  return 'bg-warn'
}

export function Detalhes({ dossie }: { dossie: Dossie }) {
  const [filtro, setFiltro] = useState<CategoriaFeedback | 'todos'>('todos')
  const { dadosPessoais: dp } = dossie

  const feedbacks =
    filtro === 'todos' ? dossie.feedbacks : dossie.feedbacks.filter((f) => f.categorias.includes(filtro))

  const dados = [
    ['Admissão', dp.admissao],
    ['Regime', dp.regime],
    ['Formação', dp.formacao],
    ['Gestor direto', dp.gestor],
    ['Faixa salarial', dp.faixaSalarial],
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<User size={15} />}>Dados pessoais</SectionTitle>
          <div className="divide-y divide-line">
            {dados.map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 text-xs">
                <span className="text-ink-secondary">{k}</span>
                <span className="font-medium text-ink-primary">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<ListChecks size={15} />}>PDI — ciclo atual</SectionTitle>
          <div className="space-y-2.5">
            {dossie.pdi.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-36 shrink-0 text-xs text-ink-secondary">{item.titulo}</div>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-secondary">
                  <div className={cn('h-full rounded-full', barColor(item.progresso))} style={{ width: `${item.progresso}%` }} />
                </div>
                <div className="w-9 text-right text-[11px] font-medium text-ink-secondary">{item.progresso}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<MessageCircle size={15} />}>Feedbacks</SectionTitle>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-[11px] transition-colors',
                filtro === f.key
                  ? 'border-brand/40 bg-brand-soft text-brand'
                  : 'border-line bg-bg-secondary text-ink-secondary hover:text-ink-primary',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="divide-y divide-line">
          {feedbacks.length === 0 && (
            <div className="py-6 text-center text-xs text-ink-tertiary">Nenhum feedback nesta categoria.</div>
          )}
          {feedbacks.map((f) => (
            <div key={f.id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-primary">
                  {f.autor} — {f.papel}
                </span>
                <span className="text-[11px] text-ink-tertiary">{f.data}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{f.texto}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {f.tags.map((t) => (
                  <span key={t.label} className={cn('rounded-md px-2 py-0.5 text-[11px]', toneBadge[t.tone as Tone])}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
