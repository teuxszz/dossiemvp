import type { CategoriaConduta, Conduta, PontuacaoCiclo } from './types'
import type { Tone } from './ui'

// Pontos por categoria (PDF: Leve 1 · Moderada 2 · Alerta 3 · Grave 4).
export const PONTOS_POR_CATEGORIA: Record<CategoriaConduta, number> = {
  leve: 1,
  moderada: 2,
  alerta: 3,
  grave: 4,
}

export const CATEGORIA_LABEL: Record<CategoriaConduta, string> = {
  leve: 'Leve',
  moderada: 'Moderada',
  alerta: 'Alerta',
  grave: 'Grave',
}

export const CATEGORIA_TONE: Record<CategoriaConduta, Tone> = {
  leve: 'info',
  moderada: 'warn',
  alerta: 'warn',
  grave: 'bad',
}

// Catálogo de condutas — transcrito do PDAA 2026 (CONSEJ).
export const CONDUTAS: Conduta[] = [
  // Leves (1 ponto)
  { id: 'l1', categoria: 'leve', pontos: 1, descricao: 'Atrasar (sem justificativa idônea) a RG, RT, 1:1 ou momento CONSEJ' },
  { id: 'l2', categoria: 'leve', pontos: 1, descricao: 'Atrasar ou deixar de responder formulários de pesquisas internas no prazo' },
  { id: 'l3', categoria: 'leve', pontos: 1, descricao: 'Atrasar em 1 dia a entrega de uma demanda destinada a cliente' },
  // Moderadas (2 pontos)
  { id: 'm1', categoria: 'moderada', pontos: 2, descricao: 'Faltar (sem justificativa idônea) a RG, RT, 1:1 ou momento CONSEJ' },
  { id: 'm2', categoria: 'moderada', pontos: 2, descricao: 'Atrasar entrega interna de atribuições alinhadas pela liderança' },
  { id: 'm3', categoria: 'moderada', pontos: 2, descricao: 'Não enviar o repasse de Grupo de Trabalho (GT) no prazo' },
  { id: 'm4', categoria: 'moderada', pontos: 2, descricao: 'Não enviar o repasse semanal da Diretoria no prazo (Diretores)' },
  { id: 'm5', categoria: 'moderada', pontos: 2, descricao: 'Passar mais de 2 dias sem interagir em GT ativo' },
  { id: 'm6', categoria: 'moderada', pontos: 2, descricao: 'Não realizar entrega interna em Coordenadoria/Diretoria' },
  { id: 'm7', categoria: 'moderada', pontos: 2, descricao: 'Atrasar em até 2 dias o prazo de uma demanda para cliente' },
  // Alertas (3 pontos)
  { id: 'a1', categoria: 'alerta', pontos: 3, descricao: 'Chegar atrasado em reunião com cliente (sem tolerância)' },
  { id: 'a2', categoria: 'alerta', pontos: 3, descricao: 'Atrasar em 3 ou mais dias o prazo de uma demanda para cliente' },
  { id: 'a3', categoria: 'alerta', pontos: 3, descricao: 'Não realizar entrega interna em Coordenadoria/Diretoria' },
  { id: 'a4', categoria: 'alerta', pontos: 3, descricao: 'Faltar (sem justificativa) a momento CONSEJ com confirmação de presença' },
  { id: 'a5', categoria: 'alerta', pontos: 3, descricao: 'Atrasar envio de follow-up (conteúdos de valor)' },
  // Graves (4 pontos)
  { id: 'g1', categoria: 'grave', pontos: 4, descricao: 'Atrasar em até 4 dias a entrega de uma demanda para cliente' },
  { id: 'g2', categoria: 'grave', pontos: 4, descricao: 'Ter 75% de faltas em evento custeado pela CONSEJ' },
  { id: 'g3', categoria: 'grave', pontos: 4, descricao: 'Atrasar entrega de documentos para lead (proposta, contrato)' },
  { id: 'g4', categoria: 'grave', pontos: 4, descricao: 'Atrasar entrega interna de atribuições alinhadas pela liderança' },
  { id: 'g5', categoria: 'grave', pontos: 4, descricao: 'Faltar (sem justificativa idônea) a reunião com cliente/lead, CF ou AG' },
]

// Limites do Sistema de Farol (PDF).
export const LIMITE_AMARELO = 7 // 7 a 12
export const LIMITE_VERMELHO = 13 // >= 13
export const LIMITE_PROBATORIO = 16 // entra em Estágio Probatório (uma única vez)

export type FarolNivel = 'azul' | 'amarelo' | 'vermelho'

export interface Farol {
  nivel: FarolNivel
  label: string
  tone: Tone
  faixa: string
  descricao: string
  probatorio: boolean
}

export function farolDe(pontos: number): Farol {
  const probatorio = pontos >= LIMITE_PROBATORIO
  if (pontos >= LIMITE_VERMELHO) {
    return {
      nivel: 'vermelho',
      label: 'Farol Vermelho',
      tone: 'bad',
      faixa: '≥ 13 pontos',
      descricao: probatorio
        ? 'Situação crítica · 16 pts: Estágio Probatório (conduzido pela DirEx)'
        : 'Situação crítica · acompanhamento próximo da Diretoria de Pessoas e Pesquisas',
      probatorio,
    }
  }
  if (pontos >= LIMITE_AMARELO) {
    return {
      nivel: 'amarelo',
      label: 'Farol Amarelo',
      tone: 'warn',
      faixa: '7 a 12 pontos',
      descricao: 'Situação de atenção · pode haver plano de desenvolvimento personalizado',
      probatorio: false,
    }
  }
  return {
    nivel: 'azul',
    label: 'Farol Azul',
    tone: 'info',
    faixa: '0 a 6 pontos',
    descricao: 'Situação regular · sem acompanhamento especial',
    probatorio: false,
  }
}

// Substitui a pontuação do ciclo atual pelo valor "ao vivo" (somatório das
// condutas registradas), mantendo os ciclos históricos.
export function comCicloAtual(
  pontuacaoPorCiclo: PontuacaoCiclo[],
  cicloAtual: { ano: number; ciclo: string },
  pontosAtual: number,
): PontuacaoCiclo[] {
  const existe = pontuacaoPorCiclo.some((p) => p.ano === cicloAtual.ano && p.ciclo === cicloAtual.ciclo)
  const base = existe
    ? pontuacaoPorCiclo
    : [...pontuacaoPorCiclo, { ano: cicloAtual.ano, ciclo: cicloAtual.ciclo, pontos: 0 }]
  return base.map((p) =>
    p.ano === cicloAtual.ano && p.ciclo === cicloAtual.ciclo ? { ...p, pontos: pontosAtual } : p,
  )
}
