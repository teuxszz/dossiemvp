import { useEffect, useMemo, useState } from 'react'
import { Sidebar, type TabKey } from './components/Sidebar'
import { Header } from './components/Header'
import { HomeView } from './components/HomeView'
import { LoginScreen } from './components/LoginScreen'
import { Dashboard } from './components/tabs/Dashboard'
import { Perfil } from './components/tabs/Perfil'
import { Pdaa } from './components/tabs/Pdaa'
import { Historico } from './components/tabs/Historico'
import { Feedbacks } from './components/tabs/Feedbacks'
import { Entregas } from './components/tabs/Entregas'
import { Pdi } from './components/tabs/Pdi'
import { FeedbackForm } from './components/FeedbackForm'
import { useDossie } from './hooks/useDossie'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { useCicloGlobal, type UseCicloGlobal } from './hooks/useCicloGlobal'
import { computeMediaTime } from './lib/mockData'
import type { Dossie, Feedback, RegistroConduta, EventoTimeline, KpiCiclo, SnapshotCiclo, ConfigCiclo, GrupoTrabalho, ParticipacaoGT, Colaborador, ItemPdi } from './lib/types'
import type { DataSource } from './hooks/useDossie'

const LS_RESPONSES = 'dossie_feedback_responses'
const LS_CICLO_CONFIG = 'dossie_ciclo_config'
const LS_SNAPSHOTS = 'dossie_snapshots'
const LS_PDI = 'dossie_pdi'

interface StoredResponse extends Feedback {
  membroId: string
  token: string
}

function getFeedbackParams(): { token: string; membroId: string; membroNome: string } | null {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('feedback')
  const membroId = params.get('membro')
  const membroNome = decodeURIComponent(params.get('nome') ?? '')
  if (token && membroId) return { token, membroId, membroNome }
  return null
}

export function App() {
  const feedbackParams = getFeedbackParams()
  if (feedbackParams) {
    return (
      <FeedbackForm
        token={feedbackParams.token}
        membroId={feedbackParams.membroId}
        membroNome={feedbackParams.membroNome}
      />
    )
  }

  const auth = useAuth()

  if (auth.authRequired && (auth.session === undefined || auth.loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-tertiary text-sm text-ink-tertiary">
        Carregando…
      </div>
    )
  }

  if (auth.authRequired && auth.session === null) {
    return <LoginScreen onSignIn={auth.signIn} onSignUp={auth.signUp} onResetPassword={auth.resetPassword} error={auth.error} />
  }

  return <MainApp email={auth.email} isAdmin={auth.isAdmin} onSignOut={auth.signOut} />
}

