import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { MOCK_MEMBROS, criarDossieBase } from '@/lib/mockData'
import type { Colaborador, Dossie } from '@/lib/types'

export type DataSource = 'supabase' | 'mock'

interface UseDossieResult {
  dossie: Dossie | null
  membros: Pick<Colaborador, 'id' | 'nome' | 'cargo' | 'area' | 'iniciais' | 'cargoSecundario' | 'areaSecundaria'>[]
  allDossies: Dossie[] // todos os dossiês (mock mode apenas)
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  addMembro: (colab: Colaborador) => void
  removeMembro: (id: string) => void
  /** Atualiza cargo/diretoria (ou outros campos do colaborador) de um membro existente. */
  updateMembro: (id: string, patch: Partial<Colaborador>) => void
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
const LS_REMOVIDOS = 'dossie_membros_removidos'

function loadExtras(): Dossie[] {
  try { return JSON.parse(localStorage.getItem(LS_EXTRAS) ?? '[]') } catch { return [] }
}
function saveExtras(extras: Dossie[]) {
  localStorage.setItem(LS_EXTRAS, JSON.stringify(extras))
}

// Ids removidos pelo admin. Os membros "de fábrica" (MOCK_MEMBROS) vivem num
// array const no código — não dá pra tirar item dali em runtime, então
// guardamos os ids removidos aqui e filtramos em todo lugar que lista membros.
function loadRemovidos(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LS_REMOVIDOS) ?? '[]')) } catch { return new Set() }
}
function saveRemovidos(ids: Set<string>) {
  localStorage.setItem(LS_REMOVIDOS, JSON.stringify([...ids]))
}

const LS_EDITS = 'dossie_membros_edits'

// Alterações (cargo/diretoria etc.) feitas em membros "de fábrica"
// (MOCK_MEMBROS) — mesmo problema da remoção: não dá pra mutar o array
// const, então guardamos um patch por id e aplicamos por cima em tudo que
// lista/lê membros.
function loadEdits(): Record<string, Partial<Colaborador>> {
  try { return JSON.parse(localStorage.getItem(LS_EDITS) ?? '{}') } catch { return {} }
}
function saveEdits(edits: Record<string, Partial<Colaborador>>) {
  localStorage.setItem(LS_EDITS, JSON.stringify(edits))
}
function aplicarEdits(d: Dossie, edits: Record<string, Partial<Colaborador>>): Dossie {
  const patch = edits[d.colaborador.id]
  if (!patch) return d
  return { ...d, colaborador: { ...d.colaborador, ...patch } }
}

const source: DataSource = isSupabaseConfigured ? 'supabase' : 'mock'

export function useDossie(): UseDossieResult {
  // Mock extras (membros criados pelo coordenador)
  const [extras, setExtras] = useState<Dossie[]>(loadExtras)
  const [removidos, setRemovidos] = useState<Set<string>>(loadRemovidos)
  const [edits, setEdits] = useState<Record<string, Partial<Colaborador>>>(loadEdits)

  const allMock: Dossie[] = [...MOCK_MEMBROS, ...extras]
    .filter((d) => !removidos.has(d.colaborador.id))
    .map((d) => aplicarEdits(d, edits))

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
    cargoSecundario: d.colaborador.cargoSecundario,
    areaSecundaria: d.colaborador.areaSecundaria,
  }))

  // Lista de membros exposta para a HomeView — sempre inclui mock + extras
  const membros: UseDossieResult['membros'] = isSupabaseConfigured
    ? [...mockMembros, ...supabaseMembros.filter((s) => !allMock.some((m) => m.colaborador.id === s.id) && !removidos.has(s.id))]
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
    if (!selectedId || removidos.has(selectedId)) { setDossie(null); return }

    setLoading(true)
    setError(null)

    // Sempre tenta local primeiro (mock + extras criados pelo coordenador)
    const local = allMock.find((d) => d.colaborador.id === selectedId) ?? null
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
  }, [selectedId, extras, removidos, edits])

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
    if (selectedId === id) setSelectedId(null)

    // Membro criado neste navegador (extras) — tira da lista local.
    if (extras.some((d) => d.colaborador.id === id)) {
      const updated = extras.filter((d) => d.colaborador.id !== id)
      setExtras(updated)
      saveExtras(updated)
      return
    }

    // Membro "de fábrica" (MOCK_MEMBROS, incluindo o quadro importado do
    // organograma) — não dá pra tirar do array const, então marca como
    // removido e filtra em toda listagem daqui pra frente.
    if (MOCK_MEMBROS.some((d) => d.colaborador.id === id)) {
      const updated = new Set(removidos)
      updated.add(id)
      setRemovidos(updated)
      saveRemovidos(updated)
      return
    }

    // Membro que só existe no Supabase — remove de verdade lá (RLS exige admin).
    setSupabaseMembros((prev) => prev.filter((m) => m.id !== id))
    if (supabase) {
      supabase
        .from('colaboradores')
        .delete()
        .eq('id', id)
        .then(({ error: err }) => {
          if (err) console.warn('Não foi possível remover no Supabase:', err.message)
        })
    }
  }

  function updateMembro(id: string, patch: Partial<Colaborador>) {
    // Membro criado neste navegador (extras) — edita o dossiê guardado ali.
    const extraIdx = extras.findIndex((d) => d.colaborador.id === id)
    if (extraIdx >= 0) {
      const updated = extras.map((d, i) => (i === extraIdx ? { ...d, colaborador: { ...d.colaborador, ...patch } } : d))
      setExtras(updated)
      saveExtras(updated)
      if (dossie?.colaborador.id === id) setDossie((prev) => (prev ? { ...prev, colaborador: { ...prev.colaborador, ...patch } } : prev))
      return
    }

    // Membro "de fábrica" — guarda o patch por cima (ver aplicarEdits).
    if (MOCK_MEMBROS.some((d) => d.colaborador.id === id)) {
      const updatedEdits = { ...edits, [id]: { ...edits[id], ...patch } }
      setEdits(updatedEdits)
      saveEdits(updatedEdits)
      if (dossie?.colaborador.id === id) setDossie((prev) => (prev ? { ...prev, colaborador: { ...prev.colaborador, ...patch } } : prev))
      return
    }

    // Membro que só existe no Supabase — atualiza de verdade lá (RLS exige admin).
    setSupabaseMembros((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
    if (dossie?.colaborador.id === id) setDossie((prev) => (prev ? { ...prev, colaborador: { ...prev.colaborador, ...patch } } : prev))
    if (supabase) {
      const dbPatch: Record<string, unknown> = {}
      if (patch.cargo !== undefined) dbPatch.cargo = patch.cargo
      if (patch.area !== undefined) dbPatch.area = patch.area
      if (patch.nome !== undefined) dbPatch.nome = patch.nome
      if (patch.matricula !== undefined) dbPatch.matricula = patch.matricula
      if (patch.iniciais !== undefined) dbPatch.iniciais = patch.iniciais
      if (patch.email !== undefined) dbPatch.email = patch.email || null
      if (Object.keys(dbPatch).length > 0) {
        supabase
          .from('colaboradores')
          .update(dbPatch)
          .eq('id', id)
          .then(({ error: err }) => {
            if (err) console.warn('Não foi possível atualizar no Supabase:', err.message)
          })
      }
    }
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
    updateMembro,
    resolveIdByEmail,
    loading,
    error,
    source,
  }
}
