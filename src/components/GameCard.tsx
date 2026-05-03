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

const FALLBACK_GRADIENTS = [
  'from-indigo-950 via-violet-950 to-slate-950',
  'from-slate-900 via-indigo-950 to-zinc-950',
  'from-violet-950 via-fuchsia-950 to-slate-950',
  'from-zinc-900 via-slate-800 to-indigo-950',
  'from-blue-950 via-indigo-950 to-violet-950',
]

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

  const fallback = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]

  return (
    <article
      className="card-enter card-ring group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer bg-[#0c0c18]"
      style={{ animationDelay: `${Math.min(index * 35, 320)}ms` }}
    >
      {/* Full-bleed image */}
      {game.background_image ? (
        <Image
          src={game.background_image}
          alt={game.name}
          fill
          className="object-cover opacity-70 group-hover:opacity-95 group-hover:scale-[1.07] transition-[opacity,transform] duration-700"
          style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallback}`} />
      )}

      {/* Cinematic gradient overlay — dark bottom, subtle top vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 to-transparent" />

      {/* Top controls */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-10">
        <button
          onClick={handleLike}
          title={loggedIn ? (isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión'}
          className={`
            w-7 h-7 flex items-center justify-center rounded-full text-[11px]
            transition-[transform,background-color,box-shadow] duration-200 active:scale-90
            ${isLiked
              ? 'bg-red-500 text-white shadow-md shadow-red-500/50'
              : 'bg-black/60 text-white/50 hover:text-white border border-white/10 backdrop-blur-md'
            }
          `}
          style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
        >
          {isLiked ? '♥' : '♡'}
        </button>

        {game.metacritic && (
          <span
            className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded backdrop-blur-sm"
            style={{
              background: `${metacriticColor}20`,
              color: metacriticColor,
              border: `1px solid ${metacriticColor}35`,
            }}
          >
            {game.metacritic}
          </span>
        )}
      </div>

      {/* Bottom content — overlaid on image */}
      <div className="absolute inset-x-0 bottom-0 p-3 z-10">
        <h3 className="text-white font-semibold text-[13px] leading-tight line-clamp-2 mb-1.5 drop-shadow-sm">
          {game.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-white/40 text-[11px] tabular-nums">{releaseYear ?? '—'}</span>
          {game.rating > 0 && (
            <span className="text-amber-400/90 text-[11px] tabular-nums font-medium">
              ★ {game.rating.toFixed(1)}
            </span>
          )}
        </div>

        {game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {game.genres.slice(0, 2).map((g) => (
              <span
                key={g.id}
                className="text-[9px] px-1.5 py-0.5 rounded-sm bg-white/10 text-white/55 backdrop-blur-sm border border-white/8"
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
