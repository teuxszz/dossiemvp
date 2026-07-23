import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface AuthState {
  /** Sessão do Supabase Auth. `undefined` enquanto carrega, `null` se deslogado. */
  session: Session | null | undefined
  email: string | null
  isAdmin: boolean
  /** true enquanto resolve a sessão inicial ou a checagem de admin. */
  loading: boolean
  /** true só quando o Supabase está configurado — só aí faz sentido exigir login. */
  authRequired: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  /** Cadastro público — a senha nunca passa pelo admin. `needsConfirmation` indica se falta confirmar o e-mail. */
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

/**
 * Login por email/senha (Supabase Auth) + checagem de admin (tabela `admins`).
 * Quando o Supabase não está configurado (modo demo/mock), a sessão fica
 * sempre "autenticada" e `isAdmin = true` — não faz sentido gatear login
 * num ambiente sem backend real.
 */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null | undefined>(
    isSupabaseConfigured ? undefined : null,
  )
  const [isAdmin, setIsAdmin] = useState(!isSupabaseConfigured)
  const [checkingAdmin, setCheckingAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase) return
    const email = session?.user?.email
    if (!email) {
      setIsAdmin(false)
      return
    }
    setCheckingAdmin(true)
    supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data)
        setCheckingAdmin(false)
      })
  }, [session?.user?.email])

  async function signIn(email: string, password: string) {
    if (!supabase) return { error: null }
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      return { error: err.message }
    }
    return { error: null }
  }

  async function signUp(email: string, password: string) {
    if (!supabase) return { error: null, needsConfirmation: false }
    setError(null)
    const { data, error: err } = await supabase.auth.signUp({ email, password })
    if (err) {
      setError(err.message)
      return { error: err.message, needsConfirmation: false }
    }
    // Se o projeto exige confirmação por e-mail, o signUp não retorna sessão ainda.
    const needsConfirmation = !data.session
    return { error: null, needsConfirmation }
  }

  async function resetPassword(email: string) {
    if (!supabase) return { error: null }
    setError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email)
    if (err) {
      setError(err.message)
      return { error: err.message }
    }
    return { error: null }
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return {
    session,
    email: session?.user?.email ?? null,
    isAdmin,
    loading: session === undefined || checkingAdmin,
    authRequired: isSupabaseConfigured,
    error,
    signIn,
    signUp,
    resetPassword,
    signOut,
  }
}
