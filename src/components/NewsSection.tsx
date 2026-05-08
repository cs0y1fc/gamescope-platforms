'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CornerPathFrame } from '@/components/ui'

type NewsItem = {
  id: number
  title: string
  excerpt: string
  imageUrl: string
  date: string
  category: string
}

function formatRetroDate(dateStr: string): string {
  const d = new Date(dateStr)
  const yy = String(d.getFullYear()).slice(-2)
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  const day = Math.floor(diff / (1000 * 60 * 60 * 24))
  return `${yy}.${String(day).padStart(3, '0')}`
}

function picsumFor(index: number): string {
  return `https://picsum.photos/seed/retronova-news-${index + 1}/800/400`
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNews(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  if (!loading && news.length === 0) return null

  return (
    <section className="mb-12 mt-12">
      <div className="section-divider">
        <span>{'// latest transmissions'}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-xl uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}
          >
            TRANSMISSIONS
          </h2>
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            &gt; INCOMING DATA STREAM
          </p>
        </div>
        <button className="btn-retro text-xs">
          [VIEW ALL →]
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-72" style={{ border: '1px solid var(--color-border)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {news.map((item, i) => (
            <article
              key={item.id}
              className="card-retro group relative h-64 sm:h-72 overflow-hidden cursor-pointer card-enter"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CornerPathFrame size={12} />

              <div className="absolute inset-0">
                <Image
                  src={picsumFor(i)}
                  alt={item.title}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>

              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, var(--color-bg) 0%, rgba(8,8,8,0.7) 50%, transparent 100%)`,
                }}
              />

              <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                <div className="flex items-start justify-between">
                  <span
                    className="text-[10px] tabular-nums"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    [{String(i + 1).padStart(3, '0')}]
                  </span>
                  <span
                    className="text-[10px] tabular-nums"
                    style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
                  >
                    {formatRetroDate(item.date)}
                  </span>
                </div>

                <div>
                  <span
                    className="inline-block text-[9px] px-1.5 py-0.5 mb-2 uppercase tracking-widest"
                    style={{
                      background: 'var(--color-accent)',
                      color: '#000',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    [{item.category}]
                  </span>
                  <h3
                    className="text-sm uppercase tracking-wide line-clamp-2 leading-tight mb-1 group-hover:text-[--color-accent] transition-colors"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-[11px] line-clamp-2"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {`// ${item.excerpt}`}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
