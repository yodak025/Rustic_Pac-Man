# Agent Development Guide - Chomp Crawler

## Project Overview
Browser-based Pac-Man clone with procedurally generated mazes (3D rogue-like perspective). Built with Next.js 15, React 19, Three.js (React Three Fiber), TypeScript, and Python (Pyodide) for maze generation. State managed via Zustand. Thesis project for Engineering in Audiovisual Systems.

**Tech Stack:** Next.js 15, React 19, Three.js 0.176, React Three Fiber, Zustand 5, TypeScript 5.8, Tailwind CSS 4, Pyodide 0.27

---

## Build, Lint & Test Commands

### Development & Build
```bash
npm run dev              # Start Next.js dev server (http://localhost:3000)
npm run build            # Next.js production build
npm run start            # Start production server
npm run lint             # Run ESLint on all TypeScript files
npm run type-check       # TypeScript type checking
```

### Testing
**⚠️ No test framework configured.** No Jest, Vitest, or Testing Library present.

---

## Project Structure

```
app/                  # Next.js App Router (NEW)
├── layout.tsx        # Root layout (metadata, fonts, global styles)
├── page.tsx          # Landing page (/)
└── game/
    └── page.tsx      # Game route (/game)

src/
├── core/             # Game engine & ECS-like systems
│   ├── engine.ts     # Main game loop (RusticGameEngine)
│   └── systems/      # Movement, collision, player control, ghost AI
├── maze-gen/         # Python maze generation (Pyodide integration)
├── scenes/           # Three.js/R3F 3D components
├── state/            # Zustand stores (7 stores)
├── types/            # TypeScript type definitions
├── ui/               # React UI (4-level hierarchy: components → common → layout → pages)
│   ├── components/   # Level 1: Atomics (Button, Link, PageTitle, etc.)
│   ├── common/       # Level 2: Composed (Modal, LoadingScreen, etc.)
│   ├── layout/       # Level 3: Sections (HUD, DebugBar, etc.)
│   └── pages/        # Level 4: Views (GameApp, GameWrapper, MainMenu, etc.)
├── assets/           # Fonts (Sixtyfour.ttf) & global styles
└── config/           # JSON configs (debug.json, ghostBehavior.json)
```

**Path Aliases:**
- `@/` → `src/`
- `@core/` → `src/core/`
- `@scenes/` → `src/scenes/`
- `@state/` → `src/state/`
- `@custom-types/` → `src/types/`
- `@ui/` → `src/ui/`
- `@assets/` → `src/assets/`
- `@config/` → `src/config/`

---

## Code Style Guidelines

### General Principles
1. **KISS Principle:** Keep code as simple as possible
2. **SOLID Principles:** Apply pragmatically, avoid over-complexity
3. **English-only code:** All code, comments, and identifiers in English
4. **Clean Code:** Minimize comments. Use descriptive names. No arg-return comment blocks
5. **Explicit typing:** Always use types in `.ts`/`.tsx` files. No `any` types
6. **Prudent modifications:** Make minimal changes to achieve goals

### TypeScript/React Style

**Imports:**
```typescript
import { useGameStatusStore } from '@state/store'
import type { Position } from '@custom-types/gameComponents'
```

**Component Structure:**
```typescript
'use client' // Only for client components (game, Three.js, Zustand)

import React from 'react'
import type { SomeType } from '@custom-types/...'

export interface ComponentProps {
  prop: SomeType
  optional?: string
}

const Component: React.FC<ComponentProps> = ({ prop, optional = 'default' }) => {
  return <div>{prop}</div>
}

export default Component
```

**Naming Conventions:**
- `PascalCase`: Components, types, interfaces, enums
- `camelCase`: Functions, variables, methods
- `SCREAMING_SNAKE_CASE`: Constants
- `kebab-case`: CSS classes (Tailwind)

**State Management (Zustand):**
```typescript
const status = useGameStatusStore((state) => state.status)
set(() => ({ status: newStatus }))
```

