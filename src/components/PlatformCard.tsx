'use client'

import { Platform } from '@/lib/types'

type Props = {
  platform: Platform
  isFavorite: boolean
  onToggleFavorite: (platform: Platform) => void
}

export default function PlatformCard({ platform, isFavorite, onToggleFavorite }: Props) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900 hover:border-gray-600 transition-colors group">
      {platform.image_url && (
        <div
          className="h-32 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"
          style={{ backgroundImage: `url(${platform.image_url})` }}
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-100">{platform.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{platform.games_count.toLocaleString()} juegos</p>
          </div>
          <button
            onClick={() => onToggleFavorite(platform)}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
              isFavorite
                ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10'
            }`}
            title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        </div>
        {(platform.year_start || platform.year_end) && (
          <p className="text-xs text-gray-600 mt-2">
            {platform.year_start ?? '?'} — {platform.year_end ?? 'presente'}
          </p>
        )}
        {platform.source === 'database' && (
          <span className="mt-2 inline-block text-[10px] text-gray-700">cached</span>
        )}
      </div>
    </div>
  )
}
