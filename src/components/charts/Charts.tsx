import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AbonoCiclo, Competencia, KpiCiclo, PontuacaoCiclo, ScorePonto } from '@/lib/types'
import { farolDe } from '@/lib/pdaa'
import { toneHex } from '@/lib/ui'

const GRID = 'var(--line)'
const AXIS = { fontSize: 11, fill: 'var(--ink-tertiary)' }

const tooltipStyle = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--line-strong)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--ink-primary)',
}

// Recharts colore o texto de cada item pela cor da série por padrão — em fundo
// escuro isso fica ilegível quando a cor é escura. Força contraste fixo.
const tooltipLabelStyle = { color: 'var(--ink-primary)', fontWeight: 600, marginBottom: 2 }
const tooltipItemStyle = { color: 'var(--ink-secondary)' }

const KPI_SERIES = [
  { key: 'engajamento', label: 'Engajamento', color: '#008bad' },
  { key: 'pco', label: 'PCO', color: '#f6a823' },
  { key: 'entregas', label: 'Entregas', color: '#20b691' },
] as const

// Barras de KPIs por ciclo (C1–C4) de UM ano selecionado.
// cicloAtual: destaca o ciclo em aberto no eixo X.
export function KpisPorCicloChart({ data, cicloAtual }: { data: KpiCiclo[]; cicloAtual?: string }) {
  const ordenado = [...data].sort((a, b) => a.ciclo.localeCompare(b.ciclo))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ordenado} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={2} barCategoryGap="22%">
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="ciclo"
          tick={(props) => {
            const val = String(props.payload?.value ?? '')
            const isAtual = !!cicloAtual && val === cicloAtual
            const tx = props.x as number
            const ty = (props.y as number) + 12
            return (
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                fontSize={11}
                fill={isAtual ? 'var(--ink-primary)' : 'var(--ink-tertiary)'}
                fontWeight={isAtual ? 600 : 400}
              >
                {isAtual ? `${val} ●` : val}
              </text>
            )
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ fill: 'var(--bg-secondary)' }} />
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
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
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
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
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

// Pontuação PDAA por ciclo (C1–C4) — cada barra colorida pelo farol (azul/amarelo/vermelho).
// cicloAtual: destaca o ciclo em aberto com borda tracejada.
export function PontuacaoPorCicloChart({ data, cicloAtual }: { data: PontuacaoCiclo[]; cicloAtual?: string }) {
  const ordenado = [...data].sort((a, b) => a.ciclo.localeCompare(b.ciclo))
  const max = Math.max(16, ...ordenado.map((d) => d.pontos))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ordenado} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="ciclo"
          tick={(props) => {
            const val = String(props.payload?.value ?? '')
            const isAtual = !!cicloAtual && val === cicloAtual
            const tx = props.x as number
            const ty = (props.y as number) + 12
            return (
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                fontSize={11}
                fill={isAtual ? 'var(--ink-primary)' : 'var(--ink-tertiary)'}
                fontWeight={isAtual ? 600 : 400}
              >
                {isAtual ? `${val} ●` : val}
              </text>
            )
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis domain={[0, max]} tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
          cursor={{ fill: 'var(--bg-secondary)' }}
          formatter={(v, _name, props) => {
            const isAtual = cicloAtual && props.payload?.ciclo === cicloAtual
            return [`${v} pts${isAtual ? ' (em aberto)' : ''}`, 'Pontuação']
          }}
        />
        <ReferenceLine y={7} stroke="#f6a823" strokeDasharray="4 4" />
        <ReferenceLine y={13} stroke="#e23645" strokeDasharray="4 4" />
        <Bar dataKey="pontos" radius={[3, 3, 0, 0]}>
          {ordenado.map((d) => (
            <Cell
              key={`${d.ano}-${d.ciclo}`}
              fill={toneHex[farolDe(d.pontos).tone]}
              opacity={cicloAtual && d.ciclo === cicloAtual ? 0.75 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Abonos usados por ciclo (C1–C4).
export function AbonosPorCicloChart({ data }: { data: AbonoCiclo[] }) {
  const ordenado = [...data].sort((a, b) => a.ciclo.localeCompare(b.ciclo))
  const max = Math.max(3, ...ordenado.map((d) => d.usados))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ordenado} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="32%">
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="ciclo" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis domain={[0, max]} tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ fill: 'var(--bg-secondary)' }} formatter={(v) => [`${v} abono(s)`, 'Usados']} />
        <Bar dataKey="usados" fill="#20b691" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
