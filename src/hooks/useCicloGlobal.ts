import { useEffect, useState } from 'react'

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

export interface DatasCiclo {
  inicio: string // "YYYY-MM-DD"
  fim: string
}

const LS_DATAS_CICLOS = 'dossie_datas_ciclos'

export function chaveCiclo(ano: number, ciclo: CicloTag) {
  return `${ano}-${ciclo}`
}

function loadDatasCiclos(): Record<string, DatasCiclo> {
  try { return JSON.parse(localStorage.getItem(LS_DATAS_CICLOS) ?? '{}') } catch { return {} }
}
function saveDatasCiclos(datas: Record<string, DatasCiclo>) {
  localStorage.setItem(LS_DATAS_CICLOS, JSON.stringify(datas))
}

function hojeISO(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

// Acha, entre os ciclos do ano, qual tem a data de hoje dentro do período
// configurado (início ≤ hoje ≤ fim). Comparação por string ISO funciona
// porque "YYYY-MM-DD" ordena igual cronologicamente.
function cicloPelaData(ano: number, datas: Record<string, DatasCiclo>): CicloTag | null {
  const hoje = hojeISO()
  for (const c of CICLOS) {
    const d = datas[chaveCiclo(ano, c)]
    if (d && d.inicio && d.fim && hoje >= d.inicio && hoje <= d.fim) return c
  }
  return null
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
  /** Datas (início/fim) configuradas por ciclo, indexadas por "AAAA-CX". */
  datasCiclos: Record<string, DatasCiclo>
  /** Define ou limpa (undefined) o período de um ciclo específico. */
  definirDatasCiclo: (ano: number, ciclo: CicloTag, datas: DatasCiclo | undefined) => void
}

export function useCicloGlobal(): UseCicloGlobal {
  const [cicloGlobal, setCicloGlobal] = useState<CicloRef>(loadCicloGlobal)
  const [anosFechados, setAnosFechados] = useState<Set<number>>(loadAnosFechados)
  const [cicloMaisRecente, setCicloMaisRecente] = useState<CicloRef>(() => loadCicloMaisRecente(loadCicloGlobal()))
  const [datasCiclos, setDatasCiclos] = useState<Record<string, DatasCiclo>>(loadDatasCiclos)

  function definirDatasCiclo(ano: number, ciclo: CicloTag, datas: DatasCiclo | undefined) {
    const key = chaveCiclo(ano, ciclo)
    const next = { ...datasCiclos }
    if (datas) next[key] = datas
    else delete next[key]
    setDatasCiclos(next)
    saveDatasCiclos(next)
  }

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

  // Acompanha o calendário: se hoje cair dentro do período configurado de um
  // ciclo diferente do ativo (e não tiver ninguém navegando pelo histórico),
  // troca sozinho — sem confirmação, porque não é uma ação manual da pessoa,
  // é só o painel reconhecendo em que ciclo estamos de verdade.
  useEffect(() => {
    const estaNoHistorico = cicloGlobal.ano !== cicloMaisRecente.ano || cicloGlobal.ciclo !== cicloMaisRecente.ciclo
    if (estaNoHistorico) return

    function conferir() {
      const encontrado = cicloPelaData(cicloMaisRecente.ano, datasCiclos)
      if (encontrado && encontrado !== cicloMaisRecente.ciclo) {
        const next: CicloRef = { ano: cicloMaisRecente.ano, ciclo: encontrado }
        setCicloGlobal(next)
        saveCicloGlobal(next)
        setCicloMaisRecente(next)
        saveCicloMaisRecente(next)
      }
    }

    conferir()
    // Reconfere periodicamente pra sessões que ficam abertas atravessando a virada de um ciclo pro outro.
    const id = setInterval(conferir, 30 * 60 * 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasCiclos, cicloMaisRecente.ano, cicloMaisRecente.ciclo, cicloGlobal.ano, cicloGlobal.ciclo])

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
    datasCiclos,
    definirDatasCiclo,
  }
}

export { CICLOS }
