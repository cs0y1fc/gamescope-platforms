# GameScope — RetroNova Design System

> Guía visual para transformar GameScope al estilo retro-futurista de RetroNova.
> Referencia: https://retronovaworld.webflow.io/
> Versión: GAMESCOPE DESIGN VER. 1.0::26.128

---

## // AESTHETIC

RetroNova combina nostalgia retro con innovación contemporánea. La interfaz simula una terminal de sistema futurista: pantallas de carga, texto estilo código, esquinas geométricas decorativas y una paleta oscura con acentos en naranja. Todo el texto de UI usa convenciones de "comandos entre corchetes".

**Palabras clave:** cyberpunk · terminal · retro-futurista · dark mode · monospace · geometric

---

## // COLOR PALETTE

Añadir en `src/app/globals.css` bajo `:root`:

```css
/* RetroNova Design System */
--color-bg:          #080808;   /* fondo principal */
--color-surface:     #0f0f0f;   /* cards y paneles */
--color-surface-2:   #141414;   /* superficie elevada (hover, activo) */
--color-border:      #1f1f1f;   /* bordes por defecto */
--color-border-accent: #FF6B00; /* borde activo / hover */

--color-accent:      #FF6B00;   /* naranja RetroNova — CTAs, highlights, líneas */
--color-accent-dim:  rgba(255,107,0,0.15); /* glow naranja suave */
--color-accent-glow: rgba(255,107,0,0.35); /* glow naranja pronunciado */

--color-text:        #F0EDE6;   /* texto principal */
--color-text-muted:  #6B6560;   /* texto secundario / labels */
--color-text-faint:  #3A3835;   /* texto muy suave (decorativo) */

--color-success:     #00FF9F;   /* verde terminal — rating ≥ 4.0 */
--color-warn:        #FFD600;   /* amarillo — Metacritic ≥ 50 */
--color-danger:      #FF3B3B;   /* rojo — Metacritic < 50 */
--color-info:        #00C8FF;   /* azul cian — badges informativos */
```

### Equivalencias con el sistema actual

| Variable actual | Variable RetroNova | Hex |
|---|---|---|
| `#6366f1` (indigo) | `--color-accent` | `#FF6B00` |
| `#10b981` (emerald) | `--color-success` | `#00FF9F` |
| `#050507` (bg) | `--color-bg` | `#080808` |
| `#f0f0f5` (text) | `--color-text` | `#F0EDE6` |

---

## // TYPOGRAPHY

### Fuentes a importar en `src/app/layout.tsx`

```tsx
import { Share_Tech_Mono, Orbitron } from 'next/font/google'

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
})

const orbitron = Orbitron({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-display',
})
```

### Variables CSS

```css
--font-mono:    'Share Tech Mono', 'Courier New', monospace;  /* UI, labels, body */
--font-display: 'Orbitron', sans-serif;                        /* títulos, hero */
```

### Escala tipográfica

| Rol | Fuente | Tamaño | Peso | Uso |
|---|---|---|---|---|
| Hero title | `--font-display` | `clamp(2rem, 5vw, 4rem)` | 800 | Nombre del juego en detail page |
| Section heading | `--font-display` | `1.25rem` | 700 | Títulos de sección |
| Card title | `--font-mono` | `1rem` | 400 | Nombre del juego en card |
| Body | `--font-mono` | `0.875rem` | 400 | Descripciones, metadatos |
| Label / ID | `--font-mono` | `0.75rem` | 400 | IDs numerados, badges, tags |
| Muted | `--font-mono` | `0.6875rem` | 400 | Fechas, créditos, versiones |

### Convenciones de texto UI

```
// Navegación y botones: MAYÚSCULAS entre corchetes
[VIEW GAME]        [BACK HOME]       [PREV]       [NEXT]
[ACTIVATE SOUND]   [SKIP LOADING]    [SIGN IN]    [REGISTER]

// Labels de filtros: clave::valor
[PLATFORM::PC]     [GENRE::RPG]      [YEAR::2024]

// IDs de elementos: número con ceros
[001]  [002]  [003]

// Comentarios de sección (centrales, color muted)
// platforms       // games       // favorites       // new releases

// Versión del sistema (footer o hero)
GAMESCOPE VER. 1.0::26.128

// Estado del sistema
> SYSTEM READY_
> LOADING PLATFORMS...
> SYNC COMPLETE — 487 ENTRIES
```

---

## // COMPONENTS

### Header (`Header.tsx`)

```
┌─────────────────────────────────────────────────────────────────┐  ← TopLine (naranja)
│  >_ GAMESCOPE          // nav          [♥ 12]    [SIGN IN]      │
└─────────────────────────────────────────────────────────────────┘
```

