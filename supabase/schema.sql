-- ============================================================================
-- CONSEJ — Dossiê Individual · Schema Supabase
-- ----------------------------------------------------------------------------
-- Como usar:
--   1. Supabase Dashboard > seu projeto > SQL Editor > New query
--   2. Cole TODO este arquivo e clique em "Run".
--   3. A tabela `colaboradores` é criada/atualizada (upsert) com RLS + seed.
-- Re-rodar é seguro: o seed usa "on conflict do update".
-- ============================================================================

-- 1. Tabela principal -------------------------------------------------------
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

-- 3. RLS — leitura pública (MVP). Para RH real, exija autenticação.
alter table public.colaboradores enable row level security;

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
  'Coordenador de Projetos Jurídicos',
  'Diretoria de Operações',
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
    { "id": "r2", "tipo": "warn", "titulo": "Fortalecer PCO com trilha de liderança", "descricao": "PCO 7pp abaixo da meta. Recomendar módulo Gestão de Stakeholders — disponível na trilha interna." },
    { "id": "r3", "tipo": "info", "titulo": "Incluir em programa de mentoria reversa", "descricao": "PDAA acima de 90% — perfil adequado para compartilhamento de boas práticas com novos membros." },
    { "id": "r4", "tipo": "good", "titulo": "Desenvolver negociação em cenários ambíguos", "descricao": "Ponto levantado em feedback de pares. Sugerir participação em rodadas de simulação com clientes." }
  ],
  "timeline": [
    { "id": "t1", "tipo": "good", "titulo": "Promoção para Coordenador de Projetos", "meta": "Diretoria de Operações · Primeira coordenação de squad (5 membros)", "data": "Mar 2024", "ordem": 7 },
    { "id": "t2", "tipo": "info", "titulo": "Conclusão: Liderança Ágil (96h)", "meta": "Nota final: 9,2 · Certificado emitido · PDI cumprido", "data": "Nov 2023", "ordem": 6 },
    { "id": "t3", "tipo": "good", "titulo": "Avaliação de desempenho — destaque", "meta": "Score: 4,7/5 · Reconhecimento público na diretoria", "data": "Set 2023", "ordem": 5 },
    { "id": "t4", "tipo": "warn", "titulo": "Feedback formal — gestão de prazo", "meta": "Atraso em entrega estratégica · Plano de ação elaborado · Resolvido", "data": "Jun 2023", "ordem": 4 },
    { "id": "t5", "tipo": "info", "titulo": "Treinamento: Análise de Dados Aplicada", "meta": "40h · Concluído · Aplicado em projeto de BI interno", "data": "Fev 2023", "ordem": 3 },
    { "id": "t6", "tipo": "good", "titulo": "Transição para Diretoria de Gente & Gestão", "meta": "Liderança de processo seletivo · Onboarding de 12 membros", "data": "Jan 2023", "ordem": 2 },
    { "id": "t7", "tipo": "info", "titulo": "Entrada na CONSEJ", "meta": "Diretoria Comercial · Trainee de prospecção", "data": "Mar 2022", "ordem": 1 }
  ],
  "kpisPorCiclo": [
    { "ano": 2024, "ciclo": "C1", "engajamento": 78, "pco": 66, "pdaa": 80, "entregas": 82 },
    { "ano": 2024, "ciclo": "C2", "engajamento": 81, "pco": 69, "pdaa": 83, "entregas": 85 },
    { "ano": 2024, "ciclo": "C3", "engajamento": 84, "pco": 71, "pdaa": 87, "entregas": 88 },
    { "ano": 2024, "ciclo": "C4", "engajamento": 86, "pco": 72, "pdaa": 89, "entregas": 90 },
    { "ano": 2025, "ciclo": "C1", "engajamento": 85, "pco": 70, "pdaa": 88, "entregas": 89 },
    { "ano": 2025, "ciclo": "C2", "engajamento": 86, "pco": 72, "pdaa": 90, "entregas": 91 },
    { "ano": 2025, "ciclo": "C3", "engajamento": 88, "pco": 73, "pdaa": 90, "entregas": 93 },
    { "ano": 2025, "ciclo": "C4", "engajamento": 89, "pco": 75, "pdaa": 92, "entregas": 94 },
    { "ano": 2026, "ciclo": "C1", "engajamento": 87, "pco": 73, "pdaa": 91, "entregas": 94 },
    { "ano": 2026, "ciclo": "C2", "engajamento": 90, "pco": 76, "pdaa": 93, "entregas": 95 },
    { "ano": 2026, "ciclo": "C3", "engajamento": 91, "pco": 78, "pdaa": 94, "entregas": 96 },
    { "ano": 2026, "ciclo": "C4", "engajamento": 92, "pco": 80, "pdaa": 95, "entregas": 97 }
  ],
  "competencias": [
    { "eixo": "Comunicação", "valor": 78 },
    { "eixo": "Liderança", "valor": 85 },
    { "eixo": "Colaboração", "valor": 88 },
    { "eixo": "Proatividade", "valor": 90 },
    { "eixo": "Execução", "valor": 94 },
    { "eixo": "Adaptabilidade", "valor": 81 }
  ],
  "tendenciaScore": [
    { "trimestre": "Q1 24", "score": 78 },
    { "trimestre": "Q2 24", "score": 81 },
    { "trimestre": "Q3 24", "score": 84 },
    { "trimestre": "Q4 24", "score": 86 },
    { "trimestre": "Q1 25", "score": 85 },
    { "trimestre": "Q2 25", "score": 87 },
    { "trimestre": "Q3 25", "score": 89 },
    { "trimestre": "Q4 25", "score": 91 }
  ],
  "perfil": {
    "dataEntrada": "Mar 2022",
    "nascimento": "14/07/2002",
    "celular": "(84) 99812-3045",
    "email": "carlos.menezes@consej.com.br",
    "diretoriaAtual": "Diretoria de Operações",
    "coordenadoriaAtual": "Coordenadoria de Projetos Jurídicos",
    "diretoriasAnteriores": [
      { "diretoria": "Diretoria Comercial", "periodo": "Mar 2022 – Dez 2022" },
      { "diretoria": "Diretoria de Gente & Gestão", "periodo": "Jan 2023 – Fev 2024" }
    ],
    "curso": "Direito · UFRN",
    "periodoCurso": "8º período",
    "perfilComportamental": "Executor · DISC: D/C",
    "arquetipo": "O Realizador",
    "interesses": ["Direito empresarial", "Gestão de projetos", "Mentoria", "Dados & BI"]
  },
  "pdi": [
    { "id": "p1", "titulo": "Liderança situacional", "progresso": 80 },
    { "id": "p2", "titulo": "Gestão de stakeholders", "progresso": 45 },
    { "id": "p3", "titulo": "Comunicação executiva", "progresso": 65 },
    { "id": "p4", "titulo": "Análise de dados", "progresso": 90 }
  ],
  "feedbacks": [
    { "id": "f1", "autor": "Ana Paula Saraiva", "papel": "Gestora direta", "data": "Out 2024", "texto": "Carlos demonstra alta capacidade de mobilizar a equipe em momentos de pressão. Entregou o projeto X3 com 2 dias de antecedência e qualidade reconhecida pela diretoria. Como próximo passo, ganharia muito desenvolvendo assertividade na defesa de prazos com stakeholders externos.", "categorias": ["positivo", "gestor"], "tags": [{ "label": "Entrega", "tone": "good" }, { "label": "Liderança", "tone": "info" }] }
  ],
  "auditoria": [
    { "id": "a1", "quando": "04/06/2025 09:12", "acao": "Visualização do dossiê completo", "ator": "Ana P. Saraiva", "tone": "info" },
    { "id": "a2", "quando": "01/06/2025 14:37", "acao": "Exportação de relatório parcial", "ator": "Gente & Gestão", "tone": "good" },
    { "id": "a3", "quando": "28/05/2025 10:05", "acao": "Atualização de PDI — ciclo 2024", "ator": "Ana P. Saraiva", "tone": "info" },
    { "id": "a4", "quando": "20/05/2025 16:22", "acao": "Tentativa de exportação bloqueada", "ator": "Acesso negado", "tone": "bad" },
    { "id": "a5", "quando": "15/05/2025 08:50", "acao": "Registro de feedback — ciclo Q2", "ator": "Gente & Gestão", "tone": "good" }
  ],
  "perfisAcesso": [
    { "id": "pa1", "nome": "Ana Paula Saraiva", "permissao": "Gestora direta · Leitura + Edição PDI", "tone": "info" },
    { "id": "pa2", "nome": "Diretoria de Gente & Gestão", "permissao": "Leitura completa + Exportação", "tone": "good" },
    { "id": "pa3", "nome": "Diretoria de Operações", "permissao": "Leitura — KPIs e recomendações", "tone": "info" },
    { "id": "pa4", "nome": "Conselho", "permissao": "Somente log de auditoria", "tone": "warn" },
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
