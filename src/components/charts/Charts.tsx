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

const KPI_SERIES = [
  { key: 'engajamento', label: 'Engajamento', color: '#008bad' },
  { key: 'pco', label: 'PCO', color: '#f6a823' },
  { key: 'pdaa', label: 'PDAA', color: '#20b691' },
  { key: 'entregas', label: 'Entregas', color: '#00648f' },
] as const

// Barras de KPIs por ciclo (C1–C4) de UM ano selecionado.
export function KpisPorCicloChart({ data }: { data: KpiCiclo[] }) {
  const ordenado = [...data].sort((a, b) => a.ciclo.localeCompare(b.ciclo))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ordenado} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={2} barCategoryGap="22%">
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="ciclo" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-secondary)' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {KPI_SERIES.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// Radar hexagonal de competências comportamentais (estilo Qulture.Rocks).
export function RadarCompetencias({ data }: { data: Competencia[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="eixo" tick={{ fontSize: 11, fill: 'var(--ink-secondary)' }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--ink-tertiary)' }} stroke={GRID} />
        <Radar dataKey="valor" stroke="#008bad" fill="#008bad" fillOpacity={0.22} strokeWidth={2} />
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
          stroke="#008bad"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#008bad' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
