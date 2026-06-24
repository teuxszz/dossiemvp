// Tipos de domínio do Dossiê Individual.
// Espelham as tabelas em supabase/schema.sql.

export type StatusNivel = 'good' | 'warn' | 'bad'

export interface Kpi {
  key: string
  label: string
  value: number // 0-100
  status: StatusNivel
  sub: string
}

export interface Recomendacao {
  id: string
  tipo: StatusNivel | 'info'
  titulo: string
  descricao: string
}

export interface EventoTimeline {
  id: string
  tipo: 'good' | 'warn' | 'bad' | 'info'
  titulo: string
  meta: string
  data: string // ex.: "Mar 2024"
  ordem: number
}

export interface KpiCiclo {
  ano: number // 2025
  ciclo: string // "C1".."C4" — 4 ciclos por ano
  engajamento: number
  pco: number
  pdaa: number
  entregas: number
}

export interface Competencia {
  eixo: string
  valor: number
}

export interface ScorePonto {
  trimestre: string
  score: number
}

export interface ItemPdi {
  id: string
  titulo: string
  progresso: number // 0-100
}

export type CategoriaFeedback = 'positivo' | 'desenvolvimento' | 'gestor'

export interface Feedback {
  id: string
  autor: string
  papel: string
  data: string
  texto: string
  categorias: CategoriaFeedback[]
  tags: { label: string; tone: StatusNivel | 'info' }[]
}

export interface PassagemDiretoria {
  diretoria: string
  periodo: string
}

// Perfil do membro (substitui dados de RH como salário/regime/formação).
export interface Perfil {
  dataEntrada: string
  nascimento: string
  celular: string
  email: string
  diretoriaAtual: string
  coordenadoriaAtual: string
  diretoriasAnteriores: PassagemDiretoria[]
  curso: string
  periodoCurso: string
  perfilComportamental: string
  arquetipo: string
  interesses: string[]
}

export interface AcessoAuditoria {
  id: string
  quando: string
  acao: string
  ator: string
  tone: StatusNivel | 'info'
}

export interface PerfilAcesso {
  id: string
  nome: string
  permissao: string
  tone: StatusNivel | 'info'
}

export interface Colaborador {
  id: string
  nome: string
  cargo: string
  area: string
  matricula: string
  iniciais: string
  acessoRestrito: boolean
  ssoMfa: boolean
}

export interface Dossie {
  colaborador: Colaborador
  kpis: Kpi[]
  recomendacoes: Recomendacao[]
  timeline: EventoTimeline[]
  kpisPorCiclo: KpiCiclo[]
  competencias: Competencia[]
  tendenciaScore: ScorePonto[]
  perfil: Perfil
  pdi: ItemPdi[]
  feedbacks: Feedback[]
  auditoria: AcessoAuditoria[]
  perfisAcesso: PerfilAcesso[]
}
