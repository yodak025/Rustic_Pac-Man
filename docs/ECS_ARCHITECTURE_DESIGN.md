# Arquitectura ECS para Chomp Crawler

## Documento de Diseño v1.0

---

## 1. Visión General

### 1.1 Principios Arquitectónicos

1. **Separación Hot/Cold State**: El estado lógico (Cold) vive en un `GameWorld` puro. El estado de renderizado (Hot) vive en Zustand y se sincroniza 1x por frame.

2. **Sistemas Atómicos**: Cada sistema tiene una única responsabilidad. Lee componentes específicos, escribe componentes específicos.

3. **Orden de Ejecución Fijo**: Los sistemas se ejecutan en capas predefinidas. No hay eventos entre sistemas (simplicidad sobre flexibilidad).

4. **Dos Modelos de Movimiento**: 
   - **Continuo** (Chomp): Posición float controlada por input, con alineación a grid
   - **Discreto** (Fantasmas): Posición integer controlada por timer

5. **Componentes Puros**: Sin lógica, solo datos. Las "actions" actuales desaparecen.

---

## 2. Estructura del Cold State (GameWorld)

### 2.1 Clase GameWorld

```typescript
class GameWorld {
  // ══════════════════════════════════════════════════════════
  // STORAGE
  // ══════════════════════════════════════════════════════════
  
  private entities: Map<EntityId, Set<ComponentType>>
  private components: Map<ComponentType, Map<EntityId, Component>>
  
  // Índices para queries rápidas
  private entitiesByArchetype: Map<ArchetypeHash, Set<EntityId>>
  
  // ══════════════════════════════════════════════════════════
  // ENTITY MANAGEMENT
  // ══════════════════════════════════════════════════════════
  
  createEntity(id: EntityId): void
  destroyEntity(id: EntityId): void
  entityExists(id: EntityId): boolean
  
  // ══════════════════════════════════════════════════════════
  // COMPONENT MANAGEMENT
  // ══════════════════════════════════════════════════════════
  
  addComponent<T>(entityId: EntityId, type: ComponentType, data: T): void
  removeComponent(entityId: EntityId, type: ComponentType): void
  getComponent<T>(entityId: EntityId, type: ComponentType): T | undefined
  hasComponent(entityId: EntityId, type: ComponentType): boolean
  setComponent<T>(entityId: EntityId, type: ComponentType, data: T): void
  
  // ══════════════════════════════════════════════════════════
  // QUERIES
  // ══════════════════════════════════════════════════════════
  
  // Obtener todas las entidades que tienen TODOS los componentes especificados
  query(...componentTypes: ComponentType[]): EntityId[]
  
  // Query con acceso directo a componentes (evita múltiples getComponent)
  queryWithComponents<T extends ComponentType[]>(
    ...types: T
  ): Array<{ entityId: EntityId, components: ComponentTuple<T> }>
  
  // ══════════════════════════════════════════════════════════
  // SPATIAL QUERIES (para maze)
  // ══════════════════════════════════════════════════════════
  
  // Estructuras espaciales separadas para eficiencia
  private wallGrid: Set<PositionKey>  // "x,y" → existe pared
  private houseGrid: Set<PositionKey>
  private collectableGrid: Map<PositionKey, CollectableKind>
  
  isWallAt(x: number, y: number): boolean
  isHouseAt(x: number, y: number): boolean
  getCollectableAt(x: number, y: number): CollectableKind | null
  removeCollectable(x: number, y: number): void
  
  // ══════════════════════════════════════════════════════════
  // DEBUG API
  // ══════════════════════════════════════════════════════════
  
  debugSetComponent<T>(entityId: EntityId, type: ComponentType, data: T): void
  debugGetFullState(): SerializedWorld  // Para inspección
}
```

### 2.2 Tipos Base

```typescript
type EntityId = string
type ComponentType = string
type PositionKey = `${number},${number}`
type ArchetypeHash = string  // Sorted component types joined

interface Component {
  // Marker interface - todos los componentes extienden esto
}
```

---

## 3. Definición de Componentes

### 3.1 Componentes de Identidad

```typescript
// ══════════════════════════════════════════════════════════
// Identificadores y Tags
// ══════════════════════════════════════════════════════════

interface PlayerTag extends Component {
  // Marker: esta entidad es el jugador
}

interface GhostTag extends Component {
  kind: GhostKind  // BLINKY | PINKY | INKY | CLYDE
}

interface WallTag extends Component {
  // Marker: esta entidad es una pared
}

interface CollectableTag extends Component {
  kind: CollectableKind  // PAC_DOT | POWER_PELLET
}

interface HouseTileTag extends Component {
  // Marker: tile pertenece a la casa de fantasmas
}
```

### 3.2 Componentes de Posición

```typescript
// ══════════════════════════════════════════════════════════
// Posición Discreta (Fantasmas, Walls, Collectables)
// ══════════════════════════════════════════════════════════

interface DiscretePosition extends Component {
  x: number  // integer
  y: number  // integer
}

// ══════════════════════════════════════════════════════════
// Posición Continua (Solo Chomp)
// ══════════════════════════════════════════════════════════

interface ContinuousPosition extends Component {
  x: number  // float
  y: number  // float
}

// Nota: Chomp tiene AMBOS componentes.
// - ContinuousPosition: posición real para render y física
// - DiscretePosition: tile actual (floor de continuous) para:
//   - Targeting de fantasmas
//   - Colisiones con fantasmas
//   - Recolección de items
```

### 3.3 Componentes de Movimiento