- Fondo: `--color-bg` con `border-bottom: 1px solid --color-border`
- Logo: prefijo `>_` en `--color-accent`, texto en `--font-display`
- Nav links: `--font-mono`, MAYÚSCULAS, hover → `--color-accent`
- `TopLine`: componente SVG `<TopLine />` justo encima del header

### GameCard (`GameCard.tsx`)

```
┌╔═══════════════╗┐
│║               ║│  ← CornerPath decorators (4 esquinas)
│║  [img]        ║│
│║               ║│
│╚═══════════════╝│
│  [001]           │  ← ID numérico
│  GAME TITLE      │  ← font-display, text-text
│  // genre · year │  ← font-mono, text-muted
│  ★ 4.5  [75]    │  ← rating + Metacritic coloreado
│─────────────────│  ← CardBar
│  [VIEW GAME]    │  ← CTA en naranja
└─────────────────┘
```

- Sin glassmorphism. Fondo: `--color-surface`, borde: `--color-border`
- Hover: `border-color: --color-border-accent` + `box-shadow: 0 0 12px --color-accent-dim`
- Esquinas: `<CornerPath variant="tl|tr|bl|br" />`
- Metacritic: verde `≥75`, amarillo `≥50`, rojo `<50`

### PlatformCard (`PlatformCard.tsx`)

```
┌╔══════════════════════════════╗┐
│║  [img/logo]   PLATFORM NAME  ║│
│║               // 1,234 games ║│
│║               [2001 — 2023]  ║│
│╚══════════════════════════════╝│
│──────────────────────────────│  ← CardBar
│  [☆ FAVORITE]     [CACHED]   │
└──────────────────────────────┘
```

- Mismo patrón de bordes que GameCard
- Estrella de favorito → `--color-accent` cuando activa

### GamesGrid — Filtros (`GamesGrid.tsx`)

Los filtros actúan como comandos de terminal:

```
// filters

[PLATFORM::ALL ▼]   [GENRE::ALL ▼]   [YEAR::ALL ▼]   [SORT::RATING ▼]

                                                    [← PREV]  PAGE 2/14  [NEXT →]
```

- `<select>` estilizado con `appearance: none`, fondo `--color-surface`, borde `--color-border`
- Etiqueta visible: `[PLATFORM::` + valor en `--color-accent` + `]`
- Paginación: texto `--font-mono`, botones con borde, sin relleno por defecto

### AuthModal (`AuthModal.tsx`)

```
╔══════════════════════════════════════╗
║  > SYSTEM ACCESS REQUEST_            ║
║  ──────────────────────────────────  ║
║  > ENTER CREDENTIALS                 ║
║                                      ║
║  email_____________________________  ║  ← cursor parpadeante
║  password__________________________  ║
║                                      ║
║  [AUTHENTICATE]    [REGISTER]        ║
║  ──────────────────────────────────  ║
║  // OR CONNECT VIA                   ║
║  [G GOOGLE OAUTH]                    ║
╚══════════════════════════════════════╝
```

- Inputs: `background: transparent`, `border-bottom: 1px solid --color-border`, sin border-radius
- Focus: `border-bottom-color: --color-accent`
- Cursor: `::after { content: '_'; animation: blink 1s step-end infinite; }`
- Overlay backdrop: `background: rgba(8,8,8,0.85)`, `backdrop-filter: blur(4px)`

### NewReleasesBanner (`NewReleasesBanner.tsx`)

```
// INCOMING TRANSMISSIONS ─────────────────────────────────────────
│  [NEW] Game One     │  [NEW] Game Two     │  [NEW] Game Three    │
│  Released 3d ago    │  Released 1w ago    │  Released 2w ago     │
◄ PREV ──────────────────────────────────────────────────── NEXT ►
```

- Header de sección: `// INCOMING TRANSMISSIONS` en `--font-mono`, `--color-text-muted`
- Badge `[NEW]`: fondo `--color-accent`, texto negro, `--font-mono`
- Navegación: `[← PREV]` / `[NEXT →]` sin relleno, texto `--color-accent`

### NewsSection (`NewsSection.tsx`)

```
// latest transmissions

┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│  [img]    │  │  [img]    │  │  [img]    │  │  [img]    │
│           │  │           │  │           │  │           │
│ [001]     │  │ [002]     │  │ [003]     │  │ [004]     │
│ TITLE     │  │ TITLE     │  │ TITLE     │  │ TITLE     │
│ 26.128    │  │ 26.120    │  │ 26.115    │  │ 26.102    │  ← fecha YY.DDD
└───────────┘  └───────────┘  └───────────┘  └───────────┘
```

- Fecha en formato `YY.DDD` (año + día del año): `new Date().toLocaleDateString('en', {year:'2-digit'})` + `dayOfYear`
- Ref numérica `[00N]` basada en índice

### Loading States

Reemplazar spinners por barra de progreso estilo terminal:

