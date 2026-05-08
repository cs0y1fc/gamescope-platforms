'use client'

import Link from 'next/link'
import { Platform } from '@/lib/types'
import { CornerPathFrame, CardBar } from '@/components/ui'

type Props = {
  platform: Platform
  isFavorite: boolean
  onToggleFavorite: (platform: Platform) => void
}

export default function PlatformCard({ platform, isFavorite, onToggleFavorite }: Props) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite(platform)
  }

  return (
    <Link href={`/platforms/${platform.slug}`} className="card-retro relative overflow-hidden group block">
      <CornerPathFrame size={12} />

      {platform.image_url && (
        <div
          className="h-32 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity"
          style={{ backgroundImage: `url(${platform.image_url})` }}
        />
      )}

      <div className="p-4 relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className="uppercase tracking-wide truncate group-hover:text-[--color-accent] transition-colors"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--color-text)',
                fontSize: '0.95rem',
              }}
            >
              {platform.name}
            </h3>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {`// ${platform.games_count.toLocaleString()} games`}
            </p>
          </div>
          <button
            onClick={handleFavoriteClick}
            className="flex-shrink-0 px-2 py-1 transition-colors"
            style={{
              color: isFavorite ? 'var(--color-accent)' : 'var(--color-text-muted)',
              border: `1px solid ${isFavorite ? 'var(--color-accent)' : 'var(--color-border)'}`,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
            }}
            title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            {isFavorite ? '[★]' : '[☆]'}
          </button>
        </div>

        {(platform.year_start || platform.year_end) && (
          <p
            className="text-xs mt-3 tabular-nums"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            [{platform.year_start ?? '????'} — {platform.year_end ?? 'PRESENT'}]
          </p>
        )}

        <CardBar className="mt-3 mb-2" />

        <div className="flex items-center justify-between">
          <span
            className="text-[10px] uppercase tracking-wider"
            style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}
          >
            {platform.source === 'database' ? '[CACHED]' : '[LIVE]'}
          </span>
          <span
            className="text-[10px] uppercase tracking-wider"
            style={{
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {isFavorite ? '[SAVED]' : '[VIEW →]'}
          </span>
        </div>
      </div>
    </Link>
  )
}
