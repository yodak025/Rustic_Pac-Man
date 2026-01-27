# Agent Development Guide - Chomp Crawler

## 🚨 CRITICAL DIRECTIVE: Always Check Current Documentation

**MANDATORY RULE:** When working with any technology configuration, dependency, or specific technical feature, you MUST first consult the latest official documentation online before providing solutions or making changes.

**Why:** Technology evolves rapidly. Configurations, APIs, and best practices change between versions. Outdated information leads to broken builds, deprecated patterns, and wasted time.

**Required workflow:**
1. **Identify the technology and version** (check `package.json` for exact versions)
2. **Search official documentation** for the specific feature/configuration being addressed
3. **Verify compatibility** with the current version in use
4. **Apply up-to-date solutions** based on official sources
5. **Test empirically** to confirm the solution works

**Examples of when this is critical:**
- Configuring build tools (Turbopack, Webpack, Vite, etc.)
- Setting up framework features (Next.js App Router, React Server Components, etc.)
- Working with bundlers, transpilers, or optimization tools
- Implementing library-specific APIs or patterns
- Debugging version-specific issues

**Never assume configurations from memory or training data are current. Always verify first.**

---

## Project Overview
Browser-based Pac-Man clone with procedurally generated mazes (3D rogue-like perspective). Built with Next.js 16, React 19, Three.js (React Three Fiber), TypeScript, and Python (Pyodide) for maze generation. State managed via Zustand. Thesis project for Engineering in Audiovisual Systems.

**Tech Stack:** Next.js 16.1.3, React 19.1.0, Three.js 0.176.0, React Three Fiber 9.1.2, Zustand 5.0.5, TypeScript 5.8.3, Tailwind CSS 4.1.18, Pyodide 0.27.6

---

## Build, Lint & Test Commands

### Development & Build
Check `package.json` scripts section for all available commands. Common tasks:
- **Development server:** Uses Turbopack by default (Next.js 16+)
- **Production build:** Standard Next.js build process
- **Linting:** ESLint with flat config
- **Type checking:** TypeScript compiler in noEmit mode

### Turbopack Configuration
**Bundler:** Turbopack enabled by default in dev mode. See `next.config.ts` for:
- Custom loader rules (e.g., Python files for Pyodide)
- Transpiled packages configuration
- Build-specific settings

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
See `tsconfig.json` for complete path mappings. Primary aliases:
- `@/` → `src/` (general)
- Module-specific: `@core/`, `@scenes/`, `@state/`, `@custom-types/`, `@ui/`, `@assets/`, `@config/`

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

**⚠️ CRITICAL: Color Palette**
- **Source:** CSS variables defined in `src/assets/styles/globals.css`
- **ALWAYS use CSS variables** via `var(--color-name)` syntax (e.g., `text-[var(--color-primary-light)]`)
- **NEVER hardcode hex colors** in components
- Check `globals.css` for the complete color palette (primary, background, alert, accent, etc.)

**Typography & Animations:**
- Custom font configuration in `globals.css` and `app/layout.tsx`
- Standard animation durations in `globals.css`

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
- **System execution order:** See `src/core/engine.ts` for sequential system pipeline
- **Game loop:** requestAnimationFrame-based, defined in `src/core/engine.ts`
- **Initialization:** `GameWrapper.tsx` initializes engine via useEffect

**Routing:**
- **Next.js routes:** Check `app/` directory structure for file-based routing
- **Game internal state routing:** Managed via Zustand `gameStatus` store (check `src/state/` stores)

**State Architecture:**
- **State management:** Zustand stores in `src/state/` (multiple stores, check directory)
- **Bridge layer:** Stores connect core game logic with UI components
- No Redux or Context API

---

## Key Configuration Files

- **`next.config.ts`:** Turbopack rules, Pyodide headers (COOP/COEP), transpiled packages
- **`tsconfig.json`:** Path aliases, compiler options, strict mode settings
- **`eslint.config.js`:** ESLint 9 flat config
- **`package.json`:** Dependencies, scripts, project metadata
- **`src/config/*.json`:** Runtime configuration (debug, ghost behavior, etc.)
- **`UI_ARCHITECTURE.md`:** Comprehensive UI component hierarchy guide

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
- Limited React optimization (check dynamic imports in `app/` routes)
- No error boundaries
- Bundle size optimization needed

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
