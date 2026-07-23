import { useState, type FormEvent } from 'react'
import { ShieldCheck, LogIn, UserPlus, MailCheck } from 'lucide-react'

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>
  onSignUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>
  error: string | null
}

export function LoginScreen({ onSignIn, onSignUp, error }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [signupDone, setSignupDone] = useState<'confirmar' | 'pronto' | null>(null)

  function switchMode(next: 'login' | 'signup') {
    setMode(next)
    setLocalError(null)
    setSignupDone(null)
    setPassword('')
    setConfirmPassword('')
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setSubmitting(true)
    setLocalError(null)
    const { error: err } = await onSignIn(email.trim(), password)
    setSubmitting(false)
    if (err) setLocalError(err)
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    if (password.length < 6) {
      setLocalError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setLocalError('As senhas não coincidem.')
      return
    }
    setSubmitting(true)
    setLocalError(null)
    const { error: err, needsConfirmation } = await onSignUp(email.trim(), password)
    setSubmitting(false)
    if (err) { setLocalError(err); return }
    setSignupDone(needsConfirmation ? 'confirmar' : 'pronto')
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
            <p className="mt-1 text-xs text-ink-tertiary">
              {mode === 'login' ? 'Acesse com seu e-mail institucional' : 'Crie sua conta de acesso'}
            </p>
          </div>
        </div>

        {signupDone ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-good-soft text-good">
              <MailCheck size={18} />
            </div>
            {signupDone === 'confirmar' ? (
              <p className="text-sm text-ink-secondary">
                Conta criada! Enviamos um e-mail de confirmação para <strong className="text-ink-primary">{email}</strong>.
                Confirme para poder entrar.
              </p>
            ) : (
              <p className="text-sm text-ink-secondary">
                Conta criada! Você já pode entrar com seu e-mail e senha.
              </p>
            )}
            <p className="text-[11px] text-ink-tertiary">
              Sua conta ainda precisa ser vinculada a um dossiê pela Diretoria de Pesquisas e Pessoas antes de você
              conseguir ver seus dados.
            </p>
            <button
              onClick={() => switchMode('login')}
              className="w-full rounded-lg border border-line px-4 py-2 text-sm text-ink-secondary hover:text-ink-primary"
            >
              Ir para o login
            </button>
          </div>
        ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-3">
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
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
              />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="mb-1 block text-[11px] text-ink-tertiary">Confirmar senha</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
                />
              </div>
            )}

            {shownError && (
              <div className="rounded-lg border border-bad/40 bg-bad-soft px-3 py-2 text-xs text-bad">
                {shownError === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : shownError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !email.trim() || !password || (mode === 'signup' && !confirmPassword)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
              {submitting
                ? (mode === 'login' ? 'Entrando…' : 'Criando conta…')
                : (mode === 'login' ? 'Entrar' : 'Criar conta')}
            </button>
          </form>
        )}

        {!signupDone && (
          <p className="mt-4 text-center text-[11px] text-ink-tertiary">
            {mode === 'login' ? (
              <>Ainda não tem conta? <button onClick={() => switchMode('signup')} className="text-brand hover:underline">Criar conta</button></>
            ) : (
              <>Já tem conta? <button onClick={() => switchMode('login')} className="text-brand hover:underline">Entrar</button></>
            )}
          </p>
        )}

        <p className="mt-3 text-center text-[11px] text-ink-tertiary">
          Problemas para acessar? Fale com a Diretoria de Pesquisas e Pessoas.
        </p>
      </div>
    </div>
  )
}
