import { BarChart3, Hexagon, LineChart as LineIcon } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { KpisPorCicloChart, RadarCompetencias, TendenciaScore } from '../charts/Charts'
import type { Dossie } from '@/lib/types'

export function Analise({ dossie }: { dossie: Dossie }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle icon={<BarChart3 size={15} />}>KPIs por ciclo</SectionTitle>
          <div className="h-56">
            <KpisPorCicloChart data={dossie.kpisPorCiclo} />
          </div>
        </Card>
        <Card className="p-4">
          <SectionTitle icon={<Hexagon size={15} />}>Radar de competências</SectionTitle>
          <div className="h-56">
            <RadarCompetencias data={dossie.competencias} />
          </div>
        </Card>
      </div>
      <Card className="p-4">
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
