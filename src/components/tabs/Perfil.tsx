import { useState } from 'react'
import {
  IdCard,
  Hexagon,
  ListChecks,
  Lightbulb,
  TrendingUp,
  GraduationCap,
  Users,
  Cake,
  Phone,
  Mail,
  CalendarDays,
  Building2,
  Compass,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Briefcase,
} from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { RadarCompetencias } from '../charts/Charts'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import type { Dossie, Perfil as PerfilType, Competencia, PassagemDiretoria, ParticipacaoGT, AvaliacaoDesenvolvimento } from '@/lib/types'

const recomIcon: Record<Tone, typeof TrendingUp> = {
  good: TrendingUp,
  warn: GraduationCap,
  bad: Users,
  info: Users,
}

function barColor(p: number) {
  if (p >= 70) return 'bg-good-bar'
  if (p >= 50) return 'bg-brand'
  return 'bg-warn'
}

// ---------- Dados do membro ----------

function DadosMembro({ dossie, cargoAtual }: { dossie: Dossie; cargoAtual: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<PerfilType & { cargoAtual: string }>({
    ...dossie.perfil,
    cargoAtual,
  })
  const [saved, setSaved] = useState(draft)

  function save() {
    setSaved(draft)
    setEditing(false)
  }
  function cancel() {
    setDraft(saved)
    setEditing(false)
  }

  const p = saved

  const rows: { icon: typeof Cake; label: string; field: keyof typeof draft | 'cargoAtual' }[] = [
    { icon: CalendarDays, label: 'Entrada na CONSEJ', field: 'dataEntrada' },
    { icon: Cake, label: 'Nascimento', field: 'nascimento' },
    { icon: Phone, label: 'Celular', field: 'celular' },
    { icon: Mail, label: 'E-mail', field: 'email' },
    { icon: GraduationCap, label: 'Curso', field: 'curso' },
  ]

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<IdCard size={15} />}>Dados do membro</SectionTitle>
        {editing ? (
          <div className="flex gap-1.5">
            <button onClick={save} className="flex items-center gap-1 rounded-md bg-good-soft px-2 py-1 text-[11px] text-good hover:opacity-80">
              <Check size={12} /> Salvar
            </button>
            <button onClick={cancel} className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary hover:opacity-80">
              <X size={12} /> Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary hover:text-brand">
            <Pencil size={12} /> Editar
          </button>
        )}
      </div>

      <div className="divide-y divide-line">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 py-2 text-xs">
            <r.icon size={15} className="shrink-0 text-ink-tertiary" />
            <span className="text-ink-secondary">{r.label}</span>
            {editing ? (
              <input
                value={String(draft[r.field as keyof typeof draft] ?? '')}
                onChange={(e) => setDraft((prev) => ({ ...prev, [r.field]: e.target.value }))}
                className="ml-auto w-44 rounded border border-line bg-bg-tertiary px-2 py-0.5 text-right text-xs text-ink-primary focus:border-brand focus:outline-none"
              />
            ) : (
              <span className="ml-auto text-right font-medium text-ink-primary">
                {r.field === 'cargoAtual' ? p.cargoAtual : String(p[r.field as keyof PerfilType] ?? '')}
              </span>
            )}
          </div>
        ))}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="shrink-0 text-ink-secondary">Arquétipo</span>
            <input
              value={draft.arquetipo}
              onChange={(e) => setDraft((prev) => ({ ...prev, arquetipo: e.target.value }))}
              className="ml-auto w-40 rounded border border-line bg-bg-tertiary px-2 py-0.5 text-right text-xs text-ink-primary focus:border-brand focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="shrink-0 text-ink-secondary">Perfil comportamental</span>
            <input
              value={draft.perfilComportamental}
              onChange={(e) => setDraft((prev) => ({ ...prev, perfilComportamental: e.target.value }))}
              className="ml-auto w-40 rounded border border-line bg-bg-tertiary px-2 py-0.5 text-right text-xs text-ink-primary focus:border-brand focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="shrink-0 text-ink-secondary">Interesses (vírgula)</span>
            <input
              value={draft.interesses.join(', ')}
              onChange={(e) => setDraft((prev) => ({ ...prev, interesses: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
              className="ml-auto w-40 rounded border border-line bg-bg-tertiary px-2 py-0.5 text-right text-xs text-ink-primary focus:border-brand focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={cn('rounded-md px-2 py-0.5 text-[11px]', toneBadge.info)}>{p.arquetipo}</span>
          <span className={cn('rounded-md px-2 py-0.5 text-[11px]', toneBadge.good)}>{p.perfilComportamental}</span>
          {p.interesses.map((i) => (
            <span key={i} className="rounded-md border border-line bg-bg-secondary px-2 py-0.5 text-[11px] text-ink-secondary">
              {i}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

// ---------- Trajetória ----------

function Trajetoria({ dossie }: { dossie: Dossie }) {
  const p = dossie.perfil
  const [editing, setEditing] = useState(false)
  const [diretoriaAtual, setDiretoriaAtual] = useState(p.diretoriaAtual)
  const [cargoAtual, setCargoAtual] = useState(dossie.colaborador.cargo)
  const [anteriores, setAnteriores] = useState<PassagemDiretoria[]>(p.diretoriasAnteriores)
  const [savedDir, setSavedDir] = useState(diretoriaAtual)
  const [savedCargo, setSavedCargo] = useState(cargoAtual)
  const [savedAnt, setSavedAnt] = useState(anteriores)
  const [expanded, setExpanded] = useState(true)

  function save() {
    setSavedDir(diretoriaAtual)
    setSavedCargo(cargoAtual)
    setSavedAnt(anteriores)
    setEditing(false)
  }
  function cancel() {
    setDiretoriaAtual(savedDir)
    setCargoAtual(savedCargo)
    setAnteriores(savedAnt)
    setEditing(false)
  }
  function addAnterior() {
    setAnteriores((prev) => [...prev, { diretoria: '', periodo: '' }])
  }
  function removeAnterior(idx: number) {
    setAnteriores((prev) => prev.filter((_, i) => i !== idx))
  }
  function updateAnterior(idx: number, field: keyof PassagemDiretoria, value: string) {
    setAnteriores((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)))
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<Compass size={15} />}>Trajetória na CONSEJ</SectionTitle>
        {editing ? (
          <div className="flex gap-1.5">
            <button onClick={save} className="flex items-center gap-1 rounded-md bg-good-soft px-2 py-1 text-[11px] text-good hover:opacity-80">
              <Check size={12} /> Salvar
            </button>
            <button onClick={cancel} className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary hover:opacity-80">
              <X size={12} /> Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary hover:text-brand">
            <Pencil size={12} /> Editar
          </button>
        )}
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-bg-secondary p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
            <Building2 size={13} /> Diretoria atual
          </div>
          {editing ? (
            <input
              value={diretoriaAtual}
              onChange={(e) => setDiretoriaAtual(e.target.value)}
              className="mt-1 w-full rounded border border-line bg-bg-tertiary px-2 py-0.5 text-[13px] text-ink-primary focus:border-brand focus:outline-none"
            />
          ) : (
            <div className="mt-1 text-[13px] font-medium text-ink-primary">{savedDir}</div>
          )}
        </div>
        <div className="rounded-lg border border-line bg-bg-secondary p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
            <Briefcase size={13} /> Cargo atual
          </div>
          {editing ? (
            <input
              value={cargoAtual}
              onChange={(e) => setCargoAtual(e.target.value)}
              className="mt-1 w-full rounded border border-line bg-bg-tertiary px-2 py-0.5 text-[13px] text-ink-primary focus:border-brand focus:outline-none"
            />
          ) : (
            <div className="mt-1 text-[13px] font-medium text-ink-primary">{savedCargo}</div>
          )}
        </div>
      </div>

      {/* Diretorias anteriores — colapsável */}
      <button
        className="flex w-full items-center justify-between text-[11px] font-medium uppercase tracking-wide text-ink-tertiary hover:text-ink-secondary"
        onClick={() => setExpanded((v) => !v)}
      >
        <span>Diretorias anteriores</span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {expanded && (
        <div className="mt-1.5">
          {editing ? (
            <div className="space-y-2">
              {anteriores.map((d, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={d.diretoria}
                    onChange={(e) => updateAnterior(idx, 'diretoria', e.target.value)}
                    placeholder="Diretoria"
                    className="flex-1 rounded border border-line bg-bg-tertiary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
                  />
                  <input
                    value={d.periodo}
                    onChange={(e) => updateAnterior(idx, 'periodo', e.target.value)}
                    placeholder="Período"
                    className="w-40 rounded border border-line bg-bg-tertiary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
                  />
                  <button onClick={() => removeAnterior(idx)} className="text-ink-tertiary hover:text-bad">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={addAnterior}
                className="flex items-center gap-1 text-[11px] text-brand hover:opacity-80"
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {savedAnt.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-ink-primary">{d.diretoria}</span>
                  <span className="text-ink-tertiary">{d.periodo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ---------- Competências ----------

function Competencias({ dossie }: { dossie: Dossie }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Competencia[]>(dossie.competencias)
  const [saved, setSaved] = useState(draft)

  function save() { setSaved(draft); setEditing(false) }
  function cancel() { setDraft(saved); setEditing(false) }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<Hexagon size={15} />}>Competências comportamentais</SectionTitle>
        {editing ? (
          <div className="flex gap-1.5">
            <button onClick={save} className="flex items-center gap-1 rounded-md bg-good-soft px-2 py-1 text-[11px] text-good hover:opacity-80">
              <Check size={12} /> Salvar
            </button>
            <button onClick={cancel} className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary hover:opacity-80">
              <X size={12} /> Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary hover:text-brand">
            <Pencil size={12} /> Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-2 space-y-2">
          {draft.map((c, i) => (
            <div key={c.eixo} className="flex items-center gap-3 text-xs">
              <span className="w-32 shrink-0 text-ink-secondary">{c.eixo}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={c.valor}
                onChange={(e) =>
                  setDraft((prev) => prev.map((x, j) => (j === i ? { ...x, valor: Number(e.target.value) } : x)))
                }
                className="flex-1 accent-brand"
              />
              <span className="w-8 text-right font-medium text-ink-primary">{c.valor}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-64">
          <RadarCompetencias data={saved} />
        </div>
      )}
    </Card>
  )
}

// ---------- GTs por ciclo ----------

interface GtDraft {
  ano: number
  ciclo: string
  gts: string[]
}

function GtsPorCiclo({
  participacaoGTs,
  setParticipacaoGTs,
}: {
  participacaoGTs: ParticipacaoGT[]
  setParticipacaoGTs: React.Dispatch<React.SetStateAction<ParticipacaoGT[]>>
}) {
  const [expandedCiclo, setExpandedCiclo] = useState<string | null>(null)
  const [editandoCiclo, setEditandoCiclo] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, GtDraft>>({})

  const sorted = [...participacaoGTs].sort((a, b) =>
    a.ano !== b.ano ? b.ano - a.ano : b.ciclo.localeCompare(a.ciclo),
  )

  function cicloKey(p: ParticipacaoGT) { return `${p.ano}-${p.ciclo}` }

  function toggleExpand(key: string) {
    setExpandedCiclo((v) => (v === key ? null : key))
  }

  function startEdit(p: ParticipacaoGT) {
    const key = cicloKey(p)
    setDrafts((prev) => ({ ...prev, [key]: { ano: p.ano, ciclo: p.ciclo, gts: [...p.gts] } }))
    setEditandoCiclo(key)
  }

  function saveEdit(originalKey: string) {
    const d = drafts[originalKey]
    if (!d) return
    const newGts = d.gts.filter((g) => g.trim())
    setParticipacaoGTs((prev) =>
      prev.map((x) => cicloKey(x) === originalKey ? { ano: d.ano, ciclo: d.ciclo, gts: newGts } : x),
    )
    setEditandoCiclo(null)
  }

  function cancelEdit() { setEditandoCiclo(null) }

  function updateDraft(key: string, field: keyof GtDraft, value: string | number) {
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  function addGt(key: string) {
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], gts: [...(prev[key]?.gts ?? []), ''] } }))
  }

  function updateGt(key: string, idx: number, val: string) {
    setDrafts((prev) => {
      const arr = [...(prev[key]?.gts ?? [])]
      arr[idx] = val
      return { ...prev, [key]: { ...prev[key], gts: arr } }
    })
  }

  function removeGt(key: string, idx: number) {
    setDrafts((prev) => {
      const arr = (prev[key]?.gts ?? []).filter((_, i) => i !== idx)
      return { ...prev, [key]: { ...prev[key], gts: arr } }
    })
  }

  function addCiclo() {
    const anos = participacaoGTs.map((p) => p.ano)
    const anoAtual = anos.length ? Math.max(...anos) : new Date().getFullYear()
    const novoCiclo: ParticipacaoGT = { ciclo: 'C1', ano: anoAtual, gts: [] }
    setParticipacaoGTs((prev) => [novoCiclo, ...prev])
  }

  function removeCiclo(key: string) {
    setParticipacaoGTs((prev) => prev.filter((p) => cicloKey(p) !== key))
  }

  const CICLOS = ['C1', 'C2', 'C3', 'C4']

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<Users size={15} />}>GTs por ciclo</SectionTitle>
        <button
          onClick={addCiclo}
          className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary hover:text-brand"
        >
          <Plus size={12} /> Adicionar ciclo
        </button>
      </div>

      {sorted.length === 0 && (
        <p className="mt-3 text-xs text-ink-tertiary">Nenhuma participação registrada.</p>
      )}

      <div className="mt-2 space-y-1.5">
        {sorted.map((p) => {
          const key = cicloKey(p)
          const isOpen = expandedCiclo === key
          const isEditing = editandoCiclo === key
          const draft = drafts[key]
          const draftGts = draft?.gts ?? p.gts

          return (
            <div key={key} className="rounded-lg border border-line">
              <div className="flex items-center gap-2 px-3 py-2">
                {isEditing ? (
                  /* Linha de edição do cabeçalho — ano e ciclo inline */
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="number"
                      value={draft?.ano ?? p.ano}
                      onChange={(e) => updateDraft(key, 'ano', Number(e.target.value))}
                      className="w-20 rounded border border-line bg-bg-tertiary px-2 py-0.5 text-xs font-medium text-ink-primary focus:border-brand focus:outline-none"
                    />
                    <select
                      value={draft?.ciclo ?? p.ciclo}
                      onChange={(e) => updateDraft(key, 'ciclo', e.target.value)}
                      className="rounded border border-line bg-bg-tertiary px-2 py-0.5 text-xs font-medium text-ink-primary focus:border-brand focus:outline-none"
                    >
                      {CICLOS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleExpand(key)}
                    className="flex flex-1 items-center gap-2 text-left text-xs"
                  >
                    <span className="font-medium text-ink-primary">{p.ano} {p.ciclo}</span>
                    {p.gts.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.gts.map((g) => (
                          <span key={g} className="rounded-md border border-line bg-bg-secondary px-1.5 py-0.5 text-[10px] text-ink-secondary">
                            {g}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-ink-tertiary">Sem GTs</span>
                    )}
                    {isOpen ? <ChevronUp size={13} className="ml-auto shrink-0 text-ink-tertiary" /> : <ChevronDown size={13} className="ml-auto shrink-0 text-ink-tertiary" />}
                  </button>
                )}
                {!isEditing && (
                  <>
                    <button onClick={() => startEdit(p)} className="shrink-0 text-ink-tertiary hover:text-brand">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => removeCiclo(key)} className="shrink-0 text-ink-tertiary hover:text-bad">
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
                {isEditing && (
                  <div className="flex gap-1">
                    <button onClick={() => saveEdit(key)} className="text-good hover:opacity-80"><Check size={13} /></button>
                    <button onClick={cancelEdit} className="text-ink-tertiary hover:opacity-80"><X size={13} /></button>
                  </div>
                )}
              </div>

              {(isOpen || isEditing) && (
                <div className="border-t border-line px-3 pb-3 pt-2">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      {draftGts.map((g, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            value={g}
                            onChange={(e) => updateGt(key, idx, e.target.value)}
                            placeholder="Nome do GT"
                            className="flex-1 rounded border border-line bg-bg-tertiary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
                          />
                          <button onClick={() => removeGt(key, idx)} className="text-ink-tertiary hover:text-bad">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addGt(key)}
                        className="flex items-center gap-1 text-[11px] text-brand hover:opacity-80"
                      >
                        <Plus size={11} /> Adicionar GT
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {p.gts.map((g) => (
                        <li key={g} className="flex items-center gap-1.5 text-xs text-ink-secondary">
                          <span className="h-1 w-1 rounded-full bg-brand" /> {g}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ---------- Desenvolvimento e 1:1 ----------

function EditableList({
  items,
  onChange,
  placeholder,
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}) {
  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => {
              const next = [...items]
              next[idx] = e.target.value
              onChange(next)
            }}
            placeholder={placeholder}
            className="flex-1 rounded border border-line bg-bg-tertiary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
          />
          <button onClick={() => onChange(items.filter((_, i) => i !== idx))} className="text-ink-tertiary hover:text-bad">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ''])}
        className="flex items-center gap-1 text-[11px] text-brand hover:opacity-80"
      >
        <Plus size={11} /> Adicionar
      </button>
    </div>
  )
}

function Desenvolvimento1a1({
  avaliacao,
  setAvaliacao,
}: {
  avaliacao: AvaliacaoDesenvolvimento
  setAvaliacao: React.Dispatch<React.SetStateAction<AvaliacaoDesenvolvimento>>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<AvaliacaoDesenvolvimento>(avaliacao)
  const [saved, setSaved] = useState(avaliacao)

  function save() { setSaved(draft); setAvaliacao(draft); setEditing(false) }
  function cancel() { setDraft(saved); setEditing(false) }

  const sections: { key: keyof AvaliacaoDesenvolvimento; label: string; color: 'good' | 'bad' | 'warn' | 'info' }[] = [
    { key: 'pontosDesenvolvimento', label: 'Pontos de desenvolvimento (membro)', color: 'info' },
    { key: 'percepcaoGestores', label: 'Percepção dos gestores', color: 'warn' },
    { key: 'pontosFortes', label: 'Pontos fortes — 1:1', color: 'good' },
    { key: 'pontosFracos', label: 'Pontos fracos — 1:1', color: 'bad' },
  ]

  const data = editing ? draft : saved

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<TrendingUp size={15} />}>Desenvolvimento e 1:1</SectionTitle>
        {editing ? (
          <div className="flex gap-1.5">
            <button onClick={save} className="flex items-center gap-1 rounded-md bg-good-soft px-2 py-1 text-[11px] text-good hover:opacity-80">
              <Check size={12} /> Salvar
            </button>
            <button onClick={cancel} className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary hover:opacity-80">
              <X size={12} /> Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary hover:text-brand">
            <Pencil size={12} /> Editar
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((sec) => (
          <div key={sec.key}>
            <div className={cn('mb-1.5 text-[11px] font-medium uppercase tracking-wide', `text-${sec.color === 'info' ? 'brand' : sec.color}`)}>
              {sec.label}
            </div>
            {editing ? (
              <EditableList
                items={draft[sec.key]}
                onChange={(items) => setDraft((prev) => ({ ...prev, [sec.key]: items }))}
                placeholder="Descrever ponto…"
              />
            ) : (
              <ul className="space-y-1">
                {data[sec.key].length === 0 && (
                  <li className="text-xs text-ink-tertiary italic">Nenhum item registrado.</li>
                )}
                {data[sec.key].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-ink-secondary">
                    <span className={cn('mt-1.5 h-1 w-1 shrink-0 rounded-full', `bg-${sec.color === 'info' ? 'brand' : sec.color}`)} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ---------- Root ----------

export function Perfil({
  dossie,
  participacaoGTs,
  setParticipacaoGTs,
}: {
  dossie: Dossie
  participacaoGTs: ParticipacaoGT[]
  setParticipacaoGTs: React.Dispatch<React.SetStateAction<ParticipacaoGT[]>>
}) {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoDesenvolvimento>(dossie.avaliacaoDesenvolvimento)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <DadosMembro dossie={dossie} cargoAtual={dossie.colaborador.cargo} />
        <Trajetoria dossie={dossie} />
      </div>

      <GtsPorCiclo participacaoGTs={participacaoGTs} setParticipacaoGTs={setParticipacaoGTs} />

      <Desenvolvimento1a1 avaliacao={avaliacao} setAvaliacao={setAvaliacao} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Competencias dossie={dossie} />

        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<ListChecks size={15} />}>PDI — plano de desenvolvimento</SectionTitle>
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
        <SectionTitle icon={<Lightbulb size={15} />}>Recomendações automáticas</SectionTitle>
        <div className="divide-y divide-line">
          {dossie.recomendacoes.map((r) => {
            const tone = r.tipo as Tone
            const Icon = recomIcon[tone]
            return (
              <div key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', toneBadge[tone])}>
                  <Icon size={15} />
                </span>
                <div>
                  <div className="text-[13px] font-medium text-ink-primary">{r.titulo}</div>
                  <div className="mt-0.5 text-xs text-ink-secondary">{r.descricao}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
