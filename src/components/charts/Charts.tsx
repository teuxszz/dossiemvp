import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Competencia, KpiCiclo, ScorePonto } from '@/lib/types'

const GRID = 'var(--line)'
const AXIS = { fontSize: 11, fill: 'var(--ink-tertiary)' }

const tooltipStyle = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--line-strong)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--ink-primary)',
}

export function KpisPorCicloChart({ data }: { data: KpiCiclo[] }) {
  // Reorganiza por métrica para agrupar barras por ciclo.
  const rows = [
    { metric: 'Engajamento', ...pick(data, 'engajamento') },
    { metric: 'PCO', ...pick(data, 'pco') },
    { metric: 'PDAA', ...pick(data, 'pdaa') },
    { metric: 'Entregas', ...pick(data, 'entregas') },
  ]
  const ciclos = data.map((d) => d.ciclo)
  const cores = ['#378ADD', '#1D9E75', '#BA7517']

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="metric" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis domain={[50, 100]} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-secondary)' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {ciclos.map((ciclo, i) => (
          <Bar key={ciclo} dataKey={ciclo} fill={cores[i % cores.length]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

function pick(data: KpiCiclo[], key: keyof Omit<KpiCiclo, 'ciclo'>) {
  return Object.fromEntries(data.map((d) => [d.ciclo, d[key]]))
}

export function RadarCompetencias({ data }: { data: Competencia[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="eixo" tick={{ fontSize: 10, fill: 'var(--ink-tertiary)' }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--ink-tertiary)' }} stroke={GRID} />
        <Radar dataKey="valor" stroke="#378ADD" fill="#378ADD" fillOpacity={0.18} strokeWidth={2} />
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function TendenciaScore({ data }: { data: ScorePonto[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="trimestre" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis domain={[60, 100]} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#185FA5"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#185FA5' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
