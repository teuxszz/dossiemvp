import { useEffect, useState } from 'react'
import { UserCog, Plus, Trash2 } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { supabase } from '@/lib/supabase'

interface Admin {
  email: string
  criado_em: string
}

export function Administradores() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [novoEmail, setNovoEmail] = useState('')
  const [adding, setAdding] = useState(false)

  function carregar() {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    supabase
      .from('admins')
      .select('email, criado_em')
      .order('criado_em', { ascending: true })
      .then(({ data, error: err }) => {
        setLoading(false)
        if (err) { setError(err.message); return }
        setAdmins((data ?? []) as Admin[])
      })
  }

  useEffect(() => { carregar() }, [])

  async function adicionar() {
    if (!supabase || !novoEmail.trim()) return
    setAdding(true)
    setError(null)
    const { error: err } = await supabase.from('admins').insert({ email: novoEmail.trim().toLowerCase() })
    setAdding(false)
    if (err) { setError(err.message); return }
    setNovoEmail('')
    carregar()
  }

  async function remover(email: string) {
    if (!supabase) return
    if (!confirm(`Remover acesso de administrador de ${email}?`)) return
    const { error: err } = await supabase.from('admins').delete().eq('email', email)
    if (err) { setError(err.message); return }
    carregar()
  }

  return (
    <Card className="p-4 sm:p-5">
      <SectionTitle icon={<UserCog size={15} />}>Administradores</SectionTitle>
      <p className="mb-4 text-xs text-ink-secondary">
        E-mails abaixo enxergam e editam todos os dossiês. Membros fora desta lista só acessam o próprio
        dossiê, em modo leitura (exceto celular, e-mail de contato, período do curso e registro de abonos).
      </p>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="email"
          value={novoEmail}
          onChange={(e) => setNovoEmail(e.target.value)}
          placeholder="email@consej.com.br"
          className="flex-1 rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
        />
        <button
          onClick={adicionar}
          disabled={adding || !novoEmail.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          <Plus size={13} /> Adicionar
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-bad/40 bg-bad-soft px-3 py-2 text-xs text-bad">{error}</div>
      )}

      {loading ? (
        <p className="py-6 text-center text-xs text-ink-tertiary">Carregando…</p>
      ) : admins.length === 0 ? (
        <p className="py-6 text-center text-xs text-ink-tertiary">Nenhum administrador cadastrado ainda.</p>
      ) : (
        <div className="divide-y divide-line">
          {admins.map((a) => (
            <div key={a.email} className="flex items-center justify-between gap-3 py-2.5 text-xs">
              <span className="text-ink-primary">{a.email}</span>
              <button onClick={() => remover(a.email)} className="shrink-0 text-ink-tertiary hover:text-bad" title="Remover">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
