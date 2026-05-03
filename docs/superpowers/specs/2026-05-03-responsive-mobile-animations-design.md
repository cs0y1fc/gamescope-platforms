# Disseny: Responsive Mobile-First + Animacions — GameScope

**Data**: 2026-05-03  
**Estat**: Aprovat  

---

## Context

L'app GameScope té un disseny fosc modern amb animacions Emil Kowalski, però dues àrees concretes no estan optimitzades per mòbil:

1. Els **4 selects de filtres** en `flex-wrap` es trenquen en múltiples línies a mòbil i ocupen massa espai vertical al header.
2. El **banner de novedades** té targetes de 320px — a un mòbil de 375px quasi no es veu la targeta adjacent, sense snap scroll.

L'objectiu és corregir ambdós punts i afegir animacions modernes que complementin les ja existents (Emil Kowalski: `card-enter` stagger, `shimmer` skeleton, transicions `cubic-bezier(0.23,1,0.32,1)`).

---

## Decisions de disseny

### Filtres a mòbil
- **Decisió**: fila scrollable horitzontal (no drawer, no grid 2×2).
- **Raó**: menys complexitat d'implementació; els selects `<select>` natives funcionen bé a mòbil sense necessitat d'un component custom.
- **Com**: `flex-nowrap overflow-x-auto`, scrollbar oculta, selects lleugerament més compactes a mòbil.
- **Desktop**: sense canvis visuals.

### Banner de novedades
- **Decisió**: 2 targetes visibles a mòbil + snap scroll a totes les mides.
- **Raó**: veure 2 targetes alhora dona més context de contingut que una sola gran.
- **Mides**:
  - Mobile (< `sm`): `w-[168px]`, imatge `h-28`
  - Desktop (`sm+`): `w-64` (256px), imatge `h-40`
- **Snap scroll**: `scroll-snap-type: x mandatory` al contenidor, `scroll-snap-align: start` per targeta — actiu a totes les mides per coherència.
- **Indicador dots**: a mòbil, puntets sota el banner sincronitzats amb el scroll.

---

## Canvis per component

### `src/components/GamesGrid.tsx`

**Filtres**:
- Fila de filtres: `flex-wrap gap-2` → `flex gap-2 overflow-x-auto pb-3` + scrollbar oculta via `style`.
- Selects: afegir `shrink-0` perquè no es comprimeixi cap a ells.
- Animació d'entrada: aplicar `card-enter` amb `animationDelay` progressiu (0ms, 50ms, 100ms, 150ms) als 4 selects.

**Header brand (mòbil)**:
- El subtítol de compte de jocs ja és `hidden sm:block`. Cap canvi necessari.

### `src/components/NewReleasesBanner.tsx`

**Mides de targeta**:
- `w-80` → `w-[168px] sm:w-64`
- `h-48` → `h-28 sm:h-40`
- `rounded-2xl` es manté.
- `p-4` → `p-2.5 sm:p-3.5`
- Títol: `text-sm` → `text-xs sm:text-sm`
- Gèneres: `text-xs` → `text-[10px] sm:text-xs`
- Badge data: `text-xs` → `text-[10px] sm:text-xs`
- `sizes` imatge: `"320px"` → `"(max-width: 640px) 168px, 256px"`

**Snap scroll**:
- Contenidor: afegir `scroll-snap-type: x mandatory` via `style`.
- Targeta `<article>`: afegir `scroll-snap-align: start` via `style` o classe Tailwind `snap-start`.
- `scroll-smooth` ja existeix al contenidor.

**Dots indicator** (mòbil):
- Un `<div>` de dots visible només a mòbil (`sm:hidden`).
- Sincronitzat amb l'scroll via `onScroll` + `scrollLeft`.
- Dot actiu: amplada 16px + color indigo; inactiu: 5px + blanc/15%.

**Hover lift** (desktop):
- Targeta banner: `sm:hover:-translate-y-1` + `transition-transform` (complementa l'opacitat d'imatge existent).

**Skeleton**:
- Mateixos canvis de mides que les targetes reals.

### `src/app/globals.css`

No calen keyframes nous — s'aprofita `card-enter` existent per als filtres.
Possiblement afegir regla per a `scroll-snap` si Tailwind no ho cobreix (però `snap-*` classes de Tailwind v3 ja ho fan).

---

## Animacions resum

| Animació | Component | Mecanisme |
|---|---|---|
| Stagger filtres | `GamesGrid` | `card-enter` + `animationDelay` 0/50/100/150ms |
| Stagger banner | `NewReleasesBanner` | Ja existent, s'ajusta timing |
| Hover lift | Targetes banner (desktop) | `sm:hover:-translate-y-1 transition-transform` |
| Scroll dots | Banner (mòbil) | `onScroll` → actualitza índex actiu |

Totes les noves animacions respecten les regles Emil Kowalski: mai `scale(0)`, només `transform`+`opacity`, `cubic-bezier(0.23,1,0.32,1)`, feedback `:active` on toca.

---

## Verificació

1. `npm run dev` → obrir a mòbil (375px) o DevTools mòbil.
2. **Filtres**: la fila de selects s'ha de poder fer scroll horitzontal sense trencar-se.
3. **Banner**: s'han de veure 2 targetes (+ vora de la 3a) a 375px. El snap ha de funcionar (es para a cada targeta).
4. **Dots**: han de moure's en scroll al banner.
5. **Desktop**: banner amb `w-64` mostra ~3 targetes, snap funciona. Filtres sense canvis visibles.
6. `npm run build` sense errors TypeScript.
7. Desplegar a Vercel prod.
