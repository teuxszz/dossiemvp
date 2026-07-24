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

-- 3. Login por email/senha (Supabase Auth) ----------------------------------
-- Cada colaborador é vinculado a um usuário do Auth pelo e-mail. Crie o
-- usuário em Authentication > Users (Supabase Dashboard) com esse mesmo
-- e-mail; a coluna abaixo é só o vínculo, a senha fica no Auth.
alter table public.colaboradores add column if not exists email text unique;

-- 3.1 Administradores (RH/liderança) — enxergam e editam todos os dossiês.
create table if not exists public.admins (
  email      text primary key,
  criado_em  timestamptz not null default now()
);
alter table public.admins enable row level security;

-- Função auxiliar: o e-mail autenticado está na lista de admins?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where email = auth.jwt() ->> 'email'
  );
$$;

drop policy if exists "admins leem a tabela admins" on public.admins;
create policy "admins leem a tabela admins"
  on public.admins for select
  using ( public.is_admin() );

drop policy if exists "admins gerenciam admins" on public.admins;
create policy "admins gerenciam admins"
  on public.admins for all
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- IMPORTANTE — bootstrap: a policy acima exige já existir um admin para
-- gerenciar a tabela pela UI. Rode manualmente (uma vez) trocando o e-mail:
--   insert into public.admins (email) values ('seu-email@consej.com.br')
--   on conflict (email) do nothing;

-- 3.2 RLS de colaboradores — admin vê/edita tudo; o próprio membro só lê
--     (e edita campos específicos via as funções da seção 5).
alter table public.colaboradores enable row level security;

drop policy if exists "leitura publica colaboradores" on public.colaboradores;
drop policy if exists "leitura admin ou proprio dossie" on public.colaboradores;
create policy "leitura admin ou proprio dossie"
  on public.colaboradores
  for select
  using ( public.is_admin() or email = auth.jwt() ->> 'email' );

drop policy if exists "admin insere colaboradores" on public.colaboradores;
create policy "admin insere colaboradores"
  on public.colaboradores for insert
  with check ( public.is_admin() );

drop policy if exists "admin atualiza colaboradores" on public.colaboradores;
create policy "admin atualiza colaboradores"
  on public.colaboradores for update
  using ( public.is_admin() )
  with check ( public.is_admin() );

drop policy if exists "admin remove colaboradores" on public.colaboradores;
create policy "admin remove colaboradores"
  on public.colaboradores for delete
  using ( public.is_admin() );

