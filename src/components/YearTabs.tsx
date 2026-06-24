import { cn } from '@/lib/ui'

interface Props {
  anos: number[]
  value: number
  onChange: (ano: number) => void
}

// Seletor de ano reutilizável (Dashboard e PDAA).
export function YearTabs({ anos, value, onChange }: Props) {
  return (
    <div className="flex gap-1.5">
      {anos.map((y) => (
        <button
          key={y}
          onClick={() => onChange(y)}
          className={cn(
            'rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors',
            y === value
              ? 'border-brand/50 bg-brand-soft text-brand'
              : 'border-line bg-bg-secondary text-ink-secondary hover:text-ink-primary',
          )}
        >
          {y}
        </button>
      ))}
    </div>
  )
}
