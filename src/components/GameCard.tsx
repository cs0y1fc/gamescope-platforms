'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Game } from '@/lib/types'
import { CornerPathFrame, CardBar } from '@/components/ui'

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

interface Genre { id: number; name: string }

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
    game.metacritic && game.metacritic >= 75 ? 'var(--color-success)'
    : game.metacritic && game.metacritic >= 50 ? 'var(--color-warn)'
    : 'var(--color-danger)'

  const isHero = variant === 'hero'
  const isCompact = variant === 'compact'

  const aspectClass = isHero
    ? 'aspect-[4/5] lg:aspect-auto lg:h-full'
    : isCompact
      ? 'aspect-[16/10] lg:aspect-auto lg:h-full'
      : 'aspect-[3/4]'

  const id = String(index + 1).padStart(3, '0')

  return (
    <Link href={`/game/${game.slug}`} passHref>
      <article
        className={`card-enter card-retro group relative ${aspectClass} overflow-hidden cursor-pointer`}
        style={{ animationDelay: `${Math.min(index * 35, 320)}ms` }}
      >
        {/* Image */}
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            className={`object-cover transition-[opacity,transform] duration-700 ${
              isHero ? 'opacity-50' : 'opacity-40'
            } group-hover:opacity-70 group-hover:scale-[1.04]`}
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
          <div className="absolute inset-0" style={{ background: 'var(--color-surface-2)' }} />
        )}

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, var(--color-bg) 0%, rgba(8,8,8,0.85) 40%, rgba(8,8,8,0.4) 70%, transparent 100%)`,
          }}
        />

        {/* Corner decorators */}
        <CornerPathFrame size={isHero ? 18 : 12} />

        {/* Top controls */}
        <div className={`absolute z-10 flex items-start justify-between ${
          isHero ? 'top-4 left-4 right-4' : 'top-3 left-3 right-3'
        }`}>
          <span
            className={`${isHero ? 'text-xs' : 'text-[10px]'} tabular-nums`}
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            [{id}]
          </span>

          <div className="flex items-center gap-2">
            {game.metacritic && (
              <span
                className={`${isHero ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5'} tabular-nums`}
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  color: metacriticColor,
                  border: `1px solid ${metacriticColor}`,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                [{game.metacritic}]
              </span>
            )}
            <button
              onClick={handleLike}
              title={loggedIn ? (isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión'}
              className={`${isHero ? 'w-8 h-8 text-base' : 'w-7 h-7 text-sm'} flex items-center justify-center transition-colors duration-200 active:scale-90`}
              style={{
                background: isLiked ? 'var(--color-accent)' : 'rgba(8,8,8,0.6)',
                color: isLiked ? '#000' : 'var(--color-text-muted)',
                border: `1px solid ${isLiked ? 'var(--color-accent)' : 'var(--color-border)'}`,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {isLiked ? '♥' : '♡'}
            </button>
          </div>
        </div>

        {/* Hero badge */}
        {isHero && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span
              className="text-[10px] px-3 py-1 tracking-[0.2em] uppercase"
              style={{
                background: 'var(--color-accent)',
                color: '#000',
                fontFamily: 'var(--font-mono)',
              }}
            >
              [FEATURED]
            </span>
          </div>
        )}

        {/* Bottom content */}
        <div className={`absolute inset-x-0 bottom-0 ${isHero ? 'p-5 sm:p-6' : 'p-3'} z-10`}>
          <h3
            className={`uppercase tracking-wide leading-tight mb-1 ${
              isHero ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-sm'
            } line-clamp-2`}
            style={{
              color: 'var(--color-text)',
              fontFamily: isHero ? 'var(--font-display)' : 'var(--font-mono)',
              fontWeight: isHero ? 700 : 400,
            }}
          >
            {game.name}
          </h3>

          <div
            className={`flex items-center justify-between ${isHero ? 'text-sm' : 'text-[10px]'} tabular-nums`}
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            <span>{`// ${releaseYear ?? '—'}`}</span>
            {game.rating > 0 && (
              <span style={{ color: 'var(--color-warn)' }}>★ {game.rating.toFixed(1)}</span>
            )}
          </div>

          {game.genres.length > 0 && (
            <>
              <CardBar className="my-2" color={isHero ? 'var(--color-accent)' : undefined} />
              <div className="flex flex-wrap gap-1.5">
                {game.genres.slice(0, isHero ? 4 : 2).map((g: Genre) => (
                  <span
                    key={g.id}
                    className={`${isHero ? 'text-[10px] px-1.5 py-0.5' : 'text-[9px] px-1 py-0.5'} uppercase tracking-wider`}
                    style={{
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </article>
    </Link>
  )
}
