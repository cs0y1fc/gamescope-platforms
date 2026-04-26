import fs from 'fs'
import path from 'path'
import { getSupabase, DbPlatform, SyncState } from './supabase'
import { fetchAllPlatforms } from './rawg'
import { Platform } from './types'

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000
const IMAGES_DIR = path.join(process.cwd(), 'public', 'platforms')

export type SyncStatus = {
  configured: boolean
  lastSyncedAt: string | null
  platformsCount: number
  needsSync: boolean
}

export type SyncResult =
  | { ok: true; synced: true; count: number; imagesDownloaded: number }
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

// Downloads a RAWG image to public/platforms/{slug}.jpg.
// Returns the local URL path on success, null if the write is not possible
// (e.g. read-only filesystem in production) or the download fails.
async function saveImageLocally(slug: string, rawgUrl: string): Promise<string | null> {
  const filename = `${slug}.jpg`
  const filePath = path.join(IMAGES_DIR, filename)

  // Skip download if the file already exists on disk
  if (fs.existsSync(filePath)) return `/platforms/${filename}`

  try {
    await fs.promises.mkdir(IMAGES_DIR, { recursive: true })
    const res = await fetch(rawgUrl)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    await fs.promises.writeFile(filePath, buffer)
    return `/platforms/${filename}`
  } catch {
    // Filesystem not writable (e.g. Vercel serverless) — fall back gracefully
    return null
  }
}

export async function runSync(): Promise<SyncResult> {
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Supabase not configured' }

  const status = await getSyncStatus()
  if (!status.needsSync) return { ok: true, synced: false, skippedReason: 'fresh' }

  let platforms: Awaited<ReturnType<typeof fetchAllPlatforms>>
  try {
    platforms = await fetchAllPlatforms()
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'RAWG fetch failed' }
  }

  let imagesDownloaded = 0

  for (const p of platforms) {
    let imageLocalUrl: string | null = null

    if (p.image_background) {
      imageLocalUrl = await saveImageLocally(p.slug, p.image_background)
      if (imageLocalUrl) imagesDownloaded++
    }

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

  return { ok: true, synced: true, count: platforms.length, imagesDownloaded }
}

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