```typescript
// ══════════════════════════════════════════════════════════
// Timer de Movimiento Discreto (Fantasmas)
// ══════════════════════════════════════════════════════════

interface MovementTimer extends Component {
  elapsed: number    // ms acumulados
  interval: number   // ms entre movimientos
}

// ══════════════════════════════════════════════════════════
// Velocidad Continua (Solo Chomp)
// ══════════════════════════════════════════════════════════

interface MovementSpeed extends Component {
  current: number     // tiles/segundo actual
  base: number        // tiles/segundo base (constante por ahora)
}

// ══════════════════════════════════════════════════════════
// Intención de Movimiento (Output de sistemas de decisión)
// ══════════════════════════════════════════════════════════

interface MovementIntent extends Component {
  direction: Direction | null  // UP, DOWN, LEFT, RIGHT, o null (sin movimiento)
}

// ══════════════════════════════════════════════════════════
// Estado de Alineación (Solo Chomp)
// ══════════════════════════════════════════════════════════

interface AlignmentState extends Component {
  isAligned: boolean           // true si x e y son enteros
  aligningDirection: Direction | null  // dirección de deslizamiento si no hay input
}
```

### 3.4 Componentes de Input

```typescript
// ══════════════════════════════════════════════════════════
// Estado de Input (Singleton, solo una entidad lo tiene)
// ══════════════════════════════════════════════════════════

interface InputState extends Component {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

// ══════════════════════════════════════════════════════════
// Dirección Deseada del Jugador
// ══════════════════════════════════════════════════════════

interface PlayerIntent extends Component {
  // La dirección que el jugador QUIERE ir (puede no ser posible aún)
  desiredDirection: Direction | null
  // La última dirección en la que se movió exitosamente
  lastValidDirection: Direction | null
}

// ══════════════════════════════════════════════════════════
// Marcador de Control por Jugador
// ══════════════════════════════════════════════════════════

interface Playable extends Component {
  // Marker: esta entidad responde a input del jugador
}
```

### 3.5 Componentes de Comportamiento de Fantasmas

```typescript
// ══════════════════════════════════════════════════════════
// Modo de Comportamiento
// ══════════════════════════════════════════════════════════

interface BehaviorMode extends Component {
  mode: GhostBehaviorModeValue  // HOUSE | EXITING_HOUSE | SCATTER | CHASE | FRIGHTENED | EATEN
}

// ══════════════════════════════════════════════════════════
// Timer de Comportamiento
// ══════════════════════════════════════════════════════════

interface BehaviorTimer extends Component {
  ticksRemaining: number  // ticks hasta cambio de modo
}

// ══════════════════════════════════════════════════════════
// Target de Navegación
// ══════════════════════════════════════════════════════════

interface TargetPosition extends Component {
  x: number
  y: number
  kind: TargetKind  // PLAYER | TILE | HOUSE | RANDOM
}

// ══════════════════════════════════════════════════════════
// Referencia a Peer (Solo Inky)
// ══════════════════════════════════════════════════════════

interface PeerReference extends Component {
  peerId: EntityId  // 'blinky' para Inky
}

// ══════════════════════════════════════════════════════════
// Dirección Actual (para evitar reversa)
// ══════════════════════════════════════════════════════════

interface CurrentDirection extends Component {
  direction: Direction | null
}
```

### 3.6 Componentes de Combate/Interacción

```typescript
// ══════════════════════════════════════════════════════════
// Salud
// ══════════════════════════════════════════════════════════

interface Health extends Component {
  current: number
  max: number
}

// ══════════════════════════════════════════════════════════
// Invulnerabilidad Temporal
// ══════════════════════════════════════════════════════════

interface Invulnerability extends Component {
  ticksRemaining: number  // 0 = vulnerable
}

// ══════════════════════════════════════════════════════════
// Capacidad de Recolección
// ══════════════════════════════════════════════════════════

interface Collector extends Component {
  canCollect: CollectableKind[]  // [PAC_DOT, POWER_PELLET]
}

// ══════════════════════════════════════════════════════════
// Evento de Colisión (componente temporal, limpiado cada frame)
// ══════════════════════════════════════════════════════════

interface CollisionEvent extends Component {
  withEntity: EntityId
  type: 'ghost' | 'wall' | 'collectable'
}

// ══════════════════════════════════════════════════════════
// Evento de Recolección (componente temporal)
// ══════════════════════════════════════════════════════════

interface CollectionEvent extends Component {
  collectableId: EntityId
  kind: CollectableKind
  position: { x: number, y: number }
}
```

### 3.7 Componentes de Render (Solo para Hot State)

```typescript
// ══════════════════════════════════════════════════════════
// Estos componentes solo existen para marcar qué sincronizar
// ══════════════════════════════════════════════════════════

interface Renderable extends Component {
  // Marker: esta entidad debe sincronizarse al Hot State
}

// El Hot State contendrá:
// - position (de ContinuousPosition o DiscretePosition según entidad)
// - health (valor actual)
// - isInvulnerable (derivado de Invulnerability.ticksRemaining > 0)
// - behaviorMode (para fantasmas, determina color)
// - direction (para fantasmas, determina rotación)
```

---

## 4. Definición de Sistemas

### 4.1 Orden de Ejecución

```typescript
enum SystemPhase {
  // ══════════════════════════════════════════════════════════
  // FASE 1: CAPTURA DE INPUT
  // ══════════════════════════════════════════════════════════
  INPUT_CAPTURE,
  
  // ══════════════════════════════════════════════════════════
  // FASE 2: DECISIONES (qué quiere hacer cada entidad)
  // ══════════════════════════════════════════════════════════
  PLAYER_INTENT,
  GHOST_BEHAVIOR_MODE,
  GHOST_TARGETING,
  GHOST_DIRECTION,
  
  // ══════════════════════════════════════════════════════════
  // FASE 3: FÍSICA (aplicar movimiento)
  // ══════════════════════════════════════════════════════════
  CONTINUOUS_MOVEMENT,
  DISCRETE_MOVEMENT,
  ALIGNMENT,
  DISCRETE_POSITION_SYNC,  // Actualiza DiscretePosition de Chomp
  
  // ══════════════════════════════════════════════════════════
  // FASE 4: DETECCIÓN (qué pasó como resultado del movimiento)
  // ══════════════════════════════════════════════════════════
  WALL_COLLISION,       // Ya aplicado en movimiento, aquí solo cleanup
  ENTITY_COLLISION,
  COLLECTION_DETECTION,
  
  // ══════════════════════════════════════════════════════════
  // FASE 5: EFECTOS (consecuencias de las detecciones)
  // ══════════════════════════════════════════════════════════
  DAMAGE,
  COLLECTION_EFFECT,
  POWER_PELLET_EFFECT,
  INVULNERABILITY_TICK,
  BEHAVIOR_TIMER_TICK,
  
  // ══════════════════════════════════════════════════════════
  // FASE 6: ESTADO DE JUEGO
  // ══════════════════════════════════════════════════════════
  VICTORY_CONDITION,
  DEFEAT_CONDITION,
  
  // ══════════════════════════════════════════════════════════
  // FASE 7: SINCRONIZACIÓN (una vez por frame, al final)
  // ══════════════════════════════════════════════════════════
  SYNC_TO_HOT_STATE,
  
  // ══════════════════════════════════════════════════════════
  // FASE 8: LIMPIEZA
  // ══════════════════════════════════════════════════════════
  CLEANUP_EVENTS,
}
```

