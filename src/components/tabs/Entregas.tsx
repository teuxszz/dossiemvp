import { useState, useMemo } from 'react'
import {
  Package,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { YearTabs } from '../YearTabs'
import { cn, toneBadge } from '@/lib/ui'
import type { Dossie, GrupoTrabalho, EntregaGT, StatusEntrega } from '@/lib/types'

const STATUS_CONFIG: Record<StatusEntrega, { label: string; icon: typeof Check; tone: 'good' | 'bad' | 'warn' }> = {
  no_prazo:   { label: 'No prazo',   icon: CheckCircle2, tone: 'good' },
  fora_prazo: { label: 'Fora do prazo', icon: AlertCircle,   tone: 'bad'  },
  pendente:   { label: 'Pendente',   icon: Clock,        tone: 'warn' },
}

function uid() {
  return `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

interface EntregaRowProps {
  entrega: EntregaGT
  editing: boolean
  onChange: (updated: EntregaGT) => void
  onRemove: () => void
}

function EntregaRow({ entrega, editing, onChange, onRemove }: EntregaRowProps) {
  const cfg = STATUS_CONFIG[entrega.status]
  const Icon = cfg.icon

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-3 py-2.5 text-xs">
        <span className={cn('flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px]', toneBadge[cfg.tone])}>
          <Icon size={11} /> {cfg.label}
        </span>
        <span className="flex-1 text-ink-primary">{entrega.descricao}</span>
        <span className="shrink-0 text-ink-tertiary">prazo: {entrega.prazo}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <select
        value={entrega.status}
        onChange={(e) => onChange({ ...entrega, status: e.target.value as StatusEntrega })}
        className="rounded border border-line bg-bg-tertiary px-2 py-1 text-[11px] text-ink-primary focus:border-brand focus:outline-none"
      >
        {(Object.keys(STATUS_CONFIG) as StatusEntrega[]).map((s) => (
          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
        ))}
      </select>
      <input
        value={entrega.descricao}
        onChange={(e) => onChange({ ...entrega, descricao: e.target.value })}
        placeholder="Descrição da entrega"
        className="min-w-0 flex-1 rounded border border-line bg-bg-tertiary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
      />
      <input
        value={entrega.prazo}
        onChange={(e) => onChange({ ...entrega, prazo: e.target.value })}
        placeholder="DD/MM/AAAA"
        className="w-28 rounded border border-line bg-bg-tertiary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
      />
      <button onClick={onRemove} className="text-ink-tertiary hover:text-bad">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

interface GtCardProps {
  gt: GrupoTrabalho
  onChange: (updated: GrupoTrabalho) => void
  onRemoveGt: () => void
  isAdmin: boolean
}

function GtCard({ gt, onChange, onRemoveGt, isAdmin }: GtCardProps) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [nomeEdit, setNomeEdit] = useState(gt.nome)
  const [diretoriaEdit, setDiretoriaEdit] = useState(gt.diretoria ?? '')

  const total = gt.entregas.length
  const noPrazo = gt.entregas.filter((e) => e.status === 'no_prazo').length
  const foraPrazo = gt.entregas.filter((e) => e.status === 'fora_prazo').length
  const pendentes = gt.entregas.filter((e) => e.status === 'pendente').length

  function saveNome() {
    onChange({ ...gt, nome: nomeEdit, diretoria: diretoriaEdit || undefined })
    setEditing(false)
  }

  function updateEntrega(id: string, updated: EntregaGT) {
    onChange({ ...gt, entregas: gt.entregas.map((e) => (e.id === id ? updated : e)) })
  }

  function removeEntrega(id: string) {
    onChange({ ...gt, entregas: gt.entregas.filter((e) => e.id !== id) })
  }

  function addEntrega() {
    const nova: EntregaGT = { id: uid(), descricao: '', prazo: '', status: 'pendente' }
    onChange({ ...gt, entregas: [...gt.entregas, nova] })
  }

  return (
    <div className="rounded-lg border border-line bg-bg-secondary">
      {/* Header do GT */}
      <div className="flex items-center gap-2 px-4 py-3">
        {isAdmin && editing ? (
          <>
            <div className="flex flex-1 flex-col gap-1">
              <input
                value={nomeEdit}
                onChange={(e) => setNomeEdit(e.target.value)}
                placeholder="Nome do GT"
                className="rounded border border-line bg-bg-tertiary px-2 py-1 text-[13px] font-medium text-ink-primary focus:border-brand focus:outline-none"
                autoFocus
              />
              <input
                value={diretoriaEdit}
                onChange={(e) => setDiretoriaEdit(e.target.value)}
                placeholder="Diretoria (ex.: Diretoria de Demandas)"
                className="rounded border border-line bg-bg-tertiary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
              />
            </div>
            <button onClick={saveNome} className="text-good hover:opacity-80"><Check size={14} /></button>
            <button onClick={() => { setNomeEdit(gt.nome); setDiretoriaEdit(gt.diretoria ?? ''); setEditing(false) }} className="text-ink-tertiary hover:opacity-80"><X size={14} /></button>
          </>
        ) : (
          <>
            <button onClick={() => setOpen((v) => !v)} className="flex flex-1 items-center gap-2 text-left">
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-ink-primary">{gt.nome}</span>
                {gt.diretoria && (
                  <span className="flex items-center gap-1 text-[10px] text-ink-tertiary">
                    <Building2 size={10} /> {gt.diretoria}
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                {noPrazo > 0 && (
                  <span className={cn('rounded px-1.5 py-0.5 text-[10px]', toneBadge.good)}>{noPrazo} ok</span>
                )}
                {foraPrazo > 0 && (
                  <span className={cn('rounded px-1.5 py-0.5 text-[10px]', toneBadge.bad)}>{foraPrazo} atrasada{foraPrazo > 1 ? 's' : ''}</span>
                )}
                {pendentes > 0 && (
                  <span className={cn('rounded px-1.5 py-0.5 text-[10px]', toneBadge.warn)}>{pendentes} pendente{pendentes > 1 ? 's' : ''}</span>
                )}
              </div>
              <span className="ml-auto text-[11px] text-ink-tertiary">{total} entrega{total !== 1 ? 's' : ''}</span>
              {open ? <ChevronUp size={14} className="shrink-0 text-ink-tertiary" /> : <ChevronDown size={14} className="shrink-0 text-ink-tertiary" />}
            </button>
            {isAdmin && (
              <>
                <button onClick={() => setEditing(true)} className="ml-2 shrink-0 text-ink-tertiary hover:text-brand">
                  <Pencil size={13} />
                </button>
                <button onClick={onRemoveGt} className="shrink-0 text-ink-tertiary hover:text-bad">
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {open && (
        <div className="border-t border-line px-4 pb-3 pt-1">
          <div className="divide-y divide-line">
            {gt.entregas.length === 0 && !editing && (
              <p className="py-3 text-center text-xs text-ink-tertiary">Nenhuma entrega registrada.</p>
            )}
            {gt.entregas.map((e) => (
              <EntregaRow
                key={e.id}
                entrega={e}
                editing={isAdmin && editing}
                onChange={(updated) => updateEntrega(e.id, updated)}
                onRemove={() => removeEntrega(e.id)}
              />
            ))}
          </div>
          {isAdmin && editing && (
            <button
              onClick={addEntrega}
              className="mt-2 flex items-center gap-1.5 text-[11px] text-brand hover:opacity-80"
            >
              <Plus size={12} /> Adicionar entrega
            </button>
          )}
          {isAdmin && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-tertiary hover:text-brand"
            >
              <Pencil size={12} /> Editar entregas
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface Props {
  dossie: Dossie
  gts: GrupoTrabalho[]
  setGts: React.Dispatch<React.SetStateAction<GrupoTrabalho[]>>
  cicloAtual: { ano: number; ciclo: string }
  isAdmin: boolean
}

export function Entregas({ gts, setGts, cicloAtual, isAdmin }: Props) {
  const anos = useMemo(
    () => [...new Set(gts.map((g) => g.ano))].sort((a, b) => b - a),
    [gts],
  )
  const [ano, setAno] = useState<number>(anos[0] ?? cicloAtual.ano)

  const gtDoAno = gts.filter((g) => g.ano === ano)

  // Resumo do ano
  const totalEntregas = gtDoAno.reduce((s, g) => s + g.entregas.length, 0)
  const totalNoPrazo = gtDoAno.reduce((s, g) => s + g.entregas.filter((e) => e.status === 'no_prazo').length, 0)
  const totalForaPrazo = gtDoAno.reduce((s, g) => s + g.entregas.filter((e) => e.status === 'fora_prazo').length, 0)
  const totalPendentes = gtDoAno.reduce((s, g) => s + g.entregas.filter((e) => e.status === 'pendente').length, 0)
  const taxaPrazo = totalEntregas > 0 ? Math.round((totalNoPrazo / (totalNoPrazo + totalForaPrazo || 1)) * 100) : null

  function updateGt(id: string, updated: GrupoTrabalho) {
    setGts((prev) => prev.map((g) => (g.id === id ? updated : g)))
  }

  function removeGt(id: string) {
    setGts((prev) => prev.filter((g) => g.id !== id))
  }

  function addGt() {
    const novoGt: GrupoTrabalho = {
      id: `gt_${Date.now()}`,
      nome: 'Novo GT',
      ciclo: cicloAtual.ciclo,
      ano: cicloAtual.ano,
      entregas: [],
    }
    setGts((prev) => [...prev, novoGt])
    setAno(cicloAtual.ano)
  }

  return (
    <div className="space-y-4">
      {/* Resumo do ano */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: totalEntregas, tone: 'info' as const },
          { label: 'No prazo', value: totalNoPrazo, tone: 'good' as const },
          { label: 'Fora do prazo', value: totalForaPrazo, tone: 'bad' as const },
          { label: 'Pendentes', value: totalPendentes, tone: 'warn' as const },
        ].map((c) => (
          <Card key={c.label} className="p-4">
            <div className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">{c.label}</div>
            <div className={cn('mt-1 text-3xl font-semibold', `text-${c.tone === 'info' ? 'brand' : c.tone}`)}>{c.value}</div>
            {c.label === 'No prazo' && taxaPrazo !== null && (
              <div className="mt-1 text-[11px] text-ink-tertiary">{taxaPrazo}% de aderência</div>
            )}
          </Card>
        ))}
      </div>

      {/* GTs por ano */}
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={<Package size={15} />}>Entregas por GT — {ano}</SectionTitle>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={addGt}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
              >
                <Plus size={13} /> Novo GT
              </button>
            )}
            {anos.length > 0 && <YearTabs anos={anos} value={ano} onChange={setAno} />}
          </div>
        </div>

        {gtDoAno.length === 0 ? (
          <p className="py-8 text-center text-xs text-ink-tertiary">
            {isAdmin ? 'Nenhum GT registrado para ' + ano + '. Clique em "Novo GT" para adicionar.' : `Nenhum GT registrado para ${ano}.`}
          </p>
        ) : (
          <div className="space-y-3">
            {gtDoAno.map((gt) => (
              <GtCard
                key={gt.id}
                gt={gt}
                onChange={(updated) => updateGt(gt.id, updated)}
                onRemoveGt={() => removeGt(gt.id)}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
