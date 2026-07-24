import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend,
} from 'recharts'
import { ShieldAlert, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, SectionTitle } from './Card'
import { farolDe } from '@/lib/pdaa'
import { cn, toneBadge } from '@/lib/ui'
import type { UseCicloGlobal } from '@/hooks/useCicloGlobal'
import type { Dossie, KpiCiclo } from '@/lib/types'

const FAROL_CONFIG = {
  azul:     { label: 'Farol Azul',     bg: 'bg-brand/10',  text: 'text-brand', border: 'border-brand/30' },
  amarelo:  { label: 'Farol Amarelo',  bg: 'bg-warn/10',   text: 'text-warn',  border: 'border-warn/30'  },
  vermelho: { label: 'Farol Vermelho', bg: 'bg-bad/10',    text: 'text-bad',   border: 'border-bad/30'   },
}

const BAR_COLORS = { azul: '#38bdf8', amarelo: '#f59e0b', vermelho: '#f43f5e' }

interface MemberStat {
  id: string
  nome: string
  iniciais: string
  area: string
  pontosPdaa: number
  farolNivel: 'azul' | 'amarelo' | 'vermelho'
  kpiAtual: { engajamento: number; pco: number; entregas: number; presenca: number } | null
}

function corIniciais(id: string) {
  const opts = ['bg-brand/20 text-brand', 'bg-good/20 text-good', 'bg-warn/20 text-warn', 'bg-purple-500/20 text-purple-400', 'bg-cyan-500/20 text-cyan-400']
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return opts[h % opts.length]
}

function avg(nums: number[]) {
  if (!nums.length) return 0
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length)
}

// Nome curto pra rótulo de gráfico — só primeiro nome, exceto quando isso gera
// ambiguidade (ex.: várias "Maria"), aí junta a inicial do segundo nome.
function nomesCurtos(nomesCompletos: string[]): Map<string, string> {
  const partes = nomesCompletos.map((n) => n.trim().split(/\s+/))
  const contagemPrimeiroNome = new Map<string, number>()
  for (const p of partes) contagemPrimeiroNome.set(p[0], (contagemPrimeiroNome.get(p[0]) ?? 0) + 1)

  const resultado = new Map<string, string>()
  partes.forEach((p, i) => {
    const primeiro = p[0]
    const ambiguo = (contagemPrimeiroNome.get(primeiro) ?? 0) > 1
    const curto = ambiguo && p[1] ? `${primeiro} ${p[1][0]}.` : primeiro
    resultado.set(nomesCompletos[i], curto)
  })
  return resultado
}

interface Props {
  allDossies: Dossie[]
  onSelectMembro: (id: string) => void
  cicloGlobal: UseCicloGlobal
}

