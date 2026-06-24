import { ShieldCheck, Lock, Eye, List, Users } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import type { Dossie } from '@/lib/types'

export function Seguranca({ dossie }: { dossie: Dossie }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <ShieldCheck className="mx-auto mb-2 text-brand" size={26} />
          <div className="text-[13px] font-medium text-ink-primary">SSO + MFA</div>
          <div className="mt-1 text-[11px] text-good">✓ Autenticado em 04/06/2025</div>
        </Card>
        <Card className="p-4 text-center">
          <Lock className="mx-auto mb-2 text-bad" size={26} />
          <div className="text-[13px] font-medium text-ink-primary">Exportação</div>
          <div className="mt-1 text-[11px] text-bad">✗ Bloqueada sem aprovação N+2</div>
        </Card>
        <Card className="p-4 text-center">
          <Eye className="mx-auto mb-2 text-warn" size={26} />
          <div className="text-[13px] font-medium text-ink-primary">Nível de acesso</div>
          <div className="mt-1 text-[11px] text-warn">Restrito — Perfil RH/Gestor</div>
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<List size={15} />}>Log de auditoria — últimos acessos</SectionTitle>
        <div className="divide-y divide-line">
          {dossie.auditoria.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2 text-xs">
              <span className="w-28 shrink-0 text-ink-tertiary">{a.quando}</span>
              <span className="flex-1 text-ink-secondary">{a.acao}</span>
              <span className={cn('rounded-md px-2 py-0.5 text-[11px]', toneBadge[a.tone as Tone])}>{a.ator}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<Users size={15} />}>Perfis com acesso autorizado</SectionTitle>
        <div className="divide-y divide-line">
          {dossie.perfisAcesso.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-2 text-xs">
              <span className="text-ink-secondary">{p.nome}</span>
              <span className={cn('rounded-md px-2 py-0.5 text-right text-[11px]', toneBadge[p.tone as Tone])}>
                {p.permissao}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