// Camada de navegação — decide entre HomeView e DossierView
function MainApp({ email, isAdmin, onSignOut }: { email: string | null; isAdmin: boolean; onSignOut: () => void }) {
  const { dossie, membros, allDossies, selectedId, setSelectedId, addMembro, removeMembro, updateMembro, updateDossieData, resolveIdByEmail, loading, error, source } = useDossie()
  const { theme, toggle } = useTheme()
  const cicloGlobal = useCicloGlobal()
  const [resolvingOwn, setResolvingOwn] = useState(false)
  const [ownNotFound, setOwnNotFound] = useState(false)

  // Membro comum (não-admin): não escolhe quem ver — cai direto no próprio dossiê.
  useEffect(() => {
    if (isAdmin || !email || selectedId) return
    let active = true
    setResolvingOwn(true)
    resolveIdByEmail(email).then((id) => {
      if (!active) return
      setResolvingOwn(false)
      if (id) setSelectedId(id)
      else setOwnNotFound(true)
    })
    return () => { active = false }
  }, [isAdmin, email, selectedId])

  if (!isAdmin) {
    if (!selectedId) {
      if (resolvingOwn) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-bg-tertiary text-sm text-ink-tertiary">
            Carregando…
          </div>
        )
      }
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-tertiary px-4 text-center text-sm text-ink-tertiary">
          <p>
            {ownNotFound
              ? <>Não encontramos um dossiê vinculado a <strong className="text-ink-primary">{email}</strong>. Fale com a Diretoria de Pesquisas e Pessoas.</>
              : 'Carregando…'}
          </p>
          <button onClick={onSignOut} className="rounded-lg border border-line px-4 py-2 text-xs text-ink-secondary hover:text-ink-primary">
            Sair
          </button>
        </div>
      )
    }
    return (
      <DossierView
        dossie={dossie}
        allDossies={allDossies}
        loading={loading}
        error={error}
        source={source}
        theme={theme}
        onToggleTheme={toggle}
        onBack={undefined}
        isAdmin={false}
        currentEmail={email}
        onSignOut={onSignOut}
        onUpdateMembro={updateMembro}
        onUpdateDossieData={updateDossieData}
        cicloGlobal={cicloGlobal}
      />
    )
  }

  if (!selectedId) {
    return (
      <HomeView
        membros={membros}
        allDossies={allDossies}
        onSelect={setSelectedId}
        onAddMembro={addMembro}
        onRemoveMembro={removeMembro}
        onUpdateMembro={updateMembro}
        theme={theme}
        onToggleTheme={toggle}
        onSignOut={onSignOut}
        cicloGlobal={cicloGlobal}
      />
    )
  }

  return (
    <DossierView
      dossie={dossie}
      allDossies={allDossies}
      loading={loading}
      error={error}
      source={source}
      theme={theme}
      onToggleTheme={toggle}
      onBack={() => setSelectedId(null)}
      isAdmin
      currentEmail={email}
      onSignOut={onSignOut}
      onUpdateMembro={updateMembro}
      onUpdateDossieData={updateDossieData}
      cicloGlobal={cicloGlobal}
    />
  )
}

// Dossiê individual — todos os hooks ficam aqui, sem returns condicionais antes deles
interface DossierViewProps {
  dossie: Dossie | null
  allDossies: Dossie[]
  loading: boolean
  error: string | null
  source: DataSource
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onBack?: () => void
  isAdmin: boolean
  currentEmail: string | null
  onSignOut: () => void
  onUpdateMembro: (id: string, patch: Partial<Colaborador>) => void
  onUpdateDossieData: (id: string, patch: Partial<Omit<Dossie, 'colaborador'>>) => void
  cicloGlobal: UseCicloGlobal
}

