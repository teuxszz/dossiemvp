import { useState } from 'react'
import {
  ArrowUp,
  Star,
  BookOpen,
  FileWarning,
  GitCommitVertical,
  LogIn,
  Target,
  MessageCircle,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import type { EventoTimeline, TipoEvento, Dossie } from '@/lib/types'

const TIPO_CONFIG: Record<
  TipoEvento,
  { label: string; icon: typeof ArrowUp; defaultTipo: EventoTimeline['tipo'] }
> = {
  ingresso: { label: 'Ingresso', icon: LogIn, defaultTipo: 'info' },
  treinamento: { label: 'Treinamento', icon: BookOpen, defaultTipo: 'info' },
  cargo: { label: 'Mudança de cargo', icon: ArrowUp, defaultTipo: 'good' },
  meta: { label: 'Meta atingida', icon: Target, defaultTipo: 'good' },
  avaliacao: { label: 'Avaliação de desempenho', icon: Star, defaultTipo: 'good' },
  feedback_formal: { label: 'Feedback formal', icon: MessageCircle, defaultTipo: 'warn' },
  advertencia: { label: 'Advertência', icon: FileWarning, defaultTipo: 'bad' },
  outro: { label: 'Outro', icon: GitCommitVertical, defaultTipo: 'info' },
}

function iconFor(ev: EventoTimeline) {
  if (ev.tipoEvento && TIPO_CONFIG[ev.tipoEvento]) return TIPO_CONFIG[ev.tipoEvento].icon
  // Fallback heuristic for events without tipoEvento
  const t = ev.titulo.toLowerCase()
  if (t.includes('promoção') || t.includes('transição') || t.includes('cargo')) return ArrowUp
  if (t.includes('avaliação')) return Star
  if (t.includes('treinamento') || t.includes('conclusão') || t.includes('certific')) return BookOpen
  if (t.includes('advertência') || ev.tipo === 'bad') return FileWarning
  if (t.includes('feedback')) return MessageCircle
  if (t.includes('entrada') || t.includes('ingresso')) return LogIn
  if (t.includes('meta')) return Target
  return GitCommitVertical
}

const BLANK_EVENT: Omit<EventoTimeline, 'id' | 'ordem'> = {
  tipo: 'info',
  tipoEvento: 'outro',
  titulo: '',
  meta: '',
  data: '',
}

interface Props {
  dossie: Dossie
  timeline: EventoTimeline[]
  setTimeline: React.Dispatch<React.SetStateAction<EventoTimeline[]>>
  isAdmin: boolean
}

export function Historico({ timeline, setTimeline, isAdmin }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<typeof BLANK_EVENT>({ ...BLANK_EVENT })

  const sorted = [...timeline].sort((a, b) => b.ordem - a.ordem)

  function removeEvento(id: string) {
    setTimeline((prev) => prev.filter((e) => e.id !== id))
  }

  function addEvento() {
    if (!form.titulo.trim() || !form.data.trim()) return
    const maxOrdem = timeline.reduce((m, e) => Math.max(m, e.ordem), 0)
    const tipoConfig = form.tipoEvento ? TIPO_CONFIG[form.tipoEvento] : undefined
    const novoEvento: EventoTimeline = {
      ...form,
      tipo: form.tipo || tipoConfig?.defaultTipo || 'info',
      id: `t_${Date.now()}`,
      ordem: maxOrdem + 1,
    }
    setTimeline((prev) => [...prev, novoEvento])
    setForm({ ...BLANK_EVENT })
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<GitCommitVertical size={15} />}>Linha do tempo — eventos críticos</SectionTitle>
        {isAdmin && (
          <button
            onClick={() => setEditing((v) => !v)}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors',
              editing
                ? 'bg-brand/10 text-brand'
                : 'bg-bg-secondary text-ink-secondary hover:text-brand'
            )}
          >
            <Pencil size={12} />
            {editing ? 'Concluir edição' : 'Editar'}
          </button>
        )}
      </div>

      {/* Formulário de adição — visível só no modo edição */}
      {isAdmin && editing && (
        <div className="mb-4 rounded-lg border border-line bg-bg-secondary p-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">Novo evento</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-0.5 block text-[11px] text-ink-tertiary">Tipo de evento</label>
              <select
                value={form.tipoEvento}
                onChange={(e) => {
                  const te = e.target.value as TipoEvento
                  setForm((prev) => ({
                    ...prev,
                    tipoEvento: te,
                    tipo: TIPO_CONFIG[te]?.defaultTipo ?? 'info',
                  }))
                }}
                className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
              >
                {(Object.keys(TIPO_CONFIG) as TipoEvento[]).map((k) => (
                  <option key={k} value={k}>{TIPO_CONFIG[k].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] text-ink-tertiary">Data (ex.: Mar 2024)</label>
              <input
                value={form.data}
                onChange={(e) => setForm((prev) => ({ ...prev, data: e.target.value }))}
                placeholder="Mês Ano"
                className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-0.5 block text-[11px] text-ink-tertiary">Título *</label>
              <input
                value={form.titulo}
                onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
                placeholder="Descreva o evento"
                className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-0.5 block text-[11px] text-ink-tertiary">Detalhes / meta</label>
              <input
                value={form.meta}
                onChange={(e) => setForm((prev) => ({ ...prev, meta: e.target.value }))}
                placeholder="Informações adicionais"
                className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={addEvento}
            disabled={!form.titulo.trim() || !form.data.trim()}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90 disabled:opacity-40"
          >
            <Plus size={13} /> Adicionar evento
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="divide-y divide-line">
        {sorted.map((ev) => {
          const Icon = iconFor(ev)
          const tipoLabel = ev.tipoEvento ? TIPO_CONFIG[ev.tipoEvento]?.label : undefined
          return (
            <div key={ev.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', toneBadge[ev.tipo as Tone])}>
                <Icon size={15} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[13px] font-medium text-ink-primary">{ev.titulo}</div>
                  {tipoLabel && (
                    <span className="rounded-md border border-line bg-bg-secondary px-1.5 py-0.5 text-[10px] text-ink-tertiary">
                      {tipoLabel}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[11px] text-ink-secondary">{ev.meta}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="whitespace-nowrap text-[11px] text-ink-tertiary">{ev.data}</span>
                {editing && (
                  <button onClick={() => removeEvento(ev.id)} className="text-ink-tertiary hover:text-bad">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {timeline.length === 0 && (
          <p className="py-6 text-center text-xs text-ink-tertiary">Nenhum evento registrado.</p>
        )}
      </div>
    </Card>
  )
}
