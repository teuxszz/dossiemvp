import type { ReactNode } from 'react'
import { cn } from '@/lib/ui'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border border-line bg-bg-primary shadow-card', className)}>
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
    <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-ink-secondary">
      <span className="text-ink-tertiary">{icon}</span>
      {children}
    </div>
  )
}
