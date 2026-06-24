import { toneHex, type Tone } from '@/lib/ui'

interface Props {
  value: number // 0-100
  tone: Tone
  size?: number
}

// Gauge semicircular em SVG (substitui o canvas do MVP original — escala e
// fica nítido em qualquer resolução, e acompanha o tema).
export function Gauge({ value, tone, size = 132 }: Props) {
  const v = Math.max(0, Math.min(100, value))
  const stroke = 9
  const w = size
  const h = size / 2 + stroke
  const cx = w / 2
  const cy = h - stroke / 2
  const r = (w - stroke) / 2

  const arc = (from: number, to: number) => {
    const a0 = Math.PI + Math.PI * from
    const a1 = Math.PI + Math.PI * to
    const x0 = cx + r * Math.cos(a0)
    const y0 = cy + r * Math.sin(a0)
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const large = to - from > 0.5 ? 1 : 0
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${v}%`}>
      <path d={arc(0, 1)} fill="none" stroke="var(--line-strong)" strokeWidth={stroke} strokeLinecap="round" />
      <path
        d={arc(0, v / 100)}
        fill="none"
        stroke={toneHex[tone]}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize={size * 0.16}
        fontWeight={700}
        fill={toneHex[tone]}
      >
        {v}%
      </text>
    </svg>
  )
}
