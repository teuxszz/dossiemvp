import {
  ArrowUp,
  Award,
  Star,
  AlertTriangle,
  BookOpen,
  FileWarning,
  GitCommitVertical,
} from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import type { EventoTimeline, Dossie } from '@/lib/types'

function iconFor(ev: EventoTimeline) {
  const t = ev.titulo.toLowerCase()
  if (t.includes('promoção')) return ArrowUp
  if (t.includes('conclusão') || t.includes('certific')) return Award
  if (t.includes('avaliação')) return Star
  if (t.includes('feedback')) return AlertTriangle
  if (t.includes('treinamento')) return BookOpen
  if (t.includes('advertência') || ev.tipo === 'bad') return FileWarning
  return GitCommitVertical
}

export function Historico({ dossie }: { dossie: Dossie }) {
  const eventos = [...dossie.timeline].sort((a, b) => b.ordem - a.ordem)
  return (
    <Card className="p-4 sm:p-5">
      <SectionTitle icon={<GitCommitVertical size={15} />}>Linha do tempo — eventos críticos</SectionTitle>
      <div className="divide-y divide-line">
        {eventos.map((ev) => {
          const Icon = iconFor(ev)
          return (
            <div key={ev.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', toneBadge[ev.tipo as Tone])}>
                <Icon size={15} />
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-medium text-ink-primary">{ev.titulo}</div>
                <div className="mt-0.5 text-[11px] text-ink-secondary">{ev.meta}</div>
              </div>
              <div className="whitespace-nowrap text-[11px] text-ink-tertiary">{ev.data}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
