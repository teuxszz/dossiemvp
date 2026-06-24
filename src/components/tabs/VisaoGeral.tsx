import { Lightbulb, TrendingUp, GraduationCap, Users } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { KpiCard } from '../KpiCard'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import type { Dossie } from '@/lib/types'

const recomIcon: Record<Tone, typeof TrendingUp> = {
  good: TrendingUp,
  warn: GraduationCap,
  bad: Users,
  info: Users,
}

export function VisaoGeral({ dossie }: { dossie: Dossie }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {dossie.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

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
