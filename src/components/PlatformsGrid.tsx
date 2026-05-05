'use client'

import { useState, useEffect, useCallback } from 'react'
import { Platform } from '@/lib/types'
import PlatformCard from './PlatformCard'

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
    if (!iso) return 'nunca'
    const d = new Date(iso)
    return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">GameScope</h1>
            <p className="text-xs text-slate-500">Plataformas de videojuegos</p>
          </div>
          {hello && (
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1">
              {hello.message}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${dataSource === 'database' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
            <span className="text-slate-500">{dataSource === 'database' ? 'BD' : 'RAWG'}</span>
            <span className="text-slate-900 font-medium">{platforms.length} plataformas</span>
          </div>

          {syncStatus?.configured && (
            <div className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${syncStatus.needsSync ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span className="text-slate-500">Último sync</span>
              <span className="text-slate-900 font-medium">{formatSyncTime(syncStatus.lastSyncedAt)}</span>
              <button
                onClick={triggerSync}
                disabled={syncing}
                className="ml-1 text-xs text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {syncing ? 'Sincronizando…' : syncStatus.needsSync ? 'Sincronizar ahora' : 'Forzar sync'}
              </button>
            </div>
          )}

          {supabaseReady && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-slate-500">Favoritas</span>
              <span className="text-slate-900 font-medium">{favorites.length}</span>
            </div>
          )}
        </div>

        {/* Warnings */}
        {!supabaseReady && (
          <div className="mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-sm text-yellow-300">
            <strong>Supabase no configurado.</strong> Añade{' '}
            <code className="bg-yellow-500/10 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
            <code className="bg-yellow-500/10 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
            en <code className="bg-yellow-500/10 px-1 rounded">.env.local</code> y ejecuta{' '}
            <code className="bg-yellow-500/10 px-1 rounded">supabase-schema.sql</code>.
          </div>
        )}

        {syncStatus?.configured && platforms.length === 0 && !loading && !error && (
          <div className="mb-6 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-center">
            <p className="text-indigo-300 mb-3">La base de datos está vacía. Haz el primer sync para importar las plataformas de RAWG.</p>
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {syncing ? 'Importando plataformas y descargando imágenes…' : 'Iniciar sync'}
            </button>
          </div>
        )}

        {syncing && (
          <div className="mb-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-sm text-indigo-300 flex items-center gap-3">
            <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            Descargando datos de RAWG y guardando imágenes en Supabase Storage…
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm skeleton">
                <div className="h-32 opacity-20" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && platforms.length > 0 && (
          <>
            {favorites.length > 0 && supabaseReady && (
              <section className="mb-10">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  Favoritas
                  <span className="text-sm font-normal text-yellow-500">({favorites.length})</span>
                </h2>
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
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Todas las plataformas</h2>
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
