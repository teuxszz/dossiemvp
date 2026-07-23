import { useState } from 'react'

export type CicloTag = 'C1' | 'C2' | 'C3' | 'C4'
export interface CicloRef {
  ano: number
  ciclo: CicloTag
}

const CICLOS: CicloTag[] = ['C1', 'C2', 'C3', 'C4']

const LS_CICLO_GLOBAL = 'dossie_ciclo_global'
const LS_ANOS_FECHADOS = 'dossie_anos_fechados'

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

export interface UseCicloGlobal {
  cicloGlobal: CicloRef
  anosFechados: Set<number>
  /** Troca de ciclo dentro do mesmo ano — sem confirmação, é só navegação. */
  selecionarCiclo: (ciclo: CicloTag) => void
  /** true quando o ciclo ativo é C4 — é a partir dele que dá pra "virar o ano". */
  podeAvancarAno: boolean
  /** Fecha o ano atual (fica congelado, mas continua visível no histórico) e abre {ano+1, C1}. */
  confirmarVirarAno: () => void
  /** Um ano fechado nunca é reaberto por aqui — dado histórico é só leitura. */
  anoEstaFechado: (ano: number) => boolean
}

export function useCicloGlobal(): UseCicloGlobal {
  const [cicloGlobal, setCicloGlobal] = useState<CicloRef>(loadCicloGlobal)
  const [anosFechados, setAnosFechados] = useState<Set<number>>(loadAnosFechados)

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
  }

  return {
    cicloGlobal,
    anosFechados,
    selecionarCiclo,
    podeAvancarAno: cicloGlobal.ciclo === 'C4',
    confirmarVirarAno,
    anoEstaFechado: (ano: number) => anosFechados.has(ano),
  }
}

export { CICLOS }
