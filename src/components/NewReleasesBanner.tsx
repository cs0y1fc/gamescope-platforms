'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { RawgGame } from '@/lib/rawg'

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function NewReleasesBanner() {
  const [games, setGames] = useState<RawgGame[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/new-releases')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGames(data) })
      .finally(() => setLoading(false))
  }, [])

  if (!loading && games.length === 0) return null

  return (
    <section className="mb-8">
      {/* Header row */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          Últimas novedades
        </h2>
      </div>

      {/* Scrollable strip with edge fade */}
      <div className="relative">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#080810] to-transparent z-10" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#080810] to-transparent z-10" />

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-80 rounded-2xl overflow-hidden bg-[#0f0f1a] border border-white/5"
                >
                  <div className="skeleton h-48" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3.5 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))
            : games.map((game, i) => (
                <article
                  key={game.id}
                  className="card-enter flex-shrink-0 w-80 rounded-2xl overflow-hidden bg-[#0f0f1a] border border-white/5 hover:border-white/15 group cursor-pointer transition-colors"
                  style={{ animationDelay: `${Math.min(i * 40, 280)}ms` }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-[#1a1a2e]">
                    {game.background_image ? (
                      <Image
                        src={game.background_image}
                        alt={game.name}
                        fill
                        className="object-cover opacity-60 group-hover:opacity-85 transition-opacity duration-500"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                        sizes="320px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/10 text-4xl font-bold">?</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />

                    {/* Release date badge */}
                    {game.released && (
                      <span className="absolute bottom-2 right-2 text-xs font-medium text-white/60 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                        {formatDate(game.released)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-white/80 text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors duration-150">
                      {game.name}
                    </p>
                    {game.genres.length > 0 && (
                      <p className="text-white/30 text-xs mt-1.5 truncate">
                        {game.genres.slice(0, 2).map(g => g.name).join(' · ')}
                      </p>
                    )}
                  </div>
                </article>
              ))}
        </div>
      </div>
    </section>
  )
}
