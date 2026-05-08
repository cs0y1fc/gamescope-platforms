'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { RawgGame } from '@/lib/rawg'
import { CornerPathFrame } from '@/components/ui'

function daysAgo(dateStr: string | null): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'T-0D'
  if (diff < 7) return `T-${diff}D`
  if (diff < 30) return `T-${Math.floor(diff / 7)}W`
  return `T-${Math.floor(diff / 30)}M`
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <section className="mb-8">
      <div className="section-divider mb-4">
        <span>{'// incoming transmissions'}</span>
      </div>

      <div
        className="relative overflow-hidden h-[280px] sm:h-[340px] lg:h-[380px]"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <CornerPathFrame size={20} />

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
                  className="relative h-full shrink-0 px-1.5"
                  style={{ width: `${100 / games.length}%` }}
                >
                  <Link
                    href={`/game/${game.slug}`}
                    className="relative h-full w-full overflow-hidden block group/card"
                  >
                    {game.background_image && (
                      <Image
                        src={game.background_image}
                        alt={game.name}
                        fill
                        priority={i < visibleCount}
                        className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, var(--color-bg) 0%, rgba(8,8,8,0.7) 50%, rgba(8,8,8,0.2) 100%)`,
                      }}
                    />

                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[10px] px-2 py-0.5 uppercase tracking-widest"
                          style={{
                            background: 'var(--color-accent)',
                            color: '#000',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          [NEW]
                        </span>
                        {game.released && (
                          <span
                            className="text-[10px] uppercase tracking-wider tabular-nums"
                            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
                          >
                            {daysAgo(game.released)}
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-base sm:text-lg lg:text-xl uppercase tracking-wide leading-tight line-clamp-2 mb-2"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          color: 'var(--color-text)',
                        }}
                      >
                        {game.name}
                      </h3>
                      <div
                        className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider"
                        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                      >
                        {game.genres.slice(0, 2).map(g => (
                          <span key={g.id}>{`// ${g.name}`}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveIndex(current => (current <= 0 ? maxIndex : current - 1))}
              aria-label="PREV"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 px-3 py-2 transition-colors"
              style={{
                background: 'rgba(8,8,8,0.7)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
              }}
            >
              [← PREV]
            </button>
            <button
              onClick={() => setActiveIndex(current => (current >= maxIndex ? 0 : current + 1))}
              aria-label="NEXT"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 px-3 py-2 transition-colors"
              style={{
                background: 'rgba(8,8,8,0.7)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
              }}
            >
              [NEXT →]
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 flex gap-1.5">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="transition-all"
                  style={{
                    width: i === activeIndex ? '20px' : '6px',
                    height: '4px',
                    background: i === activeIndex ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
