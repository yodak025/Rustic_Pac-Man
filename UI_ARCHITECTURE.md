# UI Architecture - Rustic Pac-Man

## CORE PHILOSOPHY

Architecture based on SOLID principles + Atomic Design methodology.
Four-level hierarchy: components → common → layout → pages.
Each level builds upon lower levels. Higher levels never imported by lower levels.

## PRINCIPLES

### SOLID Application
- Single Responsibility: Each component has exactly one reason to change
- Open/Closed: Extend via props, closed to modification
- Liskov Substitution: Components are interchangeable with their variants
- Interface Segregation: No unused props, minimal required dependencies
- Dependency Inversion: High-level components depend on abstractions (props interfaces), not concrete implementations

### Composition Rules
- Atomic components (Level 1): Zero UI component dependencies, only React primitives
- Common components (Level 2): Compose atomics + simple logic, no page-level concerns
- Layout components (Level 3): Organize sections, integrate state management
- Pages (Level 4): Complete views, orchestrate layouts + common components

### Component Location Decision Tree
```
Is it a primitive UI element (button, input, icon)?
  → components/

Does it compose atomics with reusable logic?
  → common/

Does it organize UI sections with state?
  → layout/

Is it a complete application view?
  → pages/
```

## DIRECTORY STRUCTURE

```
src/ui/
├── components/    # Level 1: Atomics (7 components)
├── common/        # Level 2: Composed (7 components)
├── layout/        # Level 3: Sections (4 components)
└── pages/         # Level 4: Views (3 components)
```

Each directory contains index.ts exporting all components + types.

## COMPONENT INVENTORY

### Level 1: Atomic Components (components/)
No dependencies on other UI components. Single responsibility primitives.
7 components: Button, PageTitle, ProgressBar, DebugInput, DebugDetails, TileCell, HeartIcon
All exported via components/index.ts

Characteristics:
- Props interfaces define variant systems (e.g., Button variants: primary/secondary/danger/success)
- Size/style variants map to Tailwind utility classes
- Event handlers via props (onClick, onSubmit)
- Optional className for extension
- Some components have no props (HeartIcon)

### Level 2: Common Components (common/)
Compose atomic components. Encapsulate reusable UI patterns with simple logic.
7 components: LoadingScreen, Modal, MenuButtonGroup, LivesDisplay, GameStats, TileGrid, DebugEntitySection
All exported via common/index.ts

Characteristics:
- Compose 1-3 atomic components
- May read from Zustand stores (LoadingScreen reads useGameStatusStore)
- Props define callbacks and data (not UI primitives)
- Conditional rendering based on props (Modal.isOpen)
- Array mapping patterns (LivesDisplay renders HeartIcon array, TileGrid renders TileCell grid)

### Level 3: Layout Components (layout/)
Organize UI sections. Integrate state management. Not complete pages.
4 components: HUD, InGameMenu, DebugBar, MazeViewer
All exported via layout/index.ts

Characteristics:
- No props (read directly from stores)
- Integrate multiple stores (HUD reads 3+ stores)
- Keyboard event listeners (DebugBar toggles with '#', MazeViewer with '@')
- Conditional rendering based on game state
- Orchestrate 3-5 lower-level components

### Level 4: Page Components (pages/)
Complete application views. Orchestrate layouts + common components.
3 components: MainMenu, DeathScreen, MazeTilemapAnalyzer
All exported via pages/index.ts

Characteristics:
- No props (read/write useGameStatusStore)
- Control application routing via gameStatus.status changes
- Compose 2-4 components from lower levels
- Handle page-specific local state when needed
- Trigger game actions (start, restart, navigate)

## DEPENDENCY FLOW

```
pages/ 
  ├─→ layout/ (HUD, InGameMenu, DebugBar, MazeViewer)
  ├─→ common/ (LoadingScreen, Modal, MenuButtonGroup, LivesDisplay, GameStats, TileGrid, DebugEntitySection)
  └─→ components/ (Button, PageTitle, ProgressBar, DebugInput, DebugDetails, TileCell, HeartIcon)

layout/
  ├─→ common/
  └─→ components/

common/
  └─→ components/

components/
  └─→ (only React primitives, no UI component dependencies)
```

## STATE MANAGEMENT INTEGRATION

