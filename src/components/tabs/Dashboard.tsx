import { useMemo, useState } from 'react'
import { BarChart3, LineChart as LineIcon } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { KpiCard } from '../KpiCard'
import { KpisPorCicloChart, TendenciaScore } from '../charts/Charts'
import { cn } from '@/lib/ui'
import type { Dossie } from '@/lib/types'

export function Dashboard({ dossie }: { dossie: Dossie }) {
  const anos = useMemo(
    () => [...new Set(dossie.kpisPorCiclo.map((k) => k.ano))].sort((a, b) => b - a),
    [dossie.kpisPorCiclo],
  )
  const [ano, setAno] = useState<number>(anos[0] ?? new Date().getFullYear())

  const doAno = dossie.kpisPorCiclo.filter((k) => k.ano === ano)

  return (
    <div className="space-y-4">
      {/* KPIs em % integrados ao dashboard */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {dossie.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      {/* Barras por ciclo, com seletor de ano */}
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={<BarChart3 size={15} />}>KPIs por ciclo — {ano}</SectionTitle>
          <div className="flex gap-1.5">
            {anos.map((y) => (
              <button
                key={y}
                onClick={() => setAno(y)}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors',
                  y === ano
                    ? 'border-brand/50 bg-brand-soft text-brand'
                    : 'border-line bg-bg-secondary text-ink-secondary hover:text-ink-primary',
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          {doAno.length > 0 ? (
            <KpisPorCicloChart data={doAno} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-tertiary">
              Sem dados para {ano}.
            </div>
          )}
        </div>
        <p className="mt-2 text-[11px] text-ink-tertiary">
          Quatro ciclos por ano (C1–C4). Selecione o ano para comparar a evolução dos indicadores.
        </p>
      </Card>

      {/* Tendência de score geral */}
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