**UI Component Architecture (4-level hierarchy):**
- **Level 1 - `ui/components/`:** Atomic (Button, Link, PageTitle). Props-only, zero state
- **Level 2 - `ui/common/`:** Composed (Modal, MenuButtonGroup). Minimal state
- **Level 3 - `ui/layout/`:** Sections (HUD, DebugBar). Integrate stores, no props
- **Level 4 - `ui/pages/`:** Views (GameApp, LandingPage). Orchestrate all levels
- **Dependency flow:** Unidirectional (pages → layout → common → components)

### Styling (Tailwind CSS)

**⚠️ CRITICAL: Color Palette (CSS Variables in `src/assets/styles/globals.css`):**
```css
--color-primary-light: #FDE047      /* yellow-300 */
--color-primary-medium: #FB923C     /* orange-400 */
--color-primary-dark: #EA580C       /* orange-600 */
--color-background: #1E1B4B         /* indigo-950 */
--color-text-light: #F3F4F6         /* gray-100 */
--color-accent: #22D3EE             /* cyan-400 */
--color-alert: #EF4444              /* red-500 */
--color-alert-dark: #7F1D1D         /* red-900 */
--color-placeholder: #9CA3AF        /* gray-400 */
--color-wall: #0E7490               /* cyan-700 */
```

**Usage (ALWAYS use CSS variables):**
```typescript
<div className="text-[var(--color-primary-light)] bg-[var(--color-background)]">
```

**Typography:**
- Font: `font-mono` (Sixtyfour custom font)
- Animations: `transition-all duration-200`

---

## Next.js Specific

### Client vs Server Components
- **Server Components (default):** Landing page, layouts (no hooks, no interactivity)
- **Client Components (`'use client'`):** Game, Three.js, Zustand, any interactive UI

### Navigation
```typescript
import Link from '@/ui/components/Link' // Custom wrapper with variants

<Link href="/game" prefetch={false}>Play Now</Link>
```

### Dynamic Imports
```typescript
const GameWrapper = dynamic(() => import('@/ui/pages/GameWrapper'), {
  ssr: false,
  loading: () => <LoadingScreen />
})
```

---

## Architecture Patterns

**Game Engine (ECS-like):**
- Systems run sequentially: `playerControl` → `movement` → `collision` → `collect` → `ghostBehavior`
- Game loop in `src/core/engine.ts` (requestAnimationFrame)
- Initialized once in `GameWrapper.tsx` via useEffect

**Routing:**
- `/` - Landing page (static, SSG)
- `/game` - Full game SPA (client-side, dynamic import)
- Game internally routes via Zustand `gameStatus` (MainMenu, Playing, DeathScreen, etc.)

**State Architecture:**
- 7 Zustand stores bridge core logic and UI
- No Redux or Context API

---

## Key Configuration Files

- **`next.config.ts`:** Pyodide headers (COOP/COEP), webpack config
- **`tsconfig.json`:** Path aliases, strict mode
- **`eslint.config.js`:** ESLint 9 flat config
- **`package.json`:** Dependencies, scripts, version 3.0.0
- **`UI_ARCHITECTURE.md`:** Comprehensive UI component guide

---

## Common Tasks

### Adding UI Component
1. Determine level (atomic/common/layout/page)
2. Create in `src/ui/{level}/ComponentName.tsx`
3. Add `'use client'` if uses hooks/state
4. Export from `index.ts`

### Navigation Between Pages
```typescript
// Use custom Link component (respects UI system)
import Link from '@/ui/components/Link'
<Link href="/game" variant="primary">Play</Link>
```

### Modifying Game Logic
1. Edit `src/core/systems/`
2. Test with `npm run dev`
3. No changes to Next.js app/ needed

---

## Known Gaps
- No testing framework
- No React.memo/lazy loading (except game route)
- No error boundaries
- Bundle size not optimized (~10MB for game)

---

## Anti-Patterns
❌ Missing `'use client'` for Three.js/Zustand components  
❌ Importing `next/link` directly (use `@/ui/components/Link`)  
❌ Using `any` types  
❌ Importing higher-level UI into lower levels  
❌ **NEVER use hardcoded colors - ALWAYS use CSS variables**  

---

**Version:** 3.0.0  
**Last Updated:** January 17, 2026  
**License:** CC-BY-SA-4.0  
**Author:** @yodak025
