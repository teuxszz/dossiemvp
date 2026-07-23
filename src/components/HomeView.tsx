import { useState } from 'react'
import { Search, Plus, X, Check, Users, Trash2, LayoutDashboard, Eye, EyeOff, FolderClosed, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/ui'
import { TeamDashboard } from './TeamDashboard'
import type { Colaborador, Dossie } from '@/lib/types'

export const DIRETORIAS = [
  'Diretoria de Presidência',
  'Diretoria de Vice-Presidência',
  'Diretoria de Negócios',
  'Diretoria de Demandas',
  'Diretoria de Marketing',
  'Diretoria de Pesquisas e Pessoas',
]

// Estrutura completa de cargos por diretoria — usada para sugestões em formulários futuros.
export const CARGOS_POR_DIRETORIA: Record<string, string[]> = {
  'Diretoria de Presidência': [
    'Presidente Executivo',
    'Gerente de Relacionamentos',
    'Coordenadoria de Parcerias',
    'Coordenadoria de Operações',
  ],
  'Diretoria de Vice-Presidência': [
    'Vice Presidente',
    'Gerente de Vice-Presidência',
    'Coordenadoria de Estratégia',
    'Coordenadoria de Finanças',
    'Coordenadoria de Inovação',
  ],
  'Diretoria de Demandas': [
    'Diretor de Demandas',
    'Gerente de Demandas',
    'Coordenadoria de Clientes',
    'Coordenadoria de Procedimentos Internos',
  ],
  'Diretoria de Negócios': [
    'Diretor de Negócios',
    'Gerente de Negócios',
    'Coordenadoria de Closing',
    'Coordenadoria de Growth',
  ],
  'Diretoria de Pesquisas e Pessoas': [
    'Diretor de Pesquisas e Pessoas',
    'Gerente de Pesquisas e Pessoas',
    'Coordenadoria de Pesquisas',
    'Coordenadoria de Desempenho',
    'Coordenadoria de Experiência do Time',
    'Comissão do Processo Seletivo',
    'Comitê de Diversidade e Inclusão',
  ],
  'Diretoria de Marketing': [
    'Gerente de Marketing',
    'Coordenadoria de Branding',
    'Coordenadoria de Inbound Marketing',
    'Coordenadoria de Social Media',
  ],
}

const LS_HIDDEN = 'dossie_membros_ocultos'

function carregarOcultos(): Set<string> {
  try {
    const raw: string[] = JSON.parse(localStorage.getItem(LS_HIDDEN) ?? '[]')
    return new Set(raw)
  } catch {
    return new Set()
  }
}

const CORES_INICIAIS = [
  'bg-brand/20 text-brand',
  'bg-good/20 text-good',
  'bg-warn/20 text-warn',
  'bg-bad/20 text-bad',
  'bg-purple-500/20 text-purple-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-orange-500/20 text-orange-400',
]

function corPorId(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return CORES_INICIAIS[h % CORES_INICIAIS.length]
}

interface Membro {
  id: string
  nome: string
  cargo: string
  area: string
  iniciais: string
}

interface NovoMembroForm {
  nome: string
  cargo: string
  area: string
  iniciais: string
}

function gerarIniciais(nome: string) {
  const partes = nome.trim().split(' ').filter(Boolean)
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function gerarId(nome: string) {
  return nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
}

interface Props {
  membros: Membro[]
  allDossies: Dossie[]
  onSelect: (id: string) => void
  onAddMembro: (colab: Colaborador) => void
  onRemoveMembro: (id: string) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function HomeView({ membros, allDossies, onSelect, onAddMembro, onRemoveMembro, theme, onToggleTheme }: Props) {
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'membros' | 'dashboard'>('membros')
  const [busca, setBusca] = useState('')
  const [ocultos, setOcultos] = useState<Set<string>>(() => carregarOcultos())
  const [pasta, setPasta] = useState<'ativos' | 'pos'>('ativos')

  function alternarOculto(id: string) {
    setOcultos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(LS_HIDDEN, JSON.stringify([...next]))
      return next
    })
  }

  const [filtroDiretoria, setFiltroDiretoria] = useState<string>('todas')
  const [showNovo, setShowNovo] = useState(false)
  const [form, setForm] = useState<NovoMembroForm>({ nome: '', cargo: '', area: DIRETORIAS[0], iniciais: '' })

  const filtrados = membros.filter((m) => {
    const q = busca.toLowerCase()
    const matchBusca = !q || m.nome.toLowerCase().includes(q) || m.cargo.toLowerCase().includes(q) || m.area.toLowerCase().includes(q)
    const matchDir = filtroDiretoria === 'todas' || m.area === filtroDiretoria
    const matchPasta = pasta === 'pos' ? ocultos.has(m.id) : !ocultos.has(m.id)
    return matchBusca && matchDir && matchPasta
  })

  const diretorias = ['todas', ...Array.from(new Set(membros.map((m) => m.area))).sort()]

  function submitNovo() {
    if (!form.nome.trim() || !form.cargo.trim()) return
    const iniciais = form.iniciais.trim() || gerarIniciais(form.nome)
    const colab: Colaborador = {
      id: gerarId(form.nome),
      nome: form.nome.trim(),
      cargo: form.cargo.trim(),
      area: form.area,
      matricula: '',
      iniciais,
      acessoRestrito: false,
      ssoMfa: false,
    }
    onAddMembro(colab)
    setForm({ nome: '', cargo: '', area: DIRETORIAS[0], iniciais: '' })
    setShowNovo(false)
  }

  return (
    <div className="min-h-screen bg-bg-tertiary">
      {/* Topbar */}
      <header className="sticky top-0 z-10 border-b border-line bg-bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
              <Users size={16} className="text-brand" />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-ink-primary">Dossiê CONSEJ</h1>
              <p className="text-[11px] text-ink-tertiary">{membros.length} membro{membros.length !== 1 ? 's' : ''} cadastrado{membros.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex rounded-lg border border-line bg-bg-secondary p-0.5">
              <button
                onClick={() => setActiveTab('membros')}
                className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors', activeTab === 'membros' ? 'bg-bg-primary text-ink-primary shadow-sm' : 'text-ink-tertiary hover:text-ink-primary')}
              >
                <Users size={12} /> Membros
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors', activeTab === 'dashboard' ? 'bg-bg-primary text-ink-primary shadow-sm' : 'text-ink-tertiary hover:text-ink-primary')}
              >
                <LayoutDashboard size={12} /> Dashboard
              </button>
            </div>
            <button
              onClick={onToggleTheme}
              className="rounded-md p-2 text-ink-tertiary hover:bg-bg-secondary hover:text-ink-primary"
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            {activeTab === 'membros' && (
              <button
                onClick={() => setShowNovo(true)}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
              >
                <Plus size={13} /> Novo membro
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 space-y-5">
        {/* Dashboard do time */}
        {activeTab === 'dashboard' && (
          <TeamDashboard allDossies={allDossies} onSelectMembro={onSelect} />
        )}

        {activeTab === 'membros' && <>
        {/* Barra de busca e filtro */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, cargo ou diretoria…"
              className="w-full rounded-lg border border-line bg-bg-primary pl-9 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none"
            />
          </div>
          <select
            value={filtroDiretoria}
            onChange={(e) => setFiltroDiretoria(e.target.value)}
            className="rounded-lg border border-line bg-bg-primary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none sm:w-64"
          >
            <option value="todas">Todas as diretorias</option>
            {diretorias.filter((d) => d !== 'todas').map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {pasta === 'ativos' ? (
            <button
              onClick={() => setPasta('pos')}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-bg-primary px-3 py-2 text-sm text-ink-primary hover:border-brand/40"
              title="Abrir pasta Pós-juniores"
            >
              <FolderClosed size={14} className="text-brand" />
              Pós-juniores
              <span className="ml-1 rounded-md bg-brand/15 px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                {ocultos.size}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setPasta('ativos')}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-bg-primary px-3 py-2 text-sm text-ink-primary hover:border-brand/40"
            >
              <ArrowLeft size={14} /> Voltar aos membros
            </button>
          )}
        </div>

        {pasta === 'pos' && (
          <div className="flex items-center gap-2 text-sm text-ink-tertiary">
            <FolderClosed size={14} className="text-brand" />
            <span className="font-semibold text-ink-primary">Pasta: Pós-juniores</span>
            <span>· membros ocultos do painel principal</span>
          </div>
        )}

        {/* Modal criar membro */}
        {showNovo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-line bg-bg-primary p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-ink-primary">Novo membro</h2>
                <button onClick={() => setShowNovo(false)} className="text-ink-tertiary hover:text-ink-primary">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[11px] text-ink-tertiary">Nome completo *</label>
                  <input
                    value={form.nome}
                    onChange={(e) => {
                      const nome = e.target.value
                      setForm((p) => ({ ...p, nome, iniciais: gerarIniciais(nome) }))
                    }}
                    placeholder="Ex.: Maria Oliveira"
                    className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-ink-tertiary">Diretoria</label>
                  <select
                    value={form.area}
                    onChange={(e) => setForm((p) => ({ ...p, area: e.target.value, cargo: '' }))}
                    className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
                  >
                    {DIRETORIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-ink-tertiary">Cargo *</label>
                  {CARGOS_POR_DIRETORIA[form.area] ? (
                    <select
                      value={form.cargo}
                      onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}
                      className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
                    >
                      <option value="">Selecione o cargo…</option>
                      {CARGOS_POR_DIRETORIA[form.area].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input
                      value={form.cargo}
                      onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}
                      placeholder="Ex.: Coordenadora de Projetos"
                      className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
                    />
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-ink-tertiary">Iniciais (2 letras — gerado automaticamente)</label>
                  <input
                    value={form.iniciais}
                    onChange={(e) => setForm((p) => ({ ...p, iniciais: e.target.value.toUpperCase().slice(0, 2) }))}
                    maxLength={2}
                    placeholder="Ex.: MO"
                    className="w-20 rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setShowNovo(false)} className="rounded-lg border border-line px-4 py-2 text-sm text-ink-secondary hover:text-ink-primary">
                  Cancelar
                </button>
                <button
                  onClick={submitNovo}
                  disabled={!form.nome.trim() || !form.cargo.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-40"
                >
                  <Check size={13} /> Criar dossiê
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmação de remoção */}
        {confirmRemove && (() => {
          const m = membros.find((x) => x.id === confirmRemove)
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-xl border border-line bg-bg-primary p-6 shadow-xl">
                <div className="mb-1 flex items-center gap-2 text-bad">
                  <Trash2 size={16} />
                  <span className="text-[15px] font-semibold">Remover membro</span>
                </div>
                <p className="mt-2 text-sm text-ink-secondary">
                  Tem certeza que deseja remover <strong>{m?.nome}</strong>? Esta ação não pode ser desfeita.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <button onClick={() => setConfirmRemove(null)} className="rounded-lg border border-line px-4 py-2 text-sm text-ink-secondary hover:text-ink-primary">
                    Cancelar
                  </button>
                  <button
                    onClick={() => { onRemoveMembro(confirmRemove); setConfirmRemove(null) }}
                    className="rounded-lg bg-bad px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Grid de membros */}
        {filtrados.length === 0 ? (
          <div className="py-16 text-center text-sm text-ink-tertiary">
            {pasta === 'pos'
              ? 'Nenhum membro em Pós-juniores.'
              : busca || filtroDiretoria !== 'todas'
                ? 'Nenhum membro encontrado com esse filtro.'
                : 'Nenhum membro cadastrado ainda.'}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((m) => (
              <div key={m.id} className="group relative">
                <button
                  onClick={() => onSelect(m.id)}
                  className="flex w-full items-start gap-4 rounded-xl border border-line bg-bg-primary p-4 text-left transition-all hover:border-brand/40 hover:shadow-md"
                >
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold', corPorId(m.id))}>
                    {m.iniciais}
                  </div>
                  <div className="min-w-0 pr-6">
                    <p className="truncate text-[13px] font-semibold text-ink-primary group-hover:text-brand">{m.nome}</p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-secondary">{m.cargo}</p>
                    <p className="mt-1 truncate text-[10px] text-ink-tertiary">{m.area}</p>
                  </div>
                </button>
                <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); alternarOculto(m.id) }}
                    className="rounded-md p-1.5 text-ink-tertiary hover:bg-brand/15 hover:text-brand"
                    title={ocultos.has(m.id) ? 'Restaurar ao painel' : 'Mover para Pós-juniores'}
                  >
                    {ocultos.has(m.id) ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmRemove(m.id) }}
                    className="rounded-md p-1.5 text-ink-tertiary hover:bg-bad-soft hover:text-bad"
                    title="Remover membro"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>}
      </main>
    </div>
  )
}
