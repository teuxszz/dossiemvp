import type { StatusNivel } from './types'

export type Tone = StatusNivel | 'info'

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

// Classes utilitárias por "tom" semântico (bom / atenção / ruim / info).
export const toneText: Record<Tone, string> = {
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
  info: 'text-brand',
}

export const toneBadge: Record<Tone, string> = {
  good: 'bg-good-soft text-good',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  info: 'bg-brand-soft text-brand',
}

export const toneDot: Record<Tone, string> = {
  good: 'bg-good-bar',
  warn: 'bg-warn',
  bad: 'bg-bad-bar',
  info: 'bg-brand',
}

// Cor "crua" (hex) — usada em SVG/recharts onde Tailwind não alcança.
// Paleta do site de referência (navy/ciano).
export const toneHex: Record<Tone, string> = {
  good: '#20b691',
  warn: '#f6a823',
  bad: '#e23645',
  info: '#1ab8dd',
}
