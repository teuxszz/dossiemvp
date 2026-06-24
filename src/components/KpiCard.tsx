import { Card } from './Card'
import { Gauge } from './Gauge'
import { cn, toneDot, toneText } from '@/lib/ui'
import type { Kpi } from '@/lib/types'

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <Card className="p-4">
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
        {kpi.label}
      </div>
      <div className={cn('text-2xl font-semibold leading-none', toneText[kpi.status])}>
        {kpi.value}%
      </div>
      <div className="mt-1 flex justify-center">
        <Gauge value={kpi.value} tone={kpi.status} size={120} />
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px]">
        <span className={cn('inline-block h-2 w-2 shrink-0 rounded-full', toneDot[kpi.status])} />
        <span className={cn('leading-tight', toneText[kpi.status])}>{kpi.sub}</span>
      </div>
    </Card>
  )
}
