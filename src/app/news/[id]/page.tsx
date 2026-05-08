import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import { CornerPathFrame, CardBar, SquareGeometry } from '@/components/ui'
import { NEWS, getNewsById } from '@/lib/news-data'

export async function generateStaticParams() {
  return NEWS.map(n => ({ id: String(n.id) }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = getNewsById(Number(id))
  if (!item) return { title: 'TRANSMISSION NOT FOUND :: GAMESCOPE' }
  return {
    title: `${item.title.toUpperCase()} :: GAMESCOPE`,
    description: item.excerpt,
  }
}

function formatRetroDate(dateStr: string): string {
  const d = new Date(dateStr)
  const yy = String(d.getFullYear()).slice(-2)
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  const day = Math.floor(diff / (1000 * 60 * 60 * 24))
  return `${yy}.${String(day).padStart(3, '0')}`
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = getNewsById(Number(id))
  if (!item) notFound()

  const idx = NEWS.findIndex(n => n.id === item.id)
  const prev = idx > 0 ? NEWS[idx - 1] : null
  const next = idx < NEWS.length - 1 ? NEWS[idx + 1] : null
  const ref = String(idx + 1).padStart(3, '0')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Header />

      {/* Hero */}
      <div className="relative w-full aspect-[21/9] lg:aspect-[21/7] max-h-[500px] overflow-hidden scanlines">
        <Image src={item.imageUrl} alt={item.title} fill className="object-cover opacity-40" priority sizes="100vw" />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, var(--color-bg) 0%, rgba(8,8,8,0.6) 60%, transparent 100%)`,
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 z-10">
          <div
            className="flex items-center gap-3 mb-3 text-xs uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span
              className="px-2 py-1"
              style={{ background: 'var(--color-accent)', color: '#000' }}
            >
              [{item.category}]
            </span>
            <span style={{ color: 'var(--color-accent)' }}>{formatRetroDate(item.date)}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>[REF::{ref}]</span>
            <span style={{ color: 'var(--color-text-muted)' }}>[{item.readTime} MIN READ]</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-text)' }}
          >
            {item.title}
          </h1>
          <p
            className="text-sm mt-3 max-w-2xl"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {`// ${item.excerpt}`}
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Meta strip */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-faint)' }}>{'AUTHOR::'}</span>
            <div style={{ color: 'var(--color-accent)' }}>/{item.author}</div>
          </div>
          <div className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-faint)' }}>{'CATEGORY::'}</span>
            <div style={{ color: 'var(--color-text)' }}>{item.category.toUpperCase()}</div>
          </div>
          <div className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-faint)' }}>{'PUBLISHED::'}</span>
            <div style={{ color: 'var(--color-text)' }} className="tabular-nums">
              {formatRetroDate(item.date)}
            </div>
          </div>
          <div className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-faint)' }}>{'READ_TIME::'}</span>
            <div style={{ color: 'var(--color-text)' }} className="tabular-nums">
              {item.readTime} MIN
            </div>
          </div>
        </div>

        {/* Body */}
        <article
          className="relative p-6 sm:p-8"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <SquareGeometry opacity={0.08} />
          <CornerPathFrame size={14} />

          <h2
            className="text-xs uppercase tracking-wider mb-6"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {'// transmission body'}
          </h2>

          {item.body.split('\n\n').map((paragraph, i) => (
            <p
              key={i}
              className="leading-relaxed mb-4 last:mb-0"
              style={{
                color: i === 0 ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                lineHeight: 1.7,
              }}
            >
              {i === 0 && (
                <span style={{ color: 'var(--color-accent)', marginRight: '0.5rem' }}>&gt;_</span>
              )}
              {paragraph}
            </p>
          ))}

          <CardBar className="mt-8 mb-4" color="var(--color-accent)" />

          <div
            className="flex items-center justify-between text-xs uppercase tracking-wider"
            style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}
          >
            <span>END OF TRANSMISSION</span>
            <span>[REF::{ref}]</span>
          </div>
        </article>

        {/* Nav */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          {prev ? (
            <Link
              href={`/news/${prev.id}`}
              className="card-retro p-4 group transition-colors block"
            >
              <div
                className="text-[10px] uppercase tracking-widest mb-1"
                style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}
              >
                [← PREV]
              </div>
              <div
                className="text-xs uppercase truncate group-hover:text-[--color-accent] transition-colors"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}
              >
                {prev.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/news/${next.id}`}
              className="card-retro p-4 group transition-colors block text-right"
            >
              <div
                className="text-[10px] uppercase tracking-widest mb-1"
                style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}
              >
                [NEXT →]
              </div>
              <div
                className="text-xs uppercase truncate group-hover:text-[--color-accent] transition-colors"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}
              >
                {next.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <div className="flex items-center justify-center gap-3 mt-8">
          <Link href="/news" className="btn-retro text-xs">
            [VIEW ALL]
          </Link>
          <Link href="/" className="btn-retro text-xs">
            [BACK HOME]
          </Link>
        </div>
      </main>
    </div>
  )
}