-- 4. Seed --------------------------------------------------------------------
insert into public.colaboradores (id, nome, cargo, area, matricula, iniciais, acesso_restrito, sso_mfa, email, dados)
values (
  'carlos-eduardo-menezes',
  'Carlos Eduardo Menezes',
  'Coordenador de Projetos Jurídicos',
  'Diretoria de Operações',
  '0042318',
  'CM',
  true,
  true,
  'carlos.menezes@consej.com.br',
  $json$
{
  "kpis": [
    { "key": "engajamento", "label": "Engajamento", "value": 87, "status": "good", "sub": "Alto · +5pp vs ciclo anterior" },
    { "key": "pco", "label": "PCO", "value": 73, "status": "warn", "sub": "Moderado · Meta: 80%" },
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
  ],
  "pdaa": {
    "cicloAtual": { "ano": 2026, "ciclo": "C2" },
    "pontuacaoPorCiclo": [
      { "ano": 2024, "ciclo": "C1", "pontos": 4 },
      { "ano": 2024, "ciclo": "C2", "pontos": 6 },
      { "ano": 2024, "ciclo": "C3", "pontos": 9 },
      { "ano": 2024, "ciclo": "C4", "pontos": 5 },
      { "ano": 2025, "ciclo": "C1", "pontos": 3 },
      { "ano": 2025, "ciclo": "C2", "pontos": 7 },
      { "ano": 2025, "ciclo": "C3", "pontos": 5 },
      { "ano": 2025, "ciclo": "C4", "pontos": 2 },
      { "ano": 2026, "ciclo": "C1", "pontos": 6 },
      { "ano": 2026, "ciclo": "C2", "pontos": 8 },
      { "ano": 2026, "ciclo": "C3", "pontos": 0 },
      { "ano": 2026, "ciclo": "C4", "pontos": 0 }
    ],
    "abonosPorCiclo": [
      { "ano": 2024, "ciclo": "C1", "usados": 1 },
      { "ano": 2024, "ciclo": "C2", "usados": 2 },
      { "ano": 2024, "ciclo": "C3", "usados": 1 },
      { "ano": 2024, "ciclo": "C4", "usados": 0 },
      { "ano": 2025, "ciclo": "C1", "usados": 2 },
      { "ano": 2025, "ciclo": "C2", "usados": 1 },
      { "ano": 2025, "ciclo": "C3", "usados": 3 },
      { "ano": 2025, "ciclo": "C4", "usados": 1 },
      { "ano": 2026, "ciclo": "C1", "usados": 1 },
      { "ano": 2026, "ciclo": "C2", "usados": 2 },
      { "ano": 2026, "ciclo": "C3", "usados": 0 },
      { "ano": 2026, "ciclo": "C4", "usados": 0 }
    ],
    "abonosDisponiveis": 5,
    "estagioProbatorioUsado": false,
    "condutasRegistradas": [
      { "id": "rc1", "condutaId": "m1", "categoria": "moderada", "pontos": 2, "descricao": "Faltar (sem justificativa idônea) a RG, RT, 1:1 ou momento CONSEJ" },
      { "id": "rc2", "condutaId": "m5", "categoria": "moderada", "pontos": 2, "descricao": "Passar mais de 2 dias sem interagir em GT ativo" },
      { "id": "rc3", "condutaId": "a5", "categoria": "alerta", "pontos": 3, "descricao": "Atrasar envio de follow-up (conteúdos de valor)" },
      { "id": "rc4", "condutaId": "l2", "categoria": "leve", "pontos": 1, "descricao": "Atrasar ou deixar de responder formulários de pesquisas internas no prazo" }
    ]
  }
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
  email = excluded.email,
  dados = excluded.dados;

-- ============================================================================
-- 5. Auto-edição do próprio membro (funções SECURITY DEFINER)
-- ----------------------------------------------------------------------------
-- Regra: o membro comum só enxerga e nunca edita a linha diretamente (RLS
-- acima bloqueia update). Estas duas funções são a ÚNICA porta de escrita
-- liberada pra ele — cada uma só altera os campos explicitamente permitidos
-- e sempre reduz o alvo à própria linha (email = auth.jwt()->>'email').
-- ============================================================================

-- 5.1 Perfil básico: celular, e-mail de contato e período do curso.
create or replace function public.atualizar_perfil_proprio(
  p_celular       text,
  p_email_contato text,
  p_periodo_curso text,
  p_data_entrada  text default null,
  p_nascimento    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := auth.jwt() ->> 'email';
  v_found boolean;
begin
  if v_email is null then
    raise exception 'Não autenticado.';
  end if;

  update public.colaboradores
  set dados = jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(dados, '{perfil,celular}', to_jsonb(coalesce(p_celular, '')), true),
              '{perfil,email}', to_jsonb(coalesce(p_email_contato, '')), true
            ),
            '{perfil,periodoCurso}', to_jsonb(coalesce(p_periodo_curso, '')), true
          ),
          '{perfil,dataEntrada}', to_jsonb(coalesce(p_data_entrada, dados #>> '{perfil,dataEntrada}', '')), true
        ),
        '{perfil,nascimento}', to_jsonb(coalesce(p_nascimento, dados #>> '{perfil,nascimento}', '')), true
      )
  where email = v_email;

  get diagnostics v_found = row_count;
  if not v_found then
    raise exception 'Nenhum dossiê vinculado a este e-mail.';
  end if;
end;
$$;

grant execute on function public.atualizar_perfil_proprio(text, text, text, text, text) to authenticated;

-- 5.2 Registrar abono PDAA (ação do catálogo, no ciclo atual).
create or replace function public.registrar_abono_proprio(
  p_ano             int,
  p_ciclo           text,
  p_tipo             text,
  p_descricao        text,
  p_pontos_abonados  int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email  text := auth.jwt() ->> 'email';
  v_id     text;
  v_dados  jsonb;
  v_ciclos jsonb;
  v_idx    int;
  v_novo   jsonb;
begin
  if v_email is null then
    raise exception 'Não autenticado.';
  end if;

  select id, dados into v_id, v_dados from public.colaboradores where email = v_email;
  if v_id is null then
    raise exception 'Nenhum dossiê vinculado a este e-mail.';
  end if;

  v_novo := jsonb_build_object(
    'id', 'ab-' || extract(epoch from clock_timestamp())::bigint::text,
    'tipo', p_tipo,
    'descricao', p_descricao,
    'data', to_char(current_date, 'YYYY-MM-DD'),
    'pontosAbonados', p_pontos_abonados
  );

  v_ciclos := coalesce(v_dados #> '{pdaa,abonosPorCiclo}', '[]'::jsonb);

  select i into v_idx
  from jsonb_array_elements(v_ciclos) with ordinality as e(item, i)
  where (e.item ->> 'ano')::int = p_ano and e.item ->> 'ciclo' = p_ciclo
  limit 1;

  if v_idx is null then
    v_ciclos := v_ciclos || jsonb_build_array(jsonb_build_object(
      'ano', p_ano, 'ciclo', p_ciclo, 'usados', 1, 'registros', jsonb_build_array(v_novo)
    ));
  else
    v_ciclos := jsonb_set(
      v_ciclos, array[(v_idx - 1)::text, 'registros'],
      coalesce(v_ciclos -> (v_idx - 1) -> 'registros', '[]'::jsonb) || jsonb_build_array(v_novo),
      true
    );
    v_ciclos := jsonb_set(
      v_ciclos, array[(v_idx - 1)::text, 'usados'],
      to_jsonb(coalesce((v_ciclos -> (v_idx - 1) ->> 'usados')::int, 0) + 1),
      true
    );
  end if;

  update public.colaboradores
  set dados = jsonb_set(v_dados, '{pdaa,abonosPorCiclo}', v_ciclos, true)
  where id = v_id;
end;
$$;

grant execute on function public.registrar_abono_proprio(int, text, text, text, int) to authenticated;
