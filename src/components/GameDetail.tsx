'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import { CornerPathFrame, CardBar } from '@/components/ui'
import { createClient } from '@/lib/supabase-browser'

type GameDetail = {
  id: number
  slug: string
  name: string
  released: string | null
  background_image: string | null
  rating: number
  rating_top: number | null
  metacritic: number | null
  metacritic_platforms: Array<{
    platform: number
    name: string
    url: string | null
    score: number
  }>
  description_raw: string
  website: string | null
  genres: Array<{ id: number; name: string; slug: string }>
  platforms: Array<{
    platform: { id: number; name: string; slug: string }
    released_at: string
    requirements_en: { minimum: string; recommended: string } | null
  }>
  developers: Array<{ id: number; name: string; slug: string }>
  publishers: Array<{ id: number; name: string; slug: string }>
  screenshots: Array<{ id: number; image: string }>
  movies: Array<{ id: number; name: string; preview: string; data: { 480: string; max: string } }>
  stores: Array<{
    id: number
    store: { id: number; name: string; slug: string; domain: string }
    url: string
  }>
  tags: Array<{ id: number; name: string; slug: string }>
  esrb_rating: { id: number; name: string; slug: string } | null
  reddit_count: number
  twitch_count: number
  youtube_count: number
  reviews_count: number
  added: number
  playtime: number | null
}

type LikeRow = { rawg_id: number; game_name: string }

