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
} from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { RadarCompetencias } from '../charts/Charts'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import type { Dossie } from '@/lib/types'

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

export function Perfil({ dossie }: { dossie: Dossie }) {
  const p = dossie.perfil

  const contato: { icon: typeof Cake; label: string; value: string }[] = [
    { icon: CalendarDays, label: 'Entrada na CONSEJ', value: p.dataEntrada },
    { icon: Cake, label: 'Nascimento', value: p.nascimento },
    { icon: Phone, label: 'Celular', value: p.celular },
    { icon: Mail, label: 'E-mail', value: p.email },
    { icon: GraduationCap, label: 'Curso', value: `${p.curso} · ${p.periodoCurso}` },
  ]

  return (
    <div className="space-y-4">
      {/* Identidade + alocação */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<IdCard size={15} />}>Dados do membro</SectionTitle>
          <div className="divide-y divide-line">
            {contato.map((c) => (
              <div key={c.label} className="flex items-center gap-3 py-2 text-xs">
                <c.icon size={15} className="shrink-0 text-ink-tertiary" />
                <span className="text-ink-secondary">{c.label}</span>
                <span className="ml-auto text-right font-medium text-ink-primary">{c.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className={cn('rounded-md px-2 py-0.5 text-[11px]', toneBadge.info)}>{p.arquetipo}</span>
            <span className={cn('rounded-md px-2 py-0.5 text-[11px]', toneBadge.good)}>{p.perfilComportamental}</span>
            {p.interesses.map((i) => (
              <span key={i} className="rounded-md border border-line bg-bg-secondary px-2 py-0.5 text-[11px] text-ink-secondary">
                {i}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<Compass size={15} />}>Trajetória na CONSEJ</SectionTitle>
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-bg-secondary p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
                <Building2 size={13} /> Diretoria atual
              </div>
              <div className="mt-1 text-[13px] font-medium text-ink-primary">{p.diretoriaAtual}</div>
            </div>
            <div className="rounded-lg border border-line bg-bg-secondary p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
                <Compass size={13} /> Coordenadoria atual
              </div>
              <div className="mt-1 text-[13px] font-medium text-ink-primary">{p.coordenadoriaAtual}</div>
            </div>
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">Diretorias anteriores</div>
          <div className="mt-1.5 divide-y divide-line">
            {p.diretoriasAnteriores.map((d) => (
              <div key={d.diretoria} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-ink-primary">{d.diretoria}</span>
                <span className="text-ink-tertiary">{d.periodo}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Radar hexagonal (Qulture.Rocks) + PDI */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<Hexagon size={15} />}>Competências comportamentais</SectionTitle>
          <div className="h-64">
            <RadarCompetencias data={dossie.competencias} />
          </div>
        </Card>

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

      {/* Recomendações automáticas (sem promoção) */}
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