export function TeamDashboard({ allDossies, onSelectMembro, cicloGlobal }: Props) {
  const CICLO_ATUAL = cicloGlobal.cicloGlobal
  const [visaoPdaa, setVisaoPdaa] = useState<'membro' | 'diretoria'>('membro')

  const stats: MemberStat[] = useMemo(() =>
    allDossies.map((d) => {
      const pontosPdaa = d.pdaa.condutasRegistradas.reduce((s, r) => s + r.pontos, 0)
      const farol = farolDe(pontosPdaa)
      const kpiRow = d.kpisPorCiclo.find(
        (k) => k.ano === CICLO_ATUAL.ano && k.ciclo === CICLO_ATUAL.ciclo
      )
      return {
        id: d.colaborador.id,
        nome: d.colaborador.nome,
        iniciais: d.colaborador.iniciais,
        area: d.colaborador.area,
        pontosPdaa,
        farolNivel: farol.nivel,
        kpiAtual: kpiRow
          ? { engajamento: kpiRow.engajamento, pco: kpiRow.pco, entregas: kpiRow.entregas, presenca: (kpiRow as KpiCiclo & { presenca?: number }).presenca ?? 0 }
          : null,
      }
    }),
  [allDossies])

  const total = stats.length
  const porFarol = {
    azul:     stats.filter((s) => s.farolNivel === 'azul').length,
    amarelo:  stats.filter((s) => s.farolNivel === 'amarelo').length,
    vermelho: stats.filter((s) => s.farolNivel === 'vermelho').length,
  }
  const emAtencao = stats.filter((s) => s.farolNivel !== 'azul').sort((a, b) => b.pontosPdaa - a.pontosPdaa)

  const mapNomeCurto = useMemo(() => nomesCurtos(stats.map((s) => s.nome)), [stats])

  const comKpi = stats.filter((s) => s.kpiAtual !== null)
  const mediaKpi = {
    engajamento: avg(comKpi.map((s) => s.kpiAtual!.engajamento)),
    pco:         avg(comKpi.map((s) => s.kpiAtual!.pco)),
    entregas:    avg(comKpi.map((s) => s.kpiAtual!.entregas)),
    presenca:    avg(comKpi.map((s) => s.kpiAtual!.presenca)),
  }

  // Distribuição por diretoria
  const porDiretoria = Object.entries(
    stats.reduce<Record<string, { total: number; atencao: number }>>((acc, s) => {
      if (!acc[s.area]) acc[s.area] = { total: 0, atencao: 0 }
      acc[s.area].total++
      if (s.farolNivel !== 'azul') acc[s.area].atencao++
      return acc
    }, {})
  ).sort((a, b) => b[1].total - a[1].total)

  // Dados para o gráfico de barras (PDAA por membro)
  const chartDataPorMembro = [...stats]
    .sort((a, b) => b.pontosPdaa - a.pontosPdaa)
    .map((s) => ({
      nome: mapNomeCurto.get(s.nome) ?? s.nome,
      nomeCompleto: s.nome,
      pontos: s.pontosPdaa,
      nivel: s.farolNivel,
      id: s.id as string | undefined,
      membros: undefined as number | undefined,
    }))

  // Mesmos dados, agregados por diretoria (média de pontos PDAA do grupo)
  const chartDataPorDiretoria = Object.entries(
    stats.reduce<Record<string, number[]>>((acc, s) => {
      if (!acc[s.area]) acc[s.area] = []
      acc[s.area].push(s.pontosPdaa)
      return acc
    }, {}),
  )
    .map(([diretoria, pontos]) => {
      const media = avg(pontos)
      return {
        nome: diretoria.replace('Diretoria de ', ''),
        nomeCompleto: diretoria,
        pontos: media,
        nivel: farolDe(media).nivel,
        id: undefined as string | undefined,
        membros: pontos.length as number | undefined,
      }
    })
    .sort((a, b) => b.pontos - a.pontos)

  const chartData = visaoPdaa === 'membro' ? chartDataPorMembro : chartDataPorDiretoria

  const kpiChartData = comKpi.map((s) => ({
    nome: mapNomeCurto.get(s.nome) ?? s.nome,
    Engajamento: s.kpiAtual!.engajamento,
    PCO: s.kpiAtual!.pco,
    Entregas: s.kpiAtual!.entregas,
  }))

  return (
    <div className="space-y-4">
      {/* KPIs médios */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Engajamento médio', value: mediaKpi.engajamento, suffix: '%' },
          { label: 'PCO médio',         value: mediaKpi.pco,         suffix: '%' },
          { label: 'Entregas médias',   value: mediaKpi.entregas,     suffix: '%' },
          { label: 'Presença média',    value: mediaKpi.presenca,     suffix: '%' },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <div className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">{k.label}</div>
            <div className="mt-1 text-3xl font-semibold text-brand">{k.value}{k.suffix}</div>
            {comKpi.length < total && (
              <div className="mt-1 text-[10px] text-ink-tertiary">{comKpi.length}/{total} com dados</div>
            )}
          </Card>
        ))}
      </div>

      {/* Farol do time + membros em atenção */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Distribuição farol */}
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<ShieldAlert size={15} />}>Farol do time</SectionTitle>
          <div className="mt-3 space-y-2">
            {(['azul', 'amarelo', 'vermelho'] as const).map((nivel) => {
              const cfg = FAROL_CONFIG[nivel]
              const n = porFarol[nivel]
              const pct = total > 0 ? Math.round((n / total) * 100) : 0
              return (
                <div key={nivel}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className={cn('font-medium', cfg.text)}>{cfg.label}</span>
                    <span className="text-ink-secondary">{n} membro{n !== 1 ? 's' : ''} · {pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
                    <div
                      className={cn('h-full rounded-full transition-all', cfg.bg.replace('/10', ''))}
                      style={{ width: `${pct}%`, backgroundColor: BAR_COLORS[nivel] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 border-t border-line pt-3 text-xs text-ink-tertiary">
            {total} membros cadastrados · ciclo {CICLO_ATUAL.ano} {CICLO_ATUAL.ciclo}
          </div>
        </Card>

        {/* Membros em atenção */}
        <Card className="p-4 sm:p-5 lg:col-span-2">
          <SectionTitle icon={<AlertTriangle size={15} />}>
            Membros em atenção
            {emAtencao.length > 0 && (
              <span className={cn('ml-2 rounded-full px-2 py-0.5 text-[10px]', toneBadge.bad)}>
                {emAtencao.length}
              </span>
            )}
          </SectionTitle>
          {emAtencao.length === 0 ? (
            <p className="mt-4 text-center text-sm text-good">Nenhum membro em farol amarelo ou vermelho.</p>
          ) : (
            <div className="mt-2 divide-y divide-line">
              {emAtencao.map((s) => {
                const cfg = FAROL_CONFIG[s.farolNivel]
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelectMembro(s.id)}
                    className="flex w-full items-center gap-3 py-2.5 text-left hover:opacity-80"
                  >
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold', corIniciais(s.id))}>
                      {s.iniciais}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink-primary">{s.nome}</p>
                      <p className="truncate text-[10px] text-ink-tertiary">{s.area}</p>
                    </div>
                    <span className={cn('shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium', cfg.bg, cfg.text, cfg.border)}>
                      {s.pontosPdaa} pts
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Gráfico PDAA por membro / por diretoria */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={<ShieldAlert size={15} />}>
            Pontuação PDAA {visaoPdaa === 'membro' ? 'por membro' : 'por diretoria'} — {CICLO_ATUAL.ano} {CICLO_ATUAL.ciclo}
          </SectionTitle>
          <div className="flex rounded-lg border border-line bg-bg-secondary p-0.5">
            <button
              onClick={() => setVisaoPdaa('membro')}
              className={cn('rounded-md px-3 py-1 text-[11px] font-medium transition-colors', visaoPdaa === 'membro' ? 'bg-bg-primary text-ink-primary shadow-sm' : 'text-ink-tertiary hover:text-ink-primary')}
            >
              Por membro
            </button>
            <button
              onClick={() => setVisaoPdaa('diretoria')}
              className={cn('rounded-md px-3 py-1 text-[11px] font-medium transition-colors', visaoPdaa === 'diretoria' ? 'bg-bg-primary text-ink-primary shadow-sm' : 'text-ink-tertiary hover:text-ink-primary')}
            >
              Por diretoria
            </button>
          </div>
        </div>
        <div className="mt-3 h-64 overflow-x-auto overflow-y-hidden">
          <div className="h-full w-full" style={{ minWidth: `${Math.max(chartData.length * 42, 100)}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barSize={24}
              margin={{ top: 4, right: 8, left: 0, bottom: 24 }}
              onClick={(d) => {
                if (visaoPdaa !== 'membro') return
                const id = (d as { activePayload?: Array<{ payload?: { id?: string } }> })?.activePayload?.[0]?.payload?.id
                if (id) onSelectMembro(id)
              }}
            >
              <XAxis
                dataKey="nome"
                tick={{ fontSize: 10, fill: 'var(--color-ink-secondary)' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-40}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  const cfg = FAROL_CONFIG[d.nivel as keyof typeof FAROL_CONFIG]
                  return (
                    <div className="rounded-lg border border-line bg-bg-primary px-3 py-2 shadow-md text-xs">
                      <p className="font-medium text-ink-primary">{d.nomeCompleto}</p>
                      <p className={cfg.text}>{cfg.label} · {d.pontos} pts{visaoPdaa === 'diretoria' ? ` (média de ${d.membros} membro${d.membros !== 1 ? 's' : ''})` : ''}</p>
                    </div>
                  )
                }}
              />
              <ReferenceLine y={7}  stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: 'Amarelo', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
              <ReferenceLine y={13} stroke="#f43f5e" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: 'Vermelho', position: 'right', fontSize: 10, fill: '#f43f5e' }} />
              <Bar dataKey="pontos" radius={[4, 4, 0, 0]} cursor={visaoPdaa === 'membro' ? 'pointer' : 'default'}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={BAR_COLORS[entry.nivel as keyof typeof BAR_COLORS]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-ink-tertiary">
          {visaoPdaa === 'membro'
            ? 'Clique em uma barra para abrir o dossiê do membro. Linhas tracejadas = limiares do farol.'
            : 'Média de pontos PDAA por diretoria neste ciclo. Linhas tracejadas = limiares do farol.'}
        </p>
      </Card>

      {/* KPIs por membro (se houver dados) */}
      {kpiChartData.length > 0 && (
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<TrendingUp size={15} />}>KPIs por membro — {CICLO_ATUAL.ano} {CICLO_ATUAL.ciclo}</SectionTitle>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpiChartData} barGap={2} barCategoryGap="30%">
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: 'var(--color-ink-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-ink-tertiary)' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{ fontSize: 12, borderRadius: 8, background: 'var(--color-bg-primary)', border: '1px solid var(--color-line-strong)', color: 'var(--color-ink-primary)' }}
                  labelStyle={{ color: 'var(--color-ink-primary)', fontWeight: 600 }}
                  itemStyle={{ color: 'var(--color-ink-secondary)' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Engajamento" fill="#38bdf8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PCO"         fill="#818cf8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Entregas"    fill="#34d399" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Membros por diretoria */}
      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<Users size={15} />}>Distribuição por diretoria</SectionTitle>
        <div className="mt-3 divide-y divide-line">
          {porDiretoria.map(([diretoria, { total: n, atencao }]) => (
            <div key={diretoria} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink-primary">{diretoria}</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary">
                  <div className="h-full rounded-full bg-brand/60" style={{ width: `${(n / total) * 100}%` }} />
                </div>
              </div>
              <span className="shrink-0 text-xs text-ink-secondary">{n} membro{n !== 1 ? 's' : ''}</span>
              {atencao > 0 && (
                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px]', toneBadge.warn)}>
                  {atencao} em atenção
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
