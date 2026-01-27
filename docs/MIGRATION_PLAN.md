# Plan de Migración ECS - Chomp Crawler

## Documento de Planificación v1.0

---

## Resumen Ejecutivo

Este documento describe el plan de migración para refactorizar la arquitectura de Chomp Crawler desde el sistema actual (múltiples Zustand stores con actions embebidas) hacia la nueva arquitectura ECS (GameWorld Cold State + 1 Hot State unificado para render).

### Decisiones Arquitectónicas Confirmadas

| Decisión | Elección |
|----------|----------|
| **Acceso a GameWorld desde React** | React Context |
| **Estructura del Hot State** | Un store Zustand unificado |
| **Patrón de migración** | Strangler Fig (migración incremental) |

### Estimación Total: 8.5-13 días de desarrollo

---

## Índice

1. [Estado Actual](#1-estado-actual)
2. [Estado Objetivo](#2-estado-objetivo)
3. [Fases de Migración](#3-fases-de-migración)
4. [Fase 0: Infraestructura Base](#fase-0-infraestructura-base)
5. [Fase 1: Migrar Maze Data](#fase-1-migrar-maze-data)
6. [Fase 2: Migrar GameStatus y Score](#fase-2-migrar-gamestatus-y-score)
7. [Fase 3: Migrar Entidad Pacman](#fase-3-migrar-entidad-pacman)
8. [Fase 4: Migrar Fantasmas](#fase-4-migrar-fantasmas)
9. [Fase 5: Migrar Colisiones y Efectos](#fase-5-migrar-colisiones-y-efectos)
10. [Fase 6: Limpieza y Deprecación](#fase-6-limpieza-y-deprecación)
11. [Diagrama de Dependencias](#diagrama-de-dependencias)
12. [Riesgos y Mitigación](#riesgos-y-mitigación)

---

## 1. Estado Actual

### Stores Zustand (6 archivos)

| Store | Archivos que lo usan | Uso Imperativo | Uso Reactivo |
|-------|---------------------|----------------|--------------|
| `usePacmanStore` | 11 | 8 | 3 |
| `useGhostsStore` | 12 | 8 | 5 |
| `useMazeStore` | 10 | 6 | 5 |
| `useGameStatusStore` | 16 | 4 | 12 |
| `useDebugConfigStore` | 8 | 0 | 8 |
| `useGhostBehaviorConfigStore` | 0 | 0 | 0 (vacío) |

### Sistemas Actuales

```
engine.ts
├── endgameConditions()
├── playerControlSystem()
├── ghostBehaviorSystem()
│   ├── ghostModeManager
│   ├── ghostChaseKindManager
│   └── ghostDirectionDecider
├── collisionSystem()
└── movementSystem()
    └── collectSystem() (inline)
```

### Problemas Identificados

1. **Actions embebidas en entidades**: Violan principio ECS de datos puros
2. **Acceso directo a stores**: Sistemas llaman `getState()` directamente
3. **Sistemas acoplados**: `movementSystem` llama `collectSystem` inline
4. **Timing gate compartido**: Todos usan timer de Blinky como gate global
5. **Tipado débil**: Ghost parameters usan `any` extensivamente
6. **Referencias circulares**: Inky almacena referencia a Blinky (peer)

---

## 2. Estado Objetivo

### Arquitectura Nueva

```
┌─────────────────────────────────────────────────────────┐
│                     GAME LOOP                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │               COLD STATE (GameWorld)             │    │
│  │  - Entities: Map<EntityId, Set<ComponentType>>   │    │
│  │  - Components: Map<ComponentType, Map<...>>      │    │
│  │  - Spatial: wallGrid, collectableGrid, houseGrid │    │
│  │  - Game: status, score, level                    │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                                │
│                         │ sync (1x/frame)                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │               HOT STATE (Zustand)                │    │
│  │  - pacman: { position, health, isInvulnerable }  │    │
│  │  - ghosts: { blinky, pinky, inky, clyde }        │    │
│  │  - maze: { walls, pacDots, powerPellets }        │    │
│  │  - game: { status, score, level }                │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │ React hooks
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    REACT COMPONENTS                      │
│  - PacmanMesh.tsx (useHotState.pacman)                  │
│  - GhostMeshes (useHotState.ghosts.*)                   │
│  - HUD.tsx (useHotState.game, useHotState.pacman)       │
│  - DebugBar.tsx (GameWorldContext para escritura)       │
└─────────────────────────────────────────────────────────┘
```

### Sistemas Nuevos (18 sistemas atómicos)

```
FASE 1: INPUT
└── InputCaptureSystem

FASE 2: DECISIONES
├── PlayerIntentSystem
├── GhostBehaviorModeSystem
├── GhostTargetingSystem
└── GhostDirectionSystem

FASE 3: FÍSICA
├── ContinuousMovementSystem
├── DiscreteMovementSystem
├── AlignmentSystem
└── DiscretePositionSyncSystem

FASE 4: DETECCIÓN
├── EntityCollisionSystem
└── CollectionDetectionSystem

FASE 5: EFECTOS
├── DamageSystem
├── CollectionEffectSystem
├── PowerPelletEffectSystem
├── InvulnerabilityTickSystem
└── BehaviorTimerTickSystem

FASE 6: ESTADO DE JUEGO
├── VictoryConditionSystem
└── DefeatConditionSystem

FASE 7: SINCRONIZACIÓN
└── SyncToHotStateSystem

FASE 8: LIMPIEZA
└── CleanupEventsSystem
```

---

## 3. Fases de Migración

### Filosofía

1. **Strangler Fig Pattern**: Construir nueva arquitectura en paralelo
2. **Feature Flag**: `USE_NEW_ECS` controla qué código ejecutar
3. **Incremental**: Cada fase produce juego funcional
4. **No Big Bang**: Nunca romper el juego por más de un commit

### Diagrama de Fases

```
                     Fase 0
                 (Infraestructura)
                        │
                        ▼
                     Fase 1
                  (Maze Data)
                        │
                        ▼
                     Fase 2
               (GameStatus/Score)
                        │
                        ▼
                     Fase 3
                (Entidad Pacman)
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
           Fase 4              Fase 5*
         (Fantasmas)      (Colisiones/Efectos)
              │                   │
              └─────────┬─────────┘
                        │
                        ▼
                     Fase 6
                   (Limpieza)

* Fase 5 puede ejecutarse en paralelo parcialmente
```

---

## Fase 0: Infraestructura Base

**Duración estimada**: 1-2 días  
**Riesgo**: Bajo  
**Prerequisitos**: Ninguno

### Objetivo

Crear la clase `GameWorld`, el Hot State unificado, y el Context de React sin romper nada existente.

### Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/core/GameWorld.ts` | Clase principal del Cold State |
| `src/core/GameWorldContext.tsx` | React Context para acceso a GameWorld |
| `src/types/components.ts` | Interfaces TypeScript de componentes nuevos |
| `src/types/componentTypes.ts` | Enums de ComponentType |
| `src/state/useHotState.ts` | Store Zustand unificado para render |
| `src/config/featureFlags.ts` | Flag `USE_NEW_ECS: false` |

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/core/engine.ts` | Agregar instancia de GameWorld (sin usar aún) |
| `src/ui/pages/GameWrapper.tsx` | Wrap con GameWorldProvider |

### Código Esperado

```typescript
// src/core/GameWorld.ts
export class GameWorld {
  private entities: Map<EntityId, Set<ComponentType>>
  private components: Map<ComponentType, Map<EntityId, Component>>
  
  // Spatial structures
  private wallGrid: Set<PositionKey>
  private houseGrid: Set<PositionKey>
  private collectableGrid: Map<PositionKey, CollectableKind>
  
  // Game state
  private gameState: { status: GameStatus, score: number, level: number }
  
  // Entity management
  createEntity(id: EntityId): void
  destroyEntity(id: EntityId): void
  
  // Component management
  addComponent<T>(entityId: EntityId, type: ComponentType, data: T): void
  getComponent<T>(entityId: EntityId, type: ComponentType): T | undefined
  setComponent<T>(entityId: EntityId, type: ComponentType, data: T): void
  
  // Queries
  query(...componentTypes: ComponentType[]): EntityId[]
  
  // Spatial queries
  isWallAt(x: number, y: number): boolean
  isHouseAt(x: number, y: number): boolean
  getCollectableAt(x: number, y: number): CollectableKind | null
  removeCollectable(x: number, y: number): void
  
  // Debug API
  debugSetComponent<T>(entityId: EntityId, type: ComponentType, data: T): void
  debugGetFullState(): SerializedWorld
}
```

```typescript
// src/core/GameWorldContext.tsx
import { createContext, useContext } from 'react'
import type { GameWorld } from './GameWorld'

const GameWorldContext = createContext<GameWorld | null>(null)

export const GameWorldProvider: React.FC<{
  gameWorld: GameWorld
  children: React.ReactNode
}> = ({ gameWorld, children }) => (
  <GameWorldContext.Provider value={gameWorld}>
    {children}
  </GameWorldContext.Provider>
)

export const useGameWorld = (): GameWorld => {
  const ctx = useContext(GameWorldContext)
  if (!ctx) throw new Error('useGameWorld must be used within GameWorldProvider')
  return ctx
}
```

```typescript
// src/state/useHotState.ts
import { create } from 'zustand'

interface HotState {
  pacman: {
    position: { x: number, y: number }
    health: number
    isInvulnerable: boolean
  }
  
  ghosts: {
    blinky: GhostRenderState
    pinky: GhostRenderState
    inky: GhostRenderState
    clyde: GhostRenderState
  }
  
  maze: {
    isLoaded: boolean
    walls: Set<PositionKey>
    pacDots: Set<PositionKey>
    powerPellets: Set<PositionKey>
    pacDotsCollected: number
    pacDotsTotal: number
  }
  
  game: {
    status: GameStatus
    score: number
    level: number
  }
  
  // Sync action (called by SyncToHotStateSystem)
  sync: (partial: Partial<HotState>) => void
}

export const useHotState = create<HotState>((set) => ({
  // Initial values...
  sync: (partial) => set(partial)
}))
```

### Validación

- [ ] El juego sigue funcionando exactamente igual
- [ ] GameWorld existe pero no se usa en el loop
- [ ] No hay errores de TypeScript
- [ ] GameWorldContext está disponible en el árbol de React

---

## Fase 1: Migrar Maze Data

**Duración estimada**: 1-2 días  
**Riesgo**: Bajo-Medio  
**Prerequisitos**: Fase 0

### Objetivo

Migrar las estructuras de maze (walls, collectables, houseTiles) a GameWorld. Datos estáticos, cambio más simple.

### Justificación

- `useMazeStore` usado por 10 archivos pero datos simples
- Walls/collectables son estructuras espaciales, no entidades complejas
- Los sistemas solo leen (excepto `collectSystem` que elimina dots)

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/core/GameWorld.ts` | Agregar `wallGrid`, `houseGrid`, `collectableGrid`, `mazeInfo` |
| `src/core/engine.ts` | Poblar GameWorld.maze durante `initMazeEntities()` |
| `src/state/useMazeStore.ts` | Agregar métodos bridge que delegan a GameWorld |
| `src/core/systems/discreteMovementSystem.ts` | Cambiar a `gameWorld.isWallAt()` |
| `src/core/systems/collectSystem.ts` | Cambiar a `gameWorld.getCollectableAt()` / `removeCollectable()` |
| `src/core/systems/ghost-behavior-system/ghostDirectionDecider.ts` | Cambiar a `gameWorld.isWallAt()` / `isHouseAt()` |
| `src/state/useHotState.ts` | Agregar sync de maze desde GameWorld |
| `src/scenes/meshes/maze/Maze.tsx` | Consumir de `useHotState.maze` |
| `src/scenes/meshes/maze/PacDot.tsx` | Consumir de `useHotState.maze.pacDots` |
| `src/scenes/meshes/maze/PowerPellet.tsx` | Consumir de `useHotState.maze.powerPellets` |
| `src/scenes/meshes/maze/Wall.tsx` | Consumir de `useHotState.maze.walls` |

### Validación

- [ ] Maze se renderiza correctamente
- [ ] Collectables desaparecen al ser recogidos
- [ ] Paredes bloquean movimiento
- [ ] Score incrementa al recoger dots

---

## Fase 2: Migrar GameStatus y Score

**Duración estimada**: 0.5-1 día  
**Riesgo**: Bajo  
**Prerequisitos**: Fase 1

### Objetivo

Migrar estado del juego (status, score, level) a GameWorld + Hot State.

### Justificación

- `useGameStatusStore` tiene 16 consumidores pero lógica simple
- Mayoría son React components que solo leen
- Solo 4 archivos escriben

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/core/GameWorld.ts` | Agregar `gameState: { status, score, level }` |
| `src/state/useHotState.ts` | Agregar `game: { status, score, level }` |
| `src/core/engine.ts` | Sync game state al final de cada frame |
| `src/core/endgameConditions.ts` | Escribir a GameWorld en vez de store |
| `src/core/systems/collectSystem.ts` | Incrementar score en GameWorld |
| `src/ui/layout/HUD.tsx` | Leer de `useHotState.game` |
| `src/ui/layout/DebugBar.tsx` | Leer status de `useHotState.game` |
| `src/ui/pages/*.tsx` (8 archivos) | Cambiar imports y selectors |

### Validación

- [ ] Score incrementa al recoger dots
- [ ] Game Over funciona
- [ ] Victory funciona
- [ ] Pause funciona
- [ ] Level up funciona

---

## Fase 3: Migrar Entidad Pacman

**Duración estimada**: 2-3 días  
**Riesgo**: Alto  
**Prerequisitos**: Fase 2

### Objetivo

Migrar Pacman a GameWorld con el nuevo modelo de movimiento continuo. **Este es el cambio más complejo.**

### Justificación

- Prerequisito para nuevo modelo de movimiento
- `usePacmanStore` tiene 11 consumidores
- Requiere nuevos sistemas (ContinuousMovement, Alignment)

### Sub-fase 3a: Crear entidad Chomp en GameWorld

| Archivo | Acción |
|---------|--------|
| `src/core/GameWorld.ts` | Métodos para crear entidad Chomp con componentes |
| `src/core/engine.ts` | Crear entidad Chomp durante init |

### Sub-fase 3b: Crear nuevos sistemas de movimiento

| Archivo | Acción |
|---------|--------|
| `src/core/systems/inputCaptureSystem.ts` | **CREAR** - Keyboard → InputState |
| `src/core/systems/playerIntentSystem.ts` | **CREAR** - Input → MovementIntent con reglas de giro |
| `src/core/systems/continuousMovementSystem.ts` | **CREAR** - Movimiento float con colisión |
| `src/core/systems/alignmentSystem.ts` | **CREAR** - Deslizamiento a grid |
| `src/core/systems/discretePositionSyncSystem.ts` | **CREAR** - Sync Continuous → Discrete |

### Sub-fase 3c: Migrar sistemas existentes

| Archivo | Acción |
|---------|--------|
| `src/core/systems/playerControlSystem.ts` | **DEPRECAR** - Reemplazado |
| `src/core/systems/discreteMovementSystem.ts` | **MODIFICAR** - Solo fantasmas |

### Sub-fase 3d: Migrar render

| Archivo | Acción |
|---------|--------|
| `src/state/useHotState.ts` | Agregar `pacman: { position, health, isInvulnerable }` |
| `src/scenes/meshes/entities/PacmanMesh.tsx` | Consumir de `useHotState.pacman` |
| `src/ui/layout/HUD.tsx` | Health de `useHotState.pacman.health` |

### Sub-fase 3e: Migrar Debug Panel

| Archivo | Acción |
|---------|--------|
| `src/ui/layout/DebugBar.tsx` | Escribir a `gameWorld.debugSetComponent()` |

### Validación

- [ ] Pacman se mueve de forma continua (no discreto)
- [ ] Solo puede girar en intersecciones
- [ ] Se desliza a grid cuando suelta tecla
- [ ] Colisiones con paredes funcionan
- [ ] Health se muestra correctamente
- [ ] Debug panel puede modificar posición

---

## Fase 4: Migrar Fantasmas

**Duración estimada**: 2 días  
**Riesgo**: Medio  
**Prerequisitos**: Fase 3

### Objetivo

Migrar los 4 fantasmas a GameWorld manteniendo movimiento discreto.

### Justificación

- Depende de que targeting lea DiscretePosition de Chomp
- `useGhostsStore` tiene 12 consumidores
- Ghost behavior es complejo pero no cambia conceptualmente

### Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/core/systems/ghostBehaviorModeSystem.ts` | Reemplaza ghostModeManager |
| `src/core/systems/ghostTargetingSystem.ts` | Reemplaza ghostChaseKindManager |
| `src/core/systems/ghostDirectionSystem.ts` | Reemplaza ghostDirectionDecider |

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/core/GameWorld.ts` | Métodos para crear entidades Ghost |
| `src/core/engine.ts` | Crear 4 fantasmas durante init |
| `src/core/systems/discreteMovementSystem.ts` | Solo fantasmas, lee de GameWorld |
| `src/state/useHotState.ts` | Agregar `ghosts: { blinky, pinky, inky, clyde }` |
| `src/scenes/meshes/entities/BlinkyMesh.tsx` | Consumir de `useHotState.ghosts.blinky` |
| `src/scenes/meshes/entities/PinkyMesh.tsx` | Consumir de `useHotState.ghosts.pinky` |
| `src/scenes/meshes/entities/InkyMesh.tsx` | Consumir de `useHotState.ghosts.inky` |
| `src/scenes/meshes/entities/ClydeMesh.tsx` | Consumir de `useHotState.ghosts.clyde` |

### Validación

- [ ] 4 fantasmas se mueven correctamente
- [ ] Behavior modes funcionan (HOUSE → EXITING → CHASE/SCATTER)
- [ ] FRIGHTENED funciona con power pellet
- [ ] EATEN regresa a casa
- [ ] Targeting por ghost type funciona
- [ ] Debug panel puede modificar fantasmas

---

## Fase 5: Migrar Colisiones y Efectos

**Duración estimada**: 1-2 días  
**Riesgo**: Medio  
**Prerequisitos**: Fase 3 y 4

### Objetivo

Migrar sistema de colisiones al nuevo modelo con event components.

### Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/core/systems/entityCollisionSystem.ts` | Detecta colisiones → CollisionEvent |
| `src/core/systems/collectionDetectionSystem.ts` | Detecta items → CollectionEvent |
| `src/core/systems/damageSystem.ts` | CollisionEvent → Health/BehaviorMode |
| `src/core/systems/collectionEffectSystem.ts` | CollectionEvent → Score/Maze |
| `src/core/systems/powerPelletEffectSystem.ts` | Power pellet → FRIGHTENED |
| `src/core/systems/invulnerabilityTickSystem.ts` | Decrementa iTicks |
| `src/core/systems/behaviorTimerTickSystem.ts` | Decrementa behavior ticks |
| `src/core/systems/victoryConditionSystem.ts` | Todos dots → WON |
| `src/core/systems/defeatConditionSystem.ts` | Health 0 → LOST |
| `src/core/systems/cleanupEventsSystem.ts` | Limpia eventos one-frame |

### Archivos a Eliminar

| Archivo | Razón |
|---------|-------|
| `src/core/systems/collisionSystem.ts` | Reemplazado |
| `src/core/systems/collectSystem.ts` | Reemplazado |
| `src/core/endgameConditions.ts` | Reemplazado por victory/defeat systems |

### Validación

- [ ] Colisión con fantasma normal quita vida
- [ ] Colisión con fantasma FRIGHTENED lo come
- [ ] Invulnerabilidad temporal funciona
- [ ] Recolección de dots suma puntos
- [ ] Power pellet asusta fantasmas
- [ ] Victoria al recoger todo
- [ ] Derrota al perder todas las vidas

---

## Fase 6: Limpieza y Deprecación

**Duración estimada**: 1 día  
**Riesgo**: Bajo  
**Prerequisitos**: Todas las fases anteriores

### Objetivo

Eliminar código legacy, stores viejos, y feature flags.

### Archivos a Eliminar

| Archivo | Razón |
|---------|-------|
| `src/state/usePacmanStore.ts` | Reemplazado por GameWorld + HotState |
| `src/state/useGhostsStore.ts` | Reemplazado |
| `src/state/useMazeStore.ts` | Reemplazado |
| `src/state/useGameStatusStore.ts` | Reemplazado |
| `src/state/useGhostBehaviorConfigStore.ts` | Archivo vacío |
| `src/core/systems/ghost-behavior-system/` | Directorio completo |
| `src/config/featureFlags.ts` | Ya no necesario |

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/types/gameEntities.ts` | Limpiar tipos legacy |
| `src/types/gameComponents.ts` | Limpiar tipos legacy |
| `src/state/store.ts` | Solo exportar useHotState |

### Validación

- [ ] El juego funciona completamente con nueva arquitectura
- [ ] No quedan imports de stores legacy
- [ ] Build size reducido
- [ ] TypeScript compila sin errores
- [ ] Lint pasa sin warnings

---

## Diagrama de Dependencias

```
                     Fase 0
                 (Infraestructura)
                   1-2 días
                        │
                        ▼
                     Fase 1
                  (Maze Data)
                   1-2 días
                        │
                        ▼
                     Fase 2
               (GameStatus/Score)
                  0.5-1 día
                        │
                        ▼
                     Fase 3
                (Entidad Pacman)
                   2-3 días
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
           Fase 4              Fase 5
         (Fantasmas)      (Colisiones)
           2 días            1-2 días
              │                   │
              └─────────┬─────────┘
                        │
                        ▼
                     Fase 6
                   (Limpieza)
                     1 día
```

---

## Riesgos y Mitigación

### Riesgo Alto: Fase 3 (Movimiento Continuo)

**Riesgo**: El nuevo modelo de movimiento puede tener edge cases no previstos.

**Mitigación**:
1. Implementar tests manuales exhaustivos
2. Mantener feature flag para revertir
3. Documentar todos los edge cases encontrados

### Riesgo Medio: Sincronización Hot/Cold State

**Riesgo**: Race conditions o estado inconsistente entre GameWorld y Zustand.

**Mitigación**:
1. Sync siempre al final del frame
2. Hot State es read-only para React (excepto Debug)
3. Debug escribe directamente a Cold State

### Riesgo Medio: Performance

**Riesgo**: La sincronización por frame puede ser costosa.

**Mitigación**:
1. Solo sincronizar datos que cambiaron
2. Usar shallow comparison
3. Profile con React DevTools

### Riesgo Bajo: Regresiones en UI

**Riesgo**: Componentes React dejan de funcionar al cambiar stores.

**Mitigación**:
1. Migrar un componente a la vez
2. Verificar visualmente cada cambio
3. Mantener stores legacy hasta final de fase

---

## Checklist de Migración

### Pre-migración

- [ ] Documento de arquitectura leído y entendido
- [ ] Dependencias analizadas
- [ ] Plan revisado y aprobado

### Por Fase

Para cada fase, verificar:

- [ ] Código implementado
- [ ] Sin errores de TypeScript
- [ ] Sin errores de ESLint
- [ ] Juego funciona correctamente
- [ ] Commit con mensaje descriptivo

### Post-migración

- [ ] Código legacy eliminado
- [ ] Documentación actualizada
- [ ] Performance verificada
- [ ] README actualizado

---

## Apéndice: Archivos por Fase

### Resumen de archivos afectados

| Fase | Crear | Modificar | Eliminar |
|------|-------|-----------|----------|
| 0 | 6 | 2 | 0 |
| 1 | 0 | 11 | 0 |
| 2 | 0 | 10 | 0 |
| 3 | 5 | 6 | 0 |
| 4 | 3 | 9 | 0 |
| 5 | 10 | 0 | 3 |
| 6 | 0 | 3 | 7 |
| **Total** | **24** | **41** | **10** |

---

**Versión**: 1.0  
**Fecha**: Enero 2026  
**Autor**: Definido en colaboración con el equipo de desarrollo  
**Documento relacionado**: `/docs/ECS_ARCHITECTURE_DESIGN.md`