function MarkdownText({ text }: { text: string }) {
  const paragraphs = text.split('\n').filter(p => p.trim())
  return (
    <>
      {paragraphs.map((p, i) => {
        if (p.startsWith('###')) {
          return (
            <h3
              key={i}
              className="uppercase tracking-wider mt-6 mb-2"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}
            >
              {p.replace('###', '').trim()}
            </h3>
          )
        }
        if (p.startsWith('##')) {
          return (
            <h2
              key={i}
              className="text-lg uppercase tracking-wider mt-6 mb-2"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}
            >
              {p.replace('##', '').trim()}
            </h2>
          )
        }
        if (p.startsWith('#')) {
          return (
            <h1
              key={i}
              className="text-xl uppercase tracking-wider mt-6 mb-2"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}
            >
              {p.replace('#', '').trim()}
            </h1>
          )
        }
        return (
          <p
            key={i}
            className="leading-relaxed mb-3"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
          >
            {p}
          </p>
        )
      })}
    </>
  )
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative p-6 ${className}`}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <CornerPathFrame size={12} />
      {children}
    </div>
  )
}

export default function GameDetailClient({ slug }: { slug: string }) {
  const [game, setGame] = useState<GameDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'about' | 'screenshots' | 'requirements' | 'stores'>('about')
  const [isLiked, setIsLiked] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    fetch(`/api/games/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Error fetching game')
        return res.json()
      })
      .then(data => {
        setGame(data)
        setLoading(false)
      })
      .catch(e => {
        setError(e instanceof Error ? e.message : 'Error desconocido')
        setLoading(false)
      })
  }, [slug])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (data.user) {
        setLoggedIn(true)
        fetch('/api/likes')
          .then(r => r.json())
          .then((likes: LikeRow[]) => {
            if (Array.isArray(likes)) {
              setIsLiked(likes.some(l => l.rawg_id === game?.id))
            }
          })
      }
    })
  }, [game?.id])

  const handleLike = async () => {
    if (!loggedIn) { setShowAuth(true); return }
    if (!game) return

    if (isLiked) {
      await fetch(`/api/likes?rawg_id=${game.id}`, { method: 'DELETE' })
      setIsLiked(false)
    } else {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawg_id: game.id, game_name: game.name }),
      })
      if (res.ok) setIsLiked(true)
    }
  }

  const metacriticColor =
    game?.metacritic && game.metacritic >= 75 ? 'var(--color-success)'
    : game?.metacritic && game.metacritic >= 50 ? 'var(--color-warn)'
    : 'var(--color-danger)'

  const releaseYear = game?.released ? new Date(game.released).getFullYear() : null
  const releaseDate = game?.released
    ? new Date(game.released).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()
    : null

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton aspect-[21/9] mb-8" style={{ border: '1px solid var(--color-border)' }} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 skeleton w-3/4" />
              <div className="h-32 skeleton w-full" />
            </div>
            <div className="space-y-4">
              <div className="h-48 skeleton w-full" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
          <div className="text-center">
            <p
              className="text-xl mb-2 cursor-blink uppercase tracking-wider"
              style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}
            >
              ! GAME NOT FOUND
            </p>
            <p
              className="mb-6 text-sm"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {`// ${error || 'COULD NOT LOAD GAME DATA'}`}
            </p>
            <Link href="/" className="btn-retro btn-retro-primary text-xs">
              [← BACK HOME]
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {showAuth && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowAuth(false)}
        >
          <div
            className="max-w-sm w-full p-6 relative"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)' }}
          >
            <CornerPathFrame size={14} />
            <h3
              className="cursor-blink uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
            >
              &gt; ACCESS REQUIRED
            </h3>
            <p
              className="mb-4 text-xs"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {'// SIGN IN TO LIKE GAMES'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowAuth(false)} className="btn-retro flex-1 text-xs">
                [CANCEL]
              </button>
              <a href="/auth/callback?provider=google" className="btn-retro btn-retro-primary flex-1 text-xs text-center">
                [SIGN IN]
              </a>
            </div>
          </div>
        </div>
      )}

      <Header />

      {/* Hero */}
      <div className="relative w-full aspect-[21/9] lg:aspect-[21/7] max-h-[500px] overflow-hidden scanlines">
        {game.background_image ? (
          <>
            <Image
              src={game.background_image}
              alt={game.name}
              fill
              className="object-cover opacity-40"
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
          <div className="absolute inset-0" style={{ background: 'var(--color-surface-2)' }} />
        )}

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 z-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div
                className="flex items-center gap-3 mb-3 text-xs uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {game.metacritic && (
                  <span
                    className="px-2 py-1"
                    style={{
                      background: 'rgba(8,8,8,0.6)',
                      color: metacriticColor,
                      border: `1px solid ${metacriticColor}`,
                    }}
                  >
                    [META::{game.metacritic}]
                  </span>
                )}
                {game.esrb_rating && (
                  <span
                    className="px-2 py-1"
                    style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                  >
                    [{game.esrb_rating.name.toUpperCase()}]
                  </span>
                )}
                {game.playtime && (
                  <span
                    className="px-2 py-1"
                    style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                  >
                    [{game.playtime}H]
                  </span>
                )}
              </div>
              <h1
                className="text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-text)' }}
              >
                {game.name}
              </h1>
              <div
                className="flex items-center gap-4 mt-3 text-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {releaseDate && (
                  <span style={{ color: 'var(--color-text-muted)' }}>{`// ${releaseDate}`}</span>
                )}
                <button
                  onClick={handleLike}
                  className="btn-retro text-xs"
                  style={{
                    color: isLiked ? '#000' : 'var(--color-text)',
                    background: isLiked ? 'var(--color-accent)' : 'transparent',
                    borderColor: isLiked ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                >
                  {isLiked ? '[♥ LIKED]' : '[♡ LIKE]'}
                </button>
              </div>
            </div>
            <div className="hidden sm:block text-right" style={{ fontFamily: 'var(--font-mono)' }}>
              <div
                className="flex items-center gap-1 text-2xl tabular-nums"
                style={{ color: 'var(--color-warn)' }}
              >
                ★ {game.rating?.toFixed(1) ?? '—'}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {game.reviews_count?.toLocaleString()} REVIEWS
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Tags bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {game.genres.slice(0, 5).map(g => (
            <span
              key={g.id}
              className="text-xs px-2 py-1 uppercase tracking-wider"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-accent)',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {g.name}
            </span>
          ))}
          {releaseYear && (
            <span
              className="text-xs px-2 py-1 uppercase tracking-wider"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              [{releaseYear}]
            </span>
          )}
          {game.developers.length > 0 && (
            <span
              className="text-xs px-2 py-1 uppercase tracking-wider"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {game.developers[0].name}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-0 mb-8 w-fit"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {([
            { key: 'about', label: 'ABOUT' },
            { key: 'screenshots', label: 'CAPTURES' },
            { key: 'requirements', label: 'SPECS' },
            { key: 'stores', label: 'STORES' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 text-xs uppercase tracking-wider transition-colors"
              style={{
                background: activeTab === tab.key ? 'var(--color-accent)' : 'transparent',
                color: activeTab === tab.key ? '#000' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              [{tab.label}]
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2">
            {activeTab === 'about' && (
              <Panel>
                <h2
                  className="uppercase tracking-wider mb-4"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}
                >
                  {'// DESCRIPTION'}
                </h2>
                {game.description_raw ? (
                  <MarkdownText text={game.description_raw} />
                ) : (
                  <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {'// NO DESCRIPTION AVAILABLE'}
                  </p>
                )}

                {game.publishers.length > 0 && (
                  <>
                    <CardBar className="mt-6 mb-4" />
                    <h3
                      className="text-xs uppercase tracking-wider mb-3"
                      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {'// PUBLISHED BY'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {game.publishers.map(p => (
                        <span
                          key={p.id}
                          className="text-xs px-2 py-1 uppercase"
                          style={{
                            color: 'var(--color-text)',
                            border: '1px solid var(--color-border)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {game.tags.length > 0 && (
                  <>
                    <CardBar className="mt-6 mb-4" />
                    <h3
                      className="text-xs uppercase tracking-wider mb-3"
                      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {'// TAGS'}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {game.tags.slice(0, 20).map(t => (
                        <span
                          key={t.id}
                          className="text-[10px] px-1.5 py-0.5 uppercase"
                          style={{
                            color: 'var(--color-text-muted)',
                            border: '1px solid var(--color-border)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </Panel>
            )}

            {activeTab === 'screenshots' && (
              <div>
                {game.screenshots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {game.screenshots.map(s => (
                      <div
                        key={s.id}
                        className="card-retro overflow-hidden relative"
                      >
                        <CornerPathFrame size={10} />
                        <Image
                          src={s.image}
                          alt={`Screenshot ${s.id}`}
                          width={600}
                          height={340}
                          className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Panel>
                    <p
                      className="text-center py-8"
                      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {'// NO CAPTURES AVAILABLE'}
                    </p>
                  </Panel>
                )}
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-4">
                {game.platforms.map(p => {
                  const req = p.requirements_en
                  if (!req) return null
                  return (
                    <Panel key={p.platform.id}>
                      <h3
                        className="uppercase tracking-wider mb-4"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}
                      >
                        {`// ${p.platform.name}`}
                      </h3>
                      {req.minimum && (
                        <div className="mb-4">
                          <h4
                            className="text-xs uppercase tracking-wider mb-2"
                            style={{ color: 'var(--color-warn)', fontFamily: 'var(--font-mono)' }}
                          >
                            [MIN]
                          </h4>
                          <div
                            className="text-xs whitespace-pre-line p-3"
                            style={{
                              color: 'var(--color-text-muted)',
                              background: 'var(--color-bg)',
                              border: '1px solid var(--color-border)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {req.minimum}
                          </div>
                        </div>
                      )}
                      {req.recommended && (
                        <div>
                          <h4
                            className="text-xs uppercase tracking-wider mb-2"
                            style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}
                          >
                            [RECOMMENDED]
                          </h4>
                          <div
                            className="text-xs whitespace-pre-line p-3"
                            style={{
                              color: 'var(--color-text-muted)',
                              background: 'var(--color-bg)',
                              border: '1px solid var(--color-border)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {req.recommended}
                          </div>
                        </div>
                      )}
                    </Panel>
                  )
                })}
                {game.platforms.every(p => !p.requirements_en) && (
                  <Panel>
                    <p
                      className="text-center py-8"
                      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {'// NO REQUIREMENTS DATA'}
                    </p>
                  </Panel>
                )}
              </div>
            )}

            {activeTab === 'stores' && (
              <div className="space-y-3">
                {game.stores.length > 0 ? (
                  game.stores.map(s => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-retro flex items-center justify-between p-4 group transition-colors"
                    >
                      <span
                        className="uppercase tracking-wider text-sm group-hover:text-[--color-accent] transition-colors"
                        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
                      >
                        &gt; {s.store.name}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
                      >
                        [OPEN →]
                      </span>
                    </a>
                  ))
                ) : (
                  <Panel>
                    <p
                      className="text-center py-8"
                      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {'// NO STORES AVAILABLE'}
                    </p>
                  </Panel>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Panel>
              <h3
                className="text-xs uppercase tracking-wider mb-4"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                {'// INFO'}
              </h3>
              <div className="space-y-4 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                <div>
                  <span className="text-xs block mb-1" style={{ color: 'var(--color-text-faint)' }}>DEVELOPER::</span>
                  {game.developers.length > 0 ? (
                    game.developers.map(d => (
                      <span key={d.id} style={{ color: 'var(--color-text)' }}>{d.name}</span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--color-text-faint)' }}>—</span>
                  )}
                </div>
                <div>
                  <span className="text-xs block mb-1" style={{ color: 'var(--color-text-faint)' }}>RELEASED::</span>
                  <span style={{ color: 'var(--color-text)' }}>{releaseDate || '—'}</span>
                </div>
                {game.website && (
                  <div>
                    <span className="text-xs block mb-1" style={{ color: 'var(--color-text-faint)' }}>WEBSITE::</span>
                    <a
                      href={game.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all hover:underline"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {game.website}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-xs block mb-2" style={{ color: 'var(--color-text-faint)' }}>PLATFORMS::</span>
                  <div className="flex flex-wrap gap-1.5">
                    {game.platforms.map(p => (
                      <span
                        key={p.platform.id}
                        className="text-[10px] px-1.5 py-0.5 uppercase"
                        style={{
                          color: 'var(--color-text-muted)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {p.platform.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs block mb-1" style={{ color: 'var(--color-text-faint)' }}>RATING::</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg tabular-nums" style={{ color: 'var(--color-warn)' }}>
                      ★ {game.rating?.toFixed(1) ?? '—'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                      ({game.reviews_count?.toLocaleString() ?? 0})
                    </span>
                  </div>
                </div>
                {game.metacritic_platforms && game.metacritic_platforms.length > 0 && (
                  <div>
                    <span className="text-xs block mb-2" style={{ color: 'var(--color-text-faint)' }}>METACRITIC::</span>
                    <div className="space-y-1">
                      {game.metacritic_platforms.map(mp => (
                        <div key={mp.platform} className="flex items-center justify-between text-xs">
                          <span style={{ color: 'var(--color-text-muted)' }}>{mp.name}</span>
                          <span
                            className="px-1.5 py-0.5 tabular-nums"
                            style={{
                              color: metacriticColor,
                              border: `1px solid ${metacriticColor}`,
                            }}
                          >
                            {mp.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-xs block mb-2" style={{ color: 'var(--color-text-faint)' }}>STATS::</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    {[
                      { label: 'ADDED', value: game.added, color: 'var(--color-accent)' },
                      { label: 'YOUTUBE', value: game.youtube_count, color: 'var(--color-danger)' },
                      { label: 'TWITCH', value: game.twitch_count, color: 'var(--color-info)' },
                    ].map(s => (
                      <div
                        key={s.label}
                        className="p-2"
                        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                      >
                        <div className="text-sm tabular-nums" style={{ color: s.color }}>
                          {s.value?.toLocaleString() ?? 0}
                        </div>
                        <div style={{ color: 'var(--color-text-faint)' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <h3
                className="text-xs uppercase tracking-wider mb-4"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                {'// GENRES'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {game.genres.map(g => (
                  <span
                    key={g.id}
                    className="text-xs px-2 py-1 uppercase tracking-wider"
                    style={{
                      color: 'var(--color-accent)',
                      border: '1px solid var(--color-accent)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="btn-retro text-xs">
            [← BACK HOME]
          </Link>
        </div>
      </main>
    </div>
  )
}
