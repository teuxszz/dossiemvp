# CONSEJ — Dossiê Individual (MVP)

Painel executivo de dossiê individual: KPIs com gauges, histórico (timeline),
análises (gráficos), detalhes/PDI/feedbacks e controles de acesso/segurança.

Versão melhorada do MVP em HTML, agora como app **React + Vite + TypeScript +
TailwindCSS**, com **dark mode**, gráficos em **Recharts** e dados vindos do
**Supabase** (com fallback automático para dados de exemplo).

## Stack

- React 19 + TypeScript + Vite 8
- TailwindCSS 3 (design tokens em `src/index.css`)
- Recharts (barras, radar, linha)
- Supabase (`@supabase/supabase-js`)
- lucide-react (ícones)

## Rodar localmente

```bash
npm install
npm run dev          # http://localhost:5173
```

Sem `.env.local`, o app abre com **dados de exemplo** (badge "Dados de exemplo"
no header). Para ligar o Supabase, veja abaixo.

```bash
npm run build        # type-check + bundle de produção em dist/
npm run preview      # serve o dist/ localmente
```

---

## 🚀 Como hospedar (passo a passo)

Você precisa de **3 contas grátis**: GitHub, Vercel e Supabase. A ordem
recomendada é **Supabase → GitHub → Vercel**.

### 1) Supabase — criar o banco

> Sim, para um projeto novo e separado o ideal é um **projeto Supabase novo**
> (não reaproveite o do CRM, para não misturar dados de RH com o CRM).

1. Acesse <https://supabase.com> → **New project**.
2. Defina nome (ex.: `consej-dossie`), senha do banco e região (ex.: `South America (São Paulo)`).
3. Espere ~2 min provisionar.
4. Menu lateral **SQL Editor → New query** → cole TODO o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   Isso cria a tabela `colaboradores`, ativa RLS e insere 1 colaborador de exemplo.
5. Pegue as credenciais em **Project Settings → API**:
   - **Project URL** → vira `VITE_SUPABASE_URL`
   - **anon public** (Project API keys) → vira `VITE_SUPABASE_ANON_KEY`

   > Use SEMPRE a chave **anon** no front-end. Nunca exponha a `service_role`.

6. Teste local: copie `.env.example` para `.env.local`, cole os dois valores e
   rode `npm run dev`. O badge no header deve virar **"Supabase"** (verde).

### 2) GitHub — criar o repositório

> Sim, crie um **repositório novo** (este app é separado do CRM).

```bash
cd "D:/consej-dossie"
git init
git add .
git commit -m "feat: MVP dossiê individual (React+Vite+Supabase)"
git branch -M main
```

Crie o repo no GitHub (via site **New repository**, ou com o GitHub CLI):

```bash
# opção A — GitHub CLI (se tiver `gh` instalado e logado):
gh repo create consej-dossie --private --source=. --remote=origin --push

# opção B — manual: crie o repo vazio no site, depois:
git remote add origin https://github.com/SEU_USUARIO/consej-dossie.git
git push -u origin main
```

> `.gitignore` já protege `node_modules`, `dist` e **`.env.local`** — suas chaves
> não vão para o GitHub.

### 3) Vercel — publicar

> Sim, crie um **projeto novo na Vercel** (um por repositório). É separado do
> projeto do CRM.

1. Acesse <https://vercel.com> → **Add New… → Project**.
2. **Import** o repositório `consej-dossie` do GitHub (autorize a Vercel no GitHub se pedir).
3. A Vercel detecta Vite sozinha. Confirme:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Em **Environment Variables**, adicione as duas (mesmos valores do `.env.local`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Deploy**. Em ~1 min você recebe uma URL `https://consej-dossie-xxxx.vercel.app`.

A partir daí, **todo `git push` na branch `main` redeploya automaticamente**.

> Mudou variável de ambiente depois? Em **Settings → Environment Variables**,
> edite e clique em **Redeploy** (variáveis `VITE_*` entram no bundle em build-time).

---

## Adicionar mais colaboradores

Insira novas linhas na tabela `colaboradores` (SQL Editor do Supabase). O campo
`dados` (JSONB) segue o formato do seed em `supabase/schema.sql`. Quando há mais
de um colaborador, o header mostra um **seletor** para alternar entre eles.

## Estrutura

```
src/
  App.tsx                 # orquestra header, tabs e estado
  hooks/
    useDossie.ts          # busca Supabase ou cai no mock
    useTheme.ts           # dark mode
  lib/
    supabase.ts           # client (null se sem env vars)
    types.ts              # tipos de domínio
    mockData.ts           # dados de exemplo / seed
    ui.ts                 # helpers de cor/tom + cn()
  components/
    Header.tsx  Tabs.tsx  Card.tsx  KpiCard.tsx  Gauge.tsx
    charts/Charts.tsx     # recharts (barra/radar/linha)
    tabs/                 # VisaoGeral, Historico, Analise, Detalhes, Seguranca
supabase/
  schema.sql              # tabela + RLS + seed (rode no SQL Editor)
```

## ⚠️ Nota de segurança (RH)

A policy de RLS do MVP libera **leitura pública**. Para dados reais de RH, troque
no `schema.sql` por uma policy que exija autenticação
(`using ( auth.role() = 'authenticated' )`) e adicione login antes de ir a sério.
