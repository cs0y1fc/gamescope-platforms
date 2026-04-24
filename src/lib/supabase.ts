import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type FavoritePlatform = {
  id: number
  rawg_id: number
  name: string
  slug: string
  created_at: string
}

export type DbPlatform = {
  id: number
  rawg_id: number
  name: string
  slug: string
  games_count: number
  image_background_url: string | null
  image_local_url: string | null
  year_start: number | null
  year_end: number | null
  updated_at: string
}

export type SyncState = {
  id: number
  last_synced_at: string | null
  platforms_count: number
}

let _client: SupabaseClient | null = null
let _admin: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  if (!_client) _client = createClient(url, key)
  return _client
}

// Service-role client for server-side storage writes (never exposed to browser)
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return getSupabase()
  if (!_admin) _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _admin
}
