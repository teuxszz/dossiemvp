import { useEffect, useState } from 'react'
import { ShieldCheck, Mail, UserCog, Lock, KeyRound, Check, X, AlertTriangle } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { cn } from '@/lib/ui'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { UseCicloGlobal } from '@/hooks/useCicloGlobal'
import type { Colaborador, Dossie } from '@/lib/types'

interface Props {
  allDossies: Dossie[]
  onUpdateMembro: (id: string, patch: Partial<Colaborador>) => void
  cicloGlobal: UseCicloGlobal
}

export function Seguranca({ allDossies, onUpdateMembro, cicloGlobal }: Props) {
  const [admins, setAdmins] = useState<string[] | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('admins')
      .select('email')
      .then(({ data }) => setAdmins((data ?? []).map((a) => a.email as string)))
  }, [])

  const comEmail = allDossies.filter((d) => d.colaborador.email)
  const semEmail = allDossies.filter((d) => !d.colaborador.email)
  const cobertura = allDossies.length ? Math.round((comEmail.length / allDossies.length) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <Mail className="mx-auto mb-2 text-brand" size={24} />
          <div className="font-display text-3xl font-bold text-brand">{cobertura}%</div>
          <div className="mt-1 text-[11px] text-ink-tertiary">
            {comEmail.length}/{allDossies.length} membros com login vinculado
          </div>
        </Card>
        <Card className="p-4 text-center">
          <UserCog className="mx-auto mb-2 text-brand" size={24} />
          <div className="font-display text-3xl font-bold text-brand">{admins === null ? '—' : admins.length}</div>
          <div className="mt-1 text-[11px] text-ink-tertiary">
            {isSupabaseConfigured ? 'administradores com acesso total' : 'Supabase não configurado'}
          </div>
        </Card>
        <Card className="p-4 text-center">
          <Lock className="mx-auto mb-2 text-good" size={24} />
          <div className="font-display text-3xl font-bold text-good">{cicloGlobal.anosFechados.size}</div>
          <div className="mt-1 text-[11px] text-ink-tertiary">ano(s) fechado(s) — histórico protegido contra edição</div>
        </Card>
      </div>

      {/* Cobertura de login */}
      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<KeyRound size={15} />}>Membros sem login vinculado</SectionTitle>
        <p className="mt-1 text-xs text-ink-secondary">
          Sem e-mail vinculado, a pessoa não consegue entrar no próprio dossiê — mesmo já com conta criada, o
          sistema não sabe a quem ela pertence. Vincule aqui pra liberar o acesso.
        </p>
        {semEmail.length === 0 ? (
          <p className="mt-4 text-center text-sm text-good">Todo mundo já tem e-mail vinculado. 🎉</p>
        ) : (
          <div className="mt-3 divide-y divide-line">
            {semEmail.map((d) => (
              <LinhaVincularEmail key={d.colaborador.id} colaborador={d.colaborador} onUpdateMembro={onUpdateMembro} />
            ))}
          </div>
        )}
      </Card>

      {/* Administradores — resumo (gestão fica na aba Administradores) */}
      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<UserCog size={15} />}>Administradores com acesso total</SectionTitle>
        {!isSupabaseConfigured ? (
          <p className="mt-2 text-xs text-ink-tertiary">Modo demo (sem Supabase) — controle de acesso desativado, todo mundo é admin.</p>
        ) : admins === null ? (
          <p className="mt-2 text-xs text-ink-tertiary">Carregando…</p>
        ) : admins.length === 0 ? (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-bad/30 bg-bad-soft px-3 py-2 text-xs text-bad">
            <AlertTriangle size={14} /> Nenhum administrador cadastrado — ninguém consegue gerenciar membros. Adicione um na aba Administradores.
          </div>
        ) : (
          <ul className="mt-2 space-y-1">
            {admins.map((email) => (
              <li key={email} className="text-xs text-ink-secondary">{email}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-ink-tertiary">Gerenciar quem é administrador fica na aba Administradores.</p>
      </Card>

      {/* Modelo de acesso — documentação viva do que realmente está em vigor */}
      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<ShieldCheck size={15} />}>Como o acesso funciona aqui</SectionTitle>
        <ul className="mt-2 space-y-2 text-xs text-ink-secondary">
          <li className="flex gap-2"><ShieldCheck size={13} className="mt-0.5 shrink-0 text-brand" /> Login por e-mail/senha (Supabase Auth) — a senha nunca passa por um admin, cada pessoa define a própria no cadastro.</li>
          <li className="flex gap-2"><UserCog size={13} className="mt-0.5 shrink-0 text-brand" /> Administradores enxergam e editam todos os dossiês; controlado pela tabela de admins (RLS no banco, não só na tela).</li>
          <li className="flex gap-2"><Mail size={13} className="mt-0.5 shrink-0 text-brand" /> Membro comum só enxerga o próprio dossiê, em modo leitura — exceto celular, e-mail de contato, período do curso e registro de abonos, que ele mesmo pode editar.</li>
          <li className="flex gap-2"><Lock size={13} className="mt-0.5 shrink-0 text-good" /> Anos fechados (aba Ciclos) ficam protegidos contra edição pra todo mundo, admin incluído — histórico não é reescrito por engano.</li>
        </ul>
      </Card>
    </div>
  )
}

function LinhaVincularEmail({
  colaborador,
  onUpdateMembro,
}: {
  colaborador: Colaborador
  onUpdateMembro: (id: string, patch: Partial<Colaborador>) => void
}) {
  const [editando, setEditando] = useState(false)
  const [email, setEmail] = useState('')

  function salvar() {
    if (!email.trim()) return
    onUpdateMembro(colaborador.id, { email: email.trim() })
    setEditando(false)
    setEmail('')
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
      <span className="min-w-0 flex-1 truncate text-ink-primary">{colaborador.nome}</span>
      {editando ? (
        <>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@consej.com.br"
            className="w-56 rounded border border-line bg-bg-secondary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
          />
          <button onClick={salvar} className="rounded-md bg-brand p-1.5 text-white hover:bg-brand/90"><Check size={13} /></button>
          <button onClick={() => { setEditando(false); setEmail('') }} className="rounded-md border border-line p-1.5 text-ink-tertiary hover:text-ink-primary"><X size={13} /></button>
        </>
      ) : (
        <button
          onClick={() => setEditando(true)}
          className={cn('shrink-0 rounded-md border border-dashed border-warn/40 px-2.5 py-1 text-[11px] text-warn hover:bg-warn/10')}
        >
          Vincular e-mail
        </button>
      )}
    </div>
  )
}
