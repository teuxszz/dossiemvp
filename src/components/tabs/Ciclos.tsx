import { useState } from 'react'
import { CalendarClock, Lock, AlertTriangle, Check, X, Users, ShieldCheck, ArrowLeftCircle, CalendarDays } from 'lucide-react'
import { Card, SectionTitle } from '../Card'
import { cn } from '@/lib/ui'
import { CICLOS, chaveCiclo, type CicloTag, type UseCicloGlobal } from '@/hooks/useCicloGlobal'

function formatarBr(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function hojeISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  cicloGlobal: UseCicloGlobal
}

export function Ciclos({ cicloGlobal }: Props) {
  const {
    cicloGlobal: atual,
    anosFechados,
    selecionarCiclo,
    podeAvancarAno,
    confirmarVirarAno,
    podeVoltarAno,
    confirmarVoltarAno,
    estaNoPassado,
    voltarParaAtual,
    datasCiclos,
    definirDatasCiclo,
  } = cicloGlobal
  const [confirmando, setConfirmando] = useState(false)
  const [confirmandoVolta, setConfirmandoVolta] = useState(false)
  const [pendente, setPendente] = useState<CicloTag | null>(null)

  function pedirTroca(ciclo: CicloTag) {
    if (ciclo === atual.ciclo) return
    setPendente(ciclo)
  }

  function confirmarTroca() {
    if (pendente) selecionarCiclo(pendente)
    setPendente(null)
  }

  function avancar() {
    confirmarVirarAno()
    setConfirmando(false)
  }

  function voltar() {
    confirmarVoltarAno()
    setConfirmandoVolta(false)
  }

  return (
    <div className="space-y-4">
      {/* Pop-up de confirmação ao trocar de ciclo dentro do mesmo ano */}
      {pendente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-line bg-bg-primary p-6 shadow-xl">
            <div className="mb-1 flex items-center gap-2 text-brand">
              <CalendarClock size={16} />
              <span className="text-[15px] font-semibold">Trocar ciclo ativo</span>
            </div>
            <p className="mt-2 text-sm text-ink-secondary">
              Você está prestes a mudar o ciclo ativo de <strong className="text-ink-primary">{atual.ciclo}</strong> para{' '}
              <strong className="text-ink-primary">{pendente}</strong> ({atual.ano}). Isso muda o período padrão de
              edição de KPIs, PDAA e abonos em todos os dossiês. Confirma?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setPendente(null)} className="rounded-lg border border-line px-4 py-2 text-sm text-ink-secondary hover:text-ink-primary">
                Cancelar
              </button>
              <button
                onClick={confirmarTroca}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
              >
                <Check size={13} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<CalendarClock size={15} />}>Ciclo ativo</SectionTitle>
        <p className="mt-1 text-xs text-ink-secondary">
          Define o ciclo (C1–C4) que o painel usa por padrão em todos os dossiês — KPIs, PDAA e abonos do ciclo
          corrente. Alternar aqui não muda dados antigos, só qual período fica "aberto" pra edição.
        </p>

        {estaNoPassado && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand/30 bg-brand/5 px-3 py-2">
            <span className="text-xs text-ink-secondary">Você está navegando pelo histórico — este período está só leitura.</span>
            <button
              onClick={voltarParaAtual}
              className="shrink-0 rounded-md bg-brand px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand/90"
            >
              Voltar para o ciclo atual
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="font-display text-4xl font-bold text-brand">{atual.ano}</div>
          <div className="flex rounded-lg border border-line bg-bg-secondary p-1">
            {CICLOS.map((c) => (
              <button
                key={c}
                onClick={() => pedirTroca(c)}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                  atual.ciclo === c ? 'bg-brand text-white shadow-card' : 'text-ink-tertiary hover:text-ink-primary',
                )}
              >
                {c}
              </button>
            ))}
          </div>
          {datasCiclos[chaveCiclo(atual.ano, atual.ciclo)] && (
            <span className="flex items-center gap-1.5 text-xs text-ink-tertiary">
              <CalendarDays size={13} />
              {formatarBr(datasCiclos[chaveCiclo(atual.ano, atual.ciclo)].inicio)} – {formatarBr(datasCiclos[chaveCiclo(atual.ano, atual.ciclo)].fim)}
            </span>
          )}
          {!estaNoPassado && (() => {
            const d = datasCiclos[chaveCiclo(atual.ano, atual.ciclo)]
            const hoje = hojeISO()
            const dentroDoPeriodo = d && hoje >= d.inicio && hoje <= d.fim
            return dentroDoPeriodo ? (
              <span className="flex items-center gap-1 rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-medium text-good">
                <span className="h-1.5 w-1.5 rounded-full bg-good" /> acompanhando o calendário
              </span>
            ) : null
          })()}
        </div>
        <p className="mt-2 text-[11px] text-ink-tertiary">
          Com as datas preenchidas, o ciclo ativo troca sozinho quando o calendário chegar no período de outro
          ciclo — não precisa lembrar de mudar manualmente.
        </p>

        {podeAvancarAno && (
          <div className="mt-4 rounded-lg border border-warn/30 bg-warn/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warn" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-ink-primary">
                  {atual.ciclo} é o último ciclo de {atual.ano}
                </p>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  Avançar pra {atual.ano + 1} C1 congela {atual.ano} — os dados continuam visíveis no histórico de
                  cada membro, mas viram somente leitura. Cargos de liderança (diretores e gerentes) não são
                  alterados por essa ação.
                </p>
                {!confirmando ? (
                  <button
                    onClick={() => setConfirmando(true)}
                    className="mt-3 flex items-center gap-1.5 rounded-lg bg-warn px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    <Lock size={12} /> Avançar para {atual.ano + 1} C1
                  </button>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-ink-primary">Confirma o fechamento de {atual.ano}?</span>
                    <button onClick={avancar} className="flex items-center gap-1.5 rounded-lg bg-warn px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
                      <Check size={12} /> Confirmar
                    </button>
                    <button onClick={() => setConfirmando(false)} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary">
                      <X size={12} /> Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {podeVoltarAno && (
          <div className="mt-4 rounded-lg border border-line bg-bg-secondary p-4">
            <div className="flex items-start gap-2">
              <ArrowLeftCircle size={15} className="mt-0.5 shrink-0 text-ink-tertiary" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-ink-primary">
                  {atual.ano - 1} está fechado — dá pra visualizar
                </p>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  Voltar pra {atual.ano - 1} C4 só navega pra visualização — o padrão continua o mesmo dos gráficos
                  e KPIs de qualquer outro ciclo, só que somente leitura. Cargos de liderança não são alterados.
                </p>
                {!confirmandoVolta ? (
                  <button
                    onClick={() => setConfirmandoVolta(true)}
                    className="mt-3 flex items-center gap-1.5 rounded-lg border border-line bg-bg-primary px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary"
                  >
                    <ArrowLeftCircle size={12} /> Voltar para {atual.ano - 1} C4
                  </button>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-ink-primary">Confirma ir para {atual.ano - 1} C4?</span>
                    <button onClick={voltar} className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90">
                      <Check size={12} /> Confirmar
                    </button>
                    <button onClick={() => setConfirmandoVolta(false)} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary">
                      <X size={12} /> Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<CalendarDays size={15} />}>Datas dos ciclos — {atual.ano}</SectionTitle>
        <p className="mt-1 text-xs text-ink-secondary">
          Defina o período (início/fim) de cada ciclo do ano. É só informativo — mostra o prazo pra todo mundo, mas
          não interfere em qual ciclo está aberto pra edição.
        </p>
        <div className="mt-3 space-y-2">
          {CICLOS.map((c) => (
            <LinhaDataCiclo
              key={c}
              ciclo={c}
              ativo={atual.ciclo === c}
              datas={datasCiclos[chaveCiclo(atual.ano, c)]}
              onSalvar={(datas) => definirDatasCiclo(atual.ano, c, datas)}
            />
          ))}
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <SectionTitle icon={<ShieldCheck size={15} />}>O que muda (e o que não muda) ao virar o ano</SectionTitle>
        <ul className="mt-2 space-y-2 text-xs text-ink-secondary">
          <li className="flex gap-2"><Lock size={13} className="mt-0.5 shrink-0 text-warn" /> KPIs, condutas PDAA e abonos do ano fechado passam a ser só leitura — continuam no histórico de cada dossiê.</li>
          <li className="flex gap-2"><Users size={13} className="mt-0.5 shrink-0 text-brand" /> Cargos, diretorias e a estrutura de liderança (diretores, gerentes, coordenadores) não são tocados — isso é gerenciado à parte, em Membros.</li>
          <li className="flex gap-2"><CalendarClock size={13} className="mt-0.5 shrink-0 text-good" /> O novo ano começa em C1 com o quadro de membros exatamente como estava.</li>
        </ul>
      </Card>

      {anosFechados.size > 0 && (
        <Card className="p-4 sm:p-5">
          <SectionTitle icon={<Lock size={15} />}>Anos fechados</SectionTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...anosFechados].sort((a, b) => b - a).map((ano) => (
              <span key={ano} className="rounded-md border border-line bg-bg-secondary px-2.5 py-1 text-xs text-ink-secondary">
                {ano} · congelado
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink-tertiary">
            Pra ver os dados de um ano fechado, abra o dossiê do membro e use as abas de ano nos gráficos.
          </p>
        </Card>
      )}
    </div>
  )
}

function LinhaDataCiclo({
  ciclo,
  ativo,
  datas,
  onSalvar,
}: {
  ciclo: CicloTag
  ativo: boolean
  datas: { inicio: string; fim: string } | undefined
  onSalvar: (datas: { inicio: string; fim: string } | undefined) => void
}) {
  const [inicio, setInicio] = useState(datas?.inicio ?? '')
  const [fim, setFim] = useState(datas?.fim ?? '')
  const alterado = inicio !== (datas?.inicio ?? '') || fim !== (datas?.fim ?? '')

  function salvar() {
    if (inicio && fim) onSalvar({ inicio, fim })
    else if (!inicio && !fim) onSalvar(undefined)
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2 rounded-lg border p-2.5', ativo ? 'border-brand/40 bg-brand/5' : 'border-line bg-bg-secondary')}>
      <span className={cn('w-8 shrink-0 text-sm font-semibold', ativo ? 'text-brand' : 'text-ink-primary')}>{ciclo}</span>
      <input
        type="date"
        value={inicio}
        onChange={(e) => setInicio(e.target.value)}
        className="rounded border border-line bg-bg-primary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
      />
      <span className="text-ink-tertiary">–</span>
      <input
        type="date"
        value={fim}
        onChange={(e) => setFim(e.target.value)}
        min={inicio || undefined}
        className="rounded border border-line bg-bg-primary px-2 py-1 text-xs text-ink-primary focus:border-brand focus:outline-none"
      />
      {alterado && (
        <button
          onClick={salvar}
          disabled={Boolean(inicio) !== Boolean(fim)}
          className="ml-auto flex items-center gap-1 rounded-md bg-brand px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand/90 disabled:opacity-40"
        >
          <Check size={11} /> Salvar
        </button>
      )}
    </div>
  )
}
