import { useState } from 'react'
import { Header } from './components/Header'
import { Tabs, type TabKey } from './components/Tabs'
import { VisaoGeral } from './components/tabs/VisaoGeral'
import { Historico } from './components/tabs/Historico'
import { Analise } from './components/tabs/Analise'
import { Detalhes } from './components/tabs/Detalhes'
import { Seguranca } from './components/tabs/Seguranca'
import { useDossie } from './hooks/useDossie'
import { useTheme } from './hooks/useTheme'

export function App() {
  const { dossie, colaboradores, selectedId, setSelectedId, loading, error, source } = useDossie()
  const { theme, toggle } = useTheme()
  const [tab, setTab] = useState<TabKey>('visao')

  return (
    <div className="min-h-screen bg-bg-tertiary">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden bg-bg-tertiary">
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
              />
              <Tabs active={tab} onChange={setTab} />
              <main className="p-4 sm:p-6">
                {tab === 'visao' && <VisaoGeral dossie={dossie} />}
                {tab === 'historico' && <Historico dossie={dossie} />}
                {tab === 'analise' && <Analise dossie={dossie} />}
                {tab === 'detalhes' && <Detalhes dossie={dossie} />}
                {tab === 'seguranca' && <Seguranca dossie={dossie} />}
              </main>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-16 rounded-lg bg-bg-secondary" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-bg-secondary" />
        ))}
      </div>
      <div className="h-40 rounded-lg bg-bg-secondary" />
    </div>
  )
}
