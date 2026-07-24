// Gera um SQL de migração único (upsert) pra inserir todos os membros hoje
// só locais (MOCK_MEMBROS) na tabela `colaboradores` do Supabase de verdade.
// Rodar: npx tsx scripts/gerar-migracao-supabase.ts > migracao-membros.sql
import { MOCK_MEMBROS } from '../src/lib/mockData'

function sqlString(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  return `'${String(v).replace(/'/g, "''")}'`
}

function sqlJson(v: unknown): string {
  return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
}

const linhas = MOCK_MEMBROS.map((d) => {
  const { colaborador, ...dados } = d
  return `  (${sqlString(colaborador.id)}, ${sqlString(colaborador.nome)}, ${sqlString(colaborador.cargo)}, ${sqlString(colaborador.area)}, ${sqlString(colaborador.matricula || '')}, ${sqlString(colaborador.iniciais)}, ${colaborador.acessoRestrito ?? false}, ${colaborador.ssoMfa ?? false}, ${sqlString(colaborador.email ?? null)}, ${sqlJson(dados)})`
})

const sql = `-- Migração única: insere (ou atualiza) todos os membros do organograma
-- na tabela colaboradores do Supabase. Gerado a partir de src/lib/mockData.ts.
-- Rode isso inteiro no SQL Editor do Supabase, uma vez só.

insert into public.colaboradores
  (id, nome, cargo, area, matricula, iniciais, acesso_restrito, sso_mfa, email, dados)
values
${linhas.join(',\n')}
on conflict (id) do update set
  nome = excluded.nome,
  cargo = excluded.cargo,
  area = excluded.area,
  matricula = excluded.matricula,
  iniciais = excluded.iniciais,
  acesso_restrito = excluded.acesso_restrito,
  sso_mfa = excluded.sso_mfa,
  email = coalesce(excluded.email, public.colaboradores.email),
  dados = public.colaboradores.dados || excluded.dados;
`

console.log(sql)
