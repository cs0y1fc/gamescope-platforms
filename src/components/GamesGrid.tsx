'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Game, Genre, Platform } from '@/lib/types'
import GameCard from './GameCard'
import AuthModal from './AuthModal'
import NewReleasesBanner from './NewReleasesBanner'
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

function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="bg-white/5 border border-white/10 text-white/70 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500/50 focus:text-white transition-[border-color,color] duration-150 cursor-pointer"
      style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
    >
      {children}
    </select>
  )
}

export default function GamesGrid() {
  const [games, setGames] = useState<Game[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [gridKey, setGridKey] = useState(0) // re-triggers stagger on filter change

  const [platform, setPlatform] = useState('')
  const [genre, setGenre] = useState('')
  const [year, setYear] = useState('')
  const [ordering, setOrdering] = useState('-rating')
  const [page, setPage] = useState(1)

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [likes, setLikes] = useState<LikeRow[]>([])

  const mainRef = useRef<HTMLElement>(null)
  const likedIds = new Set(likes.map((l) => l.rawg_id))
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const sb = createClient()

  // Auth state
  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (!session) setLikes([])
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Likes
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
      setGridKey(k => k + 1) // re-trigger stagger animation
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

  const changePage = (p: number) => {
    setPage(p)
    mainRef.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={(email) => { setUserEmail(email); setShowAuth(false) }}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#080810]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">

            {/* Brand */}
            <div className="shrink-0">
              <h1 className="text-white font-bold text-xl tracking-tight">
                Game<span className="text-indigo-400">Scope</span>
              </h1>
              <p className="text-white/30 text-xs mt-0.5 hidden sm:block">
                {totalCount > 0 ? `${totalCount.toLocaleString('es-ES')} juegos` : 'Catálogo de videojuegos'}
              </p>
            </div>

            {/* Auth */}
            <div className="flex items-center gap-2 shrink-0">
              {userEmail ? (
                <>
                  {likes.length > 0 && (
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-red-400/80 bg-red-500/8 border border-red-500/15 rounded-full px-2.5 py-1">
                      <span>♥</span> {likes.length}
                    </span>
                  )}
                  <span className="text-xs text-white/30 hidden md:block max-w-[140px] truncate">{userEmail}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg border border-white/8 hover:border-white/15 transition-[color,border-color] duration-150 active:scale-[0.97]"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                  >
                    Salir
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl transition-[transform,background-color] duration-150 active:scale-[0.97]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>

          {/* Filters — scrollable horitzontal a mòbil */}
          <div
            className="flex gap-2 pb-4 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="card-enter shrink-0" style={{ animationDelay: '0ms' }}>
              <Select value={platform} onChange={applyFilter(setPlatform)}>
                <option value="">Todas las plataformas</option>
                {platforms.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </Select>
            </div>
            <div className="card-enter shrink-0" style={{ animationDelay: '50ms' }}>
              <Select value={genre} onChange={applyFilter(setGenre)}>
                <option value="">Todos los géneros</option>
                {genres.map((g) => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
              </Select>
            </div>
            <div className="card-enter shrink-0" style={{ animationDelay: '100ms' }}>
              <Select value={year} onChange={applyFilter(setYear)}>
                <option value="">Todos los años</option>
                {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
              </Select>
            </div>
            <div className="card-enter shrink-0" style={{ animationDelay: '150ms' }}>
              <Select value={ordering} onChange={applyFilter(setOrdering)}>
                {ORDERING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main ref={mainRef} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        <NewReleasesBanner />

        {error && (
          <div className="p-4 bg-red-500/8 border border-red-500/15 rounded-xl text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Skeleton grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-[#0f0f1a] border border-white/5">
                <div className="skeleton h-44" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-3/4 rounded-lg" />
                  <div className="skeleton h-3 w-1/4 rounded-lg" />
                  <div className="flex gap-1.5">
                    <div className="skeleton h-5 w-16 rounded-lg" />
                    <div className="skeleton h-5 w-14 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Game grid — key changes on each fetch to re-trigger stagger */
          <div key={gridKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {games.map((g, i) => (
              <GameCard
                key={g.id}
                game={g}
                index={i}
                isLiked={likedIds.has(g.id)}
                loggedIn={!!userEmail}
                onToggleLike={handleToggleLike}
                onNeedAuth={() => setShowAuth(true)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-12">
            <button
              onClick={() => changePage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-white/60 text-sm hover:bg-white/8 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-[transform,background-color,color,opacity] duration-150 active:scale-[0.97]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
            >
              ←
            </button>

            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i
              if (p < 1 || p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.95] ${
                    p === page
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-white/5 border border-white/8 text-white/50 hover:bg-white/8 hover:text-white'
                  }`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => changePage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-white/60 text-sm hover:bg-white/8 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-[transform,background-color,color,opacity] duration-150 active:scale-[0.97]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
            >
              →
            </button>
          </div>
        )}

        {/* Pagination info */}
        {!loading && totalPages > 1 && (
          <p className="text-center text-xs text-white/20 mt-4">
            Página {page} de {totalPages.toLocaleString('es-ES')}
          </p>
        )}
      </main>
    </div>
  )
}
