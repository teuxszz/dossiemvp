import { useState } from 'react'
import {
  Target,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ListChecks,
  CalendarClock,
  UserCog,
} from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { cn } from '@/lib/ui'
import type { ItemPdi, MetaPdi } from '@/lib/types'

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function progressoDe(item: ItemPdi): number {
  if (item.metas.length === 0) return 0
  const concluidas = item.metas.filter((m) => m.concluida).length
  return Math.round((concluidas / item.metas.length) * 100)
}

function barColor(p: number) {
  if (p >= 70) return 'bg-good-bar'
  if (p >= 40) return 'bg-brand'
  return 'bg-warn'
}

interface ObjetivoCardProps {
  item: ItemPdi
  isAdmin: boolean
  onChange: (updated: ItemPdi) => void
  onRemove: () => void
  registradoPorPadrao: string
}

function ObjetivoCard({ item, isAdmin, onChange, onRemove, registradoPorPadrao }: ObjetivoCardProps) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [objetivoEdit, setObjetivoEdit] = useState(item.objetivo)
  const [descricaoEdit, setDescricaoEdit] = useState(item.descricao ?? '')
  const [prazoEdit, setPrazoEdit] = useState(item.prazo ?? '')
  const [novaMeta, setNovaMeta] = useState('')

  const progresso = progressoDe(item)

  function tocar(patch: Partial<ItemPdi>) {
    onChange({ ...item, ...patch, registradoPor: item.registradoPor ?? registradoPorPadrao, atualizadoEm: new Date().toISOString() })
  }

  function salvarCabecalho() {
    tocar({ objetivo: objetivoEdit.trim() || item.objetivo, descricao: descricaoEdit.trim() || undefined, prazo: prazoEdit.trim() || undefined })
    setEditing(false)
  }

  function toggleMeta(id: string) {
    tocar({ metas: item.metas.map((m) => (m.id === id ? { ...m, concluida: !m.concluida } : m)) })
  }

  function removerMeta(id: string) {
    tocar({ metas: item.metas.filter((m) => m.id !== id) })
  }

  function adicionarMeta() {
    if (!novaMeta.trim()) return
    const meta: MetaPdi = { id: uid('m'), titulo: novaMeta.trim(), concluida: false }
    tocar({ metas: [...item.metas, meta] })
    setNovaMeta('')
  }

  return (
    <div className="rounded-lg border border-line bg-bg-secondary">
      <div className="flex items-start gap-2 px-4 py-3">
        {isAdmin && editing ? (
          <div className="flex flex-1 flex-col gap-1.5">
            <input
              value={objetivoEdit}
              onChange={(e) => setObjetivoEdit(e.target.value)}
              placeholder="Objetivo principal"
              className="rounded border border-line bg-bg-tertiary px-2 py-1 text-[13px] font-medium text-ink-primary focus:border-brand focus:outline-none"
              autoFocus
            />
            <textarea
              value={descricaoEdit}
              onChange={(e) => setDescricaoEdit(e.target.value)}
              placeholder="Descrição / contexto (opcional)"
              rows={2}
              className="resize-none rounded border border-line bg-bg-tertiary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-ink-tertiary">Prazo</span>
              <input
                type="date"
                value={prazoEdit}
                onChange={(e) => setPrazoEdit(e.target.value)}
                className="rounded border border-line bg-bg-tertiary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
              />
              <button onClick={salvarCabecalho} className="ml-auto flex items-center gap-1 rounded-md bg-good-soft px-2 py-1 text-[11px] text-good hover:opacity-80">
                <Check size={12} /> Salvar
              </button>
              <button
                onClick={() => { setObjetivoEdit(item.objetivo); setDescricaoEdit(item.descricao ?? ''); setPrazoEdit(item.prazo ?? ''); setEditing(false) }}
                className="flex items-center gap-1 rounded-md bg-bg-tertiary px-2 py-1 text-[11px] text-ink-secondary hover:opacity-80"
              >
                <X size={12} /> Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <button onClick={() => setOpen((v) => !v)} className="flex flex-1 flex-col items-start gap-1.5 text-left">
              <div className="flex w-full items-center gap-2">
                <span className="text-[13px] font-semibold text-ink-primary">{item.objetivo}</span>
                <span className="ml-auto shrink-0 text-[11px] font-medium text-ink-secondary">{progresso}%</span>
                {open ? <ChevronUp size={14} className="shrink-0 text-ink-tertiary" /> : <ChevronDown size={14} className="shrink-0 text-ink-tertiary" />}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
                <div className={cn('h-full rounded-full transition-all', barColor(progresso))} style={{ width: `${progresso}%` }} />
              </div>
              {item.descricao && <p className="text-[11px] text-ink-tertiary">{item.descricao}</p>}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-ink-tertiary">
                {item.prazo && (
                  <span className="flex items-center gap-1"><CalendarClock size={11} /> prazo: {new Date(item.prazo).toLocaleDateString('pt-BR')}</span>
                )}
                {item.registradoPor && (
                  <span className="flex items-center gap-1"><UserCog size={11} /> {item.registradoPor}</span>
                )}
              </div>
            </button>
            {isAdmin && (
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => setEditing(true)} className="text-ink-tertiary hover:text-brand"><Pencil size={13} /></button>
                <button onClick={onRemove} className="text-ink-tertiary hover:text-bad"><Trash2 size={13} /></button>
              </div>
            )}
          </>
        )}
      </div>

      {open && (
        <div className="border-t border-line px-4 pb-3 pt-2">
          <p className="mb-1.5 text-[11px] font-medium text-ink-tertiary">Metas menores</p>
          {item.metas.length === 0 ? (
            <p className="py-2 text-center text-xs text-ink-tertiary">Nenhuma meta registrada ainda.</p>
          ) : (
            <div className="divide-y divide-line">
              {item.metas.map((m) => (
                <div key={m.id} className="flex items-center gap-2 py-1.5 text-xs">
                  <button
                    onClick={() => isAdmin && toggleMeta(m.id)}
                    disabled={!isAdmin}
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                      m.concluida ? 'border-good bg-good text-white' : 'border-line bg-bg-tertiary',
                      isAdmin && 'cursor-pointer',
                    )}
                  >
                    {m.concluida && <Check size={11} />}
                  </button>
                  <span className={cn('flex-1', m.concluida ? 'text-ink-tertiary line-through' : 'text-ink-primary')}>{m.titulo}</span>
                  {isAdmin && (
                    <button onClick={() => removerMeta(m.id)} className="shrink-0 text-ink-tertiary hover:text-bad">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {isAdmin && (
            <div className="mt-2 flex items-center gap-2">
              <input
                value={novaMeta}
                onChange={(e) => setNovaMeta(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && adicionarMeta()}
                placeholder="Nova meta menor…"
                className="min-w-0 flex-1 rounded border border-line bg-bg-tertiary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
              />
              <button onClick={adicionarMeta} className="flex items-center gap-1 text-[11px] text-brand hover:opacity-80">
                <Plus size={12} /> Adicionar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface Props {
  pdi: ItemPdi[]
  setPdi: React.Dispatch<React.SetStateAction<ItemPdi[]>>
  isAdmin: boolean
  currentEmail: string | null
}

export function Pdi({ pdi, setPdi, isAdmin, currentEmail }: Props) {
  const registradoPorPadrao = currentEmail ?? 'Coordenadoria de Desempenho'

  const total = pdi.length
  const media = total > 0 ? Math.round(pdi.reduce((s, i) => s + progressoDe(i), 0) / total) : 0
  const concluidos = pdi.filter((i) => progressoDe(i) === 100).length

  function updateItem(id: string, updated: ItemPdi) {
    setPdi((prev) => prev.map((i) => (i.id === id ? updated : i)))
  }

  function removeItem(id: string) {
    setPdi((prev) => prev.filter((i) => i.id !== id))
  }

  function addItem() {
    const novo: ItemPdi = {
      id: uid('pdi'),
      objetivo: 'Novo objetivo',
      metas: [],
      registradoPor: registradoPorPadrao,
      atualizadoEm: new Date().toISOString(),
    }
    setPdi((prev) => [novo, ...prev])
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">Objetivos ativos</div>
          <div className="mt-1 text-3xl font-semibold text-brand">{total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">Progresso médio</div>
          <div className="mt-1 text-3xl font-semibold text-brand">{media}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">Concluídos</div>
          <div className="mt-1 text-3xl font-semibold text-good">{concluidos}</div>
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <SectionTitle icon={<Target size={15} />}>PDI — Plano de Desenvolvimento Individual</SectionTitle>
          {isAdmin && (
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
            >
              <Plus size={13} /> Novo objetivo
            </button>
          )}
        </div>

        {!isAdmin && (
          <p className="mb-3 flex items-center gap-1.5 text-[11px] text-ink-tertiary">
            <ListChecks size={12} /> Só a coordenadoria de desempenho registra e atualiza o PDI — aqui você acompanha o próprio progresso.
          </p>
        )}

        {pdi.length === 0 ? (
          <p className="py-8 text-center text-xs text-ink-tertiary">
            {isAdmin ? 'Nenhum objetivo registrado ainda. Clique em "Novo objetivo" para começar.' : 'Nenhum objetivo de desenvolvimento registrado ainda.'}
          </p>
        ) : (
          <div className="space-y-3">
            {pdi.map((item) => (
              <ObjetivoCard
                key={item.id}
                item={item}
                isAdmin={isAdmin}
                onChange={(updated) => updateItem(item.id, updated)}
                onRemove={() => removeItem(item.id)}
                registradoPorPadrao={registradoPorPadrao}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
