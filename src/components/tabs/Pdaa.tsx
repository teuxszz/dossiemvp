import { useMemo, useState } from 'react'
import { Plus, Trash2, ShieldAlert, Gift, ListChecks } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { FarolCard } from '../Farol'
import { YearTabs } from '../YearTabs'
import { AbonosPorCicloChart } from '../charts/Charts'
import { CONDUTAS, CATEGORIA_LABEL, CATEGORIA_TONE, PONTOS_POR_CATEGORIA } from '@/lib/pdaa'
import { cn, toneBadge, type Tone } from '@/lib/ui'
import type { CategoriaConduta, Dossie, RegistroConduta } from '@/lib/types'

interface Props {
  dossie: Dossie
  registros: RegistroConduta[]
  setRegistros: (next: RegistroConduta[]) => void
}

const CATEGORIAS: CategoriaConduta[] = ['leve', 'moderada', 'alerta', 'grave']

export function Pdaa({ dossie, registros, setRegistros }: Props) {
  const [selecionada, setSelecionada] = useState<string>(CONDUTAS[0]?.id ?? '')

  const pontos = registros.reduce((s, r) => s + r.pontos, 0)

  const anos = useMemo(
    () => [...new Set(dossie.pdaa.abonosPorCiclo.map((a) => a.ano))].sort((a, b) => b - a),
    [dossie.pdaa.abonosPorCiclo],
  )
  const [ano, setAno] = useState<number>(anos[0] ?? 2026)
  const abonosDoAno = dossie.pdaa.abonosPorCiclo.filter((a) => a.ano === ano)
  const abonosUsadosTotal = dossie.pdaa.abonosPorCiclo.reduce((s, a) => s + a.usados, 0)

  function adicionar() {
    const c = CONDUTAS.find((x) => x.id === selecionada)
    if (!c) return
    const novo: RegistroConduta = {
      id: crypto.randomUUID(),
      condutaId: c.id,
      categoria: c.categoria,
      pontos: c.pontos,
      descricao: c.descricao,
    }
    setRegistros([...registros, novo])
  }

  function remover(id: string) {
    setRegistros(registros.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Resumo: farol + abonos */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <FarolCard pontos={pontos} probatorioUsado={dossie.pdaa.estagioProbatorioUsado} />

        <Card className="p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
            <Gift size={13} /> Abonos disponíveis
          </div>
          <div className="text-4xl font-semibold leading-none text-good">{dossie.pdaa.abonosDisponiveis}</div>
          <div className="mt-2 text-xs text-ink-secondary">
            {abonosUsadosTotal} abono(s) já utilizado(s) no histórico
          </div>
          <div className="mt-3 text-[11px] text-ink-tertiary">
            Cada ação pode abonar no máximo 3 pontos (PDAA 2026).
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
            <ListChecks size={13} /> Condutas no ciclo
          </div>
          <div className="text-4xl font-semibold leading-none text-ink-primary">{registros.length}</div>
          <div className="mt-2 text-xs text-ink-secondary">
            somando <span className="font-medium text-ink-primary">{pontos} pts</span> no ciclo atual (
            {dossie.pdaa.cicloAtual.ano} {dossie.pdaa.cicloAtual.ciclo})
          </div>
        </Card>
      </div>

      {/* Abonos usados por ciclo */}
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={<Gift size={15} />}>Abonos usados por ciclo — {ano}</SectionTitle>
          <YearTabs anos={anos} value={ano} onChange={setAno} />
        </div>
        <div className="h-48">
          {abonosDoAno.length > 0 ? (
            <AbonosPorCicloChart data={abonosDoAno} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-tertiary">Sem dados para {ano}.</div>
          )}
        </div>
      </Card>

      {/* Registro editável de condutas */}
      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<ShieldAlert size={15} />}>Registro de condutas (editável)</SectionTitle>
        <p className="mb-3 text-xs text-ink-secondary">
          Selecione uma conduta do catálogo do PDAA. Os pontos somam automaticamente e atualizam a pontuação e o farol
          em todas as abas.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selecionada}
            onChange={(e) => setSelecionada(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-line bg-bg-secondary px-3 py-2 text-xs text-ink-primary"
          >
            {CATEGORIAS.map((cat) => (
              <optgroup key={cat} label={`${CATEGORIA_LABEL[cat]} · ${PONTOS_POR_CATEGORIA[cat]} pt(s)`}>
                {CONDUTAS.filter((c) => c.categoria === cat).map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.pontos}pt] {c.descricao}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            onClick={adicionar}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-dark"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>

        <div className="mt-3 divide-y divide-line">
          {registros.length === 0 && (
            <div className="py-6 text-center text-xs text-ink-tertiary">Nenhuma conduta registrada neste ciclo.</div>
          )}
          {registros.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-2">
              <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium', toneBadge[CATEGORIA_TONE[r.categoria] as Tone])}>
                {CATEGORIA_LABEL[r.categoria]} · {r.pontos}pt
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-ink-secondary" title={r.descricao}>
                {r.descricao}
              </span>
              <button
                onClick={() => remover(r.id)}
                className="shrink-0 rounded-md p-1.5 text-ink-tertiary hover:bg-bad-soft hover:text-bad"
                aria-label="Remover conduta"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {registros.length > 0 && (
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs text-ink-secondary">Total no ciclo</span>
            <span className="text-sm font-semibold text-ink-primary">{pontos} pts</span>
          </div>
        )}
      </Card>
    </div>
  )
}