### 4.2 Especificación de Cada Sistema

---

#### **InputCaptureSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: INPUT_CAPTURE
// RESPONSABILIDAD: Capturar estado del teclado
// ══════════════════════════════════════════════════════════

interface InputCaptureSystem {
  // INPUT EXTERNO
  keyboardState: { w: boolean, a: boolean, s: boolean, d: boolean }
  
  // LEE COMPONENTES
  // (ninguno)
  
  // ESCRIBE COMPONENTES
  InputState: {
    up: keyboardState.w,
    down: keyboardState.s,
    left: keyboardState.a,
    right: keyboardState.d
  }
  
  // LÓGICA
  // 1. Obtener entidad singleton 'input' (o crearla si no existe)
  // 2. Escribir estado actual del teclado
}
```

---

#### **PlayerIntentSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: PLAYER_INTENT
// RESPONSABILIDAD: Traducir input a intención de movimiento
// ══════════════════════════════════════════════════════════

interface PlayerIntentSystem {
  // QUERY
  entities: query(Playable, ContinuousPosition, PlayerIntent, AlignmentState)
  inputEntity: query(InputState)
  
  // LEE COMPONENTES
  InputState
  ContinuousPosition
  AlignmentState
  PlayerIntent (para lastValidDirection)
  
  // ESCRIBE COMPONENTES
  PlayerIntent.desiredDirection
  MovementIntent
  
  // LÓGICA
  // 1. Leer InputState
  // 2. Determinar dirección deseada del input:
  //    - Si hay input: primera dirección pulsada con prioridad
  //    - Si no hay input: null
  // 3. Escribir PlayerIntent.desiredDirection
  // 4. Determinar MovementIntent:
  //    - Si desiredDirection es válida (ver reglas abajo): usar desiredDirection
  //    - Si no, y hay lastValidDirection y no hay input: usar lastValidDirection (deslizamiento)
  //    - Si hay input pero dirección no válida: mantener lastValidDirection
  
  // REGLAS DE VALIDEZ DE DIRECCIÓN:
  // - Horizontal (LEFT/RIGHT): solo válido si y es entero (alineado verticalmente)
  // - Vertical (UP/DOWN): solo válido si x es entero (alineado horizontalmente)
  // - Esto garantiza que Chomp solo gira en intersecciones
}
```

**Ejemplo de comportamiento:**

```
Situación: Chomp en (5.3, 10.0), moviéndose RIGHT, jugador pulsa UP

ContinuousPosition: { x: 5.3, y: 10.0 }
InputState: { up: true, right: false, ... }
AlignmentState: { isAligned: false, ... }

Cálculo:
- desiredDirection = UP
- ¿Es UP válido? UP requiere x entero. x=5.3 → NO
- ¿Hay lastValidDirection? Sí, RIGHT
- MovementIntent = RIGHT (sigue moviéndose hasta poder girar)

Cuando llegue a (6.0, 10.0):
- desiredDirection = UP (jugador sigue pulsando)
- ¿Es UP válido? x=6.0 → SÍ
- MovementIntent = UP
- Actualizar lastValidDirection = UP
```

---

#### **ContinuousMovementSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: CONTINUOUS_MOVEMENT
// RESPONSABILIDAD: Mover Chomp basado en MovementIntent
// ══════════════════════════════════════════════════════════

interface ContinuousMovementSystem {
  // QUERY
  entities: query(ContinuousPosition, MovementSpeed, MovementIntent, PlayerTag)
  
  // LEE COMPONENTES
  ContinuousPosition
  MovementSpeed
  MovementIntent
  
  // LEE WORLD
  world.isWallAt(x, y)
  world.isHouseAt(x, y)
  
  // ESCRIBE COMPONENTES
  ContinuousPosition
  AlignmentState
  
  // INPUT EXTERNO
  deltaTime: number (ms)
  
  // LÓGICA
  // 1. Para cada entidad con estos componentes:
  // 2. Si MovementIntent.direction es null:
  //    - No hacer nada (AlignmentSystem manejará el deslizamiento)
  // 3. Calcular nueva posición:
  //    distance = speed.current * (deltaTime / 1000)
  //    newPos = currentPos + directionVector * distance
  // 4. Validar colisión con paredes:
  //    - Calcular tile destino (floor de newPos en la dirección de movimiento)
  //    - Si hay pared en tile destino:
  //      - Clampear posición al borde del tile actual
  //      - Ejemplo: si x=5.8, direction=RIGHT, pared en x=6
  //        → newX = 5.999... (o simplemente 6.0 - epsilon)
  //        → Pero si pared, newX = 5.0 (tile anterior válido)
  // 5. Aplicar nueva posición
  // 6. Actualizar AlignmentState:
  //    isAligned = (x % 1 === 0) && (y % 1 === 0)
}
```

**Detalle de Colisión con Paredes:**

```
Situación: Chomp en (5.7, 10.0), moviéndose RIGHT, pared en (6, 10)

Paso 1: Calcular tile al que entraría
- direction = RIGHT
- currentTile = floor(5.7) = 5
- nextTile = 6

Paso 2: Verificar pared
- isWallAt(6, 10) = true

