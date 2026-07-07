import { useState } from 'react'
import { MessageCircle, Quote, Plus, Trash2, ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import type { Dossie, Feedback, CategoriaFeedback } from '@/lib/types'

const LS_MANUAL_FB = 'dossie_feedbacks_manual'

const CATEGORIAS: { key: CategoriaFeedback; label: string }[] = [
  { key: 'positivo', label: 'Positivo' },
  { key: 'desenvolvimento', label: 'Desenvolvimento' },
  { key: 'gestor', label: 'Avaliação de gestor' },
]

const CICLOS = ['C1', 'C2', 'C3', 'C4']

function uid() {
  return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function loadManualFeedbacks(membroId: string): Feedback[] {
  try {
    const all: Record<string, Feedback[]> = JSON.parse(localStorage.getItem(LS_MANUAL_FB) ?? '{}')
    return all[membroId] ?? []
  } catch {
    return []
  }
}

function saveManualFeedbacks(membroId: string, feedbacks: Feedback[]) {
  try {
    const all: Record<string, Feedback[]> = JSON.parse(localStorage.getItem(LS_MANUAL_FB) ?? '{}')
    localStorage.setItem(LS_MANUAL_FB, JSON.stringify({ ...all, [membroId]: feedbacks }))
  } catch { /* ignore */ }
}

interface AddFormProps {
  onSave: (fb: Feedback) => void
  onCancel: () => void
  anoAtual: number
}

function AddForm({ onSave, onCancel, anoAtual }: AddFormProps) {
  const [autor, setAutor] = useState('')
  const [papel, setPapel] = useState('')
  const [ciclo, setCiclo] = useState('C1')
  const [ano, setAno] = useState(anoAtual)
  const [texto, setTexto] = useState('')
  const [categorias, setCategorias] = useState<CategoriaFeedback[]>([])

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  function toggleCategoria(cat: CategoriaFeedback) {
    setCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  function submit() {
    if (!autor.trim() || !texto.trim()) return
    const now = new Date()
    const fb: Feedback = {
      id: uid(),
      autor: autor.trim(),
      papel: papel.trim() || 'Coordenador',
      data: `${meses[now.getMonth()]} ${now.getFullYear()}`,
      ciclo,
      ano,
      texto: texto.trim(),
      categorias,
      tags: [],
    }
    onSave(fb)
  }

  return (
    <div className="rounded-lg border border-brand/30 bg-bg-secondary p-4 space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">Autor</label>
          <input
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            placeholder="Nome do responsável"
            className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">Papel</label>
          <input
            value={papel}
            onChange={(e) => setPapel(e.target.value)}
            placeholder="Ex.: Diretor, Gerente…"
            className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">Ciclo</label>
          <select
            value={ciclo}
            onChange={(e) => setCiclo(e.target.value)}
            className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
          >
            {CICLOS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="w-24">
          <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">Ano</label>
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">Feedback</label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={4}
          placeholder="Texto do feedback colhido na 1:1…"
          className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none resize-none"
        />
      </div>

      <div>
        <div className="mb-1 text-[11px] font-medium text-ink-tertiary">Categorias</div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.key}
              onClick={() => toggleCategoria(cat.key)}
              className={cn(
                'rounded-md px-2 py-0.5 text-[11px] border transition-colors',
                categorias.includes(cat.key)
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-line bg-bg-tertiary text-ink-secondary hover:border-brand/50',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 rounded-md bg-bg-tertiary px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary"
        >
          <X size={12} /> Cancelar
        </button>
        <button
          onClick={submit}
          disabled={!autor.trim() || !texto.trim()}
          className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90 disabled:opacity-40"
        >
          <Check size={12} /> Salvar feedback
        </button>
      </div>
    </div>
  )
}

interface Props {
  dossie: Dossie
  feedbacks: Feedback[]
  onAddFeedback: (fb: Feedback) => void
  onRemoveFeedback: (id: string) => void
}

export function Feedbacks({ dossie, feedbacks, onAddFeedback, onRemoveFeedback }: Props) {
  const membroId = dossie.colaborador.id
  const [showForm, setShowForm] = useState(false)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  function handleSave(fb: Feedback) {
    onAddFeedback(fb)
    // Persiste o feedback manual no localStorage
    const manuals = loadManualFeedbacks(membroId)
    saveManualFeedbacks(membroId, [...manuals, fb])
    setShowForm(false)
  }

  function handleRemove(id: string) {
    onRemoveFeedback(id)
    const manuals = loadManualFeedbacks(membroId).filter((f) => f.id !== id)
    saveManualFeedbacks(membroId, manuals)
  }

  // Agrupar por {ano}-{ciclo}, mais recente primeiro; sem ciclo → "Geral"
  const grupos: { key: string; label: string; fbs: Feedback[] }[] = []
  const mapaGrupos: Record<string, Feedback[]> = {}

  for (const fb of feedbacks) {
    const key = fb.ano && fb.ciclo ? `${fb.ano}-${fb.ciclo}` : 'geral'
    if (!mapaGrupos[key]) mapaGrupos[key] = []
    mapaGrupos[key].push(fb)
  }

  const sortedKeys = Object.keys(mapaGrupos).sort((a, b) => {
    if (a === 'geral') return 1
    if (b === 'geral') return -1
    return b.localeCompare(a)
  })

  for (const key of sortedKeys) {
    const [ano, ciclo] = key === 'geral' ? ['', ''] : key.split('-')
    grupos.push({
      key,
      label: key === 'geral' ? 'Geral' : `${ano} · ${ciclo}`,
      fbs: mapaGrupos[key],
    })
  }

  const anoAtual = dossie.pdaa.cicloAtual.ano

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <SectionTitle icon={<MessageCircle size={15} />}>
            Feedbacks das 1:1
            <span className="ml-1.5 rounded-full bg-bg-secondary px-1.5 py-0.5 text-[11px] font-normal text-ink-tertiary">
              {feedbacks.length}
            </span>
          </SectionTitle>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
          >
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? 'Cancelar' : 'Adicionar'}
          </button>
        </div>

        {showForm && (
          <div className="mt-4">
            <AddForm
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
              anoAtual={anoAtual}
            />
          </div>
        )}

        {feedbacks.length === 0 && !showForm && (
          <div className="py-8 text-center text-xs text-ink-tertiary">
            Nenhum feedback registrado. Clique em "Adicionar" para registrar o feedback de uma 1:1.
          </div>
        )}

        {grupos.length > 0 && (
          <div className="mt-4 space-y-2">
            {grupos.map((grupo) => {
              const isOpen = expandedKey === grupo.key
              return (
                <div key={grupo.key} className="rounded-lg border border-line">
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                    onClick={() => setExpandedKey(isOpen ? null : grupo.key)}
                  >
                    <span className="text-[13px] font-semibold text-ink-primary">{grupo.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-ink-tertiary">{grupo.fbs.length} feedback{grupo.fbs.length !== 1 ? 's' : ''}</span>
                      {isOpen ? <ChevronUp size={14} className="text-ink-tertiary" /> : <ChevronDown size={14} className="text-ink-tertiary" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-line divide-y divide-line px-4">
                      {grupo.fbs.map((fb) => (
                        <div key={fb.id} className="py-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[13px] font-medium text-ink-primary">{fb.autor}</span>
                              {fb.papel && (
                                <span className="ml-2 text-xs text-ink-tertiary">— {fb.papel}</span>
                              )}
                              <span className="ml-2 text-[11px] text-ink-tertiary">{fb.data}</span>
                            </div>
                            <button
                              onClick={() => handleRemove(fb.id)}
                              className="shrink-0 text-ink-tertiary hover:text-bad"
                              title="Remover feedback"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="mt-2">
                            <Quote className="mb-1 text-brand" size={16} />
                            <p className="text-sm leading-relaxed text-ink-primary">{fb.texto}</p>
                          </div>
                          {(fb.categorias.length > 0 || fb.tags.length > 0) && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {fb.categorias.map((c) => (
                                <span
                                  key={c}
                                  className={cn(
                                    'rounded-md px-2 py-0.5 text-[11px]',
                                    c === 'positivo' ? toneBadge.good : c === 'desenvolvimento' ? toneBadge.warn : toneBadge.info,
                                  )}
                                >
                                  {CATEGORIAS.find((x) => x.key === c)?.label ?? c}
                                </span>
                              ))}
                              {fb.tags.map((t) => (
                                <span
                                  key={t.label}
                                  className={cn('rounded-md px-2 py-0.5 text-[11px]', toneBadge[t.tone as Tone])}
                                >
                                  {t.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
