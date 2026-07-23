import { useState, type FormEvent } from 'react'
import { ShieldCheck, LogIn } from 'lucide-react'

interface Props {
  onSubmit: (email: string, password: string) => Promise<{ error: string | null }>
  error: string | null
}

export function LoginScreen({ onSubmit, error }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setSubmitting(true)
    setLocalError(null)
    const { error: err } = await onSubmit(email.trim(), password)
    setSubmitting(false)
    if (err) setLocalError(err)
  }

  const shownError = localError ?? error

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-tertiary px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-bg-primary p-8 shadow-pop">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-ink-primary">Dossiê CONSEJ</h1>
            <p className="mt-1 text-xs text-ink-tertiary">Acesse com seu e-mail institucional</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] text-ink-tertiary">E-mail</label>
            <input
              type="email"
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@consej.com.br"
              className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-ink-tertiary">Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
            />
          </div>

          {shownError && (
            <div className="rounded-lg border border-bad/40 bg-bad-soft px-3 py-2 text-xs text-bad">
              {shownError === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : shownError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !email.trim() || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn size={15} /> {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-ink-tertiary">
          Acesso restrito a membros da CONSEJ. Problemas para entrar? Fale com a Diretoria de Pesquisas e Pessoas.
        </p>
      </div>
    </div>
  )
}
