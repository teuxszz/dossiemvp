import { useState } from 'react'

export type CicloTag = 'C1' | 'C2' | 'C3' | 'C4'
export interface CicloRef {
  ano: number
  ciclo: CicloTag
}

const CICLOS: CicloTag[] = ['C1', 'C2', 'C3', 'C4']

const LS_CICLO_GLOBAL = 'dossie_ciclo_global'
const LS_ANOS_FECHADOS = 'dossie_anos_fechados'
const LS_CICLO_RECENTE = 'dossie_ciclo_mais_recente'

const DEFAULT_CICLO: CicloRef = { ano: 2026, ciclo: 'C2' }

function loadCicloGlobal(): CicloRef {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_CICLO_GLOBAL) ?? 'null')
    if (raw && typeof raw.ano === 'number' && CICLOS.includes(raw.ciclo)) return raw
  } catch { /* ignore */ }
  return DEFAULT_CICLO
}
function saveCicloGlobal(c: CicloRef) {
  localStorage.setItem(LS_CICLO_GLOBAL, JSON.stringify(c))
}

function loadAnosFechados(): Set<number> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_ANOS_FECHADOS) ?? '[]')) } catch { return new Set() }
}
function saveAnosFechados(anos: Set<number>) {
  localStorage.setItem(LS_ANOS_FECHADOS, JSON.stringify([...anos]))
}

// O ciclo mais "avançado" que já existiu — permite voltar no tempo pra
// visualizar anos fechados sem perder o caminho de volta pro presente.
function loadCicloMaisRecente(cicloAtual: CicloRef): CicloRef {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_CICLO_RECENTE) ?? 'null')
    if (raw && typeof raw.ano === 'number' && CICLOS.includes(raw.ciclo)) return raw
  } catch { /* ignore */ }
  return cicloAtual
}
function saveCicloMaisRecente(c: CicloRef) {
  localStorage.setItem(LS_CICLO_RECENTE, JSON.stringify(c))
}

export interface UseCicloGlobal {
  cicloGlobal: CicloRef
  anosFechados: Set<number>
  /** Troca de ciclo dentro do mesmo ano — sem confirmação, é só navegação. */
  selecionarCiclo: (ciclo: CicloTag) => void
  /** true quando o ciclo ativo é C4 — é a partir dele que dá pra "virar o ano". */
  podeAvancarAno: boolean
  /** Fecha o ano atual (fica congelado, mas continua visível no histórico) e abre {ano+1, C1}. */
  confirmarVirarAno: () => void
  /** true quando o ciclo ativo é C1 e o ano anterior já foi fechado — dá pra voltar e visualizá-lo. */
  podeVoltarAno: boolean
  /** Volta pra {ano-1, C4} só pra navegação/visualização — o ano de origem não é reaberto (segue só leitura). */
  confirmarVoltarAno: () => void
  /** Um ano fechado nunca é reaberto por aqui — dado histórico é só leitura. */
  anoEstaFechado: (ano: number) => boolean
  /** true quando o ciclo ativo não é o mais recente — ou seja, está navegando pelo histórico. */
  estaNoPassado: boolean
  /** Pula direto de volta pro ciclo mais recente (sai do modo histórico). */
  voltarParaAtual: () => void
}

export function useCicloGlobal(): UseCicloGlobal {
  const [cicloGlobal, setCicloGlobal] = useState<CicloRef>(loadCicloGlobal)
  const [anosFechados, setAnosFechados] = useState<Set<number>>(loadAnosFechados)
  const [cicloMaisRecente, setCicloMaisRecente] = useState<CicloRef>(() => loadCicloMaisRecente(loadCicloGlobal()))

  function selecionarCiclo(ciclo: CicloTag) {
    const next = { ...cicloGlobal, ciclo }
    setCicloGlobal(next)
    saveCicloGlobal(next)
  }

  function confirmarVirarAno() {
    const anoFechado = new Set(anosFechados)
    anoFechado.add(cicloGlobal.ano)
    setAnosFechados(anoFechado)
    saveAnosFechados(anoFechado)

    const next: CicloRef = { ano: cicloGlobal.ano + 1, ciclo: 'C1' }
    setCicloGlobal(next)
    saveCicloGlobal(next)
    setCicloMaisRecente(next)
    saveCicloMaisRecente(next)
  }

  function confirmarVoltarAno() {
    // Só navega — o ano de destino já está em anosFechados (por isso dá pra
    // voltar), então continua travado pra edição. Nada aqui reabre nada, e o
    // ciclo mais recente (o "presente") fica guardado pra dar pra voltar.
    const next: CicloRef = { ano: cicloGlobal.ano - 1, ciclo: 'C4' }
    setCicloGlobal(next)
    saveCicloGlobal(next)
  }

  function voltarParaAtual() {
    setCicloGlobal(cicloMaisRecente)
    saveCicloGlobal(cicloMaisRecente)
  }

  return {
    cicloGlobal,
    anosFechados,
    selecionarCiclo,
    podeAvancarAno: cicloGlobal.ciclo === 'C4',
    confirmarVirarAno,
    podeVoltarAno: cicloGlobal.ciclo === 'C1' && anosFechados.has(cicloGlobal.ano - 1),
    confirmarVoltarAno,
    anoEstaFechado: (ano: number) => anosFechados.has(ano),
    estaNoPassado: cicloGlobal.ano !== cicloMaisRecente.ano || cicloGlobal.ciclo !== cicloMaisRecente.ciclo,
    voltarParaAtual,
  }
}

export { CICLOS }
