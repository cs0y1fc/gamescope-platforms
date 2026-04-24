'use client'

import { useState, useEffect, useCallback } from 'react'
import { RawgPlatform } from '@/lib/rawg'
import PlatformCard from './PlatformCard'

type HelloResponse = { message: string; timestamp: string; version: string }
type FavoriteRow = { id: number; rawg_id: number; name: string; slug: string }

export default function PlatformsGrid() {
  const [platforms, setPlatforms] = useState<RawgPlatform[]>([])
  const [favorites, setFavorites] = useState<FavoriteRow[]>([])
  const [hello, setHello] = useState<HelloResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabaseReady, setSupabaseReady] = useState(true)

  const favoriteIds = new Set(favorites.map((f) => f.rawg_id))

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [helloRes, platformsRes, favoritesRes] = await Promise.all([
        fetch('/api/hello'),
        fetch('/api/platforms'),
        fetch('/api/favorites'),
      ])

      setHello(await helloRes.json())

      const platformsData = await platformsRes.json()
      if (platformsData.error) throw new Error(platformsData.error)
      setPlatforms(platformsData.results ?? [])

      const favData = await favoritesRes.json()
      if (Array.isArray(favData)) {
        setFavorites(favData)
      } else {
        setSupabaseReady(false)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const toggleFavorite = async (platform: RawgPlatform) => {
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

  return (
    <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">GameScope</h1>
            <p className="text-xs text-gray-500">Plataformas de videojuegos</p>
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
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-gray-400">RAWG API</span>
            <span className="text-white font-medium">{platforms.length} plataformas</span>
          </div>
          <div className={`flex items-center gap-2 bg-gray-900 border rounded-lg px-4 py-2 text-sm ${supabaseReady ? 'border-gray-800' : 'border-yellow-800/50'}`}>
            <span className={`w-2 h-2 rounded-full ${supabaseReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-gray-400">Supabase</span>
            {supabaseReady
              ? <span className="text-white font-medium">{favorites.length} favoritas</span>
              : <span className="text-yellow-400 font-medium">Configura env vars</span>
            }
          </div>
        </div>

        {!supabaseReady && (
          <div className="mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-sm text-yellow-300">
            <strong>Supabase no configurado.</strong> Añade <code className="bg-yellow-500/10 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> y <code className="bg-yellow-500/10 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en <code className="bg-yellow-500/10 px-1 rounded">.env.local</code> y crea la tabla <code className="bg-yellow-500/10 px-1 rounded">favorite_platforms</code>.
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 animate-pulse">
                <div className="h-32 bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                  <div className="h-3 bg-gray-800 rounded w-1/3" />
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

        {!loading && !error && (
          <>
            {favorites.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>Favoritas</span>
                  <span className="text-sm font-normal text-yellow-400">({favorites.length})</span>
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
              <h2 className="text-lg font-semibold text-white mb-4">Todas las plataformas</h2>
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
