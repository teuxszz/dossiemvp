import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { MOCK_DOSSIE } from '@/lib/mockData'
import type { Colaborador, Dossie } from '@/lib/types'

export type DataSource = 'supabase' | 'mock'

interface UseDossieResult {
  dossie: Dossie | null
  colaboradores: Pick<Colaborador, 'id' | 'nome' | 'cargo' | 'iniciais'>[]
  selectedId: string | null
  setSelectedId: (id: string) => void
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
  dados: Omit<Dossie, 'colaborador'>
}

function rowToDossie(row: ColaboradorRow): Dossie {
  return {
    colaborador: {
      id: row.id,
      nome: row.nome,
      cargo: row.cargo,
      area: row.area,
      matricula: row.matricula,
      iniciais: row.iniciais,
      acessoRestrito: row.acesso_restrito,
      ssoMfa: row.sso_mfa,
    },
    ...row.dados,
  }
}

const source: DataSource = isSupabaseConfigured ? 'supabase' : 'mock'

export function useDossie(): UseDossieResult {
  const [colaboradores, setColaboradores] = useState<UseDossieResult['colaboradores']>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dossie, setDossie] = useState<Dossie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 1. Carrega a lista de colaboradores (para o seletor).
  useEffect(() => {
    let active = true

    async function loadList() {
      if (!supabase) {
        const c = MOCK_DOSSIE.colaborador
        setColaboradores([{ id: c.id, nome: c.nome, cargo: c.cargo, iniciais: c.iniciais }])
        setSelectedId(c.id)
        return
      }
      const { data, error: err } = await supabase
        .from('colaboradores')
        .select('id, nome, cargo, iniciais')
        .order('nome', { ascending: true })

      if (!active) return
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      const list = (data ?? []) as UseDossieResult['colaboradores']
      setColaboradores(list)
      setSelectedId((prev) => prev ?? list[0]?.id ?? null)
      if (list.length === 0) setLoading(false)
    }

    loadList()
    return () => {
      active = false
    }
  }, [])

  // 2. Carrega o dossiê do colaborador selecionado.
  useEffect(() => {
    let active = true
    if (!selectedId) return

    async function loadOne() {
      setLoading(true)
      setError(null)

      if (!supabase) {
        if (active) {
          setDossie(MOCK_DOSSIE)
          setLoading(false)
        }
        return
      }

      const { data, error: err } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('id', selectedId)
        .single()

      if (!active) return
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      setDossie(rowToDossie(data as ColaboradorRow))
      setLoading(false)
    }

    loadOne()
    return () => {
      active = false
    }
  }, [selectedId])

  return { dossie, colaboradores, selectedId, setSelectedId, loading, error, source }
}
