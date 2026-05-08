import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import { CornerPathFrame, CardBar } from '@/components/ui'
import { NEWS } from '@/lib/news-data'

export const metadata = {
  title: 'TRANSMISSIONS :: GAMESCOPE',
  description: '// Latest gaming news on RetroNova',
}

function formatRetroDate(dateStr: string): string {
  const d = new Date(dateStr)
  const yy = String(d.getFullYear()).slice(-2)
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  const day = Math.floor(diff / (1000 * 60 * 60 * 24))
  return `${yy}.${String(day).padStart(3, '0')}`
}

export default function NewsListPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          {'> ARCHIVE :: TRANSMISSIONS LOG'}
        </div>

        <div className="section-divider">
          <span>{'// transmissions archive'}</span>
        </div>

        <div className="flex items-end justify-between mb-8">
          <div>
            <h1
              className="text-3xl uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-text)' }}
            >
              TRANSMISSIONS
            </h1>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {`> ${NEWS.length} ENTRIES IN ARCHIVE`}
            </p>
          </div>
          <Link href="/" className="btn-retro text-xs">
            [← BACK HOME]
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NEWS.map((item, i) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="card-retro group relative h-72 overflow-hidden cursor-pointer card-enter block"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CornerPathFrame size={12} />

              <div className="absolute inset-0">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    style={{ background: 'var(--color-accent)', color: '#000', fontFamily: 'var(--font-mono)' }}
                  >
                    [{item.category}]
                  </span>
                  <h3
                    className="text-sm uppercase tracking-wide line-clamp-2 leading-tight mb-1 group-hover:text-[--color-accent] transition-colors"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text)' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-[11px] line-clamp-2"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {`// ${item.excerpt}`}
                  </p>
                  <CardBar className="mt-2" />
                  <div
                    className="flex items-center justify-between mt-2 text-[10px] uppercase tracking-wider"
                    style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}
                  >
                    <span>{`/${item.author}`}</span>
                    <span>[{item.readTime} MIN]</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
