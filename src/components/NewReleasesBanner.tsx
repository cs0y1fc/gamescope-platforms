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
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/new-releases')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGames(data) })
      .finally(() => setLoading(false))
  }, [])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const firstCard = el.querySelector('article') as HTMLElement | null
    if (!firstCard) return
    const cardWidth = firstCard.offsetWidth + 12 // gap-3 = 12px
    setActiveIndex(Math.round(el.scrollLeft / cardWidth))
  }

  const scrollToIndex = (i: number) => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const firstCard = el.querySelector('article') as HTMLElement | null
    if (!firstCard) return
    const cardWidth = firstCard.offsetWidth + 12
    el.scrollTo({ left: i * cardWidth, behavior: 'smooth' })
    setActiveIndex(i)
  }

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

      {/* Scrollable strip with edge fades */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#080810] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#080810] to-transparent z-10" />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[168px] sm:w-64 rounded-xl sm:rounded-2xl overflow-hidden bg-[#0f0f1a] border border-white/5 snap-start"
                >
                  <div className="skeleton h-28 sm:h-40" />
                  <div className="p-2.5 sm:p-3.5 space-y-1.5">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-2.5 w-1/3 rounded" />
                  </div>
                </div>
              ))
            : games.map((game, i) => (
                <article
                  key={game.id}
                  className="card-enter flex-shrink-0 w-[168px] sm:w-64 rounded-xl sm:rounded-2xl overflow-hidden bg-[#0f0f1a] border border-white/5 hover:border-white/15 group cursor-pointer snap-start transition-[transform,border-color] duration-300 sm:hover:-translate-y-1"
                  style={{
                    animationDelay: `${Math.min(i * 40, 280)}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)',
                  }}
                >
                  {/* Image */}
                  <div className="relative h-28 sm:h-40 overflow-hidden bg-[#1a1a2e]">
                    {game.background_image ? (
                      <Image
                        src={game.background_image}
                        alt={game.name}
                        fill
                        className="object-cover opacity-60 group-hover:opacity-85 transition-opacity duration-500"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                        sizes="(max-width: 640px) 168px, 256px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/10 text-2xl sm:text-4xl font-bold">?</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />
                    {game.released && (
                      <span className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 text-[10px] sm:text-xs font-medium text-white/60 bg-black/50 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                        {formatDate(game.released)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5 sm:p-3.5">
                    <p className="text-white/80 text-xs sm:text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors duration-150">
                      {game.name}
                    </p>
                    {game.genres.length > 0 && (
                      <p className="text-white/30 text-[10px] sm:text-xs mt-1 sm:mt-1.5 truncate">
                        {game.genres.slice(0, 2).map(g => g.name).join(' · ')}
                      </p>
                    )}
                  </div>
                </article>
              ))}
        </div>
      </div>

      {/* Dots indicator — only on mobile */}
      {!loading && games.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
          {games.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Anar a la targeta ${i + 1}`}
              className={`rounded-full h-1.5 transition-all duration-200 ${
                i === activeIndex
                  ? 'w-4 bg-indigo-400'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
