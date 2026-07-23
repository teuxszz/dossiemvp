import { useState, type FormEvent } from 'react'
import { ShieldCheck, LogIn, UserPlus, MailCheck, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/ui'

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>
  onSignUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>
  onResetPassword: (email: string) => Promise<{ error: string | null }>
  error: string | null
}

type Mode = 'login' | 'signup'

export function LoginScreen({ onSignIn, onSignUp, onResetPassword, error }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [signupDone, setSignupDone] = useState<'confirmar' | 'pronto' | null>(null)
  const [resetSent, setResetSent] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setLocalError(null)
    setSignupDone(null)
    setResetSent(false)
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

  async function handleForgotPassword() {
    if (!email.trim()) {
      setLocalError('Digite seu e-mail acima antes de solicitar a redefinição.')
      return
    }
    setLocalError(null)
    setSubmitting(true)
    const { error: err } = await onResetPassword(email.trim())
    setSubmitting(false)
    if (err) { setLocalError(err); return }
    setResetSent(true)
  }

  const shownError = localError ?? error

  return (
    <div className="flex min-h-screen bg-bg-tertiary">
      {/* Painel esquerdo — decorativo, escondido no mobile */}
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden bg-[#03101c] lg:block">
        {/* Blobs decorativos */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/4 rounded-full bg-brand/25 blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

        <div className="relative flex h-full flex-col justify-between p-12">
          {/* Marca */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand ring-1 ring-brand/30">
              <ShieldCheck size={18} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-wide text-white">CONSEJ</div>
              <div className="text-[10px] text-white/50">Consultoria Jurídica Júnior</div>
            </div>
          </div>

          {/* Saudação */}
          <div>
            <div className="eyebrow text-brand">Painel de Desempenho dos Membros</div>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-white">
              Bem-vindo,
              <br />
              <span className="text-brand">Resolvedor</span>
            </h1>
            <div className="mt-6 h-px w-16 bg-white/15" />
            <p className="mt-4 max-w-xs text-sm text-white/50">
              Acesse o Dossiê CONSEJ pra acompanhar KPIs, PDAA, entregas e o histórico do time.
            </p>
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Alternador Entrar / Criar conta */}
          {!signupDone && (
            <div className="mb-6 flex rounded-lg border border-line bg-bg-secondary p-1">
              <button
                onClick={() => switchMode('login')}
                className={cn(
                  'flex-1 rounded-md py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                  mode === 'login' ? 'bg-brand text-white shadow-card' : 'text-ink-tertiary hover:text-ink-primary',
                )}
              >
                Entrar
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={cn(
                  'flex-1 rounded-md py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                  mode === 'signup' ? 'bg-brand text-white shadow-card' : 'text-ink-tertiary hover:text-ink-primary',
                )}
              >
                Criar conta
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-bg-primary p-7 shadow-pop lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
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
                  <p className="text-sm text-ink-secondary">Conta criada! Você já pode entrar com seu e-mail e senha.</p>
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
              <>
                <h2 className="font-display text-xl font-bold text-ink-primary">
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                </h2>
                <p className="mt-1 text-sm text-ink-tertiary">
                  {mode === 'login' ? 'Acesse com seu e-mail institucional.' : 'Sua senha nunca é vista pelo admin.'}
                </p>

                <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="mt-5 space-y-3">
                  <div>
                    <label className="eyebrow mb-1 block">E-mail</label>
                    <input
                      type="email"
                      autoFocus
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@consej.com.br"
                      className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="eyebrow mb-1 block">Senha</label>
                    <input
                      type="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
                    />
                  </div>
                  {mode === 'signup' && (
                    <div>
                      <label className="eyebrow mb-1 block">Confirmar senha</label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
                      />
                    </div>
                  )}

                  {resetSent && (
                    <div className="rounded-lg border border-good/30 bg-good-soft px-3 py-2 text-xs text-good">
                      Enviamos um link de redefinição de senha para {email}.
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {mode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
                    {submitting
                      ? (mode === 'login' ? 'Entrando…' : 'Criando conta…')
                      : (mode === 'login' ? 'Entrar no Hub' : 'Criar conta')}
                  </button>
                </form>

                {mode === 'login' && (
                  <button
                    onClick={handleForgotPassword}
                    className="mt-3 w-full text-center text-xs text-brand hover:underline"
                  >
                    Esqueceu sua senha?
                  </button>
                )}

                <p className="mt-4 text-center text-[11px] text-ink-tertiary">
                  {mode === 'login' ? (
                    <>Ainda não tem conta? <button onClick={() => switchMode('signup')} className="text-brand hover:underline">Solicitar acesso</button></>
                  ) : (
                    <>Já tem conta? <button onClick={() => switchMode('login')} className="inline-flex items-center gap-0.5 text-brand hover:underline">Entrar <ArrowRight size={11} /></button></>
                  )}
                </p>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-[11px] text-ink-tertiary">
            Problemas para acessar? Fale com a Diretoria de Pesquisas e Pessoas ou a Coordenadoria de Inovação.
          </p>
        </div>
      </div>
    </div>
  )
}
