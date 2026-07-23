import type { ReactNode } from 'react'
import { cn } from '@/lib/ui'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-line bg-bg-primary shadow-card', className)}>
      {children}
    </div>
  )
}

interface SectionTitleProps {
  icon: ReactNode
  children: ReactNode
}

export function SectionTitle({ icon, children }: SectionTitleProps) {
  return (
    <div className="mb-3 flex items-center gap-2 font-display text-[13px] font-semibold text-ink-primary">
      <span className="text-ink-tertiary">{icon}</span>
      {children}
    </div>
  )
}
