-- ============================================================================
-- CONSEJ — Dossiê Individual · Schema Supabase
-- ----------------------------------------------------------------------------
-- Como usar:
--   1. Supabase Dashboard > seu projeto > SQL Editor > New query
--   2. Cole TODO este arquivo e clique em "Run".
--   3. Pronto: a tabela `colaboradores` é criada, com RLS e 1 registro seed.
-- ============================================================================

-- 1. Tabela principal -------------------------------------------------------
-- Campos "core" ficam em colunas; o resto do dossiê fica em `dados` (JSONB),
-- o que mantém o MVP simples (1 tabela) sem perder flexibilidade.
create table if not exists public.colaboradores (
  id              text primary key,
  nome            text not null,
  cargo           text not null default '',
  area            text not null default '',
  matricula       text not null default '',
  iniciais        text not null default '',
  acesso_restrito boolean not null default false,
  sso_mfa         boolean not null default false,
  dados           jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 2. updated_at automático ---------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_colaboradores_updated_at on public.colaboradores;
create trigger trg_colaboradores_updated_at
  before update on public.colaboradores
  for each row execute function public.set_updated_at();

-- 3. RLS (Row Level Security) ------------------------------------------------
alter table public.colaboradores enable row level security;

-- MVP: leitura pública (chave anon pode dar SELECT). Escrita NÃO é liberada
-- para anon — só via service_role (server) ou usuários autenticados, se você
-- adicionar uma policy depois.
--
-- ⚠️  Para produção com dados sensíveis de RH, troque a policy abaixo por uma
-- que exija autenticação:  using ( auth.role() = 'authenticated' )
drop policy if exists "leitura publica colaboradores" on public.colaboradores;
create policy "leitura publica colaboradores"
  on public.colaboradores
  for select
  using ( true );

-- 4. Seed --------------------------------------------------------------------
insert into public.colaboradores (id, nome, cargo, area, matricula, iniciais, acesso_restrito, sso_mfa, dados)
values (
  'carlos-eduardo-menezes',
  'Carlos Eduardo Menezes',
  'Gerente Sênior de Operações',
  'Diretoria de Excelência Operacional',
  '0042318',
  'CM',
  true,
  true,
  $json$
{
  "kpis": [
    { "key": "engajamento", "label": "Engajamento", "value": 87, "status": "good", "sub": "Alto · +5pp vs ciclo anterior" },
    { "key": "pco", "label": "PCO", "value": 73, "status": "warn", "sub": "Moderado · Meta: 80%" },
    { "key": "pdaa", "label": "PDAA", "value": 91, "status": "good", "sub": "Destaque · Top 10%" },
    { "key": "entregas", "label": "Entregas", "value": 94, "status": "good", "sub": "Excelente · 17/18 on-time" },
    { "key": "presenca", "label": "Presença", "value": 96, "status": "good", "sub": "Pontualidade: 98%" }
  ],
  "recomendacoes": [
    { "id": "r1", "tipo": "good", "titulo": "Candidato a promoção em Q1 2026", "descricao": "Indicadores consistentes por 3 ciclos consecutivos. Avaliar sucessão para Coordenador." },
    { "id": "r2", "tipo": "warn", "titulo": "Fortalecer PCO com trilha de liderança", "descricao": "PCO 7pp abaixo da meta. Recomendar módulo \"Gestão de Stakeholders\" — disponível no LMS." },
    { "id": "r3", "tipo": "info", "titulo": "Incluir em programa de mentoria reversa", "descricao": "PDAA acima de 90% — perfil adequado para compartilhamento de boas práticas com novos gerentes." }
  ],
  "timeline": [
    { "id": "t1", "tipo": "good", "titulo": "Promoção para Gerente Sênior", "meta": "Diretoria de Excelência Operacional · Aumento salarial 18%", "data": "Mar 2024", "ordem": 7 },
    { "id": "t2", "tipo": "info", "titulo": "Conclusão: Liderança Ágil (96h)", "meta": "Nota final: 9,2 · Certificado emitido · PDI cumprido", "data": "Nov 2023", "ordem": 6 },
    { "id": "t3", "tipo": "good", "titulo": "Avaliação de desempenho — destaque", "meta": "Score: 4,7/5 · Reconhecimento público na diretoria", "data": "Set 2023", "ordem": 5 },
    { "id": "t4", "tipo": "warn", "titulo": "Feedback formal — gestão de prazo", "meta": "Atraso em entrega estratégica · Plano de ação elaborado · Resolvido", "data": "Jun 2023", "ordem": 4 },
    { "id": "t5", "tipo": "info", "titulo": "Treinamento: Análise de Dados Avançada", "meta": "40h · Concluído · Aplicado em projeto de BI setorial", "data": "Fev 2023", "ordem": 3 },
    { "id": "t6", "tipo": "good", "titulo": "Promoção para Gerente de Operações", "meta": "Primeira gestão de equipe (7 pessoas) · Transição bem avaliada", "data": "Jan 2022", "ordem": 2 },
    { "id": "t7", "tipo": "bad", "titulo": "Advertência verbal registrada", "meta": "Conflito interpessoal com par · Mediação concluída · Caso encerrado", "data": "Ago 2021", "ordem": 1 }
  ],
  "kpisPorCiclo": [
    { "ciclo": "2022", "engajamento": 72, "pco": 65, "pdaa": 78, "entregas": 80 },
    { "ciclo": "2023", "engajamento": 80, "pco": 70, "pdaa": 85, "entregas": 88 },
    { "ciclo": "2024", "engajamento": 87, "pco": 73, "pdaa": 91, "entregas": 94 }
  ],
  "competencias": [
    { "eixo": "Liderança", "valor": 82 },
    { "eixo": "Comunicação", "valor": 74 },
    { "eixo": "Análise", "valor": 91 },
    { "eixo": "Execução", "valor": 94 },
    { "eixo": "Inovação", "valor": 78 },
    { "eixo": "Colaboração", "valor": 88 }
  ],
  "tendenciaScore": [
    { "trimestre": "Q1 23", "score": 68 },
    { "trimestre": "Q2 23", "score": 72 },
    { "trimestre": "Q3 23", "score": 76 },
    { "trimestre": "Q4 23", "score": 80 },
    { "trimestre": "Q1 24", "score": 82 },
    { "trimestre": "Q2 24", "score": 84 },
    { "trimestre": "Q3 24", "score": 88 },
    { "trimestre": "Q4 24", "score": 91 }
  ],
  "dadosPessoais": {
    "admissao": "08/03/2019",
    "regime": "CLT · Integral",
    "formacao": "Eng. de Produção · UFRN",
    "gestor": "Ana Paula Saraiva",
    "faixaSalarial": "F4 · confidencial"
  },
  "pdi": [
    { "id": "p1", "titulo": "Liderança situacional", "progresso": 80 },
    { "id": "p2", "titulo": "Gestão de stakeholders", "progresso": 45 },
    { "id": "p3", "titulo": "Comunicação executiva", "progresso": 65 },
    { "id": "p4", "titulo": "Análise de dados", "progresso": 90 }
  ],
  "feedbacks": [
    { "id": "f1", "autor": "Ana Paula Saraiva", "papel": "Gestora direta", "data": "Out 2024", "texto": "Carlos demonstra alta capacidade de mobilizar equipe em momentos de pressão. Entregou o projeto X3 com 2 dias de antecedência e qualidade reconhecida pela diretoria.", "categorias": ["positivo", "gestor"], "tags": [{ "label": "Entrega", "tone": "good" }, { "label": "Liderança", "tone": "info" }] },
    { "id": "f2", "autor": "Rodrigo Figueiredo", "papel": "Par de mesma faixa", "data": "Set 2024", "texto": "Em reuniões com stakeholders externos, Carlos poderia ser mais assertivo na defesa de prazos. Há espaço para desenvolver negociação em cenários de alta ambiguidade.", "categorias": ["desenvolvimento"], "tags": [{ "label": "Comunicação", "tone": "warn" }, { "label": "Negociação", "tone": "warn" }] },
    { "id": "f3", "autor": "Fernanda Luz", "papel": "Liderada direta", "data": "Ago 2024", "texto": "Gestão de 1:1s consistente, feedbacks claros e ambiente psicologicamente seguro. Melhor gestor que tive na empresa.", "categorias": ["positivo"], "tags": [{ "label": "Clima", "tone": "good" }, { "label": "Gestão de pessoas", "tone": "good" }] }
  ],
  "auditoria": [
    { "id": "a1", "quando": "04/06/2025 09:12", "acao": "Visualização do dossiê completo", "ator": "Ana P. Saraiva", "tone": "info" },
    { "id": "a2", "quando": "01/06/2025 14:37", "acao": "Exportação de relatório parcial", "ator": "RH Corporativo", "tone": "good" },
    { "id": "a3", "quando": "28/05/2025 10:05", "acao": "Atualização de PDI — ciclo 2024", "ator": "Ana P. Saraiva", "tone": "info" },
    { "id": "a4", "quando": "20/05/2025 16:22", "acao": "Tentativa de exportação bloqueada", "ator": "Acesso negado", "tone": "bad" },
    { "id": "a5", "quando": "15/05/2025 08:50", "acao": "Registro de feedback — ciclo Q2", "ator": "RH Corporativo", "tone": "good" }
  ],
  "perfisAcesso": [
    { "id": "pa1", "nome": "Ana Paula Saraiva", "permissao": "Gestora direta · Leitura + Edição PDI", "tone": "info" },
    { "id": "pa2", "nome": "RH Corporativo", "permissao": "Leitura completa + Exportação", "tone": "good" },
    { "id": "pa3", "nome": "Dir. de Excelência Operacional", "permissao": "Leitura — KPIs e recomendações", "tone": "info" },
    { "id": "pa4", "nome": "Compliance", "permissao": "Somente log de auditoria", "tone": "warn" },
    { "id": "pa5", "nome": "Carlos E. Menezes (titular)", "permissao": "Visualização parcial — sem histórico disciplinar", "tone": "warn" }
  ]
}
$json$::jsonb
)
on conflict (id) do update set
  nome = excluded.nome,
  cargo = excluded.cargo,
  area = excluded.area,
  matricula = excluded.matricula,
  iniciais = excluded.iniciais,
  acesso_restrito = excluded.acesso_restrito,
  sso_mfa = excluded.sso_mfa,
  dados = excluded.dados;
