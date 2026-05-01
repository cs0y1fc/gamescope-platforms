'use client'

import Image from 'next/image'
import { Game } from '@/lib/types'

type Props = {
  game: Game
  isLiked: boolean
  loggedIn: boolean
  onToggleLike: (game: Game) => void
  onNeedAuth: () => void
}

export default function GameCard({ game, isLiked, loggedIn, onToggleLike, onNeedAuth }: Props) {
  const releaseYear = game.released ? new Date(game.released).getFullYear() : null

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!loggedIn) { onNeedAuth(); return }
    onToggleLike(game)
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden hover:border-gray-600 transition-colors group">
      <div className="relative h-40 bg-gray-800">
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            className="object-cover opacity-70 group-hover:opacity-90 transition-opacity"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-sm">
            Sin imagen
          </div>
        )}

        <button
          onClick={handleLike}
          title={loggedIn ? (isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión para dar likes'}
          className={`absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full transition-all
            ${isLiked
              ? 'bg-red-500 text-white'
              : 'bg-black/50 text-gray-400 hover:bg-black/70 hover:text-red-400'
            }`}
        >
          {isLiked ? '♥' : '♡'}
        </button>

        {game.metacritic && (
          <span
            className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded ${
              game.metacritic >= 75
                ? 'bg-green-500/90 text-white'
                : game.metacritic >= 50
                ? 'bg-yellow-500/90 text-black'
                : 'bg-red-500/90 text-white'
            }`}
          >
            {game.metacritic}
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2">
          {game.name}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>{releaseYear ?? '—'}</span>
          {game.rating > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              {game.rating.toFixed(1)}
            </span>
          )}
        </div>

        {game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, 3).map((g) => (
              <span
                key={g.id}
                className="text-xs bg-gray-800 text-gray-400 rounded px-1.5 py-0.5"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
