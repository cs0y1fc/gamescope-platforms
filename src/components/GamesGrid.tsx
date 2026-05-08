'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Game, Genre, Platform } from '@/lib/types'
import GameCard from './GameCard'
import AuthModal from './AuthModal'
import NewReleasesBanner from './NewReleasesBanner'
import NewsSection from './NewsSection'
import Header from './Header'
import { createClient } from '@/lib/supabase-browser'

const PAGE_SIZE = 20
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => CURRENT_YEAR - i)

const ORDERING_OPTIONS = [
  { value: '-rating', label: 'RATING' },
  { value: '-released', label: 'RECENT' },
  { value: '-metacritic', label: 'METACRITIC' },
  { value: 'name', label: 'NAME A-Z' },
  { value: '-added', label: 'POPULAR' },
]

type LikeRow = { rawg_id: number; game_name: string }

function TerminalSelect({
  label,
  value,
  displayValue,
  onChange,
  children,
}: {
  label: string
  value: string
  displayValue: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative shrink-0">
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs uppercase tracking-wider z-10"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        [{label}::
        <span style={{ color: 'var(--color-accent)' }}>{displayValue}</span>
        ]
      </span>
      <select
        value={value}
        onChange={onChange}
        className="appearance-none cursor-pointer text-xs uppercase tracking-wider focus:outline-none focus:ring-1 transition-colors"
        style={{
          background: 'var(--color-surface)',
          color: 'transparent',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-mono)',
          padding: '0.55rem 2rem 0.55rem 1rem',
          minWidth: `${Math.max(label.length + displayValue.length + 6, 14)}ch`,
        }}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
        style={{ color: 'var(--color-accent)' }}
      >
        ▼
      </span>
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
  const [gridKey, setGridKey] = useState(0)

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

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (!session) setLikes([])
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      setGridKey(k => k + 1)
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

  const changePage = (p: number) => {
    setPage(p)
    mainRef.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const platformLabel = platform ? (platforms.find(p => String(p.id) === platform)?.name ?? platform).toUpperCase() : 'ALL'
  const genreLabel = genre ? (genres.find(g => String(g.id) === genre)?.name ?? genre).toUpperCase() : 'ALL'
  const yearLabel = year || 'ALL'
  const orderingLabel = ORDERING_OPTIONS.find(o => o.value === ordering)?.label ?? 'RATING'

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>

      {showAuth && (
        <AuthModal
          initialError={authError}
          onClose={() => { setShowAuth(false); setAuthError(null) }}
          onAuth={(email) => { setUserEmail(email); setShowAuth(false); setAuthError(null) }}
        />
      )}

      <Header />

      {/* Filters bar */}
      <div
        className="sticky top-[65px] z-30 backdrop-blur-sm"
        style={{
          background: 'rgba(8, 8, 8, 0.85)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <span
              className="shrink-0 self-center text-xs uppercase tracking-wider mr-2"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {'// filters'}
            </span>
            <TerminalSelect
              label="PLATFORM"
              value={platform}
              displayValue={platformLabel}
              onChange={applyFilter(setPlatform)}
            >
              <option value="">ALL</option>
              {platforms.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </TerminalSelect>
            <TerminalSelect
              label="GENRE"
              value={genre}
              displayValue={genreLabel}
              onChange={applyFilter(setGenre)}
            >
              <option value="">ALL</option>
              {genres.map((g) => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
            </TerminalSelect>
            <TerminalSelect
              label="YEAR"
              value={year}
              displayValue={yearLabel}
              onChange={applyFilter(setYear)}
            >
              <option value="">ALL</option>
              {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
            </TerminalSelect>
            <TerminalSelect
              label="SORT"
              value={ordering}
              displayValue={orderingLabel}
              onChange={applyFilter(setOrdering)}
            >
              {ORDERING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </TerminalSelect>
          </div>
        </div>
      </div>

      <main ref={mainRef} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">

        {page === 1 && <NewReleasesBanner />}
        {page === 1 && !platform && !genre && !year && <NewsSection />}

        {/* Section divider */}
        <div className="section-divider mt-12">
          <span>{'// games catalog'}</span>
        </div>

        <div className="flex items-end justify-between mb-6">
          <div>
            <h2
              className="text-2xl uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}
            >
              GAME CATALOG
            </h2>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {totalCount > 0 ? `> ${totalCount.toLocaleString('en-US')} ENTRIES FOUND` : '> SCANNING DATABASE...'}
            </p>
          </div>
        </div>

        {error && (
          <div
            className="p-4 mb-8 flex items-center gap-3"
            style={{
              background: 'rgba(255,59,59,0.1)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          >
            <span>! ERROR ::</span>
            {error}
          </div>
        )}

        {loading ? (
          page === 1 ? (
            <>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:grid-rows-3 gap-3 mb-4">
                <div className="col-span-3 md:col-span-4 lg:col-span-3 lg:row-span-3 overflow-hidden skeleton aspect-[4/5] lg:aspect-auto" />
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="overflow-hidden skeleton aspect-[16/10] lg:aspect-auto hidden lg:block" />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {Array.from({ length: PAGE_SIZE - 3 }).map((_, i) => (
                  <div key={i} className="overflow-hidden skeleton aspect-[3/4]" />
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="overflow-hidden skeleton aspect-[3/4]" />
              ))}
            </div>
          )
        ) : (
          <div key={gridKey}>
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

        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center mt-16 mb-8 gap-4">
            <div
              className="flex items-center gap-2 p-2"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <button
                onClick={() => changePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-retro text-xs disabled:opacity-30 disabled:cursor-not-allowed"
              >
                [← PREV]
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = page;
                  if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                  if (p < 1 || p > totalPages) return null;
                  const isActive = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() => changePage(p)}
                      className="w-9 h-9 text-xs tabular-nums transition-colors"
                      style={{
                        background: isActive ? 'var(--color-accent)' : 'transparent',
                        color: isActive ? '#000' : 'var(--color-text-muted)',
                        border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {String(p).padStart(2, '0')}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => changePage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-retro text-xs disabled:opacity-30 disabled:cursor-not-allowed"
              >
                [NEXT →]
              </button>
            </div>

            <p
              className="text-xs tracking-widest uppercase tabular-nums"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              PAGE {String(page).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
