import { useEffect, useState } from 'react'
import { Sidebar, type TabKey } from './components/Sidebar'
import { Header } from './components/Header'
import { Dashboard } from './components/tabs/Dashboard'
import { Perfil } from './components/tabs/Perfil'
import { Pdaa } from './components/tabs/Pdaa'
import { Historico } from './components/tabs/Historico'
import { Feedbacks } from './components/tabs/Feedbacks'
import { Seguranca } from './components/tabs/Seguranca'
import { useDossie } from './hooks/useDossie'
import { useTheme } from './hooks/useTheme'
import type { RegistroConduta } from './lib/types'

export function App() {
  const { dossie, colaboradores, selectedId, setSelectedId, loading, error, source } = useDossie()
  const { theme, toggle } = useTheme()
  const [tab, setTab] = useState<TabKey>('dashboard')

  // Condutas registradas do ciclo atual — estado elevado para que a pontuação
  // e o farol reflitam em todas as abas. Inicializa a partir do dossiê.
  const [registros, setRegistros] = useState<RegistroConduta[]>([])
  useEffect(() => {
    if (dossie) setRegistros(dossie.pdaa.condutasRegistradas ?? [])
  }, [dossie?.colaborador.id])

  const pontosPdaa = registros.reduce((s, r) => s + r.pontos, 0)

  return (
    <div className="flex min-h-screen flex-col bg-bg-tertiary md:flex-row">
      <Sidebar active={tab} onChange={setTab} />

      <div className="min-w-0 flex-1">
        {error && (
          <div className="m-4 rounded-lg border border-bad/40 bg-bad-soft px-4 py-3 text-sm text-bad">
            Erro ao carregar do Supabase: {error}. Confira se a tabela <code>colaboradores</code> existe e se as
            policies de RLS permitem leitura.
          </div>
        )}

        {loading || !dossie ? (
          <LoadingSkeleton />
        ) : (
          <>
            <Header
              colaborador={dossie.colaborador}
              colaboradores={colaboradores}
              selectedId={selectedId}
              onSelect={setSelectedId}
              theme={theme}
              onToggleTheme={toggle}
              source={source}
              pontosPdaa={pontosPdaa}
            />
            <main className="mx-auto max-w-5xl p-4 sm:p-6">
              {tab === 'dashboard' && <Dashboard dossie={dossie} pontosPdaa={pontosPdaa} />}
              {tab === 'perfil' && <Perfil dossie={dossie} />}
              {tab === 'pdaa' && <Pdaa dossie={dossie} registros={registros} setRegistros={setRegistros} />}
              {tab === 'historico' && <Historico dossie={dossie} />}
              {tab === 'feedbacks' && <Feedbacks dossie={dossie} />}
              {tab === 'seguranca' && <Seguranca dossie={dossie} />}
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
