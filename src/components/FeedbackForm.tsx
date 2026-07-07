import { useState } from 'react'
import { CheckCircle, Send, X } from 'lucide-react'
import { cn } from '@/lib/ui'
import type { Feedback, CategoriaFeedback } from '@/lib/types'

const LS_RESPONSES = 'dossie_feedback_responses'

interface StoredResponse extends Feedback {
  membroId: string
  token: string
}

interface Props {
  token: string
  membroId: string
  membroNome: string
}

const TAGS_OPCOES = [
  { label: 'Entrega', tone: 'good' },
  { label: 'Liderança', tone: 'info' },
  { label: 'Comunicação', tone: 'info' },
  { label: 'Colaboração', tone: 'good' },
  { label: 'Prazo', tone: 'warn' },
  { label: 'Proatividade', tone: 'good' },
  { label: 'Desenvolvimento', tone: 'warn' },
  { label: 'Relacionamento', tone: 'info' },
] as const

const CATEGORIAS_OPCOES: { value: CategoriaFeedback; label: string }[] = [
  { value: 'positivo', label: 'Positivo' },
  { value: 'desenvolvimento', label: 'Desenvolvimento' },
  { value: 'gestor', label: 'Visão de gestor' },
]

export function FeedbackForm({ token, membroId, membroNome }: Props) {
  const [autor, setAutor] = useState('')
  const [papel, setPapel] = useState('')
  const [texto, setTexto] = useState('')
  const [categorias, setCategorias] = useState<CategoriaFeedback[]>([])
  const [tagsSelected, setTagsSelected] = useState<string[]>([])
  const [enviado, setEnviado] = useState(false)
  const [jaRespondido] = useState(() => {
    try {
      const saved: StoredResponse[] = JSON.parse(localStorage.getItem(LS_RESPONSES) ?? '[]')
      return saved.some((r) => r.token === token && r.membroId === membroId)
    } catch {
      return false
    }
  })

  function toggleCategoria(c: CategoriaFeedback) {
    setCategorias((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  function toggleTag(label: string) {
    setTagsSelected((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!autor.trim() || !texto.trim()) return

    const now = new Date()
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const dataFormatada = `${meses[now.getMonth()]} ${now.getFullYear()}`

    const feedback: StoredResponse = {
      id: `fb_${Date.now()}`,
      autor: autor.trim(),
      papel: papel.trim() || 'Colaborador(a)',
      data: dataFormatada,
      texto: texto.trim(),
      categorias: categorias.length ? categorias : ['positivo'],
      tags: TAGS_OPCOES.filter((t) => tagsSelected.includes(t.label)).map((t) => ({
        label: t.label,
        tone: t.tone as 'good' | 'warn' | 'bad' | 'info',
      })),
      membroId,
      token,
    }

    try {
      const saved: StoredResponse[] = JSON.parse(localStorage.getItem(LS_RESPONSES) ?? '[]')
      localStorage.setItem(LS_RESPONSES, JSON.stringify([...saved, feedback]))
    } catch {
      // silently ignore storage errors
    }
    setEnviado(true)
  }

  if (jaRespondido) {
    return (
      <Page membroNome={membroNome}>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <X size={36} className="text-bad" />
          <p className="text-sm text-ink-secondary">Este link já foi utilizado.</p>
        </div>
      </Page>
    )
  }

  if (enviado) {
    return (
      <Page membroNome={membroNome}>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle size={36} className="text-good" />
          <p className="text-base font-medium text-ink-primary">Feedback enviado com sucesso!</p>
          <p className="text-xs text-ink-tertiary">Você pode fechar esta janela.</p>
        </div>
      </Page>
    )
  }

  return (
    <Page membroNome={membroNome}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Seu nome *</label>
            <input
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              required
              placeholder="Ex.: Ana Paula Saraiva"
              className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Seu papel / cargo</label>
            <input
              value={papel}
              onChange={(e) => setPapel(e.target.value)}
              placeholder="Ex.: Diretora de Gente & Gestão"
              className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Feedback *</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
            rows={5}
            placeholder="Escreva seu feedback sobre o membro..."
            className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-ink-secondary">Categorias</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS_OPCOES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleCategoria(c.value)}
                className={cn(
                  'rounded-md border px-3 py-1 text-xs transition-colors',
                  categorias.includes(c.value)
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-line bg-bg-secondary text-ink-secondary hover:border-brand/50'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-ink-secondary">Tags</label>
          <div className="flex flex-wrap gap-2">
            {TAGS_OPCOES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => toggleTag(t.label)}
                className={cn(
                  'rounded-md border px-3 py-1 text-xs transition-colors',
                  tagsSelected.includes(t.label)
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-line bg-bg-secondary text-ink-secondary hover:border-brand/50'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
        >
          <Send size={15} />
          Enviar feedback
        </button>
      </form>
    </Page>
  )
}

function Page({ membroNome, children }: { membroNome: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-bg-tertiary px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
          C
        </div>
        <p className="text-xs text-ink-tertiary">Dossiê Individual · CONSEJ</p>
        <h1 className="mt-1 text-base font-semibold text-ink-primary">Feedback para {membroNome}</h1>
      </div>
      <div className="w-full max-w-lg rounded-xl border border-line bg-bg-primary p-6 shadow-card">{children}</div>
    </div>
  )
}
