'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import GameCard from '@/components/GameCard'
import AuthModal from '@/components/AuthModal'
import { CornerPathFrame, CardBar, SquareGeometry } from '@/components/ui'
import { Platform, Game, Genre } from '@/lib/types'
import { createClient } from '@/lib/supabase-browser'

const PAGE_SIZE = 20
type LikeRow = { rawg_id: number; game_name: string }

export default function PlatformDetail({ slug }: { slug: string }) {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [loadingPlatform, setLoadingPlatform] = useState(true)
  const [loadingGames, setLoadingGames] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [likes, setLikes] = useState<LikeRow[]>([])
  const [showAuth, setShowAuth] = useState(false)

  const sb = createClient()
  const likedIds = new Set(likes.map((l) => l.rawg_id))
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Load platform info
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingPlatform(true)
    fetch(`/api/platforms`)
      .then(r => r.json())
      .then(data => {
        const found = (data.results ?? []).find(
          (p: Platform) => p.slug === slug,
        )
        if (!found) {
          setError(`Platform "${slug}" not found.`)
        } else {
          setPlatform(found)
        }
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoadingPlatform(false))
  }, [slug])

  // Load games for this platform
  const loadGames = useCallback(async () => {
    if (!platform) return
    setLoadingGames(true)
    try {
      const qs = new URLSearchParams({
        platform: String(platform.id),
        ordering: '-rating',
        page: String(page),
      })
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
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoadingGames(false)
    }
  }, [platform, page])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadGames() }, [loadGames])

  // Auth + likes
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loadingPlatform) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton aspect-[21/9] mb-8" style={{ border: '1px solid var(--color-border)' }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4]" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error || !platform) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
          <div className="text-center">
            <p
              className="text-xl mb-2 cursor-blink uppercase tracking-wider"
              style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}
            >
              ! PLATFORM NOT FOUND
            </p>
            <p
              className="mb-6 text-sm"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {`// ${error || 'COULD NOT LOAD PLATFORM'}`}
            </p>
            <Link href="/platforms" className="btn-retro btn-retro-primary text-xs">
              [← BACK TO PLATFORMS]
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={(email) => { setUserEmail(email); setShowAuth(false) }}
        />
      )}

      <Header />

      {/* Hero */}
      <div className="relative w-full aspect-[21/9] lg:aspect-[21/8] max-h-[440px] overflow-hidden scanlines">
        {platform.image_url ? (
          <>
            <Image
              src={platform.image_url}
              alt={platform.name}
              fill
              className="object-cover opacity-30"
              priority
              sizes="100vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, var(--color-bg) 0%, rgba(8,8,8,0.6) 60%, transparent 100%)`,
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: 'var(--color-surface-2)' }}>
            <SquareGeometry opacity={0.15} />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 z-10">
          <div
            className="flex items-center gap-3 mb-3 text-xs uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span style={{ color: 'var(--color-accent)' }}>[PLATFORM]</span>
            <span style={{ color: 'var(--color-text-muted)' }}>
              [{platform.year_start ?? '????'} — {platform.year_end ?? 'PRESENT'}]
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>
              [{platform.games_count.toLocaleString()} GAMES]
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-text)' }}
          >
            {platform.name}
          </h1>
          <p
            className="text-sm mt-3"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {`> SLUG::${platform.slug}`}
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Info panel */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4 relative"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <CornerPathFrame size={10} />
          <div className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-faint)' }}>{'NAME::'}</span>
            <div style={{ color: 'var(--color-text)' }} className="truncate uppercase">
              {platform.name}
            </div>
          </div>
          <div className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-faint)' }}>{'SLUG::'}</span>
            <div style={{ color: 'var(--color-accent)' }} className="truncate">
              /{platform.slug}
            </div>
          </div>
          <div className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-faint)' }}>{'GAMES::'}</span>
            <div style={{ color: 'var(--color-text)' }} className="tabular-nums">
              {platform.games_count.toLocaleString()}
            </div>
          </div>
          <div className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-faint)' }}>{'YEARS::'}</span>
            <div style={{ color: 'var(--color-text)' }} className="tabular-nums">
              {platform.year_start ?? '????'}—{platform.year_end ?? 'NOW'}
            </div>
          </div>
        </div>

        <CardBar className="mb-8" color="var(--color-accent)" />

        <div className="section-divider">
          <span>{'// games on this platform'}</span>
        </div>

        <div className="flex items-end justify-between mb-6">
          <div>
            <h2
              className="text-2xl uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}
            >
              CATALOG
            </h2>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {totalCount > 0
                ? `> ${totalCount.toLocaleString('en-US')} ENTRIES FOUND`
                : '> SCANNING DATABASE...'}
            </p>
          </div>
          <Link href="/platforms" className="btn-retro text-xs">
            [← ALL PLATFORMS]
          </Link>
        </div>

        {loadingGames ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4]" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div
            className="p-8 text-center"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {'// NO GAMES FOUND FOR THIS PLATFORM'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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

        {!loadingGames && totalPages > 1 && (
          <div className="flex flex-col items-center mt-12 mb-4 gap-4">
            <div
              className="flex items-center gap-2 p-2"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <button
                onClick={() => changePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-retro text-xs disabled:opacity-30 disabled:cursor-not-allowed"
              >
                [← PREV]
              </button>
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
