# Responsive Mobile-First + Animacions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fer GameScope completament mobile-first: filtres scrollables horitzontalment, banner amb 2 targetes visibles + snap scroll a totes les mides, i dots indicator a mòbil.

**Architecture:** Dos components s'editen independentment: `NewReleasesBanner` rep snap scroll + mides responsives + dots; `GamesGrid` rep la fila de filtres scrollable amb stagger d'entrada. No cal nou CSS global — Tailwind `snap-*` cobreix snap scroll.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v3 (`snap-x`, `snap-mandatory`, `snap-start`), TypeScript.

---

## Mapa de fitxers

| Fitxer | Canvi |
|---|---|
| `src/components/NewReleasesBanner.tsx` | Mides responsives, snap scroll, dots indicator, hover lift |
| `src/components/GamesGrid.tsx` | Fila de filtres `overflow-x-auto` + stagger `card-enter` |

---

## Task 1: NewReleasesBanner — mides responsives + snap scroll + dots

**Files:**
- Modify: `src/components/NewReleasesBanner.tsx`

- [ ] **Step 1: Substituir el fitxer complet per la versió responsive**

Escriu aquest contingut exacte a `src/components/NewReleasesBanner.tsx`:

```tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { RawgGame } from '@/lib/rawg'

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function NewReleasesBanner() {
  const [games, setGames] = useState<RawgGame[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/new-releases')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGames(data) })
      .finally(() => setLoading(false))
  }, [])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const firstCard = el.querySelector('article') as HTMLElement | null
    if (!firstCard) return
    const cardWidth = firstCard.offsetWidth + 12 // gap-3 = 12px
    setActiveIndex(Math.round(el.scrollLeft / cardWidth))
  }

  const scrollToIndex = (i: number) => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const firstCard = el.querySelector('article') as HTMLElement | null
    if (!firstCard) return
    const cardWidth = firstCard.offsetWidth + 12
    el.scrollTo({ left: i * cardWidth, behavior: 'smooth' })
    setActiveIndex(i)
  }

  if (!loading && games.length === 0) return null

  return (
    <section className="mb-8">
      {/* Header row */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest">
          Últimas novedades
        </h2>
      </div>

      {/* Scrollable strip with edge fades */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#080810] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#080810] to-transparent z-10" />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[168px] sm:w-64 rounded-xl sm:rounded-2xl overflow-hidden bg-[#0f0f1a] border border-white/5 snap-start"
                >
                  <div className="skeleton h-28 sm:h-40" />
                  <div className="p-2.5 sm:p-3.5 space-y-1.5">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-2.5 w-1/3 rounded" />
                  </div>
                </div>
              ))
            : games.map((game, i) => (
                <article
                  key={game.id}
                  className="card-enter flex-shrink-0 w-[168px] sm:w-64 rounded-xl sm:rounded-2xl overflow-hidden bg-[#0f0f1a] border border-white/5 hover:border-white/15 group cursor-pointer snap-start transition-[transform,border-color] duration-300 sm:hover:-translate-y-1"
                  style={{
                    animationDelay: `${Math.min(i * 40, 280)}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)',
                  }}
                >
                  {/* Image */}
                  <div className="relative h-28 sm:h-40 overflow-hidden bg-[#1a1a2e]">
                    {game.background_image ? (
                      <Image
                        src={game.background_image}
                        alt={game.name}
                        fill
                        className="object-cover opacity-60 group-hover:opacity-85 transition-opacity duration-500"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
                        sizes="(max-width: 640px) 168px, 256px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/10 text-2xl sm:text-4xl font-bold">?</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />
                    {game.released && (
                      <span className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 text-[10px] sm:text-xs font-medium text-white/60 bg-black/50 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                        {formatDate(game.released)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5 sm:p-3.5">
                    <p className="text-white/80 text-xs sm:text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors duration-150">
                      {game.name}
                    </p>
                    {game.genres.length > 0 && (
                      <p className="text-white/30 text-[10px] sm:text-xs mt-1 sm:mt-1.5 truncate">
                        {game.genres.slice(0, 2).map(g => g.name).join(' · ')}
                      </p>
                    )}
                  </div>
                </article>
              ))}
        </div>
      </div>

      {/* Dots indicator — only on mobile */}
      {!loading && games.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
          {games.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Anar a la targeta ${i + 1}`}
              className={`rounded-full h-1.5 transition-all duration-200 ${
                i === activeIndex
                  ? 'w-4 bg-indigo-400'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Verificar que compila sense errors**

```bash
npm run build 2>&1 | grep -E "(error|Error|✓ Compiled)"
```

Esperat: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add src/components/NewReleasesBanner.tsx
git commit -m "feat: banner responsive mobile-first amb snap scroll i dots indicator"
```

---

## Task 2: GamesGrid — filtres scrollables horitzontalment + stagger

**Files:**
- Modify: `src/components/GamesGrid.tsx` (secció de filtres, línia ~230)

- [ ] **Step 1: Substituir el bloc de filtres**

Busca i substitueix aquest bloc (aproximadament línies 229-249):

**ABANS:**
```tsx
          {/* Filters */}
          <div className="flex flex-wrap gap-2 pb-4">
            <Select value={platform} onChange={applyFilter(setPlatform)}>
              <option value="">Todas las plataformas</option>
              {platforms.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </Select>

            <Select value={genre} onChange={applyFilter(setGenre)}>
              <option value="">Todos los géneros</option>
              {genres.map((g) => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
            </Select>

            <Select value={year} onChange={applyFilter(setYear)}>
              <option value="">Todos los años</option>
              {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
            </Select>

            <Select value={ordering} onChange={applyFilter(setOrdering)}>
              {ORDERING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
```

**DESPRÉS:**
```tsx
          {/* Filters — scrollable horitzontal a mòbil */}
          <div
            className="flex gap-2 pb-4 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="card-enter shrink-0" style={{ animationDelay: '0ms' }}>
              <Select value={platform} onChange={applyFilter(setPlatform)}>
                <option value="">Todas las plataformas</option>
                {platforms.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </Select>
            </div>
            <div className="card-enter shrink-0" style={{ animationDelay: '50ms' }}>
              <Select value={genre} onChange={applyFilter(setGenre)}>
                <option value="">Todos los géneros</option>
                {genres.map((g) => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
              </Select>
            </div>
            <div className="card-enter shrink-0" style={{ animationDelay: '100ms' }}>
              <Select value={year} onChange={applyFilter(setYear)}>
                <option value="">Todos los años</option>
                {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
              </Select>
            </div>
            <div className="card-enter shrink-0" style={{ animationDelay: '150ms' }}>
              <Select value={ordering} onChange={applyFilter(setOrdering)}>
                {ORDERING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
          </div>
```

- [ ] **Step 2: Verificar que compila sense errors**

```bash
npm run build 2>&1 | grep -E "(error|Error|✓ Compiled)"
```

Esperat: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add src/components/GamesGrid.tsx
git commit -m "feat: filtres scrollables horitzontalment a mòbil amb stagger d'entrada"
```

---

## Task 3: Verificació visual + deploy

**Files:** cap edició — verificació i deploy.

- [ ] **Step 1: Arrancar dev server i verificar a mòbil**

```bash
npm run dev
```

Obre DevTools → Toggle device toolbar → iPhone SE (375×667). Comprova:
- [ ] La fila de filtres NO es trenca en dues línies. Es pot fer scroll horitzontal.
- [ ] El banner mostra ~2 targetes (168px cadascuna) a 375px.
- [ ] Fent scroll al banner, les targetes s'aturen (snap) a cada targeta.
- [ ] Els dots es mouen en fer scroll.
- [ ] Fent clic en un dot, el banner salta a la targeta correcta.

Canvia a viewport desktop (1280px). Comprova:
- [ ] La fila de filtres es veu igual que abans (no hi ha scroll visual, caben tots).
- [ ] El banner mostra ~3 targetes de 256px.
- [ ] El snap funciona al fer scroll al banner.
- [ ] Els dots NO es veuen (estan ocults amb `sm:hidden`).
- [ ] Hover sobre targeta del banner → puja 4px (`-translate-y-1`).

- [ ] **Step 2: Build final**

```bash
npm run build 2>&1 | tail -20
```

Esperat: totes les rutes sense errors, `✓ Generating static pages`.

- [ ] **Step 3: Deploy a producció**

```bash
vercel --prod --yes 2>&1 | grep -E "(Production:|Aliased:|READY|ERROR)"
```

Esperat: `"readyState": "READY"` i URL aliased a `https://exemple1fsjs.vercel.app`.
