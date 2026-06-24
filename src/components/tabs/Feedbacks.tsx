import { MessageCircle, Quote } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import type { Dossie } from '@/lib/types'

// Aba dedicada de feedbacks — exibe apenas UM feedback (o mais recente/relevante).
export function Feedbacks({ dossie }: { dossie: Dossie }) {
  const feedback = dossie.feedbacks[0]

  return (
    <Card className="p-4 sm:p-6">
      <SectionTitle icon={<MessageCircle size={15} />}>Feedback</SectionTitle>

      {!feedback ? (
        <div className="py-8 text-center text-xs text-ink-tertiary">Nenhum feedback registrado.</div>
      ) : (
        <div className="rounded-lg border border-line bg-bg-secondary p-5">
          <Quote className="mb-3 text-brand" size={22} />
          <p className="text-sm leading-relaxed text-ink-primary">{feedback.texto}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {feedback.tags.map((t) => (
              <span key={t.label} className={cn('rounded-md px-2 py-0.5 text-[11px]', toneBadge[t.tone as Tone])}>
                {t.label}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs font-medium text-ink-primary">
              {feedback.autor} <span className="text-ink-tertiary">— {feedback.papel}</span>
            </span>
            <span className="text-[11px] text-ink-tertiary">{feedback.data}</span>
          </div>
        </div>
      )}
    </Card>
  )
}
