<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# GameScope — Agentes de adaptación RetroNova

> Sub-agentes especializados para adaptar GameScope al diseño RetroNova.
> Referencia de diseño: `design.md`
> Invocar con: `@nombre-agente` en Claude Code

## Orden de ejecución recomendado

```
1. @design-tokens     → base visual (variables, fuentes, animaciones)
2. @svg-assets        → componentes decorativos reutilizables
3. @component-refactor Header
4. @component-refactor GameCard
5. @component-refactor PlatformCard
6. @component-refactor GamesGrid
7. @component-refactor PlatformsGrid
8. @component-refactor AuthModal
9. @component-refactor NewReleasesBanner
10. @component-refactor NewsSection
11. @image-handler    → dominios y seeds de imágenes
12. @layout-audit     → validación final
```

---

## @design-tokens

**Propósito:** Establece la base del sistema de diseño RetroNova en los archivos de configuración global.

**Archivos objetivo:**
- `src/app/globals.css`
- `src/app/layout.tsx`
- `tailwind.config.ts` (si existe, si no en `src/app/globals.css` con `@theme`)

**Tareas:**
1. Añadir variables CSS de color RetroNova bajo comentario `/* RetroNova Design System */` en `:root` (ver sección `// COLOR PALETTE` en `design.md`)
2. Añadir variables `--font-mono` y `--font-display` en `:root`
3. Configurar `next/font/google` con `Share_Tech_Mono` y `Orbitron` en `layout.tsx`
4. Aplicar las fuentes al `<html>` tag via variables CSS
5. Añadir animaciones `blink`, `scanline` y clase `.card-retro` en `globals.css`
6. En Tailwind config/theme: extender colores con `accent`, `surface`, `border-accent` mapeados a las variables CSS

**Reglas:**
- NO eliminar variables CSS existentes hasta verificar que ningún componente las usa directamente como string (buscar con grep antes de borrar)
- Mantener el `:root` ordenado: primero variables existentes, luego bloque RetroNova
- Las fuentes deben cargarse con `display: 'swap'` para evitar FOUT

**Verificación:**
```bash
npm run dev
# En browser: abrir DevTools → Computed → verificar que --color-accent es #FF6B00
# Verificar que la fuente del body es Share Tech Mono
```

---

## @svg-assets

**Propósito:** Crea los cinco componentes SVG decorativos del sistema RetroNova.

**Archivos a crear:**
- `src/components/ui/CornerPath.tsx`
- `src/components/ui/CardBar.tsx`
- `src/components/ui/TopLine.tsx`
- `src/components/ui/BottomLine.tsx`
- `src/components/ui/SquareGeometry.tsx`
- `src/components/ui/index.ts` (re-exporta todos)

**Especificaciones:**

### CornerPath
```
Props: variant: 'tl' | 'tr' | 'bl' | 'br', size?: number (default 16), className?: string
Traza dos brazos en ángulo recto desde la esquina, longitud `size`px, stroke 1.5px
Color: var(--color-accent)
Posición: absolute, cada variante en su esquina (top-0 left-0, etc.)
```

### CardBar
```
Separador: línea horizontal con punto (●) centrado
SVG de ancho 100%, altura 12px
Línea: stroke 1px, color var(--color-border)
Punto: circle r=2, fill var(--color-border)
```

### TopLine / BottomLine
```
Línea horizontal de ancho completo (100vw), altura 2px
fill: var(--color-accent)
TopLine: position fixed top-0, z-index 50
BottomLine: en footer, no fixed
```

### SquareGeometry
```
SVG 100%×100% con pattern de puntos (circle r=0.5) en grid de 20px
fill: var(--color-text-faint), opacity-40
position: absolute inset-0, pointer-events: none, z-index: 0
```

**Reglas:**
- SVGs como componentes React puros, zero dependencias externas
- Todas las props tienen valores por defecto sensatos
- Exportar con named exports

---

## @component-refactor

**Propósito:** Transforma un componente específico al estilo visual RetroNova.

**Uso:** Invocar con el nombre del componente como argumento, ej: `@component-refactor Header`

**Transformaciones por componente:**

### Header (`src/components/Header.tsx`)
- Añadir `<TopLine />` encima del header
- Logo: prefijo `>_` en `--color-accent` + texto "GAMESCOPE" en `--font-display`
- Nav links: `--font-mono`, MAYÚSCULAS, hover underline naranja
- Contador de likes: formato `[♥ N]`
- Botón auth: `[SIGN IN]` / `[SIGN OUT]`, borde naranja sin relleno

### GameCard (`src/components/GameCard.tsx`)
- Añadir `<CornerPath>` en las 4 esquinas (wrapper con `position: relative`)
- ID numérico: `[{String(index + 1).padStart(3, '0')}]` en `--color-text-muted`
- Géneros: formato `// {genre} · {year}` en `--font-mono`
- `<CardBar />` entre metadatos y CTA
- CTA: `[VIEW GAME]` en `--color-accent`, sin background
- Eliminar `.card-ring`, `.glass-panel`, `.glass-*`
- Añadir clase `.card-retro`

### PlatformCard (`src/components/PlatformCard.tsx`)
- Mismo patrón de `<CornerPath>` que GameCard
- Nombre: MAYÚSCULAS, `--font-display`
- Conteo: `// {N} games`, `--font-mono`, `--color-text-muted`
- Rango de años: `[{yearStart} — {yearEnd || 'PRESENT'}]`
- `<CardBar />`
- Estrella: `[☆ FAVORITE]` / `[★ SAVED]`, activa en naranja