State stores used by UI components:
- **useGameStatusStore**: Game state (status, level, score, paused flag)
- **usePacmanStore**: Pacman entity (position, health, movement)
- **useGhostsStore**: Ghost entities (Blinky, Pinky, Inky, Clyde - positions, modes, targets)
- **useMazeStore**: Maze data (tiles, pac-dots count)

State access patterns:
- Pages: Read/write game status
- Layouts: Read multiple stores, orchestrate state changes
- Common: Minimal state access, primarily prop-driven
- Components: Zero state access, 100% props

## STYLING PATTERNS

Technology: Tailwind CSS utility classes
Color palette: yellow-400 (primary), purple-400 (secondary), red-500 (danger), green-500 (success), gray-600 (neutral)
Typography: Pixelated/retro font family
Responsive: Not prioritized (desktop-first game)
Animations: transition-all duration-300 for smooth state changes

## IMPORT CONVENTIONS

Path aliases configured in tsconfig:
- `@/ui/components` → src/ui/components
- `@/ui/common` → src/ui/common
- `@/ui/layout` → src/ui/layout
- `@/ui/pages` → src/ui/pages
- `@/state/` or `@state/` → src/state
- `@/core/` → src/core

Preferred import styles:
```typescript
// Direct imports (always valid)
import Button from '@/ui/components/Button';
import Modal from '@/ui/common/Modal';

// Index imports (when available)
import { Button, PageTitle } from '@/ui/components';
import { Modal, MenuButtonGroup } from '@/ui/common';
```

## REFACTORING METRICS

Code reduction achieved:
- DebugBar: 350 lines → 170 lines (-51%)
- InGameMenu: 30 lines → 15 lines (-50%)
- DeathScreen: 35 lines → 20 lines (-43%)
- Overall duplication: -60% across refactored components

Component count:
- 7 atomic components created
- 7 common components created
- 4 layout components refactored
- 3 page components refactored

## DEVELOPMENT PATTERNS

### Creating New Atomic Component
1. Create file in components/ (e.g., Icon.tsx)
2. Define props interface with TypeScript
3. No dependencies on other UI components
4. Export from components/index.ts
5. Use in higher-level components

### Creating New Common Component
1. Identify reusable pattern using 2+ atomics
2. Create file in common/ (e.g., Card.tsx)
3. Compose atomic components via props.children or explicit imports
4. Keep logic minimal (state, effects only if necessary)
5. Export from common/index.ts

### Creating New Layout Component
1. Identify section of UI that appears across multiple pages
2. Create file in layout/ (e.g., Sidebar.tsx)
3. Integrate state management (stores)
4. Compose common + atomic components
5. Export from layout/index.ts

### Creating New Page
1. Create file in pages/ (e.g., SettingsScreen.tsx)
2. Integrate with useGameStatusStore routing logic
3. Compose layouts + common + atomic components
4. Handle page-level state
5. Export from pages/index.ts

### Modifying Existing Component
1. Check dependency tree (what imports this component?)
2. For atomics: Ensure backward compatibility (default props)
3. For common/layout: Verify state integration still works
4. For pages: Test full user flow
5. Update props interface + TypeScript types

## TESTING STRATEGY (RECOMMENDED)

Atomics: Unit tests for each variant, disabled states, click handlers
Common: Integration tests with mocked atomic components
Layouts: Integration tests with mocked state stores
Pages: E2E tests for complete user flows

## FUTURE EXTENSIBILITY

Potential additions following architecture:
- Theming system: Create ThemeProvider in common/, atomic components consume theme
- Animation library: Wrap animated primitives as atomics
- Accessibility: Add ARIA props to atomic components, propagate upward
- Internationalization: Add i18n keys to text props in atomics
- Form system: Create Input/Form atomics, validation in common/
- Modal variants: Extend Modal in common/ for specific use cases (confirm, alert)
- Responsive design: Add breakpoint props to atomics

## ANTI-PATTERNS TO AVOID

❌ Importing higher-level components into lower levels (e.g., importing Modal into Button)
❌ Direct state access in atomic components (always use props)
❌ Business logic in atomic components (keep in common/layout/pages)
❌ Prop drilling beyond 2 levels (use composition or state management)
❌ Inline styles (use Tailwind classes)
❌ Anonymous functions in props (causes re-renders, define handlers in parent)
❌ Giant components (>200 lines = candidate for splitting)
❌ Unused props in interfaces (violates Interface Segregation)

## MAINTENANCE CHECKLIST

