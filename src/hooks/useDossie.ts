import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { MOCK_MEMBROS, criarDossieBase } from '@/lib/mockData'
import type { Colaborador, Dossie } from '@/lib/types'

export type DataSource = 'supabase' | 'mock'

interface UseDossieResult {
  dossie: Dossie | null
  membros: Pick<Colaborador, 'id' | 'nome' | 'cargo' | 'area' | 'iniciais'>[]
  allDossies: Dossie[] // todos os dossiês (mock mode apenas)
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  addMembro: (colab: Colaborador) => void
  removeMembro: (id: string) => void
  /** Resolve o id do dossiê vinculado a um e-mail (mock local ou Supabase). Usado no login do membro comum. */
  resolveIdByEmail: (email: string) => Promise<string | null>
  loading: boolean
  error: string | null
  source: DataSource
}

// Formato de linha da tabela `colaboradores` (ver supabase/schema.sql).
interface ColaboradorRow {
  id: string
  nome: string
  cargo: string
  area: string
  matricula: string
  iniciais: string
  acesso_restrito: boolean
  sso_mfa: boolean
  email: string | null
  dados: Omit<Dossie, 'colaborador'>
}

const [mockDossie0] = MOCK_MEMBROS
function rowToDossie(row: ColaboradorRow): Dossie {
  const { colaborador: _mockColab, ...mockRest } = mockDossie0
  const merged = { ...mockRest, ...row.dados }
  const ciclosOk =
    Array.isArray(merged.kpisPorCiclo) &&
    merged.kpisPorCiclo.length > 0 &&
    merged.kpisPorCiclo.every((c) => typeof c.ano === 'number')
  if (!ciclosOk) merged.kpisPorCiclo = mockRest.kpisPorCiclo

  return {
    ...merged,
    colaborador: {
      id: row.id,
      nome: row.nome,
      cargo: row.cargo,
      area: row.area,
      matricula: row.matricula,
      iniciais: row.iniciais,
      acessoRestrito: row.acesso_restrito,
      ssoMfa: row.sso_mfa,
      email: row.email ?? undefined,
    },
  }
}

const LS_EXTRAS = 'dossie_membros_extras'

function loadExtras(): Dossie[] {
  try { return JSON.parse(localStorage.getItem(LS_EXTRAS) ?? '[]') } catch { return [] }
}
function saveExtras(extras: Dossie[]) {
  localStorage.setItem(LS_EXTRAS, JSON.stringify(extras))
}

const source: DataSource = isSupabaseConfigured ? 'supabase' : 'mock'

export function useDossie(): UseDossieResult {
  // Mock extras (membros criados pelo coordenador)
  const [extras, setExtras] = useState<Dossie[]>(loadExtras)

  const allMock: Dossie[] = [...MOCK_MEMBROS, ...extras]

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dossie, setDossie] = useState<Dossie | null>(null)
  const [supabaseMembros, setSupabaseMembros] = useState<UseDossieResult['membros']>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mockMembros = allMock.map((d) => ({
    id: d.colaborador.id,
    nome: d.colaborador.nome,
    cargo: d.colaborador.cargo,
    area: d.colaborador.area,
    iniciais: d.colaborador.iniciais,
  }))

  // Lista de membros exposta para a HomeView — sempre inclui mock + extras
  const membros: UseDossieResult['membros'] = isSupabaseConfigured
    ? [...mockMembros, ...supabaseMembros.filter((s) => !allMock.some((m) => m.colaborador.id === s.id))]
    : mockMembros

  // Carrega lista do Supabase (só quando configurado)
  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase
      .from('colaboradores')
      .select('id, nome, cargo, area, iniciais')
      .order('nome', { ascending: true })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) { setError(err.message); return }
        setSupabaseMembros((data ?? []) as UseDossieResult['membros'])
      })
    return () => { active = false }
  }, [])

  // Carrega o dossiê quando selectedId ou extras mudam
  useEffect(() => {
    if (!selectedId) { setDossie(null); return }

    setLoading(true)
    setError(null)

    // Sempre tenta local primeiro (mock + extras criados pelo coordenador)
    const all = [...MOCK_MEMBROS, ...extras]
    const local = all.find((d) => d.colaborador.id === selectedId) ?? null
    if (local || !supabase) {
      setDossie(local)
      setLoading(false)
      return
    }

    // Só vai ao Supabase se o id não existe localmente
    let active = true
    supabase
      .from('colaboradores')
      .select('*')
      .eq('id', selectedId)
      .single()
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) { setError(err.message); setLoading(false); return }
        setDossie(rowToDossie(data as ColaboradorRow))
        setLoading(false)
      })

    return () => { active = false }
  }, [selectedId, extras])

  function addMembro(colab: Colaborador) {
    const novo = criarDossieBase(colab)
    const updated = [...extras, novo]
    setExtras(updated)
    saveExtras(updated)
    setSelectedId(colab.id)

    // Best-effort: também persiste no Supabase (quando configurado), pra que o
    // e-mail do novo membro já fique vinculável a um login real. Se falhar
    // (ex.: id/e-mail duplicado), o membro segue disponível localmente.
    if (supabase) {
      const { colaborador: _c, ...dados } = novo
      supabase
        .from('colaboradores')
        .insert({
          id: colab.id,
          nome: colab.nome,
          cargo: colab.cargo,
          area: colab.area,
          matricula: colab.matricula,
          iniciais: colab.iniciais,
          acesso_restrito: colab.acessoRestrito,
          sso_mfa: colab.ssoMfa,
          email: colab.email || null,
          dados,
        })
        .then(({ error: err }) => {
          if (err) console.warn('Não foi possível salvar o novo membro no Supabase:', err.message)
        })
    }
  }

  function removeMembro(id: string) {
    // Membros mock fixos não podem ser removidos
    const isMock = MOCK_MEMBROS.some((d) => d.colaborador.id === id)
    if (isMock) return
    const updated = extras.filter((d) => d.colaborador.id !== id)
    setExtras(updated)
    saveExtras(updated)
  }

  async function resolveIdByEmail(email: string): Promise<string | null> {
    const local = allMock.find((d) => d.colaborador.email === email)
    if (local) return local.colaborador.id
    if (!supabase) return null
    // RLS já restringe: um membro comum só enxerga a própria linha.
    const { data } = await supabase.from('colaboradores').select('id').eq('email', email).maybeSingle()
    return (data as { id: string } | null)?.id ?? null
  }

  return {
    dossie,
    membros,
    allDossies: allMock,
    selectedId,
    setSelectedId,
    addMembro,
    removeMembro,
    resolveIdByEmail,
    loading,
    error,
    source,
  }
}
