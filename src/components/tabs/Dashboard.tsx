import { useMemo, useState } from 'react'
import { BarChart3, LineChart as LineIcon, ShieldAlert } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { KpiCard } from '../KpiCard'
import { FarolCard } from '../Farol'
import { YearTabs } from '../YearTabs'
import { KpisPorCicloChart, PontuacaoPorCicloChart, TendenciaScore } from '../charts/Charts'
import { comCicloAtual } from '@/lib/pdaa'
import type { Dossie } from '@/lib/types'

export function Dashboard({ dossie, pontosPdaa }: { dossie: Dossie; pontosPdaa: number }) {
  const anosKpi = useMemo(
    () => [...new Set(dossie.kpisPorCiclo.map((k) => k.ano))].sort((a, b) => b - a),
    [dossie.kpisPorCiclo],
  )
  const anosPdaa = useMemo(
    () => [...new Set(dossie.pdaa.pontuacaoPorCiclo.map((k) => k.ano))].sort((a, b) => b - a),
    [dossie.pdaa.pontuacaoPorCiclo],
  )
  const [anoKpi, setAnoKpi] = useState<number>(anosKpi[0] ?? 2026)
  const [anoPdaa, setAnoPdaa] = useState<number>(anosPdaa[0] ?? 2026)

  const kpiDoAno = dossie.kpisPorCiclo.filter((k) => k.ano === anoKpi)

  // Pontuação por ciclo com o ciclo atual refletindo a edição ao vivo.
  const pontuacaoLive = comCicloAtual(dossie.pdaa.pontuacaoPorCiclo, dossie.pdaa.cicloAtual, pontosPdaa)
  const pdaaDoAno = pontuacaoLive.filter((k) => k.ano === anoPdaa)

  return (
    <div className="space-y-4">
      {/* KPIs em % */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {dossie.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={<BarChart3 size={15} />}>KPIs por ciclo — {anoKpi}</SectionTitle>
          <YearTabs anos={anosKpi} value={anoKpi} onChange={setAnoKpi} />
        </div>
        <div className="h-64">
          {kpiDoAno.length > 0 ? (
            <KpisPorCicloChart data={kpiDoAno} />
          ) : (
            <Empty ano={anoKpi} />
          )}
        </div>
        <p className="mt-2 text-[11px] text-ink-tertiary">Quatro ciclos por ano (C1–C4).</p>
      </Card>

      {/* PDAA — pontuação (separado dos KPIs) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <FarolCard pontos={pontosPdaa} probatorioUsado={dossie.pdaa.estagioProbatorioUsado} />

        <Card className="p-4 sm:p-5 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <SectionTitle icon={<ShieldAlert size={15} />}>Pontuação PDAA por ciclo — {anoPdaa}</SectionTitle>
            <YearTabs anos={anosPdaa} value={anoPdaa} onChange={setAnoPdaa} />
          </div>
          <div className="h-56">
            {pdaaDoAno.length > 0 ? <PontuacaoPorCicloChart data={pdaaDoAno} /> : <Empty ano={anoPdaa} />}
          </div>
          <p className="mt-2 text-[11px] text-ink-tertiary">
            Linhas tracejadas = limiares do farol (amarelo ≥ 7, vermelho ≥ 13). O ciclo atual reflete as condutas
            registradas na aba PDAA.
          </p>
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<LineIcon size={15} />}>
          Tendência de score geral (últimos {dossie.tendenciaScore.length} trimestres)
        </SectionTitle>
        <div className="h-44">
          <TendenciaScore data={dossie.tendenciaScore} />
        </div>
      </Card>
    </div>
  )
}

function Empty({ ano }: { ano: number }) {
  return (
    <div className="flex h-full items-center justify-center text-xs text-ink-tertiary">Sem dados para {ano}.</div>
  )
}
