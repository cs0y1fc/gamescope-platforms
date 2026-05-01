'use client'

import { useState, useEffect, useCallback } from 'react'
import { Game, Genre, Platform } from '@/lib/types'
import GameCard from './GameCard'

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

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

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
          id: number
          slug: string
          name: string
          released: string | null
          background_image: string | null
          rating: number
          metacritic: number | null
          genres: Genre[]
          platforms: Array<{ platform: { id: number; name: string; slug: string } }>
        }) => ({
          id: g.id,
          slug: g.slug,
          name: g.name,
          released: g.released,
          background_image: g.background_image,
          rating: g.rating,
          metacritic: g.metacritic,
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

  return (
    <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-geist-sans)]">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="shrink-0">
            <h1 className="text-xl font-bold text-white">GameScope</h1>
            <p className="text-xs text-gray-500">Catálogo de videojuegos</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <select
              value={platform}
              onChange={applyFilter(setPlatform)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todas las plataformas</option>
              {platforms.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={genre}
              onChange={applyFilter(setGenre)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todos los géneros</option>
              {genres.map((g) => (
                <option key={g.id} value={String(g.id)}>
                  {g.name}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={applyFilter(setYear)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todos los años</option>
              {YEARS.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={ordering}
              onChange={applyFilter(setOrdering)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              {ORDERING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
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
              <GameCard key={g.id} game={g} />
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
              const p = page <= 4
                ? i + 1
                : page >= totalPages - 3
                ? totalPages - 6 + i
                : page - 3 + i
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
