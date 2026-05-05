'use client'

import Image from 'next/image'
import { Game } from '@/lib/types'

type Variant = 'default' | 'hero' | 'compact'

type Props = {
  game: Game
  isLiked: boolean
  loggedIn: boolean
  onToggleLike: (game: Game) => void
  onNeedAuth: () => void
  index?: number
  variant?: Variant
}

const FALLBACK_GRADIENTS = [
  'from-indigo-100 via-violet-100 to-slate-100',
  'from-slate-100 via-indigo-100 to-zinc-100',
  'from-violet-100 via-fuchsia-100 to-slate-100',
  'from-zinc-100 via-slate-50 to-indigo-100',
  'from-blue-100 via-indigo-100 to-violet-100',
]

export default function GameCard({
  game, isLiked, loggedIn, onToggleLike, onNeedAuth, index = 0, variant = 'default',
}: Props) {
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

  const isHero = variant === 'hero'
  const isCompact = variant === 'compact'

  // Aspect / sizing per variant. Hero/compact rely on parent grid sizing on lg+.
  const aspectClass = isHero
    ? 'aspect-[4/5] lg:aspect-auto lg:h-full'
    : isCompact
      ? 'aspect-[16/10] lg:aspect-auto lg:h-full'
      : 'aspect-[3/4]'

  const ringClass = isHero ? 'card-ring-hero' : 'card-ring'

  const imageScaleHover = isHero
    ? 'group-hover:scale-[1.04]'
    : isCompact
      ? 'group-hover:scale-[1.06]'
      : 'group-hover:scale-[1.07]'

  const titleClass = isHero
    ? 'font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight mb-2'
    : isCompact
      ? 'font-semibold text-[12px] sm:text-[13px] leading-tight line-clamp-2 mb-1'
      : 'font-semibold text-[13px] leading-tight line-clamp-2 mb-1.5'

  const padding = isHero
    ? 'p-5 sm:p-6 lg:p-8'
    : isCompact
      ? 'p-2.5 sm:p-3'
      : 'p-3'

  const likeBtnClass = isHero
    ? 'w-9 h-9 text-sm'
    : 'w-7 h-7 text-[11px]'

  return (
    <article
      className={`card-enter ${ringClass} group relative ${aspectClass} rounded-xl overflow-hidden cursor-pointer bg-white`}
      style={{ animationDelay: `${Math.min(index * 35, 320)}ms` }}
    >
      {/* Full-bleed image */}
      {game.background_image ? (
        <Image
          src={game.background_image}
          alt={game.name}
          fill
          className={`object-cover ${isHero ? 'opacity-80' : 'opacity-70'} group-hover:opacity-95 ${imageScaleHover} transition-[opacity,transform] duration-700`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
          sizes={
            isHero
              ? '(max-width: 1024px) 100vw, 66vw'
              : isCompact
                ? '(max-width: 1024px) 33vw, 25vw'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
          }
          priority={isHero}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallback}`} />
      )}

      {/* Cinematic gradient overlay */}
      {isHero ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/10" />
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white/95 via-white/80 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/80 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-white/10" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white/95 to-transparent" />
        </>
      )}

      {/* Top controls */}
      <div
        className={`absolute z-10 flex items-start justify-between ${
          isHero ? 'top-4 left-4 right-4 sm:top-5 sm:left-5 sm:right-5' : 'top-2.5 left-2.5 right-2.5'
        }`}
      >
        <button
          onClick={handleLike}
          title={loggedIn ? (isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión'}
          className={`
            ${likeBtnClass} flex items-center justify-center rounded-full
            transition-[transform,background-color,box-shadow] duration-200 active:scale-90
            ${isLiked
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/50'
              : 'bg-white/80 backdrop-blur-md text-slate-400 hover:text-slate-700 border border-slate-200'
            }
          `}
          style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
        >
          {isLiked ? '♥' : '♡'}
        </button>

        {game.metacritic && (
          <span
            className={`${isHero ? 'text-xs px-2 py-1' : 'text-[10px] px-1.5 py-0.5'} font-bold tabular-nums rounded backdrop-blur-sm`}
            style={{
              background: `${metacriticColor}25`,
              color: metacriticColor,
              border: `1px solid ${metacriticColor}40`,
            }}
          >
            {game.metacritic}
          </span>
        )}
      </div>

      {/* Hero "FEATURED" badge */}
      {isHero && (
        <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 z-10">
          <span className="font-display text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-indigo-300/90 bg-indigo-500/15 border border-indigo-400/25 px-3 py-1 rounded-full backdrop-blur-md">
            ★ Destacado
          </span>
        </div>
      )}

      {/* Bottom content */}
      <div className={`absolute inset-x-0 bottom-0 ${padding} z-10`}>
        <h3 className={`text-slate-900 ${titleClass}`}>
          {game.name}
        </h3>

        <div className={`flex items-center justify-between ${isHero ? 'mt-1' : ''}`}>
          <span className={`text-slate-500 ${isHero ? 'text-sm' : 'text-[11px]'} tabular-nums`}>
            {releaseYear ?? '—'}
          </span>
          {game.rating > 0 && (
            <span className={`text-amber-500 ${isHero ? 'text-sm' : 'text-[11px]'} tabular-nums font-medium`}>
              ★ {game.rating.toFixed(1)}
            </span>
          )}
        </div>

        {game.genres.length > 0 && (
          <div className={`flex flex-wrap gap-1 ${isHero ? 'mt-3' : 'mt-1.5'}`}>
            {game.genres.slice(0, isHero ? 4 : 2).map((g) => (
              <span
                key={g.id}
                className={`${isHero ? 'text-[10px] sm:text-xs px-2 py-1' : 'text-[9px] px-1.5 py-0.5'} rounded-md bg-slate-100 border border-slate-200 text-slate-600`}
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