```tsx
// Componente LoadingTerminal
<div className="font-mono text-accent text-sm">
  <span className="text-muted">{'> '}</span>
  LOADING PLATFORMS
  <span className="ml-2">{'█'.repeat(progress)}{'░'.repeat(8 - progress)}</span>
  <span className="ml-2">{Math.round(progress / 8 * 100)}%</span>
</div>
```

---

## // SVG DECORATORS

Crear en `src/components/ui/`:

### `CornerPath.tsx`
```tsx
// Props: variant: 'tl' | 'tr' | 'bl' | 'br', size?: number, color?: string
// Trazo de 2px en --color-accent, posición absolute en la esquina correspondiente
// Longitud de los brazos: ~16px
```

### `CardBar.tsx`
```tsx
// Separador horizontal: línea con punto central
// ─────────────── ● ───────────────
// color: --color-border por defecto, --color-accent en hover del card padre
```

### `TopLine.tsx` / `BottomLine.tsx`
```tsx
// Línea de 2px de ancho completo en --color-accent
// Usadas en Header (top) y Footer (bottom)
```

### `SquareGeometry.tsx`
```tsx
// Grid de puntos 20x20 como fondo decorativo
// opacity: 0.04, posición absolute, pointer-events: none
// Ideal para hero sections y modales
```

---

## // LAYOUT

### Contenedor

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
```

### Grid de cards

```css
/* Cards estándar */
grid-template-columns: repeat(1, 1fr);             /* mobile */
grid-template-columns: repeat(2, 1fr);             /* md: 768px+ */
grid-template-columns: repeat(4, 1fr);             /* lg: 1024px+ */
gap: 1rem;

/* Hero card (page 1): ocupa 2 cols × 2 rows */
.card-hero { grid-column: span 2; grid-row: span 2; }
```

### Separadores de sección

```tsx
// Entre secciones principales
<div className="flex items-center gap-4 my-8">
  <div className="flex-1 h-px bg-border" />
  <span className="font-mono text-xs text-muted">// {sectionName}</span>
  <div className="flex-1 h-px bg-border" />
</div>
```

---

## // ANIMATIONS

Añadir en `globals.css`:

```css
/* Cursor terminal parpadeante */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* Scanlines decorativas (hero overlay) */
@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

.scanline-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255,107,0,0.015) 2px,
    rgba(255,107,0,0.015) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* Glow naranja en hover de cards */
.card-retro {
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.card-retro:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 16px var(--color-accent-dim);
}
```

---

## // IMAGES

| Fuente | Uso | Dominio para `next.config.ts` |
|---|---|---|
| RAWG API | Juegos y plataformas | `media.rawg.io` (ya configurado) |
| `public/platforms/` | Plataformas cacheadas | local (ya configurado) |
| picsum.photos | News articles (seeds fijos) | `picsum.photos` |

### Seeds de picsum para noticias (reproducibles)
```
Artículo 1: https://picsum.photos/seed/retronova-news-1/800/400
Artículo 2: https://picsum.photos/seed/retronova-news-2/800/400
...etc
```

### Overlay sobre imágenes
```css
/* Siempre aplicar sobre background_image en cards */
background: linear-gradient(
  to top,
  var(--color-bg) 0%,
  rgba(8,8,8,0.6) 50%,
  transparent 100%
);
```

---

## // FOOTER

```
─────────────────────────────────────────────────────────────── ← BottomLine (naranja)
  >_ GAMESCOPE    // powered by RAWG API    © 2024 · VER. 1.0
─────────────────────────────────────────────────────────────────
```

---

## // CHECKLIST DE CONFORMIDAD

Usar con el agente `@layout-audit`:

- [ ] `globals.css` — variables de color RetroNova definidas
- [ ] `globals.css` — fuentes Share Tech Mono y Orbitron importadas
- [ ] `globals.css` — animaciones `blink`, `scanline`, `.card-retro` definidas
- [ ] `layout.tsx` — next/font configurado con Share Tech Mono y Orbitron
- [ ] `Header.tsx` — TopLine, prefijo `>_`, nav en monospace
- [ ] `GameCard.tsx` — CornerPath, CardBar, ID numérico, sin glassmorphism
- [ ] `PlatformCard.tsx` — estilo colección, CardBar, estrella naranja
- [ ] `GamesGrid.tsx` — filtros con formato `[KEY::VALUE]`
- [ ] `AuthModal.tsx` — tema terminal, cursor `_` parpadeante
- [ ] `NewReleasesBanner.tsx` — `// INCOMING TRANSMISSIONS`, badge `[NEW]`
- [ ] `NewsSection.tsx` — refs numeradas, fecha `YY.DDD`
- [ ] `next.config.ts` — dominio `picsum.photos` añadido
- [ ] `src/components/ui/` — CornerPath, CardBar, TopLine, BottomLine, SquareGeometry creados
