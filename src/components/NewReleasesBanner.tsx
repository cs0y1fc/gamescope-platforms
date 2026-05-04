'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { RawgGame } from '@/lib/rawg'

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function NewReleasesBanner() {
  const [games, setGames] = useState<RawgGame[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(2)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/new-releases', { signal: controller.signal })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGames(data.slice(0, 8)) })
      .catch(err => { if (err.name !== 'AbortError') console.error(err) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setVisibleCount(w >= 1024 ? 3 : w >= 640 ? 2 : 1)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const maxIndex = Math.max(0, games.length - visibleCount)

  useEffect(() => {
    if (activeIndex > maxIndex) setActiveIndex(maxIndex)
  }, [activeIndex, maxIndex])

  useEffect(() => {
    if (games.length <= visibleCount) return
    const interval = setInterval(() => {
      setActiveIndex(current => (current >= maxIndex ? 0 : current + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [games.length, maxIndex, visibleCount])

  if (!loading && games.length === 0) return null

  const slideWidthPct = 100 / visibleCount

  return (
    <section className="mb-12 rounded-3xl overflow-hidden relative glass-strong card-ring-hero h-[280px] sm:h-[350px] lg:h-[385px] group">
      {loading ? (
        <div className="absolute inset-0 skeleton" />
      ) : (
        <>
          <div
            className="flex h-full transition-transform duration-700 ease-out"
            style={{
              width: `${(games.length * 100) / visibleCount}%`,
              transform: `translateX(-${activeIndex * slideWidthPct}%)`,
            }}
          >
            {games.map((game, i) => (
              <div
                key={game.id}
                className="relative h-full shrink-0 px-1.5 first:pl-0 last:pr-0"
                style={{ width: `${100 / games.length}%` }}
              >
                <div className="relative h-full w-full rounded-2xl overflow-hidden">
                  {game.background_image && (
                    <Image
                      src={game.background_image}
                      alt={game.name}
                      fill
                      priority={i < visibleCount}
                      className="object-cover transform scale-105 hover:scale-100 transition-transform duration-[6s] ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/60 to-transparent opacity-95" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#030305]/80 via-transparent to-transparent opacity-80" />

                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 lg:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400">
                        Nuevo
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-white mb-2 leading-tight drop-shadow-2xl line-clamp-2">
                      {game.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {game.released && (
                        <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-medium text-white border border-white/10">
                          {formatDate(game.released)}
                        </span>
                      )}
                      {game.genres.slice(0, 2).map(g => (
                        <span key={g.id} className="text-[11px] font-medium text-white/60">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveIndex(current => (current <= 0 ? maxIndex : current - 1))}
            aria-label="Anterior"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/40 transition-all active:scale-95 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => setActiveIndex(current => (current >= maxIndex ? 0 : current + 1))}
            aria-label="Siguiente"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/40 transition-all active:scale-95 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-4 z-20 flex gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Ir a la página ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
