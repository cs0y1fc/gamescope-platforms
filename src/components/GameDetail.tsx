'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import GameCard from '@/components/GameCard'
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

const FALLBACK_GRADIENTS = [
  'from-indigo-100 via-violet-100 to-slate-100',
  'from-slate-100 via-indigo-100 to-zinc-100',
  'from-violet-100 via-fuchsia-100 to-slate-100',
]

function MarkdownText({ text }: { text: string }) {
  const paragraphs = text.split('\n').filter(p => p.trim())
  
  return (
    <>
      {paragraphs.map((p, i) => {
        if (p.startsWith('###')) {
          return <h3 key={i} className="text-lg font-semibold text-slate-900 mt-6 mb-2">{p.replace('###', '').trim()}</h3>
        }
        if (p.startsWith('##')) {
          return <h2 key={i} className="text-xl font-display font-bold text-slate-900 mt-6 mb-2">{p.replace('##', '').trim()}</h2>
        }
        if (p.startsWith('#')) {
          return <h1 key={i} className="text-2xl font-display font-bold text-slate-900 mt-6 mb-2">{p.replace('#', '').trim()}</h1>
        }
        return <p key={i} className="text-slate-600 leading-relaxed mb-3">{p}</p>
      })}
    </>
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
    if (!loggedIn) {
      setShowAuth(true)
      return
    }
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
    game?.metacritic && game.metacritic >= 75 ? '#22c55e'
    : game?.metacritic && game.metacritic >= 50 ? '#eab308'
    : '#ef4444'

  const releaseYear = game?.released ? new Date(game.released).getFullYear() : null
  const releaseDate = game?.released ? new Date(game.released).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : null

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] right-[-10%] w-[40%] h-[50%] bg-emerald-400/20 rounded-full blur-[150px]" />
        </div>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="rounded-2xl overflow-hidden skeleton aspect-[21/9] mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-10 skeleton rounded-xl w-3/4" />
              <div className="h-6 skeleton rounded-lg w-1/2" />
              <div className="h-32 skeleton rounded-xl w-full" />
            </div>
            <div className="space-y-4">
              <div className="h-48 skeleton rounded-xl w-full" />
              <div className="h-24 skeleton rounded-xl w-full" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px]" />
        </div>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 relative z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Juego no encontrado</h2>
            <p className="text-slate-500 mb-6">{error || 'No se pudo cargar la información del juego.'}</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m7 13l-7-7m0 0l7-7" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[50%] bg-emerald-400/20 rounded-full blur-[150px]" />
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">Inicia sesión</h3>
            <p className="text-slate-500 mb-4">Necesitas iniciar sesión para dar likes.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAuth(false)}
                className="flex-1 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <a
                href="/auth/callback?provider=google"
                className="flex-1 px-4 py-2 rounded-full bg-indigo-600 text-white text-center font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Iniciar sesión
              </a>
            </div>
          </div>
        </div>
      )}

      <Header />

      {/* Hero Banner */}
      <div className="relative w-full aspect-[21/9] lg:aspect-[21/7] max-h-[500px] overflow-hidden">
        {game.background_image ? (
          <>
            <Image
              src={game.background_image}
              alt={game.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f8fafc]/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${FALLBACK_GRADIENTS[0]}`} />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 z-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {game.metacritic && (
                  <span
                    className="text-sm font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm"
                    style={{
                      background: `${metacriticColor}25`,
                      color: metacriticColor,
                      border: `1px solid ${metacriticColor}40`,
                    }}
                  >
                    Metacritic: {game.metacritic}
                  </span>
                )}
                {game.esrb_rating && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-500">
                    {game.esrb_rating.name}
                  </span>
                )}
                {game.playtime && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-500">
                    {game.playtime}h playtime
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight">
                {game.name}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                {releaseDate && (
                  <span className="text-slate-500 text-sm font-medium">{releaseDate}</span>
                )}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isLiked
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/50'
                      : 'bg-white/80 backdrop-blur-md text-slate-600 hover:text-rose-500 border border-slate-200'
                  }`}
                >
                  <span className="text-lg">{isLiked ? '♥' : '♡'}</span>
                  {isLiked ? 'Liked' : 'Like'}
                </button>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-2xl">
                <span>★</span>
                <span>{game.rating?.toFixed(1) ?? '—'}</span>
              </div>
              <p className="text-slate-400 text-xs font-medium mt-1">{game.reviews_count?.toLocaleString()} reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Quick Info Bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          {game.genres.slice(0, 5).map(g => (
            <span
              key={g.id}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600"
            >
              {g.name}
            </span>
          ))}
          {releaseYear && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
              {releaseYear}
            </span>
          )}
          {game.developers.length > 0 && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
              {game.developers[0].name}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 p-1 bg-white/80 backdrop-blur-xl rounded-full border border-slate-200 shadow-lg shadow-slate-200/50 w-fit">
          {([
            { key: 'about', label: 'Acerca de' },
            { key: 'screenshots', label: 'Capturas' },
            { key: 'requirements', label: 'Requisitos' },
            { key: 'stores', label: 'Tiendas' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <h2 className="text-xl font-display font-bold text-slate-900 mb-4">Descripción</h2>
                {game.description_raw ? (
                  <MarkdownText text={game.description_raw} />
                ) : (
                  <p className="text-slate-400">No hay descripción disponible.</p>
                )}

                {/* Publishers */}
                {game.publishers.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Publicado por</h3>
                    <div className="flex flex-wrap gap-2">
                      {game.publishers.map(p => (
                        <span key={p.id} className="text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {game.tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {game.tags.slice(0, 20).map(t => (
                        <span key={t.id} className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Screenshots Tab */}
            {activeTab === 'screenshots' && (
              <div>
                {game.screenshots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {game.screenshots.map(s => (
                      <div key={s.id} className="rounded-2xl overflow-hidden shadow-sm border border-slate-100">
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
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <p className="text-slate-400">No hay capturas disponibles.</p>
                  </div>
                )}
              </div>
            )}

            {/* Requirements Tab */}
            {activeTab === 'requirements' && (
              <div className="space-y-6">
                {game.platforms.map(p => {
                  const req = p.requirements_en
                  if (!req) return null
                  return (
                    <div key={p.platform.id} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                      <h3 className="text-lg font-display font-bold text-slate-900 mb-4">{p.platform.name}</h3>
                      {req.minimum && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">Mínimo</h4>
                          <div className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 rounded-xl p-4">
                            {req.minimum}
                          </div>
                        </div>
                      )}
                      {req.recommended && (
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">Recomendado</h4>
                          <div className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 rounded-xl p-4">
                            {req.recommended}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                {game.platforms.every(p => !p.requirements_en) && (
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <p className="text-slate-400">No hay requisitos disponibles.</p>
                  </div>
                )}
              </div>
            )}

            {/* Stores Tab */}
            {activeTab === 'stores' && (
              <div className="space-y-4">
                {game.stores.length > 0 ? (
                  game.stores.map(s => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {s.store.name}
                        </span>
                      </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0 0L10 14" />
                      </svg>
                    </a>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <p className="text-slate-400">No hay tiendas disponibles.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Información</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Desarrollador</span>
                  {game.developers.length > 0 ? (
                    game.developers.map(d => (
                      <span key={d.id} className="text-sm font-medium text-slate-700">{d.name}</span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Publicado</span>
                  <span className="text-sm font-medium text-slate-700">{releaseDate || '—'}</span>
                </div>
                {game.website && (
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Sitio web</span>
                    <a href={game.website} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                      {game.website}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Plataformas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {game.platforms.map(p => (
                      <span key={p.platform.id} className="text-xs font-medium px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
                        {p.platform.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Rating usuarios</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-amber-500">★ {game.rating?.toFixed(1) ?? '—'}</span>
                    <span className="text-xs text-slate-400">({game.reviews_count?.toLocaleString() ?? 0} reviews)</span>
                  </div>
                </div>
                {game.metacritic_platforms && game.metacritic_platforms.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Metacritic por plataforma</span>
                    <div className="space-y-2">
                      {game.metacritic_platforms.map(mp => (
                        <div key={mp.platform} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{mp.name}</span>
                          <span
                            className="text-sm font-bold px-2 py-0.5 rounded"
                            style={{
                              background: `${metacriticColor}20`,
                              color: metacriticColor,
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
                  <span className="text-xs text-slate-400 block mb-1">Popularidad</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-indigo-600">{game.added?.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Añadidos</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-red-500">{game.youtube_count?.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">YouTube</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-purple-500">{game.twitch_count?.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Twitch</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Géneros</h3>
              <div className="flex flex-wrap gap-2">
                {game.genres.map(g => (
                  <span
                    key={g.id}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-full hover:bg-slate-100 hover:border-slate-300 transition-all shadow-lg shadow-slate-200/50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m7 13l-7-7m0 0l7-7" />
            </svg>
            Volver al catálogo
          </Link>
        </div>
      </main>
    </div>
  )
}