'use client'

import { useState, useEffect, useCallback } from 'react'
import { Game, Genre, Platform } from '@/lib/types'
import GameCard from './GameCard'
import AuthModal from './AuthModal'
import { createClient } from '@/lib/supabase-browser'

const PAGE_SIZE = 20
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => CURRENT_YEAR - i)

const ORDERING_OPTIONS = [
  { value: '-rating', label: 'Mejor valorados' },
  { value: '-released', label: 'Más recientes' },
  { value: '-metacritic', label: 'Metacritic' },
  { value: 'name', label: 'Nombre A–Z' },
  { value: '-added', label: 'Más populares' },
]

type LikeRow = { rawg_id: number; game_name: string }

export default function GamesGrid() {
  const [games, setGames] = useState<Game[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const [platform, setPlatform] = useState('')
  const [genre, setGenre] = useState('')
  const [year, setYear] = useState('')
  const [ordering, setOrdering] = useState('-rating')
  const [page, setPage] = useState(1)

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [likes, setLikes] = useState<LikeRow[]>([])

  const likedIds = new Set(likes.map((l) => l.rawg_id))
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const sb = createClient()

  // Auth state on mount
  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (!session) setLikes([])
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load likes when logged in
  useEffect(() => {
    if (!userEmail) { setLikes([]); return }
    fetch('/api/likes').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setLikes(data)
    })
  }, [userEmail])

  const loadGames = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams({ ordering, page: String(page) })
      if (platform) qs.set('platform', platform)
      if (genre) qs.set('genre', genre)
      if (year) qs.set('year', year)

      const res = await fetch(`/api/games?${qs}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const mapped: Game[] = (data.results ?? []).map(
        (g: {
          id: number; slug: string; name: string; released: string | null
          background_image: string | null; rating: number; metacritic: number | null
          genres: Genre[]
          platforms: Array<{ platform: { id: number; name: string; slug: string } }>
        }) => ({
          id: g.id, slug: g.slug, name: g.name, released: g.released,
          background_image: g.background_image, rating: g.rating, metacritic: g.metacritic,
          genres: g.genres,
          platforms: (g.platforms ?? []).map((p) => p.platform),
        }),
      )
      setGames(mapped)
      setTotalCount(data.count ?? 0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [platform, genre, year, ordering, page])

  const loadFilters = useCallback(async () => {
    const [genresRes, platformsRes] = await Promise.all([
      fetch('/api/genres'),
      fetch('/api/platforms'),
    ])
    if (genresRes.ok) setGenres(await genresRes.json())
    if (platformsRes.ok) {
      const data = await platformsRes.json()
      setPlatforms(data.results ?? [])
    }
  }, [])

  useEffect(() => { loadFilters() }, [loadFilters])
  useEffect(() => { loadGames() }, [loadGames])

  const applyFilter = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value)
    setPage(1)
  }

  const handleToggleLike = async (game: Game) => {
    if (likedIds.has(game.id)) {
      await fetch(`/api/likes?rawg_id=${game.id}`, { method: 'DELETE' })
      setLikes((prev) => prev.filter((l) => l.rawg_id !== game.id))
    } else {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawg_id: game.id, game_name: game.name }),
      })
      if (res.ok) {
        const row = await res.json()
        setLikes((prev) => [{ rawg_id: row.rawg_id, game_name: row.game_name }, ...prev])
      }
    }
  }

  const handleSignOut = async () => {
    await sb.auth.signOut()
    setUserEmail(null)
    setLikes([])
  }

  return (
    <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-geist-sans)]">
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={(email) => { setUserEmail(email); setShowAuth(false) }}
        />
      )}

      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="shrink-0">
              <h1 className="text-xl font-bold text-white">GameScope</h1>
              <p className="text-xs text-gray-500">Catálogo de videojuegos</p>
            </div>
            {/* Auth */}
            <div className="flex items-center gap-2">
              {userEmail ? (
                <>
                  <span className="text-xs text-gray-400 hidden sm:block">{userEmail}</span>
                  {likes.length > 0 && (
                    <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-full px-2 py-0.5">
                      ♥ {likes.length}
                    </span>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded border border-gray-700 hover:border-gray-500"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={platform}
              onChange={applyFilter(setPlatform)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todas las plataformas</option>
              {platforms.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.name}</option>
              ))}
            </select>

            <select
              value={genre}
              onChange={applyFilter(setGenre)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todos los géneros</option>
              {genres.map((g) => (
                <option key={g.id} value={String(g.id)}>{g.name}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={applyFilter(setYear)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todos los años</option>
              {YEARS.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>

            <select
              value={ordering}
              onChange={applyFilter(setOrdering)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              {ORDERING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400">
            {loading ? 'Cargando…' : `${totalCount.toLocaleString('es-ES')} juegos`}
          </p>
          {!loading && totalPages > 1 && (
            <span className="text-sm text-gray-500">
              Página {page} de {totalPages.toLocaleString('es-ES')}
            </span>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 animate-pulse">
                <div className="h-40 bg-gray-800" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/4" />
                  <div className="flex gap-1">
                    <div className="h-5 w-14 bg-gray-800 rounded" />
                    <div className="h-5 w-14 bg-gray-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {games.map((g) => (
              <GameCard
                key={g.id}
                game={g}
                isLiked={likedIds.has(g.id)}
                loggedIn={!!userEmail}
                onToggleLike={handleToggleLike}
                onNeedAuth={() => setShowAuth(true)}
              />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i
              if (p < 1 || p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    p === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