Paso 3: Clampear
- No puede entrar a tile 6
- Posición final = (5.0, 10.0) [último tile válido]
- NO (5.999), porque eso crearía problemas de detección
```

---

#### **AlignmentSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: ALIGNMENT
// RESPONSABILIDAD: Deslizar Chomp hasta alineación cuando no hay input
// ══════════════════════════════════════════════════════════

interface AlignmentSystem {
  // QUERY
  entities: query(ContinuousPosition, MovementSpeed, AlignmentState, PlayerIntent)
  inputEntity: query(InputState)
  
  // LEE COMPONENTES
  ContinuousPosition
  MovementSpeed
  AlignmentState
  PlayerIntent.lastValidDirection
  InputState
  
  // ESCRIBE COMPONENTES
  ContinuousPosition
  AlignmentState
  
  // LÓGICA
  // 1. Si hay input activo (cualquier dirección pulsada): return
  // 2. Si ya está alineado (AlignmentState.isAligned): return
  // 3. Deslizar hacia el siguiente tile entero:
  //    - Usar lastValidDirection para determinar hacia dónde
  //    - Calcular tile objetivo: 
  //      - Si direction=RIGHT y x=5.3 → objetivo=6.0
  //      - Si direction=LEFT y x=5.3 → objetivo=5.0
  //    - Mover hacia objetivo a velocidad normal
  //    - Si alcanza objetivo exacto: 
  //      - Clampear a entero
  //      - AlignmentState.isAligned = true
  //      - AlignmentState.aligningDirection = null
}
```

---

#### **DiscretePositionSyncSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: DISCRETE_POSITION_SYNC
// RESPONSABILIDAD: Mantener DiscretePosition de Chomp sincronizada
// ══════════════════════════════════════════════════════════

interface DiscretePositionSyncSystem {
  // QUERY
  entities: query(ContinuousPosition, DiscretePosition, PlayerTag)
  
  // LEE COMPONENTES
  ContinuousPosition
  
  // ESCRIBE COMPONENTES
  DiscretePosition
  
  // LÓGICA
  // 1. DiscretePosition.x = Math.floor(ContinuousPosition.x)
  // 2. DiscretePosition.y = Math.floor(ContinuousPosition.y)
  
  // NOTA: Esta posición discreta es la que usan los fantasmas
  // para targeting y la detección de colisiones.
}
```

---

#### **GhostBehaviorModeSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: GHOST_BEHAVIOR_MODE
// RESPONSABILIDAD: Transiciones de máquina de estados de fantasmas
// ══════════════════════════════════════════════════════════

interface GhostBehaviorModeSystem {
  // QUERY
  entities: query(GhostTag, BehaviorMode, BehaviorTimer, DiscretePosition, TargetPosition)
  
  // LEE COMPONENTES
  BehaviorMode
  BehaviorTimer
  DiscretePosition
  TargetPosition
  
  // LEE CONFIG
  ghostBehavior.json (posiciones HOME, EXIT, SCATTER; tiempos por nivel)
  
  // LEE WORLD
  currentLevel (de algún singleton o config)
  
  // ESCRIBE COMPONENTES
  BehaviorMode
  BehaviorTimer
  TargetPosition
  
  // LÓGICA (máquina de estados simplificada)
  // Para cada fantasma:
  
  // HOUSE:
  //   Si timer <= 0 → EXITING_HOUSE
  //   Target = posición de salida
  
  // EXITING_HOUSE:
  //   Si position == exitPosition → CHASE
  //   Inicializar timer para CHASE
  
  // CHASE:
  //   Si timer <= 0 → evaluar transición a SCATTER
  //   Target = (se calcula en GhostTargetingSystem)
  
  // SCATTER:
  //   Si timer <= 0 → evaluar transición a CHASE
  //   Target = esquina de scatter
  
  // FRIGHTENED:
  //   Si llega a exitPosition → target = homePosition, direction = DOWN
  //   Si llega a homePosition → HOUSE, reiniciar timer
  
  // EATEN:
  //   No hace nada (sistema de movimiento lo ignora)
}
```

---

#### **GhostTargetingSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: GHOST_TARGETING
// RESPONSABILIDAD: Calcular posición objetivo de cada fantasma
// ══════════════════════════════════════════════════════════

interface GhostTargetingSystem {
  // QUERY
  ghosts: query(GhostTag, BehaviorMode, TargetPosition)
  player: query(PlayerTag, DiscretePosition, CurrentDirection)
  
  // LEE COMPONENTES
  GhostTag.kind
  BehaviorMode
  DiscretePosition (del jugador y de cada fantasma)
  CurrentDirection (del jugador)
  PeerReference (para Inky)
  
  // ESCRIBE COMPONENTES
  TargetPosition
  
  // LÓGICA (solo si mode == CHASE)
  // BLINKY: target = posición de Chomp
  // PINKY: target = 4 tiles adelante de Chomp (en su dirección)
  // INKY: target = vector desde Blinky a (2 tiles adelante de Chomp) * 2
  // CLYDE: si distancia > 8 → target = Chomp; else → esquina scatter
}
```

---

#### **GhostDirectionSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: GHOST_DIRECTION
// RESPONSABILIDAD: Decidir siguiente dirección de cada fantasma
// ══════════════════════════════════════════════════════════

interface GhostDirectionSystem {
  // QUERY
  entities: query(GhostTag, DiscretePosition, TargetPosition, CurrentDirection, BehaviorMode)
  
  // LEE COMPONENTES
  DiscretePosition
  TargetPosition
  CurrentDirection
  BehaviorMode
  
  // LEE WORLD
  world.isWallAt(x, y)
  world.isHouseAt(x, y)
  
  // ESCRIBE COMPONENTES
  MovementIntent
  
  // LÓGICA
  // 1. Si mode == EATEN o HOUSE (sin salir): MovementIntent = null, return
  // 2. Obtener dirección opuesta a currentDirection
  // 3. Evaluar 4 direcciones posibles (excluyendo opuesta):
  //    - Filtrar las que llevan a pared
  //    - Filtrar las que llevan a house (si no está en EXITING_HOUSE o FRIGHTENED)
  // 4. De las válidas, elegir la que minimiza distancia euclidiana al target
  // 5. Escribir MovementIntent.direction
}
```

