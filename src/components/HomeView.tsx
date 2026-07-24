import { useState, type ReactNode } from 'react'
import { Search, Plus, X, Check, Users, Trash2, LayoutDashboard, Eye, EyeOff, FolderClosed, ArrowLeft, LogOut, UserCog, Pencil, CalendarClock, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/ui'
import { TeamDashboard } from './TeamDashboard'
import { Administradores } from './tabs/Administradores'
import { Ciclos } from './tabs/Ciclos'
import { Seguranca } from './tabs/Seguranca'
import type { UseCicloGlobal } from '@/hooks/useCicloGlobal'
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
  cargoSecundario?: string
  areaSecundaria?: string
}

interface NovoMembroForm {
  nome: string
  cargo: string
  area: string
  iniciais: string
  email: string
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
  onUpdateMembro: (id: string, patch: Partial<Colaborador>) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onSignOut?: () => void
  cicloGlobal: UseCicloGlobal
}

export function HomeView({ membros, allDossies, onSelect, onAddMembro, onRemoveMembro, onUpdateMembro, theme, onToggleTheme, onSignOut, cicloGlobal }: Props) {
  const [editCargo, setEditCargo] = useState<Membro | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'membros' | 'dashboard' | 'ciclos' | 'administradores' | 'seguranca'>('membros')

  // Ano fechado (avançado ou visto pelo histórico) — só dá pra excluir/arquivar
  // membro, nada de criar ou trocar cargo, pra não bagunçar o quadro congelado.
  const quadroBloqueado = cicloGlobal.anoEstaFechado(cicloGlobal.cicloGlobal.ano)
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
  const [form, setForm] = useState<NovoMembroForm>({ nome: '', cargo: '', area: DIRETORIAS[0], iniciais: '', email: '' })

  const filtrados = membros.filter((m) => {
    const q = busca.toLowerCase()
    const matchBusca = !q || m.nome.toLowerCase().includes(q) || m.cargo.toLowerCase().includes(q) || m.area.toLowerCase().includes(q)
    // Quem tem cargo duplo (ex.: Presidente Executivo também Diretor de Demandas)
    // precisa aparecer nas duas diretorias, não só na principal.
    const matchDir = filtroDiretoria === 'todas' || m.area === filtroDiretoria || m.areaSecundaria === filtroDiretoria
    const matchPasta = pasta === 'pos' ? ocultos.has(m.id) : !ocultos.has(m.id)
    return matchBusca && matchDir && matchPasta
  })

  // Nível hierárquico a partir do texto do cargo — usado pra dividir a
  // listagem quando uma diretoria específica está selecionada.
  function nivelHierarquico(cargo: string): 'Diretoria' | 'Gerência' | 'Coordenadoria' {
    const c = cargo.toLowerCase()
    if (c.includes('diretor') || c.includes('presidente')) return 'Diretoria'
    if (c.includes('gerente')) return 'Gerência'
    return 'Coordenadoria'
  }

  const NIVEIS = ['Diretoria', 'Gerência', 'Coordenadoria'] as const
  const porNivel = filtroDiretoria !== 'todas'
    ? NIVEIS.map((nivel) => ({
        nivel,
        itens: filtrados.filter((m) => nivelHierarquico(m.cargo) === nivel),
      })).filter((g) => g.itens.length > 0)
    : null

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
      email: form.email.trim() || undefined,
    }
    onAddMembro(colab)
    setForm({ nome: '', cargo: '', area: DIRETORIAS[0], iniciais: '', email: '' })
    setShowNovo(false)
  }

  const NAV_GERAL: { key: typeof activeTab; label: string; icon: ReactNode }[] = [
    { key: 'membros', label: 'Membros', icon: <Users size={17} /> },
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { key: 'ciclos', label: 'Ciclos', icon: <CalendarClock size={17} /> },
    { key: 'administradores', label: 'Administradores', icon: <UserCog size={17} /> },
    { key: 'seguranca', label: 'Segurança', icon: <ShieldCheck size={17} /> },
  ]
  const tituloAtivo = NAV_GERAL.find((n) => n.key === activeTab)?.label ?? ''

  return (
    <div className="flex min-h-screen bg-bg-tertiary">
      {/* Sidebar lateral */}
      <aside className="flex shrink-0 flex-col gap-1 border-line bg-sidebar text-sidebar-fg md:h-screen md:w-60 md:border-r md:sticky md:top-0">
        <div className="flex h-[68px] items-center gap-2.5 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
            <Users size={16} />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="font-display truncate text-[15px] font-semibold tracking-tight text-white">Dossiê CONSEJ</div>
            <div className="truncate text-[11px] text-sidebar-fg">
              {membros.length} membro{membros.length !== 1 ? 's' : ''} cadastrado{membros.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="px-5 pt-3">
          <span
            className="flex w-fit items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand"
            title="Ciclo ativo — mude na aba Ciclos"
          >
            <CalendarClock size={13} /> {cicloGlobal.cicloGlobal.ano} · {cicloGlobal.cicloGlobal.ciclo}
          </span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-visible">
          {NAV_GERAL.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={cn(
                'flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
                activeTab === item.key
                  ? 'bg-brand text-white shadow-card'
                  : 'text-sidebar-fg hover:bg-sidebar-accent hover:text-white',
              )}
            >
              <span className={activeTab === item.key ? 'text-white' : 'text-sidebar-fg'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-1 border-t border-sidebar-border px-3 py-3">
          <button
            onClick={onToggleTheme}
            className="rounded-md p-2 text-sidebar-fg hover:bg-sidebar-accent hover:text-white"
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="rounded-md p-2 text-sidebar-fg hover:bg-sidebar-accent hover:text-bad"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Topbar do conteúdo */}
        <header className="sticky top-0 z-10 flex h-[68px] items-center border-b border-line bg-bg-primary px-6">
          <div className="flex w-full items-center justify-between gap-3">
            <h1 className="font-display text-[15px] font-semibold text-ink-primary">{tituloAtivo}</h1>
            {activeTab === 'membros' && !quadroBloqueado && (
              <button
                onClick={() => setShowNovo(true)}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
              >
                <Plus size={13} /> Novo membro
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-5xl p-6 space-y-5">
        {/* Dashboard do time */}
        {activeTab === 'dashboard' && (
          <TeamDashboard allDossies={allDossies} onSelectMembro={onSelect} cicloGlobal={cicloGlobal} />
        )}

        {activeTab === 'ciclos' && <Ciclos cicloGlobal={cicloGlobal} />}

        {activeTab === 'administradores' && <Administradores />}

        {activeTab === 'seguranca' && (
          <Seguranca allDossies={allDossies} onUpdateMembro={onUpdateMembro} cicloGlobal={cicloGlobal} />
        )}

        {activeTab === 'membros' && <>
        {quadroBloqueado && (
          <div className="rounded-lg border border-warn/30 bg-warn/5 px-3 py-2 text-xs text-warn">
            Ciclo {cicloGlobal.cicloGlobal.ano} {cicloGlobal.cicloGlobal.ciclo} está congelado — só dá pra excluir ou
            mover membros pra Pós-juniores aqui. Criar membro e editar cargo voltam a funcionar no ciclo atual.
          </div>
        )}
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
                  <label className="mb-1 block text-[11px] text-ink-tertiary">
                    E-mail de login
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Ex.: maria.oliveira@consej.com.br"
                    className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-ink-tertiary">
                    Vincula este dossiê a um login. Crie o usuário com este e-mail em Authentication →
                    Users no Supabase.
                  </p>
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

        {/* Modal de edição de cargo/diretoria */}
        {editCargo && (
          <EditCargoDialog
            membro={editCargo}
            onClose={() => setEditCargo(null)}
            onSave={(patch) => {
              onUpdateMembro(editCargo.id, patch)
              setEditCargo(null)
            }}
          />
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

        {/* Contagem */}
        {filtrados.length > 0 && (
          <p className="text-xs text-ink-tertiary">
            {filtrados.length} {filtrados.length === 1 ? 'membro encontrado' : 'membros encontrados'}
          </p>
        )}

        {/* Grid de membros */}
        {filtrados.length === 0 ? (
          <div className="py-16 text-center text-sm text-ink-tertiary">
            {pasta === 'pos'
              ? 'Nenhum membro em Pós-juniores.'
              : busca || filtroDiretoria !== 'todas'
                ? 'Nenhum membro encontrado com esse filtro.'
                : 'Nenhum membro cadastrado ainda.'}
          </div>
        ) : porNivel ? (
          <div className="space-y-6">
            {porNivel.map(({ nivel, itens }) => (
              <div key={nivel}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">{nivel}</h3>
                  <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-[10px] text-ink-tertiary">
                    {itens.length} {itens.length === 1 ? 'membro' : 'membros'}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {itens.map((m) => (
                    <MembroCard
                      key={m.id}
                      m={m}
                      oculto={ocultos.has(m.id)}
                      onToggleOculto={() => alternarOculto(m.id)}
                      onRemove={() => setConfirmRemove(m.id)}
                      onSelect={() => onSelect(m.id)}
                      onEdit={() => setEditCargo(m)}
                      podeEditar={!quadroBloqueado}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((m) => (
              <MembroCard
                key={m.id}
                m={m}
                oculto={ocultos.has(m.id)}
                onToggleOculto={() => alternarOculto(m.id)}
                onRemove={() => setConfirmRemove(m.id)}
                onSelect={() => onSelect(m.id)}
                onEdit={() => setEditCargo(m)}
                podeEditar={!quadroBloqueado}
              />
            ))}
          </div>
        )}
        </>}
        </main>
      </div>
    </div>
  )
}

function EditCargoDialog({
  membro,
  onClose,
  onSave,
}: {
  membro: Membro
  onClose: () => void
  onSave: (patch: Partial<Colaborador>) => void
}) {
  const [area, setArea] = useState(membro.area)
  const [cargo, setCargo] = useState(membro.cargo)
  const [temSegundo, setTemSegundo] = useState(!!membro.cargoSecundario)
  const [areaSecundaria, setAreaSecundaria] = useState(membro.areaSecundaria ?? DIRETORIAS[0])
  const [cargoSecundario, setCargoSecundario] = useState(membro.cargoSecundario ?? '')

  function opcoesCargo(dir: string) {
    return CARGOS_POR_DIRETORIA[dir] ?? []
  }

  function salvar() {
    if (!cargo.trim()) return
    onSave({
      area,
      cargo: cargo.trim(),
      cargoSecundario: temSegundo && cargoSecundario.trim() ? cargoSecundario.trim() : undefined,
      areaSecundaria: temSegundo && cargoSecundario.trim() ? areaSecundaria : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-line bg-bg-primary p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink-primary">Editar cargo — {membro.nome}</h2>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink-primary">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] text-ink-tertiary">Diretoria</label>
            <select
              value={area}
              onChange={(e) => {
                const novaArea = e.target.value
                setArea(novaArea)
                const opcoes = opcoesCargo(novaArea)
                if (opcoes.length && !opcoes.includes(cargo)) setCargo(opcoes[0])
              }}
              className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
            >
              {DIRETORIAS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-ink-tertiary">Cargo</label>
            {opcoesCargo(area).length > 0 ? (
              <select
                value={opcoesCargo(area).includes(cargo) ? cargo : ''}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
              >
                <option value="" disabled>Selecione o cargo…</option>
                {opcoesCargo(area).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full rounded-lg border border-line bg-bg-secondary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
              />
            )}
          </div>

          <label className="flex items-center gap-2 pt-1 text-xs text-ink-secondary">
            <input type="checkbox" checked={temSegundo} onChange={(e) => setTemSegundo(e.target.checked)} className="accent-brand" />
            Essa pessoa acumula um segundo cargo/diretoria
          </label>

          {temSegundo && (
            <div className="space-y-3 rounded-lg border border-line bg-bg-secondary p-3">
              <div>
                <label className="mb-1 block text-[11px] text-ink-tertiary">Diretoria (2º cargo)</label>
                <select
                  value={areaSecundaria}
                  onChange={(e) => {
                    const novaArea = e.target.value
                    setAreaSecundaria(novaArea)
                    const opcoes = opcoesCargo(novaArea)
                    if (opcoes.length && !opcoes.includes(cargoSecundario)) setCargoSecundario(opcoes[0])
                  }}
                  className="w-full rounded-lg border border-line bg-bg-tertiary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
                >
                  {DIRETORIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-ink-tertiary">Cargo (2º cargo)</label>
                {opcoesCargo(areaSecundaria).length > 0 ? (
                  <select
                    value={opcoesCargo(areaSecundaria).includes(cargoSecundario) ? cargoSecundario : ''}
                    onChange={(e) => setCargoSecundario(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg-tertiary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
                  >
                    <option value="" disabled>Selecione o cargo…</option>
                    {opcoesCargo(areaSecundaria).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input
                    value={cargoSecundario}
                    onChange={(e) => setCargoSecundario(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg-tertiary px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm text-ink-secondary hover:text-ink-primary">
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={!cargo.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-40"
          >
            <Check size={13} /> Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

function MembroCard({
  m,
  oculto,
  onToggleOculto,
  onRemove,
  onSelect,
  onEdit,
  podeEditar,
}: {
  m: Membro
  oculto: boolean
  onToggleOculto: () => void
  onRemove: () => void
  onSelect: () => void
  onEdit: () => void
  podeEditar: boolean
}) {
  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        className="flex h-full w-full items-start gap-4 rounded-xl border border-line bg-bg-primary p-4 text-left transition-all hover:border-brand/40 hover:shadow-md"
      >
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold', corPorId(m.id))}>
          {m.iniciais}
        </div>
        <div className="min-w-0 flex-1 pr-24">
          <p className="truncate text-[13px] font-semibold text-ink-primary group-hover:text-brand">{m.nome}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="truncate rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] text-brand">{m.cargo}</span>
            {m.cargoSecundario && (
              <span className="truncate rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] text-brand">{m.cargoSecundario}</span>
            )}
          </div>
          {/* Quando há cargo duplo, os badges acima já indicam as duas diretorias — evita repetir e truncar feio aqui embaixo. */}
          {!m.cargoSecundario && (
            <p className="mt-1.5 truncate text-[10px] text-ink-tertiary">{m.area}</p>
          )}
        </div>
      </button>
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {podeEditar && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="rounded-md p-1.5 text-ink-tertiary hover:bg-brand/15 hover:text-brand"
          title="Editar cargo/diretoria"
        >
          <Pencil size={13} />
        </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleOculto() }}
          className="rounded-md p-1.5 text-ink-tertiary hover:bg-brand/15 hover:text-brand"
          title={oculto ? 'Restaurar ao painel' : 'Mover para Pós-juniores'}
        >
          {oculto ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="rounded-md p-1.5 text-ink-tertiary hover:bg-bad-soft hover:text-bad"
          title="Remover membro"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
