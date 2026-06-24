import { Card } from './Card'
import { cn, toneDot, toneText, toneHex } from '@/lib/ui'
import type { Kpi } from '@/lib/types'

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <Card className="p-4">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
        {kpi.label}
      </div>

      <div className={cn('text-3xl font-semibold leading-none', toneText[kpi.status])}>
        {kpi.value}
        <span className="text-lg">%</span>
      </div>

      {/* Barra de porcentagem */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg-secondary">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(0, Math.min(100, kpi.value))}%`, backgroundColor: toneHex[kpi.status] }}
        />
      </div>

      <div className="mt-2.5 flex items-start gap-1.5 text-[11px]">
        <span className={cn('mt-1 inline-block h-2 w-2 shrink-0 rounded-full', toneDot[kpi.status])} />
        <span className={cn('leading-snug', toneText[kpi.status])}>{kpi.sub}</span>
      </div>
    </Card>
  )
}