---

#### **DiscreteMovementSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: DISCRETE_MOVEMENT
// RESPONSABILIDAD: Mover fantasmas tile a tile basado en timer
// ══════════════════════════════════════════════════════════

interface DiscreteMovementSystem {
  // QUERY
  entities: query(GhostTag, DiscretePosition, MovementTimer, MovementIntent, CurrentDirection)
  
  // LEE COMPONENTES
  DiscretePosition
  MovementTimer
  MovementIntent
  
  // ESCRIBE COMPONENTES
  DiscretePosition
  MovementTimer.elapsed
  CurrentDirection
  
  // INPUT EXTERNO
  deltaTime: number
  
  // LÓGICA
  // 1. Incrementar MovementTimer.elapsed += deltaTime
  // 2. Si elapsed < interval: return
  // 3. elapsed -= interval (mantener fracción)
  // 4. Si MovementIntent.direction es null: return
  // 5. Calcular nueva posición discreta:
  //    newPos = currentPos + directionVector
  // 6. Manejar teleportación (bordes del mapa):
  //    - Si newPos.x < 1 → newPos.x = 30
  //    - Si newPos.x > 30 → newPos.x = 1
  // 7. Aplicar nueva posición
  // 8. Actualizar CurrentDirection
}
```

---

#### **EntityCollisionSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: ENTITY_COLLISION
// RESPONSABILIDAD: Detectar colisiones entre Chomp y fantasmas
// ══════════════════════════════════════════════════════════

interface EntityCollisionSystem {
  // QUERY
  player: query(PlayerTag, DiscretePosition)
  ghosts: query(GhostTag, DiscretePosition, BehaviorMode)
  
  // LEE COMPONENTES
  DiscretePosition (de ambos)
  BehaviorMode (de fantasmas)
  
  // ESCRIBE COMPONENTES
  CollisionEvent (añade a Chomp)
  
  // LÓGICA
  // 1. Obtener DiscretePosition de Chomp
  // 2. Para cada fantasma:
  //    - Si BehaviorMode == EATEN: skip
  //    - Si posición fantasma == posición Chomp:
  //      - Añadir CollisionEvent a Chomp:
  //        { withEntity: ghostId, type: 'ghost' }
  
  // NOTA: Las posiciones discretas se usan para detección.
  // Chomp puede estar en (5.7, 10) pero su DiscretePosition es (5, 10).
  // Un fantasma en (5, 10) colisiona con Chomp.
  
  // CASO ESPECIAL: Cruce de posiciones
  // Si Chomp va de 5→6 y Fantasma va de 6→5 en el mismo frame:
  // - Antes del movimiento: Chomp en 5, Ghost en 6
  // - Después del movimiento: Chomp en 6, Ghost en 5
  // - No hay colisión por posición exacta, pero SE CRUZARON
  
  // SOLUCIÓN: Detectar también cruces
  // Para cada fantasma:
  //   ghostPrevPos = (almacenar antes de mover)
  //   chompPrevPos = (almacenar antes de mover)
  //   Si (ghostPrevPos == chompCurrentPos AND chompPrevPos == ghostCurrentPos):
  //     → Colisión por cruce
}
```

---

#### **DamageSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: DAMAGE
// RESPONSABILIDAD: Aplicar consecuencias de colisiones
// ══════════════════════════════════════════════════════════

interface DamageSystem {
  // QUERY
  entities: query(CollisionEvent, Health, Invulnerability)
  ghosts: query(GhostTag, BehaviorMode)
  
  // LEE COMPONENTES
  CollisionEvent
  Invulnerability
  BehaviorMode (del fantasma en la colisión)
  
  // ESCRIBE COMPONENTES
  Health
  Invulnerability
  BehaviorMode (del fantasma, si es comido)
  CurrentDirection (del fantasma, limpiar si es comido)
  
  // LÓGICA
  // Para cada entidad con CollisionEvent:
  // 1. Obtener fantasma de la colisión
  // 2. Si fantasma está FRIGHTENED:
  //    - Fantasma → EATEN
  //    - Limpiar CurrentDirection del fantasma
  //    - No aplicar daño a Chomp
  // 3. Si Invulnerability.ticksRemaining > 0:
  //    - Chomp es invulnerable, no aplicar daño
  // 4. Else:
  //    - Health.current -= 1
  //    - Invulnerability.ticksRemaining = 10 (configurable)
}
```

---

#### **CollectionDetectionSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: COLLECTION_DETECTION
// RESPONSABILIDAD: Detectar items en la posición de Chomp
// ══════════════════════════════════════════════════════════

interface CollectionDetectionSystem {
  // QUERY
  collectors: query(Collector, DiscretePosition)
  
  // LEE COMPONENTES
  Collector
  DiscretePosition
  
  // LEE WORLD
  world.getCollectableAt(x, y)
  
  // ESCRIBE COMPONENTES
  CollectionEvent
  
  // LÓGICA
  // 1. Para cada entidad con Collector:
  // 2. Verificar si hay collectable en DiscretePosition
  // 3. Si existe y Collector.canCollect incluye el tipo:
  //    - Añadir CollectionEvent: { collectableId, kind, position }
}
```

---

#### **CollectionEffectSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: COLLECTION_EFFECT
// RESPONSABILIDAD: Aplicar efectos de recolección
// ══════════════════════════════════════════════════════════

interface CollectionEffectSystem {
  // QUERY
  entities: query(CollectionEvent)
  
  // LEE COMPONENTES
  CollectionEvent
  
  // ESCRIBE WORLD
  world.removeCollectable(x, y)
  
  // ESCRIBE ESTADO DE JUEGO
  score += (PAC_DOT: 100, POWER_PELLET: 500)
  
