import { useMemo, useState } from 'react'
import { BarChart3, ShieldAlert, Pencil, Check, X, Users } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { KpiCard } from '../KpiCard'
import { FarolCard } from '../Farol'
import { YearTabs } from '../YearTabs'
import { KpisPorCicloChart, PontuacaoPorCicloChart } from '../charts/Charts'
import { comCicloAtual, filtrarCiclosFuturos } from '@/lib/pdaa'
import { cn } from '@/lib/ui'
import type { ConfigCiclo, Dossie, KpiCiclo, SnapshotCiclo } from '@/lib/types'

interface Props {
  dossie: Dossie
  pontosPdaa: number
  cicloAtual: { ano: number; ciclo: string }
  kpisPorCiclo: KpiCiclo[]
  setKpisPorCiclo: React.Dispatch<React.SetStateAction<KpiCiclo[]>>
  snapshots: SnapshotCiclo[]
  configCiclo: ConfigCiclo | null
  mediaTimeKpis: KpiCiclo[]
}

// Campos de KPI editáveis manualmente
const KPI_FIELDS = [
  { key: 'engajamento', label: 'Engajamento' },
  { key: 'pco', label: 'PCO' },
  { key: 'entregas', label: 'Entregas' },
  { key: 'presenca', label: 'Presença' },
] as const

type KpiField = (typeof KPI_FIELDS)[number]['key']

