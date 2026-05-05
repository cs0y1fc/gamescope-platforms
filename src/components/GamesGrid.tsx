'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Game, Genre, Platform } from '@/lib/types'
import GameCard from './GameCard'
import AuthModal from './AuthModal'
import NewReleasesBanner from './NewReleasesBanner'
import NewsSection from './NewsSection'
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
    <div className="relative group">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none bg-white/80 backdrop-blur-xl border border-slate-200 hover:border-indigo-500/50 text-slate-700 text-sm font-medium rounded-full px-5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 cursor-pointer shadow-lg shadow-slate-200/50"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-400 group-hover:text-indigo-300 transition-colors">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
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
  const [authError, setAuthError] = useState<string | null>(null)
  const [likes, setLikes] = useState<LikeRow[]>([])

  const mainRef = useRef<HTMLElement>(null)
  const likedIds = new Set(likes.map((l) => l.rawg_id))
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const sb = createClient()

  // Surface ?auth_error=... from OAuth callback
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const err = params.get('auth_error')
    if (err) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthError(err)
      setShowAuth(true)
      params.delete('auth_error')
      const newSearch = params.toString()
      const cleaned = window.location.pathname + (newSearch ? `?${newSearch}` : '')
      window.history.replaceState({}, '', cleaned)
    }
  }, [])

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadFilters() }, [loadFilters])
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">

      {/* Background abstract gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[50%] bg-emerald-400/20 rounded-full blur-[150px]" />
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          initialError={authError}
          onClose={() => { setShowAuth(false); setAuthError(null) }}
          onAuth={(email) => { setUserEmail(email); setShowAuth(false); setAuthError(null) }}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4 sm:py-5">

            {/* Brand */}
            <div className="shrink-0 flex flex-col gap-0.5 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <h1 className="font-display font-black text-2xl tracking-widest uppercase flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                <span className="text-gradient">Game</span>Scope
              </h1>
            </div>

            {/* Auth */}
            <div className="flex items-center gap-3 shrink-0">
              {userEmail ? (
                <>
                  {likes.length > 0 && (
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full px-3 py-1.5 font-medium shadow-sm">
                      <span className="animate-pulse">♥</span> {likes.length}
                    </span>
                  )}
                  <span className="text-sm text-slate-500 hidden md:block max-w-[140px] truncate">{userEmail}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 active:scale-95"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-full shadow-lg shadow-indigo-600/20 transition-all duration-300 active:scale-95"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="relative pb-4">
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#f8fafc] to-transparent z-10 sm:hidden" />
            <div
              className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="card-enter shrink-0" style={{ animationDelay: '0ms' }}>
                <Select value={platform} onChange={applyFilter(setPlatform)}>
                  <option value="">Plataformas</option>
                  {platforms.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                </Select>
              </div>
              <div className="card-enter shrink-0" style={{ animationDelay: '50ms' }}>
                <Select value={genre} onChange={applyFilter(setGenre)}>
                  <option value="">Géneros</option>
                  {genres.map((g) => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
                </Select>
              </div>
              <div className="card-enter shrink-0" style={{ animationDelay: '100ms' }}>
                <Select value={year} onChange={applyFilter(setYear)}>
                  <option value="">Año</option>
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
        </div>
      </header>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {/* Hero Section */}
        {page === 1 && <NewReleasesBanner />}

        {/* News Section */}
        {page === 1 && !platform && !genre && !year && <NewsSection />}

        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 mt-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">
              Catálogo de Juegos
            </h2>
            <p className="text-slate-500 text-sm">
              {totalCount > 0 ? `Explorando ${totalCount.toLocaleString('es-ES')} resultados` : 'Buscando resultados...'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm mb-8 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          page === 1 ? (
            <>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:grid-rows-3 gap-3 mb-4">
                <div className="col-span-3 md:col-span-4 lg:col-span-3 lg:row-span-3 rounded-2xl overflow-hidden skeleton aspect-[4/5] lg:aspect-auto" />
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden skeleton aspect-[16/10] lg:aspect-auto hidden lg:block" />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {Array.from({ length: PAGE_SIZE - 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden skeleton aspect-[3/4]" />
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden skeleton aspect-[3/4]" />
              ))}
            </div>
          )
        ) : (
          <div key={gridKey}>
            {/* Bento — only on page 1 with >=4 games */}
            {page === 1 && games.length >= 4 && (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:grid-rows-2 gap-3 mb-4">
                <div className="col-span-3 md:col-span-4 lg:col-span-3 lg:row-span-2">
                  <GameCard
                    game={games[0]}
                    index={0}
                    variant="hero"
                    isLiked={likedIds.has(games[0].id)}
                    loggedIn={!!userEmail}
                    onToggleLike={handleToggleLike}
                    onNeedAuth={() => setShowAuth(true)}
                  />
                </div>
                {games.slice(1, 3).map((g, i) => (
                  <div key={g.id} className="hidden lg:block">
                    <GameCard
                      game={g}
                      index={i + 1}
                      variant="compact"
                      isLiked={likedIds.has(g.id)}
                      loggedIn={!!userEmail}
                      onToggleLike={handleToggleLike}
                      onNeedAuth={() => setShowAuth(true)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Regular grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {(page === 1 && games.length >= 3 ? games.slice(3) : games).map((g, i) => (
                <GameCard
                  key={g.id}
                  game={g}
                  index={page === 1 && games.length >= 3 ? i + 3 : i}
                  isLiked={likedIds.has(g.id)}
                  loggedIn={!!userEmail}
                  onToggleLike={handleToggleLike}
                  onNeedAuth={() => setShowAuth(true)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Modern Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center mt-16 mb-8">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl p-2 rounded-full border border-slate-200 shadow-lg shadow-slate-200/50">
              <button
                onClick={() => changePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                &larr;
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = page;
                  if (page <= 3) {
                    p = i + 1;
                  } else if (page >= totalPages - 2) {
                    p = totalPages - 4 + i;
                  } else {
                    p = page - 2 + i;
                  }
                  
                  if (p < 1 || p > totalPages) return null;
                  
                  return (
                    <button
                      key={p}
                      onClick={() => changePage(p)}
                      className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                        p === page
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => changePage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                &rarr;
              </button>
            </div>
            
            <p className="text-center text-xs font-medium text-slate-400 mt-4 tracking-widest uppercase">
              Página {page} de {totalPages.toLocaleString('es-ES')}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