  // LÓGICA
  // 1. Para cada CollectionEvent:
  // 2. Remover collectable del mundo
  // 3. Incrementar score según tipo
  // 4. Actualizar contadores de maze.info
}
```

---

#### **PowerPelletEffectSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: POWER_PELLET_EFFECT
// RESPONSABILIDAD: Asustar a todos los fantasmas
// ══════════════════════════════════════════════════════════

interface PowerPelletEffectSystem {
  // QUERY
  collectionEvents: query(CollectionEvent)
  ghosts: query(GhostTag, BehaviorMode)
  
  // LEE COMPONENTES
  CollectionEvent.kind
  BehaviorMode
  
  // ESCRIBE COMPONENTES
  BehaviorMode
  TargetPosition
  
  // LÓGICA
  // 1. Buscar CollectionEvent donde kind == POWER_PELLET
  // 2. Si no existe: return
  // 3. Para cada fantasma:
  //    - Si mode != HOUSE && mode != EXITING_HOUSE && mode != EATEN:
  //      - BehaviorMode = FRIGHTENED
  //      - TargetPosition = posición de salida de casa
}
```

---

#### **InvulnerabilityTickSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: INVULNERABILITY_TICK
// RESPONSABILIDAD: Decrementar timers de invulnerabilidad
// ══════════════════════════════════════════════════════════

interface InvulnerabilityTickSystem {
  // QUERY
  entities: query(Invulnerability)
  
  // LEE COMPONENTES
  Invulnerability
  
  // ESCRIBE COMPONENTES
  Invulnerability.ticksRemaining
  
  // LÓGICA
  // Si ticksRemaining > 0: ticksRemaining -= 1
}
```

---

#### **BehaviorTimerTickSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: BEHAVIOR_TIMER_TICK
// RESPONSABILIDAD: Decrementar timers de comportamiento de fantasmas
// ══════════════════════════════════════════════════════════

interface BehaviorTimerTickSystem {
  // QUERY
  entities: query(BehaviorTimer, BehaviorMode)
  
  // LEE COMPONENTES
  BehaviorTimer
  BehaviorMode
  
  // ESCRIBE COMPONENTES
  BehaviorTimer.ticksRemaining
  
  // LÓGICA
  // Si mode in [HOUSE, CHASE, SCATTER]:
  //   Si ticksRemaining > 0: ticksRemaining -= 1
}
```

---

#### **VictoryConditionSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: VICTORY_CONDITION
// RESPONSABILIDAD: Detectar condición de victoria
// ══════════════════════════════════════════════════════════

interface VictoryConditionSystem {
  // LEE WORLD
  maze.info.pacDots.current
  maze.info.pacDots.total
  
  // ESCRIBE ESTADO DE JUEGO
  gameStatus = WON (si current >= total)
  
  // LÓGICA
  // Si todos los pac-dots recolectados: victoria
}
```

---

#### **DefeatConditionSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: DEFEAT_CONDITION
// RESPONSABILIDAD: Detectar condición de derrota
// ══════════════════════════════════════════════════════════

interface DefeatConditionSystem {
  // QUERY
  player: query(PlayerTag, Health)
  
  // LEE COMPONENTES
  Health
  
  // ESCRIBE ESTADO DE JUEGO
  gameStatus = LOST (si health <= 0)
}
```

---

#### **SyncToHotStateSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: SYNC_TO_HOT_STATE
// RESPONSABILIDAD: Sincronizar estado de render a Zustand
// ══════════════════════════════════════════════════════════

interface SyncToHotStateSystem {
  // QUERY
  renderables: query(Renderable)
  player: query(PlayerTag, ContinuousPosition, Health, Invulnerability)
  ghosts: query(GhostTag, DiscretePosition, BehaviorMode, CurrentDirection)
  
  // LEE COMPONENTES
  ContinuousPosition (Chomp)
  DiscretePosition (fantasmas)
  Health
  Invulnerability
  BehaviorMode
  CurrentDirection
  
  // ESCRIBE HOT STATE (Zustand)
  // Solo si el valor cambió desde el último frame (optimización)
  
  // SYNC PACMAN:
  hotState.pacman.position = ContinuousPosition
  hotState.pacman.health = Health.current
  hotState.pacman.isInvulnerable = Invulnerability.ticksRemaining > 0
  
  // SYNC FANTASMAS:
  for each ghost:
    hotState.ghosts[id].position = DiscretePosition
    hotState.ghosts[id].mode = BehaviorMode.mode
    hotState.ghosts[id].direction = CurrentDirection.direction
  
  // SYNC MAZE (si hubo cambios):
  hotState.maze.pacDotsCollected = maze.info.pacDots.current
  
  // SYNC GAME STATUS:
  hotState.game.score = score
  hotState.game.level = level
  hotState.game.status = status
}
```

---

#### **CleanupEventsSystem**

```typescript
// ══════════════════════════════════════════════════════════
// FASE: CLEANUP_EVENTS
// RESPONSABILIDAD: Limpiar componentes temporales
// ══════════════════════════════════════════════════════════

interface CleanupEventsSystem {
  // QUERY
  collisions: query(CollisionEvent)
  collections: query(CollectionEvent)
  
  // ESCRIBE (ELIMINA) COMPONENTES
  CollisionEvent
  CollectionEvent
  
  // LÓGICA
  // Remover todos los componentes de evento
  // Estos son "one-frame" components
}
```

---

## 5. Estructura del Hot State (Zustand)

```typescript
// ══════════════════════════════════════════════════════════
// HOT STATE - Solo datos de renderizado
// ══════════════════════════════════════════════════════════

interface HotState {
  // ══════════════════════════════════════════════════════════
  // ENTIDADES MÓVILES
  // ══════════════════════════════════════════════════════════
  
  pacman: {
    position: { x: number, y: number }  // Continua, para render suave
    health: number
    isInvulnerable: boolean
  }
  
  ghosts: {
    blinky: GhostRenderState
    pinky: GhostRenderState
    inky: GhostRenderState
    clyde: GhostRenderState
  }
  
  // ══════════════════════════════════════════════════════════
  // MAZE (relativamente estático)
  // ══════════════════════════════════════════════════════════
  
