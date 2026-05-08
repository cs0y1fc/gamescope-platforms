'use client'

import { useState, useEffect, useCallback } from 'react'
import { Platform } from '@/lib/types'
import PlatformCard from './PlatformCard'
import Header from './Header'

type HelloResponse = { message: string; timestamp: string; version: string }
type FavoriteRow = { id: number; rawg_id: number; name: string; slug: string }
type SyncStatus = {
  configured: boolean
  lastSyncedAt: string | null
  platformsCount: number
  needsSync: boolean
}

export default function PlatformsGrid() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [favorites, setFavorites] = useState<FavoriteRow[]>([])
  const [hello, setHello] = useState<HelloResponse | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabaseReady, setSupabaseReady] = useState(true)
  const [dataSource, setDataSource] = useState<'database' | 'rawg' | null>(null)

  const favoriteIds = new Set(favorites.map((f) => f.rawg_id))

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [helloRes, platformsRes, favoritesRes, syncRes] = await Promise.all([
        fetch('/api/hello'),
        fetch('/api/platforms'),
        fetch('/api/favorites'),
        fetch('/api/sync'),
      ])

      setHello(await helloRes.json())

      const platformsData = await platformsRes.json()
      if (platformsData.error) throw new Error(platformsData.error)
      setPlatforms(platformsData.results ?? [])
      setDataSource(platformsData.source ?? null)

      const favData = await favoritesRes.json()
      if (Array.isArray(favData)) {
        setFavorites(favData)
      } else if (favoritesRes.status === 503 || favData?.error) {
        setSupabaseReady(false)
      }

      if (syncRes.ok) setSyncStatus(await syncRes.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadAll() }, [loadAll])

  const triggerSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await loadAll()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const toggleFavorite = async (platform: Platform) => {
    if (!supabaseReady) return
    if (favoriteIds.has(platform.id)) {
      await fetch(`/api/favorites?rawg_id=${platform.id}`, { method: 'DELETE' })
      setFavorites((prev) => prev.filter((f) => f.rawg_id !== platform.id))
    } else {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawg_id: platform.id, name: platform.name, slug: platform.slug }),
      })
      if (res.ok) {
        const row = await res.json()
        setFavorites((prev) => [row, ...prev])
      }
    }
  }

  const formatSyncTime = (iso: string | null) => {
    if (!iso) return 'NEVER'
    const d = new Date(iso)
    return d.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }).toUpperCase()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* System status */}
        {hello && (
          <div
            className="mb-4 text-xs"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            &gt; {hello.message.toUpperCase()} :: VER {hello.version}
          </div>
        )}

        {/* Section divider */}
        <div className="section-divider">
          <span>{'// platforms registry'}</span>
        </div>

        {/* Status bar */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 p-4"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span
              className="w-2 h-2"
              style={{ background: dataSource === 'database' ? 'var(--color-success)' : 'var(--color-info)' }}
            />
            <span style={{ color: 'var(--color-text-muted)' }}>SOURCE::</span>
            <span style={{ color: 'var(--color-text)' }}>
              {dataSource === 'database' ? 'CACHE' : 'RAWG'} [{platforms.length}]
            </span>
          </div>

          {syncStatus?.configured && (
            <div className="flex items-center gap-2 text-xs flex-wrap" style={{ fontFamily: 'var(--font-mono)' }}>
              <span
                className="w-2 h-2"
                style={{ background: syncStatus.needsSync ? 'var(--color-warn)' : 'var(--color-success)' }}
              />
              <span style={{ color: 'var(--color-text-muted)' }}>LAST_SYNC::</span>
              <span style={{ color: 'var(--color-text)' }}>{formatSyncTime(syncStatus.lastSyncedAt)}</span>
              <button
                onClick={triggerSync}
                disabled={syncing}
                className="ml-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
              >
                {syncing ? '[SYNCING...]' : syncStatus.needsSync ? '[↻ SYNC NOW]' : '[↻ FORCE]'}
              </button>
            </div>
          )}

          {supabaseReady && (
            <div className="flex items-center gap-2 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="w-2 h-2" style={{ background: 'var(--color-accent)' }} />
              <span style={{ color: 'var(--color-text-muted)' }}>SAVED::</span>
              <span style={{ color: 'var(--color-text)' }}>[{String(favorites.length).padStart(3, '0')}]</span>
            </div>
          )}
        </div>

        {!supabaseReady && (
          <div
            className="mb-6 p-4 text-sm"
            style={{
              background: 'rgba(255,214,0,0.05)',
              border: '1px solid var(--color-warn)',
              color: 'var(--color-warn)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ! WARNING :: SUPABASE NOT CONFIGURED. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and run supabase-schema.sql.
          </div>
        )}

        {syncStatus?.configured && platforms.length === 0 && !loading && !error && (
          <div
            className="mb-6 p-6 text-center"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-accent)',
            }}
          >
            <p
              className="mb-4 text-sm"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
            >
              &gt; DATABASE EMPTY. INITIALIZE SYNC TO IMPORT FROM RAWG.
            </p>
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="btn-retro btn-retro-primary text-xs disabled:opacity-50"
            >
              {syncing ? '[IMPORTING...]' : '[INITIATE SYNC]'}
            </button>
          </div>
        )}

        {syncing && (
          <div
            className="mb-6 p-4 text-sm flex items-center gap-3"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-accent)',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0"
              style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
            />
            &gt; FETCHING DATA FROM RAWG :: SAVING IMAGES TO LOCAL CACHE...
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ border: '1px solid var(--color-border)', height: '12rem' }}
              />
            ))}
          </div>
        )}

        {error && (
          <div
            className="p-4 text-sm"
            style={{
              background: 'rgba(255,59,59,0.1)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ! ERROR :: {error}
          </div>
        )}

        {!loading && !error && platforms.length > 0 && (
          <>
            {favorites.length > 0 && supabaseReady && (
              <section className="mb-10">
                <div className="section-divider">
                  <span>{`// favorites [${String(favorites.length).padStart(2, '0')}]`}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {platforms
                    .filter((p) => favoriteIds.has(p.id))
                    .map((p) => (
                      <PlatformCard key={p.id} platform={p} isFavorite={true} onToggleFavorite={toggleFavorite} />
                    ))}
                </div>
              </section>
            )}

            <section>
              <div className="section-divider">
                <span>{`// all platforms [${String(platforms.length).padStart(3, '0')}]`}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {platforms.map((p) => (
                  <PlatformCard
                    key={p.id}
                    platform={p}
                    isFavorite={favoriteIds.has(p.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