When adding new feature:
- [ ] Identify appropriate component level
- [ ] Check for existing components to reuse
- [ ] Define TypeScript interface for props
- [ ] Follow naming conventions (PascalCase, descriptive)
- [ ] Export from level's index.ts
- [ ] Update this documentation if architectural pattern changes
- [ ] Verify no circular dependencies
- [ ] Ensure Tailwind classes match existing palette

When refactoring:
- [ ] Start from lowest level (atomics)
- [ ] Work upward (atomics → common → layout → pages)
- [ ] Maintain backward compatibility with default props
- [ ] Update dependent components if interface changes
- [ ] Test full dependency chain
- [ ] Remove deprecated code after migration

## COMPONENT EXAMPLES & REFERENCES

To understand implementation details, props interfaces, and usage patterns, consult the actual component files:

### Atomic Components (Level 1) - src/ui/components/
Reference these for:
- Props interface patterns (variants, sizes, event handlers)
- Tailwind class composition
- TypeScript prop typing
- Default prop values

Example files:
- **Button.tsx**: Variant system pattern, onClick handlers, disabled states
- **PageTitle.tsx**: Size variant pattern with Tailwind text-* classes
- **ProgressBar.tsx**: Animated state pattern, percentage display logic
- **DebugInput.tsx**: Form submission on Enter key, input clearing
- **DebugDetails.tsx**: HTML details/summary wrapper pattern
- **TileCell.tsx**: Color mapping from numeric values
- **HeartIcon.tsx**: Prop-less SVG component pattern

### Common Components (Level 2) - src/ui/common/
Reference these for:
- Composition patterns (how atomics are combined)
- Array mapping patterns (rendering dynamic lists)
- Store integration patterns
- Conditional rendering based on props

Example files:
- **LoadingScreen.tsx**: Store reading without props, progress-based messaging
- **Modal.tsx**: Backdrop overlay pattern, conditional rendering
- **MenuButtonGroup.tsx**: Dynamic button rendering based on provided callbacks
- **LivesDisplay.tsx**: Array.from pattern for icon repetition
- **GameStats.tsx**: Optional prop handling, stat display layout
- **TileGrid.tsx**: 2D array mapping to grid, passing props to children
- **DebugEntitySection.tsx**: Complex props interface with callbacks, collapsible section pattern

### Layout Components (Level 3) - src/ui/layout/
Reference these for:
- Multi-store integration patterns
- Keyboard event handling
- Component orchestration
- State-based conditional rendering

Example files:
- **HUD.tsx**: Multiple store reading, complex component composition
- **InGameMenu.tsx**: Game state conditional rendering, action dispatching
- **DebugBar.tsx**: Keyboard toggle pattern, repeated component instances
- **MazeViewer.tsx**: API fetch pattern, toggle visibility

### Page Components (Level 4) - src/ui/pages/
Reference these for:
- Game state routing patterns
- Page-level composition strategies
- Local state management alongside global stores
- Action triggering patterns

Example files:
- **MainMenu.tsx**: Simple page composition, game start actions
- **DeathScreen.tsx**: Game over state handling, reset actions
- **MazeTilemapAnalyzer.tsx**: Utility page pattern, async data fetching

### Index Files - Export Patterns
Reference these for:
- Named export organization
- Type re-exports
- Component grouping strategies

Example files:
- **src/ui/components/index.ts**: Atomic component exports
- **src/ui/common/index.ts**: Common component exports
- **src/ui/layout/index.ts**: Layout component exports
- **src/ui/pages/index.ts**: Page component exports

### Usage Examples in Context
To see components used in real scenarios:
- **Simple composition**: MainMenu.tsx (PageTitle + Button)
- **Modal usage**: InGameMenu.tsx (Modal + MenuButtonGroup)
- **Array rendering**: LivesDisplay.tsx (HeartIcon array), DebugBar.tsx (DebugEntitySection array)
- **Grid patterns**: TileGrid.tsx (TileCell grid), MazeTilemapAnalyzer.tsx (using TileGrid)
- **Store integration**: LoadingScreen.tsx (single store), HUD.tsx (multiple stores)
- **Keyboard events**: DebugBar.tsx ('#' key), MazeViewer.tsx ('@' key)
- **Conditional rendering**: Modal.tsx (isOpen), InGameMenu.tsx (game status)
- **Callbacks pattern**: MenuButtonGroup.tsx (optional callbacks), DebugEntitySection.tsx (entity actions)

---

Last updated: October 2025
Architecture version: 1.0
