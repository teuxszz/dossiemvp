import { AlertTriangle } from 'lucide-react'
import { cn, toneBadge, toneDot, toneText, toneHex } from '@/lib/ui'
import { farolDe, LIMITE_PROBATORIO } from '@/lib/pdaa'
import { Card } from './Card'

// Pill compacta (header) — visível em todas as abas.
export function FarolBadge({ pontos }: { pontos: number }) {
  const f = farolDe(pontos)
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium', toneBadge[f.tone])}
      style={{ borderColor: toneHex[f.tone] + '66' }}
      title={`${f.label} · ${f.descricao}`}
    >
      <span className={cn('inline-block h-2 w-2 rounded-full', toneDot[f.tone])} />
      PDAA: {pontos} pts · {f.label.replace('Farol ', '')}
    </span>
  )
}

// Card completo (dashboard / aba PDAA).
export function FarolCard({ pontos, probatorioUsado = false }: { pontos: number; probatorioUsado?: boolean }) {
  const f = farolDe(pontos)
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
        Pontuação PDAA — ciclo atual
      </div>
      <div className="flex items-end gap-3">
        <div className={cn('text-4xl font-semibold leading-none', toneText[f.tone])}>{pontos}</div>
        <div className="pb-0.5 text-sm text-ink-tertiary">pts</div>
        <span className={cn('mb-1 ml-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium', toneBadge[f.tone])}>
          <span className={cn('inline-block h-2.5 w-2.5 rounded-full', toneDot[f.tone])} />
          {f.label}
        </span>
      </div>
      <div className="mt-1 text-xs text-ink-secondary">
        {f.faixa} · {f.descricao}
      </div>

      {/* Trilha de faixas do farol */}
      <div className="mt-3 flex h-2 overflow-hidden rounded-full">
        <div className="bg-brand" style={{ width: '37.5%' }} title="Azul · 0–6" />
        <div className="bg-warn" style={{ width: '37.5%' }} title="Amarelo · 7–12" />
        <div className="bg-bad" style={{ width: '25%' }} title="Vermelho · 13–16" />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-ink-tertiary">
        <span>0</span>
        <span>7</span>
        <span>13</span>
        <span>16</span>
      </div>

      {(f.probatorio || probatorioUsado) && (
        <div
          className={cn(
            'mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px]',
            f.probatorio ? 'border-bad/40 bg-bad-soft text-bad' : 'border-line bg-bg-secondary text-ink-secondary',
          )}
        >
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            {f.probatorio
              ? `Atingiu ${LIMITE_PROBATORIO} pts — entra em Estágio Probatório (conduzido pela DirEx).`
              : 'Estágio Probatório já utilizado — só pode ser atingido uma única vez.'}
            {f.probatorio && probatorioUsado && ' Probatório já usado: sujeito a desligamento.'}
          </span>
        </div>
      )}
    </Card>
  )
}