export function Dashboard({ dossie, pontosPdaa, cicloAtual, kpisPorCiclo, setKpisPorCiclo, snapshots, configCiclo, mediaTimeKpis }: Props) {
  const anosKpi = useMemo(
    () => [...new Set(kpisPorCiclo.map((k) => k.ano))].sort((a, b) => b - a),
    [kpisPorCiclo],
  )
  const anosPdaa = useMemo(
    () => [...new Set(dossie.pdaa.pontuacaoPorCiclo.map((k) => k.ano))].sort((a, b) => b - a),
    [dossie.pdaa.pontuacaoPorCiclo],
  )
  const [anoKpi, setAnoKpi] = useState<number>(anosKpi[0] ?? 2026)
  const [anoPdaa, setAnoPdaa] = useState<number>(anosPdaa[0] ?? 2026)

  // Edição manual de KPIs do ciclo atual
  const [editandoKpi, setEditandoKpi] = useState(false)
  const cicloAtualKpi = kpisPorCiclo.find((k) => k.ano === cicloAtual.ano && k.ciclo === cicloAtual.ciclo)
  const [draftKpi, setDraftKpi] = useState<Partial<Record<KpiField, number>>>({})

  function abrirEdicaoKpi() {
    setDraftKpi({
      engajamento: cicloAtualKpi?.engajamento ?? 0,
      pco: cicloAtualKpi?.pco ?? 0,
      entregas: cicloAtualKpi?.entregas ?? 0,
      presenca: (cicloAtualKpi as KpiCiclo & { presenca?: number })?.presenca ?? 0,
    })
    setEditandoKpi(true)
  }

  function salvarKpi() {
    setKpisPorCiclo((prev) => {
      const existe = prev.some((k) => k.ano === cicloAtual.ano && k.ciclo === cicloAtual.ciclo)
      if (existe) {
        return prev.map((k) =>
          k.ano === cicloAtual.ano && k.ciclo === cicloAtual.ciclo
            ? { ...k, ...draftKpi }
            : k
        )
      }
      return [...prev, { ano: cicloAtual.ano, ciclo: cicloAtual.ciclo, pdaa: pontosPdaa, engajamento: 0, pco: 0, entregas: 0, ...draftKpi } as KpiCiclo]
    })
    setEditandoKpi(false)
  }

  const kpisFiltrados = filtrarCiclosFuturos(kpisPorCiclo, cicloAtual)
  const kpiDoAno = kpisFiltrados.filter((k) => k.ano === anoKpi)

  // Pontuação PDAA com ciclo atual ao vivo — sem ciclos futuros
  const pontuacaoLive = filtrarCiclosFuturos(
    comCicloAtual(dossie.pdaa.pontuacaoPorCiclo, cicloAtual, pontosPdaa),
    cicloAtual,
  )
  const pdaaDoAno = pontuacaoLive.filter((k) => k.ano === anoPdaa)

  // Status do ciclo
  const cicloRef = `${cicloAtual.ano}-${cicloAtual.ciclo}`
  const snapshotAtual = snapshots.find((s) => s.ano === cicloAtual.ano && s.ciclo === cicloAtual.ciclo)
  const prazoConfig = configCiclo?.cicloRef === cicloRef ? configCiclo.dataFechamento : null

  return (
    <div className="space-y-4">
      {/* Badge de status do ciclo */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium',
          snapshotAtual
            ? 'bg-good-soft text-good'
            : prazoConfig
              ? 'bg-warn/10 text-warn'
              : 'bg-brand/10 text-brand'
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', snapshotAtual ? 'bg-good' : prazoConfig ? 'bg-warn' : 'bg-brand')} />
          {snapshotAtual
            ? `Ciclo ${cicloRef} fechado`
            : `Ciclo ${cicloRef} em aberto${prazoConfig ? ` · prazo: ${new Date(prazoConfig).toLocaleDateString('pt-BR')}` : ''}`}
        </span>
      </div>

      {/* KPIs em % */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {dossie.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      {/* KPIs por ciclo — com edição manual do ciclo atual */}
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={<BarChart3 size={15} />}>KPIs por ciclo — {anoKpi}</SectionTitle>
          <div className="flex items-center gap-2">
            {anoKpi === cicloAtual.ano && !snapshotAtual && (
              editandoKpi ? (
                <div className="flex gap-1.5">
                  <button onClick={salvarKpi} className="flex items-center gap-1 rounded-md bg-good-soft px-2 py-1 text-[11px] text-good hover:opacity-80">
                    <Check size={12} /> Salvar
                  </button>
                  <button onClick={() => setEditandoKpi(false)} className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button onClick={abrirEdicaoKpi} className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 text-[11px] text-ink-secondary hover:text-brand">
                  <Pencil size={12} /> Editar {cicloAtual.ciclo}
                </button>
              )
            )}
            <YearTabs anos={anosKpi} value={anoKpi} onChange={setAnoKpi} />
          </div>
        </div>

        {/* Formulário inline de edição de KPIs do ciclo atual */}
        {editandoKpi && anoKpi === cicloAtual.ano && (
          <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg border border-line bg-bg-secondary p-3 sm:grid-cols-4">
            <p className="col-span-2 mb-1 text-[11px] text-ink-tertiary sm:col-span-4">
              Valores de KPI para {cicloAtual.ano} {cicloAtual.ciclo} (%)
            </p>
            {KPI_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-0.5 block text-[11px] text-ink-tertiary">{f.label}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draftKpi[f.key] ?? 0}
                  onChange={(e) => setDraftKpi((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                  className="w-full rounded border border-line bg-bg-tertiary px-2 py-1.5 text-xs text-ink-primary focus:border-brand focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Snapshot do ano selecionado (se houver ciclos fechados nesse ano) */}
        {(() => {
          const snapsDoAno = snapshots.filter((s) => s.ano === anoKpi)
          if (snapsDoAno.length === 0 || anoKpi === cicloAtual.ano) return null
          return (
            <div className="mb-3 rounded-lg border border-good/20 bg-good-soft/40 px-3 py-2 text-[11px] text-ink-secondary">
              Dados oficiais dos ciclos fechados de {anoKpi}:{' '}
              {snapsDoAno.map((s) => (
                <span key={s.ciclo} className="mr-3">
                  <strong>{s.ciclo}</strong> · Eng {s.kpis.engajamento}% · PCO {s.kpis.pco}% · Ent {s.kpis.entregas}% · Pres {s.kpis.presenca}%
                </span>
              ))}
            </div>
          )
        })()}

        <div className="h-64">
          {kpiDoAno.length > 0 ? (
            <KpisPorCicloChart data={kpiDoAno} cicloAtual={anoKpi === cicloAtual.ano ? cicloAtual.ciclo : undefined} />
          ) : (
            <Empty ano={anoKpi} />
          )}
        </div>
        <p className="mt-2 text-[11px] text-ink-tertiary">
          Quatro ciclos por ano (C1–C4). Clique em "Editar {cicloAtual.ciclo}" para inserir os valores do ciclo atual manualmente.
        </p>
      </Card>

      {/* PDAA — pontuação */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <FarolCard pontos={pontosPdaa} probatorioUsado={dossie.pdaa.estagioProbatorioUsado} />

        <Card className="p-4 sm:p-5 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <SectionTitle icon={<ShieldAlert size={15} />}>Pontuação PDAA por ciclo — {anoPdaa}</SectionTitle>
            <YearTabs anos={anosPdaa} value={anoPdaa} onChange={setAnoPdaa} />
          </div>
          <div className="h-56">
            {pdaaDoAno.length > 0 ? (
              <PontuacaoPorCicloChart data={pdaaDoAno} cicloAtual={anoPdaa === cicloAtual.ano ? cicloAtual.ciclo : undefined} />
            ) : (
              <Empty ano={anoPdaa} />
            )}
          </div>
          <p className="mt-2 text-[11px] text-ink-tertiary">
            Linhas tracejadas = limiares do farol (amarelo ≥ 7, vermelho ≥ 13). O ciclo atual (●) reflete as condutas registradas na aba PDAA em tempo real.
          </p>
        </Card>
      </div>

      <ComparativoTime kpisMembro={kpisFiltrados} cicloAtual={cicloAtual} mediaTimeKpis={mediaTimeKpis} />
    </div>
  )
}

const KPI_LABELS: Record<string, string> = {
  engajamento: 'Engajamento',
  pco: 'PCO',
  entregas: 'Entregas',
  pdaa: 'PDAA pts',
}

function ComparativoTime({
  kpisMembro,
  cicloAtual,
  mediaTimeKpis,
}: {
  kpisMembro: KpiCiclo[]
  cicloAtual: { ano: number; ciclo: string }
  mediaTimeKpis: KpiCiclo[]
}) {
  const anos = useMemo(
    () => [...new Set(kpisMembro.map((k) => k.ano))].sort((a, b) => b - a),
    [kpisMembro],
  )
  const [ano, setAno] = useState<number>(anos[0] ?? cicloAtual.ano)

  const ciclosMembro = kpisMembro.filter((k) => k.ano === ano)
  const ciclosTime = mediaTimeKpis.filter((k) => k.ano === ano)
  const cicloKeys = ciclosMembro.map((k) => k.ciclo).sort()

  const fields = ['engajamento', 'pco', 'entregas'] as const

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <SectionTitle icon={<Users size={15} />}>Pontuações por ciclo — comparativo com o time</SectionTitle>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[11px] text-ink-tertiary">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-brand" /> Membro</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-ink-tertiary" /> Média do time</span>
          </div>
          {anos.length > 1 && <YearTabs anos={anos} value={ano} onChange={setAno} />}
        </div>
      </div>

      {ciclosMembro.length === 0 ? (
        <p className="py-6 text-center text-xs text-ink-tertiary">Sem dados para {ano}.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line">
                <th className="pb-2 pr-4 text-left font-medium text-ink-tertiary">KPI</th>
                {cicloKeys.map((c) => (
                  <th key={c} className={cn('pb-2 px-3 text-center font-medium', c === cicloAtual.ciclo && ano === cicloAtual.ano ? 'text-brand' : 'text-ink-tertiary')}>
                    {c}{c === cicloAtual.ciclo && ano === cicloAtual.ano ? ' ●' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {fields.map((field) => (
                <tr key={field}>
                  <td className="py-2 pr-4 font-medium text-ink-secondary">{KPI_LABELS[field]}</td>
                  {cicloKeys.map((ciclo) => {
                    const m = ciclosMembro.find((k) => k.ciclo === ciclo)
                    const t = ciclosTime.find((k) => k.ciclo === ciclo)
                    const mv = m?.[field] ?? null
                    const tv = t?.[field] ?? null
                    const diff = mv !== null && tv !== null ? mv - tv : null
                    return (
                      <td key={ciclo} className="px-3 py-2 text-center">
                        <div className="font-semibold text-ink-primary">{mv ?? '—'}%</div>
                        {tv !== null && (
                          <div className={cn('text-[10px]', diff !== null && diff >= 0 ? 'text-good' : 'text-bad')}>
                            {diff !== null && diff >= 0 ? '+' : ''}{diff ?? ''}pp vs time ({tv}%)
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-[11px] text-ink-tertiary">
        Média do time é referência calculada sobre todos os membros ativos. Diferencial em pp (pontos percentuais) vs a média.
      </p>
    </Card>
  )
}

function Empty({ ano }: { ano: number }) {
  return (
    <div className="flex h-full items-center justify-center text-xs text-ink-tertiary">Sem dados para {ano}.</div>
  )
}
