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

export type TipoEvento =
  | 'ingresso'
  | 'treinamento'
  | 'cargo'
  | 'meta'
  | 'avaliacao'
  | 'feedback_formal'
  | 'advertencia'
  | 'outro'

export interface EventoTimeline {
  id: string
  tipo: 'good' | 'warn' | 'bad' | 'info'
  tipoEvento?: TipoEvento
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

export interface MetaPdi {
  id: string
  titulo: string
  concluida: boolean
}

export interface ItemPdi {
  id: string
  objetivo: string       // objetivo principal
  descricao?: string
  metas: MetaPdi[]        // metas menores que compõem o objetivo
  prazo?: string
  registradoPor?: string  // coordenador de desempenho que registrou/atualizou
  atualizadoEm?: string   // ISO date
}

export type CategoriaFeedback = 'positivo' | 'desenvolvimento' | 'gestor'

export interface Feedback {
  id: string
  autor: string
  papel: string
  data: string
  ciclo?: string   // "C1".."C4"
  ano?: number
  texto: string
  categorias: CategoriaFeedback[]
  tags: { label: string; tone: StatusNivel | 'info' }[]
}

export interface AvaliacaoDesenvolvimento {
  pontosDesenvolvimento: string[]  // o que o membro quer desenvolver
  percepcaoGestores: string[]      // o que gestores veem para melhorar
  pontosFortes: string[]           // pontos fortes das 1:1
  pontosFracos: string[]           // pontos fracos das 1:1
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
  /** E-mail de login (Supabase Auth) — vincula esta linha ao usuário autenticado. */
  email?: string
  /** Segundo cargo/diretoria, para quem acumula duas funções (ex.: Diretor(a) + Presidente Executivo). */
  cargoSecundario?: string
  areaSecundaria?: string
}

// ---- PDAA (Plano de Avaliação e Autogestão · sistema de pontos / farol) ----

export type CategoriaConduta = 'leve' | 'moderada' | 'alerta' | 'grave'

// Catálogo (vem do PDF). Leve=1, Moderada=2, Alerta=3, Grave=4.
export interface Conduta {
  id: string
  categoria: CategoriaConduta
  pontos: number
  descricao: string
}

// Uma conduta registrada (instância) — soma para a pontuação do ciclo.
export interface RegistroConduta {
  id: string // id da instância (único)
  condutaId: string
  categoria: CategoriaConduta
  pontos: number
  descricao: string
  data?: string       // ex.: "2026-06-15" — data em que a conduta ocorreu
  observacao?: string // contexto livre adicionado pelo coordenador
}

export interface PontuacaoCiclo {
  ano: number
  ciclo: string // C1..C4
  pontos: number
}

export interface UsoAbono {
  id: string
  tipo: string
  descricao?: string
  data: string
  pontosAbonados: number
}

export interface AbonoCiclo {
  ano: number
  ciclo: string
  usados: number
  registros?: UsoAbono[]
}

export interface CondutasCicloHistorico {
  ano: number
  ciclo: string
  registros: RegistroConduta[]
}

export interface Pdaa {
  cicloAtual: { ano: number; ciclo: string }
  pontuacaoPorCiclo: PontuacaoCiclo[]
  abonosPorCiclo: AbonoCiclo[]
  abonosDisponiveis: number
  estagioProbatorioUsado: boolean
  condutasRegistradas: RegistroConduta[]
  condutasPorCiclo?: CondutasCicloHistorico[]
}

// Configuração de fechamento de ciclo — gerenciada pelo G&G (global, salva em localStorage).
export interface ConfigCiclo {
  cicloRef: string      // ex.: "2026-C2"
  dataFechamento: string // ISO date "YYYY-MM-DD"
}

// Snapshot salvo ao fechar um ciclo — dados mínimos para comparação histórica.
export interface SnapshotCiclo {
  ano: number
  ciclo: string
  fechadoEm: string // ISO datetime
  pontuacaoPdaa: number
  farolNivel: string
  kpis: {
    engajamento: number
    pco: number
    entregas: number
    presenca: number
  }
}

// ---- Entregas por GT ----

export type StatusEntrega = 'no_prazo' | 'fora_prazo' | 'pendente'

export interface EntregaGT {
  id: string
  descricao: string
  prazo: string       // ex.: "15/04/2026"
  status: StatusEntrega
}

export interface GrupoTrabalho {
  id: string
  nome: string        // ex.: "GT Comercial"
  diretoria?: string  // ex.: "Diretoria de Demandas"
  ciclo: string       // ex.: "C2"
  ano: number
  entregas: EntregaGT[]
}

// GTs dos quais o membro participa por ciclo (usado em Perfil)
export interface ParticipacaoGT {
  ciclo: string
  ano: number
  gts: string[]       // nomes dos GTs
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
  avaliacaoDesenvolvimento: AvaliacaoDesenvolvimento
  auditoria: AcessoAuditoria[]
  perfisAcesso: PerfilAcesso[]
  pdaa: Pdaa
  gruposTrabalho: GrupoTrabalho[]
  participacaoGTs: ParticipacaoGT[]
}