function DossierView({ dossie, allDossies, loading, error, source, theme, onToggleTheme, onBack, isAdmin, currentEmail, onSignOut, onUpdateMembro, onUpdateDossieData, cicloGlobal }: DossierViewProps) {
  const mediaTimeKpis = useMemo(() => computeMediaTime(allDossies), [allDossies])
  const [tab, setTab] = useState<TabKey>('dashboard')

  // Condutas do ciclo atual
  const [registros, setRegistros] = useState<RegistroConduta[]>([])
  useEffect(() => {
    if (dossie) setRegistros(dossie.pdaa.condutasRegistradas ?? [])
  }, [dossie?.colaborador.id])

  // Sincroniza o que é editado no dossiê individual (KPIs, condutas PDAA, PDI)
  // de volta pro dado compartilhado — sem isso o painel geral nunca via essas
  // mudanças, porque cada aba só guardava tudo em estado local do React.
  useEffect(() => {
    if (!dossie) return
    onUpdateDossieData(dossie.colaborador.id, { pdaa: { ...dossie.pdaa, condutasRegistradas: registros } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registros, dossie?.colaborador.id])

  // Ciclo atual — segue o ciclo global (aba Ciclos no painel), pra todo mundo
  // enxergar/editar o mesmo período por padrão.
  const [cicloAtual, setCicloAtual] = useState<{ ano: number; ciclo: string }>(cicloGlobal.cicloGlobal)
  useEffect(() => {
    setCicloAtual(cicloGlobal.cicloGlobal)
  }, [cicloGlobal.cicloGlobal.ano, cicloGlobal.cicloGlobal.ciclo, dossie?.colaborador.id])

  const cicloFechado = cicloGlobal.anoEstaFechado(cicloAtual.ano)

  // KPIs por ciclo como estado — permite edição manual
  const [kpisPorCiclo, setKpisPorCiclo] = useState<KpiCiclo[]>([])
  useEffect(() => {
    if (dossie) setKpisPorCiclo(dossie.kpisPorCiclo)
  }, [dossie?.colaborador.id])
  useEffect(() => {
    if (!dossie) return
    onUpdateDossieData(dossie.colaborador.id, { kpisPorCiclo })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpisPorCiclo, dossie?.colaborador.id])

  // Timeline
  const [timeline, setTimeline] = useState<EventoTimeline[]>([])
  useEffect(() => {
    if (dossie) setTimeline(dossie.timeline)
  }, [dossie?.colaborador.id])

  // Feedbacks: dossie + localStorage
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])

  function carregarFeedbacks(membroId: string, base: Feedback[]) {
    try {
      const stored: StoredResponse[] = JSON.parse(localStorage.getItem(LS_RESPONSES) ?? '[]')
      const local = stored
        .filter((r) => r.membroId === membroId)
        .map(({ membroId: _m, token: _t, ...fb }) => fb)
      setFeedbacks([...base, ...local])
    } catch {
      setFeedbacks(base)
    }
  }

  useEffect(() => {
    if (!dossie) return
    carregarFeedbacks(dossie.colaborador.id, dossie.feedbacks)
  }, [dossie?.colaborador.id])

  useEffect(() => {
    if (!dossie) return
    const id = dossie.colaborador.id
    const base = dossie.feedbacks
    function onFocus() { carregarFeedbacks(id, base) }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [dossie?.colaborador.id])

  // GTs e participação
  const [gts, setGts] = useState<GrupoTrabalho[]>([])
  const [participacaoGTs, setParticipacaoGTs] = useState<ParticipacaoGT[]>([])
  useEffect(() => {
    if (dossie) {
      setGts(dossie.gruposTrabalho)
      setParticipacaoGTs(dossie.participacaoGTs)
    }
  }, [dossie?.colaborador.id])

  // PDI — plano de desenvolvimento individual (registrado pela coordenadoria de
  // desempenho, persistido por membro em localStorage pra sobreviver a reloads).
  const [pdi, setPdi] = useState<ItemPdi[]>([])
  useEffect(() => {
    if (!dossie) return
    try {
      const all: Record<string, ItemPdi[]> = JSON.parse(localStorage.getItem(LS_PDI) ?? '{}')
      setPdi(all[dossie.colaborador.id] ?? dossie.pdi)
    } catch {
      setPdi(dossie.pdi)
    }
  }, [dossie?.colaborador.id])

  useEffect(() => {
    if (!dossie) return
    try {
      const all: Record<string, ItemPdi[]> = JSON.parse(localStorage.getItem(LS_PDI) ?? '{}')
      localStorage.setItem(LS_PDI, JSON.stringify({ ...all, [dossie.colaborador.id]: pdi }))
    } catch { /* ignore */ }
    onUpdateDossieData(dossie.colaborador.id, { pdi })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdi, dossie?.colaborador.id])

  // Config de fechamento de ciclo — legado, mantido só de leitura pro histórico
  // exibido no Dashboard; a criação/edição agora acontece na aba Ciclos (geral).
  const [configCiclo] = useState<ConfigCiclo | null>(() => {
    try { return JSON.parse(localStorage.getItem(LS_CICLO_CONFIG) ?? 'null') } catch { return null }
  })

  // Snapshots de ciclos fechados
  const [snapshots, setSnapshots] = useState<SnapshotCiclo[]>([])
  useEffect(() => {
    if (!dossie) return
    try {
      const all: Record<string, SnapshotCiclo[]> = JSON.parse(localStorage.getItem(LS_SNAPSHOTS) ?? '{}')
      setSnapshots(all[dossie.colaborador.id] ?? [])
    } catch { setSnapshots([]) }
  }, [dossie?.colaborador.id])

  const pontosPdaa = registros.reduce((s, r) => s + r.pontos, 0)

  return (
    <div className="flex min-h-screen flex-col bg-bg-tertiary md:flex-row">
      <Sidebar active={tab} onChange={setTab} isAdmin={isAdmin} cicloAtual={cicloAtual} />

      <div className="min-w-0 flex-1">
        {error && (
          <div className="m-4 rounded-lg border border-bad/40 bg-bad-soft px-4 py-3 text-sm text-bad">
            Erro ao carregar do Supabase: {error}.
          </div>
        )}

        {loading || !dossie ? (
          <LoadingSkeleton />
        ) : (
          <>
            <Header
              colaborador={dossie.colaborador}
              dossie={dossie}
              onBack={onBack}
              theme={theme}
              onToggleTheme={onToggleTheme}
              source={source}
              pontosPdaa={pontosPdaa}
              onSignOut={onSignOut}
            />
            <main className="mx-auto max-w-5xl p-4 sm:p-6">
              {tab === 'dashboard' && (
                <Dashboard
                  dossie={dossie}
                  pontosPdaa={pontosPdaa}
                  cicloAtual={cicloAtual}
                  kpisPorCiclo={kpisPorCiclo}
                  setKpisPorCiclo={setKpisPorCiclo}
                  snapshots={snapshots}
                  configCiclo={configCiclo}
                  mediaTimeKpis={mediaTimeKpis}
                  isAdmin={isAdmin}
                  cicloFechado={cicloFechado}
                />
              )}
              {tab === 'perfil' && (
                <Perfil
                  dossie={dossie}
                  participacaoGTs={participacaoGTs}
                  setParticipacaoGTs={setParticipacaoGTs}
                  isAdmin={isAdmin}
                  currentEmail={currentEmail}
                  onUpdateColaborador={(patch) => onUpdateMembro(dossie.colaborador.id, patch)}
                />
              )}
              {tab === 'pdaa' && (
                <Pdaa
                  dossie={dossie}
                  registros={registros}
                  setRegistros={setRegistros}
                  cicloAtual={cicloAtual}
                  pontosPdaa={pontosPdaa}
                  snapshots={snapshots}
                  isAdmin={isAdmin}
                  currentEmail={currentEmail}
                  cicloFechado={cicloFechado}
                />
              )}
              {tab === 'pdi' && (
                <Pdi pdi={pdi} setPdi={setPdi} isAdmin={isAdmin} currentEmail={currentEmail} />
              )}
              {tab === 'historico' && (
                <Historico dossie={dossie} timeline={timeline} setTimeline={setTimeline} isAdmin={isAdmin} />
              )}
              {tab === 'entregas' && (
                <Entregas
                  dossie={dossie}
                  gts={gts}
                  setGts={setGts}
                  cicloAtual={cicloAtual}
                  isAdmin={isAdmin}
                />
              )}
              {tab === 'feedbacks' && (
                <Feedbacks
                  dossie={dossie}
                  feedbacks={feedbacks}
                  onAddFeedback={(fb) => setFeedbacks((p) => [...p, fb])}
                  onRemoveFeedback={(id) => setFeedbacks((p) => p.filter((f) => f.id !== id))}
                  isAdmin={isAdmin}
                />
              )}
            </main>
          </>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-16 rounded-lg bg-bg-secondary" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-bg-secondary" />
        ))}
      </div>
      <div className="h-56 rounded-lg bg-bg-secondary" />
    </div>
  )
}
