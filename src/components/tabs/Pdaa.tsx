import { useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  ShieldAlert,
  Gift,
  ListChecks,
  Lock,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  History,
  Search,
} from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { FarolCard } from '../Farol'
import { YearTabs } from '../YearTabs'
import { AbonosPorCicloChart, PontuacaoPorCicloChart } from '../charts/Charts'
import { CONDUTAS, CATEGORIA_LABEL, CATEGORIA_TONE, PONTOS_POR_CATEGORIA, comCicloAtual, filtrarCiclosFuturos, farolDe, ABONOS_CATALOGO } from '@/lib/pdaa'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import { supabase } from '@/lib/supabase'
import type { CategoriaConduta, Dossie, RegistroConduta, SnapshotCiclo, UsoAbono } from '@/lib/types'

const CATEGORIAS: CategoriaConduta[] = ['leve', 'moderada', 'alerta', 'grave']

interface Props {
  dossie: Dossie
  registros: RegistroConduta[]
  setRegistros: (next: RegistroConduta[]) => void
  cicloAtual: { ano: number; ciclo: string }
  pontosPdaa: number
  snapshots: SnapshotCiclo[]
  isAdmin: boolean
  currentEmail: string | null
  cicloFechado: boolean
}

export function Pdaa({ dossie, registros, setRegistros, cicloAtual, pontosPdaa, snapshots, isAdmin, currentEmail, cicloFechado }: Props) {
  const [abonoSalvando, setAbonoSalvando] = useState(false)
  const [abonoErro, setAbonoErro] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [pickerCategoria, setPickerCategoria] = useState<CategoriaConduta | 'todas'>('todas')
  const [pickerBusca, setPickerBusca] = useState('')
  const [condutaSel, setCondutaSel] = useState<string | null>(null)
  const [condutaData, setCondutaData] = useState('')
  const [condutaObs, setCondutaObs] = useState('')
  const [showAbonoCatalogo, setShowAbonoCatalogo] = useState(false)
  const [showAddAbono, setShowAddAbono] = useState(false)
  const [abonoTipoSel, setAbonoTipoSel] = useState(ABONOS_CATALOGO[0].id)
  const [abonoDesc, setAbonoDesc] = useState('')
  const [abonosAtual, setAbonosAtual] = useState<UsoAbono[]>(() => {
    const cicloData = dossie.pdaa.abonosPorCiclo.find(
      (a) => a.ano === cicloAtual.ano && a.ciclo === cicloAtual.ciclo
    )
    return cicloData?.registros ?? []
  })
  const [expandedCondutaCiclo, setExpandedCondutaCiclo] = useState<string | null>(null)

  const anos = useMemo(
    () => [...new Set(dossie.pdaa.pontuacaoPorCiclo.map((a) => a.ano))].sort((a, b) => b - a),
    [dossie.pdaa.pontuacaoPorCiclo],
  )
  const anosAbonos = useMemo(
    () => [...new Set(dossie.pdaa.abonosPorCiclo.map((a) => a.ano))].sort((a, b) => b - a),
    [dossie.pdaa.abonosPorCiclo],
  )
  const [anoPdaa, setAnoPdaa] = useState<number>(anos[0] ?? 2026)
  const [anoAbonos, setAnoAbonos] = useState<number>(anosAbonos[0] ?? 2026)

  const pontuacaoLive = filtrarCiclosFuturos(
    comCicloAtual(dossie.pdaa.pontuacaoPorCiclo, cicloAtual, pontosPdaa),
    cicloAtual,
  )
  const pdaaDoAno = pontuacaoLive.filter((k) => k.ano === anoPdaa)

  const abonosDoAno = dossie.pdaa.abonosPorCiclo.filter((a) => a.ano === anoAbonos)
  const abonosUsadosTotal = dossie.pdaa.abonosPorCiclo.reduce((s, a) => s + a.usados, 0)

  function adicionarConduta() {
    const c = CONDUTAS.find((x) => x.id === condutaSel)
    if (!c) return
    setRegistros([...registros, {
      id: crypto.randomUUID(),
      condutaId: c.id,
      categoria: c.categoria,
      pontos: c.pontos,
      descricao: c.descricao,
      data: condutaData || undefined,
      observacao: condutaObs.trim() || undefined,
    }])
    setCondutaSel(null)
    setCondutaData('')
    setCondutaObs('')
    setShowPicker(false)
  }

  function remover(id: string) {
    setRegistros(registros.filter((r) => r.id !== id))
  }

  // Encontra snapshot do ciclo atual se já fechado
  const snapshotAtual = snapshots.find((s) => s.ano === cicloAtual.ano && s.ciclo === cicloAtual.ciclo)

  return (
    <div className="space-y-4">
      {/* Banner de ciclo fechado (histórico) */}
      {snapshotAtual && (
        <div className="flex items-center gap-2 rounded-lg border border-good/30 bg-good-soft px-4 py-2.5 text-xs text-good">
          <Lock size={14} />
          <span>
            Ciclo {cicloAtual.ano} {cicloAtual.ciclo} <strong>fechado</strong> em{' '}
            {new Date(snapshotAtual.fechadoEm).toLocaleDateString('pt-BR')} · PDAA final:{' '}
            <strong>{snapshotAtual.pontuacaoPdaa} pts</strong> ({snapshotAtual.farolNivel})
          </span>
        </div>
      )}

      {/* Resumo: farol + abonos + condutas */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <FarolCard pontos={pontosPdaa} probatorioUsado={dossie.pdaa.estagioProbatorioUsado} />

        <Card className="p-4 sm:p-5">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
              <Gift size={13} /> Abonos
            </div>
            <button
              onClick={() => setShowAbonoCatalogo((v) => !v)}
              className="text-[11px] text-brand hover:opacity-80"
            >
              {showAbonoCatalogo ? 'Ocultar catálogo' : 'Ver catálogo'}
            </button>
          </div>
          <div className="text-4xl font-semibold leading-none text-good">{dossie.pdaa.abonosDisponiveis}</div>
          <div className="mt-1 text-xs text-ink-secondary">disponíveis · {abonosUsadosTotal} usados no histórico</div>

          {/* Catálogo de abonos possíveis */}
          {showAbonoCatalogo && (
            <div className="mt-3 space-y-1.5 border-t border-line pt-3">
              <div className="text-[11px] font-medium text-ink-tertiary mb-1.5">Ações que geram abono</div>
              {ABONOS_CATALOGO.map((ab) => (
                <div key={ab.id} className="rounded-md border border-line bg-bg-secondary p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[12px] font-medium text-ink-primary">{ab.tipo}</span>
                    <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px]', toneBadge.good)}>até {ab.pontosMaximos}pt</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-secondary">{ab.descricao}</p>
                </div>
              ))}
            </div>
          )}

          {/* Abonos registrados no ciclo atual */}
          <div className="mt-3 border-t border-line pt-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-medium text-ink-tertiary">Registrados — {cicloAtual.ciclo} {cicloAtual.ano}</span>
              {!cicloFechado && (
                <button
                  onClick={() => setShowAddAbono((v) => !v)}
                  className="flex items-center gap-1 text-brand hover:opacity-80"
                >
                  <Plus size={11} /> Adicionar
                </button>
              )}
            </div>

            {showAddAbono && (
              <div className="mb-2 rounded-lg border border-line bg-bg-secondary p-3 space-y-2">
                <select
                  value={abonoTipoSel}
                  onChange={(e) => setAbonoTipoSel(e.target.value)}
                  className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
                >
                  {ABONOS_CATALOGO.map((ab) => (
                    <option key={ab.id} value={ab.id}>{ab.tipo} (até {ab.pontosMaximos}pt)</option>
                  ))}
                </select>
                <input
                  value={abonoDesc}
                  onChange={(e) => setAbonoDesc(e.target.value)}
                  placeholder="Observação opcional..."
                  className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
                />
                {abonoErro && <p className="text-[11px] text-bad">{abonoErro}</p>}
                <div className="flex gap-2">
                  <button
                    disabled={abonoSalvando}
                    onClick={async () => {
                      const tipo = ABONOS_CATALOGO.find((a) => a.id === abonoTipoSel)
                      if (!tipo) return
                      const now = new Date()
                      const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
                      const novo: UsoAbono = {
                        id: `ua_${Date.now()}`,
                        tipo: tipo.tipo,
                        descricao: abonoDesc || undefined,
                        data: `${meses[now.getMonth()]} ${now.getFullYear()}`,
                        pontosAbonados: tipo.pontosMaximos,
                      }
                      setAbonoErro(null)
                      // Membro comum: grava de verdade via RPC (única escrita liberada pra ele).
                      // Admin: segue o padrão do resto do app — só em memória, nesta sessão.
                      if (!isAdmin && currentEmail && supabase) {
                        setAbonoSalvando(true)
                        const { error } = await supabase.rpc('registrar_abono_proprio', {
                          p_ano: cicloAtual.ano,
                          p_ciclo: cicloAtual.ciclo,
                          p_tipo: tipo.tipo,
                          p_descricao: abonoDesc || null,
                          p_pontos_abonados: tipo.pontosMaximos,
                        })
                        setAbonoSalvando(false)
                        // "Nenhum dossiê vinculado": membro só existe localmente (seed do
                        // organograma, ainda não migrado pro Supabase) — segue com o
                        // registro local em vez de travar o membro sem poder usar o abono.
                        if (error && !error.message.includes('Nenhum dossiê vinculado')) {
                          setAbonoErro(error.message)
                          return
                        }
                      }
                      setAbonosAtual((prev) => [...prev, novo])
                      setAbonoDesc('')
                      setShowAddAbono(false)
                    }}
                    className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand/90 disabled:opacity-50"
                  >
                    <Check size={11} /> {abonoSalvando ? 'Registrando…' : 'Registrar'}
                  </button>
                  <button onClick={() => setShowAddAbono(false)} className="text-xs text-ink-tertiary hover:text-ink-primary">Cancelar</button>
                </div>
              </div>
            )}

            {abonosAtual.length === 0 ? (
              <p className="text-[11px] text-ink-tertiary italic">Nenhum abono registrado neste ciclo.</p>
            ) : (
              <div className="space-y-1">
                {abonosAtual.map((ua) => (
                  <div key={ua.id} className="flex items-center gap-2 text-[11px]">
                    <span className={cn('rounded px-1.5 py-0.5', toneBadge.good)}>{ua.pontosAbonados}pt</span>
                    <span className="flex-1 text-ink-secondary truncate">{ua.tipo}</span>
                    <span className="shrink-0 text-ink-tertiary">{ua.data}</span>
                    {isAdmin && !cicloFechado && (
                      <button onClick={() => setAbonosAtual((p) => p.filter((a) => a.id !== ua.id))} className="text-ink-tertiary hover:text-bad">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
                <div className="mt-1 border-t border-line pt-1 text-[11px] font-medium text-good">
                  Total abonado: {abonosAtual.reduce((s, a) => s + a.pontosAbonados, 0)} pts neste ciclo
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
            <ListChecks size={13} /> Condutas no ciclo
          </div>
          <div className="text-4xl font-semibold leading-none text-ink-primary">{registros.length}</div>
          <div className="mt-2 text-xs text-ink-secondary">
            somando <span className="font-medium text-ink-primary">{pontosPdaa} pts</span> no ciclo{' '}
            {cicloAtual.ano} {cicloAtual.ciclo}
          </div>
        </Card>
      </div>

      {/* Pontuação PDAA por ciclo — sincronizada com o ciclo atual */}
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={<ShieldAlert size={15} />}>Pontuação PDAA por ciclo — {anoPdaa}</SectionTitle>
          <div className="flex items-center gap-2">
            <YearTabs anos={anos} value={anoPdaa} onChange={setAnoPdaa} />
          </div>
        </div>
        <div className="h-52">
          {pdaaDoAno.length > 0 ? (
            <PontuacaoPorCicloChart data={pdaaDoAno} cicloAtual={anoPdaa === cicloAtual.ano ? cicloAtual.ciclo : undefined} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-tertiary">Sem dados para {anoPdaa}.</div>
          )}
        </div>
        <p className="mt-2 text-[11px] text-ink-tertiary">
          Linhas tracejadas = limiares do farol (amarelo ≥ 7, vermelho ≥ 13). O ciclo atual reflete as condutas registradas abaixo em tempo real.
        </p>
      </Card>

      {/* Snapshots de ciclos fechados */}
      {snapshots.length > 0 && (
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<Lock size={15} />}>Ciclos fechados — histórico oficial</SectionTitle>
          <div className="mt-2 divide-y divide-line">
            {[...snapshots].reverse().map((s) => {
              const farol = farolDe(s.pontuacaoPdaa)
              return (
                <div key={`${s.ano}-${s.ciclo}`} className="flex flex-wrap items-center gap-3 py-2.5 text-xs">
                  <span className="w-14 font-medium text-ink-primary">{s.ano} {s.ciclo}</span>
                  <span className={cn('rounded-md px-2 py-0.5 text-[11px]', toneBadge[farol.tone as Tone])}>
                    {farol.label} · {s.pontuacaoPdaa} pts
                  </span>
                  <span className="text-ink-secondary">Eng {s.kpis.engajamento}%</span>
                  <span className="text-ink-secondary">PCO {s.kpis.pco}%</span>
                  <span className="text-ink-secondary">Entregas {s.kpis.entregas}%</span>
                  <span className="text-ink-secondary">Presença {s.kpis.presenca}%</span>
                  <span className="ml-auto text-ink-tertiary">
                    {new Date(s.fechadoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Análise de condutas por ciclo — histórico */}
      {(dossie.pdaa.condutasPorCiclo ?? []).length > 0 && (
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<History size={15} />}>Análise de condutas por ciclo</SectionTitle>
          <p className="mb-3 mt-1 text-xs text-ink-secondary">
            Padrões identificados em ciclos anteriores para orientar planos de desenvolvimento.
          </p>
          <div className="space-y-2">
            {(dossie.pdaa.condutasPorCiclo ?? [])
              .sort((a, b) => a.ano !== b.ano ? b.ano - a.ano : b.ciclo.localeCompare(a.ciclo))
              .map((cc) => {
                const key = `${cc.ano}-${cc.ciclo}`
                const isOpen = expandedCondutaCiclo === key
                const total = cc.registros.reduce((s, r) => s + r.pontos, 0)

                // Agrupa por descrição para identificar padrões
                const padroes = Object.entries(
                  cc.registros.reduce<Record<string, number>>((acc, r) => {
                    acc[r.descricao] = (acc[r.descricao] ?? 0) + 1
                    return acc
                  }, {})
                ).sort((a, b) => b[1] - a[1])

                return (
                  <div key={key} className="rounded-lg border border-line">
                    <button
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                      onClick={() => setExpandedCondutaCiclo(isOpen ? null : key)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-ink-primary">{cc.ano} {cc.ciclo}</span>
                        <span className={cn('rounded-md px-2 py-0.5 text-[11px]', toneBadge[farolDe(total).tone as Tone])}>
                          {total} pts
                        </span>
                        <span className="text-[11px] text-ink-tertiary">{cc.registros.length} conduta(s)</span>
                      </div>
                      {isOpen ? <ChevronUp size={14} className="text-ink-tertiary" /> : <ChevronDown size={14} className="text-ink-tertiary" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-line px-4 pb-4 pt-3 space-y-3">
                        {/* Padrões */}
                        {padroes.some(([, count]) => count > 1) && (
                          <div className="rounded-lg bg-warn/5 border border-warn/20 p-3">
                            <div className="mb-1.5 text-[11px] font-medium text-warn">Padrões identificados</div>
                            {padroes.filter(([, count]) => count > 1).map(([desc, count]) => (
                              <div key={desc} className="flex items-start gap-1.5 text-[11px] text-ink-secondary">
                                <span className={cn('mt-0.5 shrink-0 rounded px-1 py-0.5 text-[10px]', toneBadge.warn)}>{count}×</span>
                                <span>{desc}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Lista de condutas */}
                        <div className="divide-y divide-line">
                          {cc.registros.map((r) => (
                            <div key={r.id} className="flex items-center gap-3 py-2">
                              <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[11px]', toneBadge[CATEGORIA_TONE[r.categoria] as Tone])}>
                                {CATEGORIA_LABEL[r.categoria]} · {r.pontos}pt
                              </span>
                              <span className="min-w-0 flex-1 text-xs text-ink-secondary">{r.descricao}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </Card>
      )}

      {/* Abonos usados por ciclo */}
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={<Gift size={15} />}>Abonos usados por ciclo — {anoAbonos}</SectionTitle>
          <YearTabs anos={anosAbonos} value={anoAbonos} onChange={setAnoAbonos} />
        </div>
        <div className="h-48">
          {abonosDoAno.length > 0 ? (
            <AbonosPorCicloChart data={abonosDoAno} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-tertiary">Sem dados para {anoAbonos}.</div>
          )}
        </div>
      </Card>

      {/* Registro editável de condutas — só admin registra/remove. Prazo e
          fechamento de ciclo agora são geridos globalmente na aba Ciclos. */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <SectionTitle icon={<ShieldAlert size={15} />}>Registro de condutas — {cicloAtual.ano} {cicloAtual.ciclo}</SectionTitle>
        </div>

        {isAdmin && !cicloFechado && (
        <p className="mb-3 mt-3 text-xs text-ink-secondary">
          Escolha uma conduta do catálogo do PDAA. Os pontos somam automaticamente e atualizam o farol em todas as abas.
        </p>
        )}
        {cicloFechado && (
          <p className="mb-3 mt-3 text-xs text-ink-tertiary">Ano {cicloAtual.ano} fechado — dados congelados, só leitura.</p>
        )}

        {/* Picker de conduta */}
        {isAdmin && !snapshotAtual && !cicloFechado && (
          <>
            {!showPicker ? (
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1.5 rounded-md border border-dashed border-brand/40 px-3 py-2 text-xs text-brand hover:bg-brand/5"
              >
                <Plus size={13} /> Registrar conduta
              </button>
            ) : (
              <div className="rounded-lg border border-line bg-bg-secondary">
                {/* Abas de categoria */}
                <div className="flex flex-wrap gap-1 border-b border-line px-3 pt-3 pb-0">
                  {(['todas', ...CATEGORIAS] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setPickerCategoria(cat); setCondutaSel(null) }}
                      className={cn(
                        'rounded-t-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                        pickerCategoria === cat
                          ? 'bg-bg-primary text-brand border border-b-bg-primary border-line -mb-px'
                          : 'text-ink-tertiary hover:text-ink-primary'
                      )}
                    >
                      {cat === 'todas' ? 'Todas' : `${CATEGORIA_LABEL[cat]} (${PONTOS_POR_CATEGORIA[cat]}pt)`}
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowPicker(false); setCondutaSel(null); setPickerBusca('') }}
                    className="ml-auto pb-1 text-ink-tertiary hover:text-ink-primary"
                  ><X size={14} /></button>
                </div>

                {/* Busca */}
                <div className="relative px-3 pt-3">
                  <Search size={12} className="absolute left-5 top-1/2 translate-y-[3px] text-ink-tertiary" />
                  <input
                    value={pickerBusca}
                    onChange={(e) => { setPickerBusca(e.target.value); setCondutaSel(null) }}
                    placeholder="Buscar conduta..."
                    className="w-full rounded-md border border-line bg-bg-primary pl-7 pr-3 py-1.5 text-xs text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
                  />
                </div>

                {/* Lista de condutas */}
                <div className="mt-2 max-h-56 overflow-y-auto px-3 pb-3 space-y-1.5">
                  {CONDUTAS
                    .filter((c) => pickerCategoria === 'todas' || c.categoria === pickerCategoria)
                    .filter((c) => !pickerBusca || c.descricao.toLowerCase().includes(pickerBusca.toLowerCase()))
                    .map((c) => {
                      const isSel = condutaSel === c.id
                      return (
                        <button
                          key={c.id}
                          onClick={() => setCondutaSel(isSel ? null : c.id)}
                          className={cn(
                            'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                            isSel
                              ? 'border-brand/40 bg-brand/5'
                              : 'border-line bg-bg-primary hover:border-brand/30 hover:bg-brand/5'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium', toneBadge[CATEGORIA_TONE[c.categoria] as Tone])}>
                              {CATEGORIA_LABEL[c.categoria]} · {c.pontos}pt
                            </span>
                            {isSel && <Check size={11} className="ml-auto text-brand" />}
                          </div>
                          <p className="mt-1 text-[11px] text-ink-secondary leading-snug">{c.descricao}</p>
                        </button>
                      )
                    })}
                  {CONDUTAS
                    .filter((c) => pickerCategoria === 'todas' || c.categoria === pickerCategoria)
                    .filter((c) => !pickerBusca || c.descricao.toLowerCase().includes(pickerBusca.toLowerCase()))
                    .length === 0 && (
                    <p className="py-4 text-center text-xs text-ink-tertiary">Nenhuma conduta encontrada.</p>
                  )}
                </div>

                {/* Form de contexto (data + obs) — aparece quando há seleção */}
                {condutaSel && (
                  <div className="border-t border-line px-3 py-3 space-y-2">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-0.5 block text-[11px] text-ink-tertiary">Data da ocorrência <span className="italic">(opcional)</span></label>
                        <input
                          type="date"
                          value={condutaData}
                          onChange={(e) => setCondutaData(e.target.value)}
                          className="w-full rounded-md border border-line bg-bg-primary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[11px] text-ink-tertiary">Observação <span className="italic">(opcional)</span></label>
                        <input
                          value={condutaObs}
                          onChange={(e) => setCondutaObs(e.target.value)}
                          placeholder="Ex.: Faltou à reunião com cliente X"
                          className="w-full rounded-md border border-line bg-bg-primary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={adicionarConduta}
                        className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
                      >
                        <Check size={12} /> Confirmar registro
                      </button>
                      <button onClick={() => { setCondutaSel(null); setCondutaData(''); setCondutaObs('') }} className="text-xs text-ink-tertiary hover:text-ink-primary">
                        Limpar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-3 divide-y divide-line">
          {registros.length === 0 && (
            <div className="py-6 text-center text-xs text-ink-tertiary">Nenhuma conduta registrada neste ciclo.</div>
          )}
          {registros.map((r) => (
            <div key={r.id} className="flex items-start gap-3 py-2.5">
              <span className={cn('mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium', toneBadge[CATEGORIA_TONE[r.categoria] as Tone])}>
                {CATEGORIA_LABEL[r.categoria]} · {r.pontos}pt
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-secondary leading-snug">{r.descricao}</p>
                {(r.data || r.observacao) && (
                  <p className="mt-0.5 text-[10px] text-ink-tertiary">
                    {r.data && <span>{new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                    {r.data && r.observacao && <span> · </span>}
                    {r.observacao && <span className="italic">{r.observacao}</span>}
                  </p>
                )}
              </div>
              {isAdmin && !snapshotAtual && !cicloFechado && (
                <button
                  onClick={() => remover(r.id)}
                  className="shrink-0 rounded-md p-1.5 text-ink-tertiary hover:bg-bad-soft hover:text-bad"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {registros.length > 0 && (
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs text-ink-secondary">Total no ciclo</span>
            <span className="text-sm font-semibold text-ink-primary">{pontosPdaa} pts</span>
          </div>
        )}
      </Card>
    </div>
  )
}
