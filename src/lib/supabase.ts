import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// O app roda mesmo sem Supabase configurado: nesse caso `supabase` é null
// e os hooks caem no mock (src/lib/mockData.ts). Assim que você preencher
// VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (em .env.local ou na Vercel),
// o app passa a ler do banco automaticamente.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null
