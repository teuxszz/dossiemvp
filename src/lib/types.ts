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
  ciclo: string // "2022"
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

export interface DadosPessoais {
  admissao: string
  regime: string
  formacao: string
  gestor: string
  faixaSalarial: string
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
  dadosPessoais: DadosPessoais
  pdi: ItemPdi[]
  feedbacks: Feedback[]
  auditoria: AcessoAuditoria[]
  perfisAcesso: PerfilAcesso[]
}
