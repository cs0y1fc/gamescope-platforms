import { getSupabase, getSupabaseAdmin, DbPlatform, SyncState } from './supabase'
import { fetchAllPlatforms } from './rawg'
import { Platform } from './types'

const BUCKET = 'platform-images'
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000

export type SyncStatus = {
  configured: boolean
  lastSyncedAt: string | null
  platformsCount: number
  needsSync: boolean
}

export type SyncResult =
  | { ok: true; synced: true; count: number }
  | { ok: true; synced: false; skippedReason: 'fresh' }
  | { ok: false; error: string }

export async function getSyncStatus(): Promise<SyncStatus> {
  const sb = getSupabase()
  if (!sb) return { configured: false, lastSyncedAt: null, platformsCount: 0, needsSync: false }

  const { data } = await sb
    .from('sync_state')
    .select('last_synced_at, platforms_count')
    .eq('id', 1)
    .single<SyncState>()

  const lastSyncedAt = data?.last_synced_at ?? null
  const elapsed = lastSyncedAt ? Date.now() - new Date(lastSyncedAt).getTime() : Infinity

  return {
    configured: true,
    lastSyncedAt,
    platformsCount: data?.platforms_count ?? 0,
    needsSync: elapsed > SYNC_INTERVAL_MS,
  }
}

async function ensureBucket(sb: ReturnType<typeof getSupabaseAdmin>) {
  if (!sb) return
  try {
    await sb.storage.createBucket(BUCKET, { public: true })
  } catch {
    // bucket already exists — safe to ignore
  }
}

async function uploadImage(
  sb: ReturnType<typeof getSupabaseAdmin>,
  slug: string,
  rawgUrl: string,
): Promise<string | null> {
  if (!sb) return null
  try {
    const res = await fetch(rawgUrl)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())

    await sb.storage.from(BUCKET).upload(`${slug}.jpg`, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

    const { data } = sb.storage.from(BUCKET).getPublicUrl(`${slug}.jpg`)
    return data.publicUrl
  } catch {
    return null
  }
}

export async function runSync(): Promise<SyncResult> {
  const sb = getSupabase()
  const sbAdmin = getSupabaseAdmin()

  if (!sb) return { ok: false, error: 'Supabase not configured' }

  const status = await getSyncStatus()
  if (!status.needsSync) return { ok: true, synced: false, skippedReason: 'fresh' }

  await ensureBucket(sbAdmin)

  let platforms: Awaited<ReturnType<typeof fetchAllPlatforms>>
  try {
    platforms = await fetchAllPlatforms()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'RAWG fetch failed' }
  }

  for (const p of platforms) {
    const imageLocalUrl = p.image_background
      ? await uploadImage(sbAdmin, p.slug, p.image_background)
      : null

    await sb.from('platforms').upsert(
      {
        rawg_id: p.id,
        name: p.name,
        slug: p.slug,
        games_count: p.games_count,
        image_background_url: p.image_background ?? null,
        image_local_url: imageLocalUrl,
        year_start: p.year_start ?? null,
        year_end: p.year_end ?? null,
        updated_at: new Date().toISOString(),
      } satisfies Omit<DbPlatform, 'id'>,
      { onConflict: 'rawg_id' },
    )
  }

  await sb.from('sync_state').upsert({
    id: 1,
    last_synced_at: new Date().toISOString(),
    platforms_count: platforms.length,
  })

  return { ok: true, synced: true, count: platforms.length }
}

// Normalise a DB row to the shared Platform shape used by the frontend
export function dbPlatformToUnified(p: DbPlatform): Platform {
  return {
    id: p.rawg_id,
    name: p.name,
    slug: p.slug,
    games_count: p.games_count,
    image_url: p.image_local_url ?? p.image_background_url,
    year_start: p.year_start,
    year_end: p.year_end,
    source: 'database',
  }
}