  maze: {
    isLoaded: boolean
    walls: Set<PositionKey>  // Solo posiciones, no entidades completas
    pacDots: Set<PositionKey>
    powerPellets: Set<PositionKey>
    pacDotsCollected: number
    pacDotsTotal: number
  }
  
  // ══════════════════════════════════════════════════════════
  // ESTADO DE JUEGO
  // ══════════════════════════════════════════════════════════
  
  game: {
    status: GameStatus
    score: number
    level: number
  }
}

interface GhostRenderState {
  position: { x: number, y: number }  // Discreta
  mode: GhostBehaviorModeValue
  direction: Direction | null  // Para rotación del modelo
}
```

---

## 6. Diagrama de Flujo de un Frame

```
════════════════════════════════════════════════════════════════════
                           GAME LOOP (1 FRAME)
════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: INPUT                                                    │
│                                                                  │
│  Teclado ──▶ InputCaptureSystem ──▶ [InputState]                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: DECISIONES                                               │
│                                                                  │
│  [InputState] ──▶ PlayerIntentSystem ──▶ [MovementIntent]       │
│                        │                      (Chomp)            │
│                        └──▶ [PlayerIntent.lastValidDirection]   │
│                                                                  │
│  [BehaviorTimer] ──▶ GhostBehaviorModeSystem ──▶ [BehaviorMode] │
│                                                                  │
│  [BehaviorMode] ──▶ GhostTargetingSystem ──▶ [TargetPosition]   │
│                                                                  │
│  [TargetPosition] ──▶ GhostDirectionSystem ──▶ [MovementIntent] │
│                                                    (Ghosts)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 3: FÍSICA                                                   │
│                                                                  │
│  [MovementIntent] ──▶ ContinuousMovementSystem                  │
│        (Chomp)              │                                    │
│                             └──▶ [ContinuousPosition]           │
│                             └──▶ [AlignmentState]               │
│                                                                  │
│  [MovementIntent] ──▶ DiscreteMovementSystem                    │
│       (Ghosts)              │                                    │
│                             └──▶ [DiscretePosition]             │
│                                                                  │
│  [InputState=none] ──▶ AlignmentSystem ──▶ [ContinuousPosition] │
│                                             (deslizamiento)      │
│                                                                  │
│  [ContinuousPosition] ──▶ DiscretePositionSyncSystem            │
│                                │                                 │
│                                └──▶ [DiscretePosition] (Chomp)  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 4: DETECCIÓN                                                │
│                                                                  │
│  [DiscretePosition] ──▶ EntityCollisionSystem                   │
│    (Chomp + Ghosts)          │                                   │
│                              └──▶ [CollisionEvent]              │
│                                                                  │
│  [DiscretePosition] ──▶ CollectionDetectionSystem               │
│                              │                                   │
│                              └──▶ [CollectionEvent]             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 5: EFECTOS                                                  │
│                                                                  │
│  [CollisionEvent] ──▶ DamageSystem ──▶ [Health], [Invuln]       │
│                                                                  │
│  [CollectionEvent] ──▶ CollectionEffectSystem ──▶ Score, Maze   │
│                                                                  │
│  [CollectionEvent=PP] ──▶ PowerPelletEffectSystem               │
│                                 │                                │
│                                 └──▶ [BehaviorMode=FRIGHTENED]  │
│                                                                  │
│  [Invulnerability] ──▶ InvulnerabilityTickSystem                │
│                                                                  │
│  [BehaviorTimer] ──▶ BehaviorTimerTickSystem                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 6: ESTADO DE JUEGO                                          │
│                                                                  │
│  Maze.info ──▶ VictoryConditionSystem ──▶ GameStatus=WON?       │
│                                                                  │
│  [Health] ──▶ DefeatConditionSystem ──▶ GameStatus=LOST?        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 7: SINCRONIZACIÓN                                           │
│                                                                  │
│  COLD STATE ──▶ SyncToHotStateSystem ──▶ HOT STATE (Zustand)    │
│                                                                  │
│  (Solo datos que cambiaron, solo datos de render)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 8: LIMPIEZA                                                 │
│                                                                  │
│  CleanupEventsSystem ──▶ Elimina [CollisionEvent]               │
│                      ──▶ Elimina [CollectionEvent]              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    requestAnimationFrame()
                              │
                              ▼
                       SIGUIENTE FRAME
```

---

## 7. Entidades y sus Componentes

### 7.1 Chomp (Jugador)

```typescript
EntityId: 'chomp'

Componentes:
├── PlayerTag: {}
├── Playable: {}
├── Renderable: {}
├── ContinuousPosition: { x: 14.0, y: 16.0 }
├── DiscretePosition: { x: 14, y: 16 }
├── MovementSpeed: { current: 5.0, base: 5.0 }
├── MovementIntent: { direction: null }
├── PlayerIntent: { desiredDirection: null, lastValidDirection: null }
├── AlignmentState: { isAligned: true, aligningDirection: null }
├── Health: { current: 3, max: 3 }
├── Invulnerability: { ticksRemaining: 0 }
└── Collector: { canCollect: [PAC_DOT, POWER_PELLET] }
```

### 7.2 Fantasma (Blinky como ejemplo)

```typescript
EntityId: 'blinky'

Componentes:
├── GhostTag: { kind: BLINKY }
├── Renderable: {}
├── DiscretePosition: { x: 14, y: 11 }
├── MovementTimer: { elapsed: 0, interval: 250 }
├── MovementIntent: { direction: null }
├── CurrentDirection: { direction: null }
├── BehaviorMode: { mode: HOUSE }
├── BehaviorTimer: { ticksRemaining: 0 }
└── TargetPosition: { x: 14, y: 11, kind: HOUSE }
```

### 7.3 Fantasma Inky (con referencia a peer)

```typescript
EntityId: 'inky'