### GamesGrid (`src/components/GamesGrid.tsx`)
- Filtros con etiqueta `// filters` + separador centrado
- Cada `<select>`: fondo `--color-surface`, borde `--color-border`, `--font-mono`, MAYÚSCULAS
- Label visible: texto `[PLATFORM::`, valor seleccionado en naranja, `]`
- Paginación: `[← PREV]` / `[NEXT →]` + `PAGE N/TOTAL`

### PlatformsGrid (`src/components/PlatformsGrid.tsx`)
- Título: `// platforms` centrado con líneas laterales
- Botón sync: `[↻ SYNC PLATFORMS]`, texto naranja
- Status: formato `> LAST SYNC: {date} — {count} ENTRIES`

### AuthModal (`src/components/AuthModal.tsx`)
- Título: `> SYSTEM ACCESS REQUEST_` con cursor `blink`
- Subtítulo: `> ENTER CREDENTIALS` / `> CREATE ACCOUNT`
- Inputs: `background: transparent`, solo `border-bottom`, sin border-radius
- Botón primario: `[AUTHENTICATE]` / `[REGISTER]`, fondo naranja, texto negro
- OAuth: `[G GOOGLE OAUTH]`, borde naranja
- Fondo: `<SquareGeometry />`

### NewReleasesBanner (`src/components/NewReleasesBanner.tsx`)
- Header: `// INCOMING TRANSMISSIONS` con separador
- Badge: `[NEW]` fondo `--color-accent`, texto `#000`
- Navegación: `[← PREV]` / `[NEXT →]` sin fondo, texto naranja
- Dots: cuadrados 4×4px, activo naranja

### NewsSection (`src/components/NewsSection.tsx`)
- Header: `// latest transmissions`
- Ref numérica: `[{String(i + 1).padStart(3, '0')}]` sobre cada card
- Fecha: formato `YY.DDD` (año 2 dígitos + día del año, ej: `26.128`)
- Imágenes: `picsum.photos/seed/retronova-news-{i+1}/800/400`
- Botón: `[VIEW ALL TRANSMISSIONS →]`

**Reglas para todos los componentes:**
- NO modificar props/interfaces TypeScript
- NO cambiar lógica de datos, llamadas a API, manejo de estado
- Sí eliminar: clases `glass-*`, `card-ring`, `text-gradient`, colores hardcoded indigo/emerald
- Hovers y focus siempre mediante variables CSS, nunca valores hardcoded

---

## @image-handler

**Propósito:** Actualiza la configuración de imágenes para el diseño RetroNova.

**Archivos objetivo:**
- `next.config.ts`
- `src/components/NewsSection.tsx`

**Tareas:**
1. Añadir `picsum.photos` a `remotePatterns` en `next.config.ts`:
```ts
{ protocol: 'https', hostname: 'picsum.photos' }
```
2. En `NewsSection.tsx`, reemplazar URLs de Unsplash por picsum con seeds fijos:
```
https://picsum.photos/seed/retronova-news-{index}/800/400
```
3. Verificar que `media.rawg.io` sigue presente en `remotePatterns`

**Reglas:**
- Seeds de picsum como strings estáticos (no `Math.random()`)
- No cambiar imágenes de juegos o plataformas (RAWG/local)

---

## @layout-audit

**Propósito:** Audita todos los componentes y reporta su conformidad con el diseño RetroNova.

**Modo:** Solo lectura. NO edita archivos.

**Archivos a revisar:**
```
src/app/globals.css
src/app/layout.tsx
src/components/Header.tsx
src/components/GameCard.tsx
src/components/GameDetail.tsx
src/components/GamesGrid.tsx
src/components/PlatformCard.tsx
src/components/PlatformsGrid.tsx
src/components/AuthModal.tsx
src/components/NewReleasesBanner.tsx
src/components/NewsSection.tsx
src/components/ui/
next.config.ts
```

**Criterios de conformidad:**

| Check | Criterio |
|---|---|
| Colores | No hay `#6366f1`, `#10b981`, `indigo-*`, `emerald-*` hardcoded |
| Fuentes | `Share Tech Mono` y `Orbitron` configuradas y en uso |
| Sin glassmorphism | No hay clases `glass-*` o `backdrop-blur` en cards |
| Corchetes | Botones y CTAs usan formato `[TEXT]` |
| CornerPath | GameCard y PlatformCard tienen decoradores de esquina |
| CardBar | Separadores presentes en cards |
| TopLine | Header tiene `<TopLine />` |
| Terminal | AuthModal usa estilo `> SYSTEM ACCESS` |
| Picsum | NewsSection usa picsum.photos, no Unsplash |
| Animaciones | `blink` y `.card-retro` definidos en `globals.css` |

**Output esperado:**
```markdown
## @layout-audit report — {fecha}

### globals.css
✅ Variables de color RetroNova presentes
✅ Fuentes definidas
✅ Animaciones blink y card-retro definidas

### Header.tsx
✅ TopLine presente
⚠️ Botón Sign In aún usa clase text-indigo-400

### RESUMEN
Conformes: N/13  |  Pendientes: N/13  |  No conformes: N/13
```
