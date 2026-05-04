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

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/new-releases', { signal: controller.signal })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGames(data.slice(0, 5)) }) // Take top 5
      .catch(err => { if (err.name !== 'AbortError') console.error(err) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  // Auto-advance
  useEffect(() => {
    if (games.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex(current => (current + 1) % games.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [games.length])

  if (!loading && games.length === 0) return null

  return (
    <section className="mb-12 rounded-3xl overflow-hidden relative glass-strong card-ring-hero h-[400px] sm:h-[500px] lg:h-[550px] group">
      {loading ? (
        <div className="absolute inset-0 skeleton" />
      ) : (
        <>
          {/* Main Image Layer */}
          {games.map((game, i) => (
            <div
              key={game.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                i === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {game.background_image && (
                <Image
                  src={game.background_image}
                  alt={game.name}
                  fill
                  priority={i === 0}
                  className="object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[10s] ease-out"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
              )}
              {/* Gradients for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/60 to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/40 to-transparent opacity-90" />
            </div>
          ))}

          {/* Content Layer */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 lg:p-16">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-400">
                  Nuevos Lanzamientos
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-4 leading-tight drop-shadow-2xl">
                {games[activeIndex]?.name}
              </h2>
              
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {games[activeIndex]?.released && (
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-white border border-white/10">
                    {formatDate(games[activeIndex].released)}
                  </span>
                )}
                <div className="flex gap-2">
                  {games[activeIndex]?.genres.slice(0, 3).map(g => (
                    <span key={g.id} className="text-sm font-medium text-white/60">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2">
                  Ver Detalles
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Prev/Next Scroll Buttons */}
          <button
            onClick={() => setActiveIndex(current => (current - 1 + games.length) % games.length)}
            aria-label="Anterior"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/40 transition-all active:scale-95 flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => setActiveIndex(current => (current + 1) % games.length)}
            aria-label="Siguiente"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/40 transition-all active:scale-95 flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Navigation Indicators */}
          <div className="absolute right-6 sm:right-10 bottom-6 sm:bottom-10 z-20 flex gap-2">
            {games.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
