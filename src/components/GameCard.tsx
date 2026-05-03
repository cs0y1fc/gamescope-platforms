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
      className="card-enter card-glow group relative flex flex-col rounded-2xl overflow-hidden bg-[#0f0f1a] border border-white/5 hover:border-indigo-500/20 transition-[transform,border-color] duration-300 hover:-translate-y-0.5"
      style={{
        animationDelay: `${Math.min(index * 40, 300)}ms`,
        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-[#1a1a2e]">
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            className="object-cover opacity-60 group-hover:opacity-90 group-hover:scale-[1.06] transition-[opacity,transform] duration-700"
            style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/10 text-4xl font-bold select-none">?</span>
          </div>
        )}

        {/* Gradient overlay — richer, preserves top of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/40 to-transparent" />

        {/* Like button */}
        <button
          onClick={handleLike}
          title={loggedIn ? (isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión'}
          className={`
            absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full text-sm
            transition-[transform,opacity,background-color,box-shadow] duration-150
            active:scale-95
            ${isLiked
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
              : 'bg-black/50 text-white/50 hover:bg-black/70 hover:text-white/90 backdrop-blur-sm'
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
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <h3 className="text-white/90 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors duration-150">
          {game.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-white/30 text-xs tabular-nums">{releaseYear ?? '—'}</span>
        </div>

        {/* Rating bar */}
        {game.rating > 0 && (
          <div className="flex items-center gap-2 mt-auto">
            <div className="flex-1 h-0.5 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-300"
                style={{ width: `${(game.rating / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-amber-400/80 tabular-nums shrink-0">{game.rating.toFixed(1)}</span>
          </div>
        )}

        {game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, 3).map((g) => (
              <span
                key={g.id}
                className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-white/35 border border-white/5 group-hover:border-white/8 transition-colors duration-150"
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