Componentes:
├── GhostTag: { kind: INKY }
├── Renderable: {}
├── DiscretePosition: { x: 12, y: 14 }
├── MovementTimer: { elapsed: 0, interval: 250 }
├── MovementIntent: { direction: null }
├── CurrentDirection: { direction: null }
├── BehaviorMode: { mode: HOUSE }
├── BehaviorTimer: { ticksRemaining: 30 }
├── TargetPosition: { x: 12, y: 14, kind: HOUSE }
└── PeerReference: { peerId: 'blinky' }  // ← Solo Inky tiene esto
```

### 7.4 Maze Data (Estructura Espacial Optimizada)

```typescript
// En lugar de entidades individuales para cada wall/collectable,
// usamos estructuras de datos espaciales para rendimiento:

GameWorld.wallGrid: Set<PositionKey>
// Ejemplo: Set { "0,0", "0,1", "1,0", ... }

GameWorld.houseGrid: Set<PositionKey>
// Ejemplo: Set { "13,14", "14,14", "15,14", ... }

GameWorld.collectableGrid: Map<PositionKey, CollectableKind>
// Ejemplo: Map { "7,15" => PAC_DOT, "14,26" => POWER_PELLET, ... }

// Contadores para UI
GameWorld.mazeInfo: {
  pacDotsTotal: number
  pacDotsCollected: number
  powerPelletsTotal: number
  powerPelletsCollected: number
}
```

### 7.5 Singleton de Input

```typescript
EntityId: 'input'

Componentes:
└── InputState: { up: false, down: false, left: false, right: false }
```

---

## 8. Consideraciones Especiales

### 8.1 Detección de Colisión por Cruce

Para evitar que Chomp y un fantasma se "crucen" sin detectar colisión:

```typescript
// En EntityCollisionSystem, antes de mover:
interface PreviousPosition extends Component {
  x: number
  y: number
}

// El sistema guarda posiciones previas y verifica:
// Si ghost.prev == chomp.current AND chomp.prev == ghost.current → CRUCE
```

**Alternativa más simple:** Ejecutar detección de colisión ANTES y DESPUÉS del movimiento en el mismo frame.

### 8.2 Teleportación en Bordes

El `DiscreteMovementSystem` maneja teleportación:
- Si `x < 1` después de mover LEFT → `x = 30`
- Si `x > 30` después de mover RIGHT → `x = 1`

Para Chomp (continuo), el `ContinuousMovementSystem` también debe manejarlo.

### 8.3 Cómo el Debug Panel Escribe al Cold State

```typescript
// GameWorld expone API pública
gameWorld.debugSetComponent('chomp', 'ContinuousPosition', { x: 10, y: 5 })
gameWorld.debugSetComponent('blinky', 'BehaviorMode', { mode: 'FRIGHTENED' })

// Esto muta el Cold State directamente.
// En el siguiente frame, SyncToHotStateSystem propagará el cambio a Zustand.
// React verá el cambio y actualizará el render.
```

### 8.4 Inicialización de Entidades

El engine cargará entidades desde configuración:

```typescript
interface EntityTemplate {
  id: EntityId
  components: Array<{ type: ComponentType, data: any }>
}

// Ejemplo en JSON
{
  "id": "chomp",
  "components": [
    { "type": "PlayerTag", "data": {} },
    { "type": "ContinuousPosition", "data": { "x": 14, "y": 16 } },
    // ...
  ]
}
```

### 8.5 Pausa del Juego

El game loop respeta el estado de pausa:

```typescript
// En el game loop principal
if (gameStatus === 'PAUSED') {
  // No ejecutar sistemas de lógica
  // Solo ejecutar SyncToHotStateSystem para mantener UI responsive
  // requestAnimationFrame para siguiente frame
  return
}
```

### 8.6 Velocidad Variable de Chomp

El componente `MovementSpeed` permite cambios de velocidad:

```typescript
interface MovementSpeed extends Component {
  current: number  // Velocidad actual (puede ser modificada por power-ups, etc.)
  base: number     // Velocidad base (para resetear)
}

// Ejemplos de uso futuro:
// - Power pellet: speed.current = speed.base * 1.2
// - Túnel: speed.current = speed.base * 0.5
// - Reset: speed.current = speed.base
```

---

## 9. Resumen de Cambios vs Estado Actual

| Aspecto | Actual | Propuesto |
|---------|--------|-----------|
| Almacenamiento | Múltiples Zustand stores | GameWorld (Cold) + 1 Zustand store (Hot) |
| Entidades | Objetos con `components` + `actions` | IDs en GameWorld, componentes separados |
| Componentes | Tipado débil (`Record<string, any>`) | Interfaces TypeScript estrictas |
| Actions | Dentro de entidades | Eliminadas, lógica en sistemas |
| Sistemas | Monolíticos, acoplados a stores | Atómicos, reciben GameWorld |
| Movimiento Chomp | Discreto con interpolación hacky | Continuo nativo con alineación |
| Movimiento Ghosts | Discreto | Discreto (sin cambios conceptuales) |
| Colisiones | Verificación manual, frágil | Sistema dedicado con detección de cruces |
| Queries | Hardcodeadas por store | `world.query(Component1, Component2)` |
| Render sync | Directo desde stores | 1x por frame, solo datos de render |
| Maze data | Entidades ECS completas | Estructuras espaciales optimizadas (Set/Map) |

---

## 10. Decisiones de Diseño Confirmadas

1. **Velocidad de Chomp:** Constante por ahora, pero el componente `MovementSpeed` permite cambios futuros.

2. **Collectables:** Estructuras de datos espaciales (`Set<PositionKey>`, `Map<PositionKey, Kind>`) en lugar de entidades ECS completas, por rendimiento.

3. **Pausa:** El juego puede pausar; el game loop deja de ejecutar sistemas de lógica pero mantiene la sincronización para UI.

4. **Ticks vs Milliseconds:** Son conceptos diferentes:
   - **Tick:** Un salto discreto de posición (cuando el timer completa un ciclo)
   - **Milliseconds:** Tiempo real transcurrido
   - Los timers acumulan ms y disparan un tick cuando `elapsed >= interval`

---

## 11. Próximos Pasos (No incluidos en este documento)

- Plan de implementación por fases
- Migración incremental desde arquitectura actual
- Tests de rendimiento para validar decisiones
- Integración con React Three Fiber

---

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Autor:** Arquitectura definida en colaboración con el equipo de desarrollo
