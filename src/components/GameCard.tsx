'use client'

import Image from 'next/image'
import { Game } from '@/lib/types'

type Props = {
  game: Game
  isLiked: boolean
  loggedIn: boolean
  onToggleLike: (game: Game) => void
  onNeedAuth: () => void
  index?: number
}

export default function GameCard({ game, isLiked, loggedIn, onToggleLike, onNeedAuth, index = 0 }: Props) {
  const releaseYear = game.released ? new Date(game.released).getFullYear() : null

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!loggedIn) { onNeedAuth(); return }
    onToggleLike(game)
  }

  const metacriticColor =
    game.metacritic && game.metacritic >= 75 ? '#22c55e'
    : game.metacritic && game.metacritic >= 50 ? '#eab308'
    : '#ef4444'

  return (
    <article
      className="card-enter group relative flex flex-col rounded-2xl overflow-hidden bg-[#0f0f1a] border border-white/5 hover:border-white/10 transition-colors"
      style={{
        animationDelay: `${Math.min(index * 40, 300)}ms`,
      }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-[#1a1a2e]">
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/10 text-4xl font-bold select-none">?</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />

        {/* Like button — scale(0.95)+opacity, NOT scale(0) */}
        <button
          onClick={handleLike}
          title={loggedIn ? (isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión'}
          className={`
            absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full text-sm
            transition-[transform,opacity,background-color] duration-150
            active:scale-95
            ${isLiked
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-black/40 text-white/50 hover:bg-black/60 hover:text-white/80 backdrop-blur-sm'
            }
          `}
          style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
        >
          {isLiked ? '♥' : '♡'}
        </button>

        {/* Metacritic */}
        {game.metacritic && (
          <span
            className="absolute top-3 right-3 text-xs font-bold tabular-nums px-2 py-0.5 rounded-md"
            style={{ background: `${metacriticColor}22`, color: metacriticColor, border: `1px solid ${metacriticColor}44` }}
          >
            {game.metacritic}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
          {game.name}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-white/30 text-xs tabular-nums">{releaseYear ?? '—'}</span>
          {game.rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-400/80">
              <span>★</span>
              <span className="tabular-nums">{game.rating.toFixed(1)}</span>
            </span>
          )}
        </div>

        {game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, 3).map((g) => (
              <span
                key={g.id}
                className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-white/40 border border-white/5"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
