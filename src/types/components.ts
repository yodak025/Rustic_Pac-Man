/**
 * Component Interfaces for the new ECS architecture
 * 
 * These interfaces define the data structures for each component type.
 * Components are pure data - no logic, no methods.
 * 
 * @see /docs/ECS_ARCHITECTURE_DESIGN.md for detailed specifications
 */

import type { EntityId } from './componentTypes';
import {
  Direction,
  CollectableKind,
  GhostBehaviorKind,
  BehaviorMode as BehaviorModeEnum,
  EchoBehaviorKind,
  TargetKind
} from './gameComponents';

// ============================================================================
// BASE COMPONENT INTERFACE
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Component {
  // Marker interface - all components extend this
}

// ============================================================================
// IDENTITY TAGS
// ============================================================================

export interface PlayerTag extends Component {
  // Marker: this entity is the player (Chomp)
  readonly _tag: 'player';
}

export interface GhostTag extends Component {
  kind: GhostBehaviorKind;
}

export interface EchoTag extends Component {
  kind: EchoBehaviorKind;
}

export interface WallTag extends Component {
  readonly _tag: 'wall';
}

export interface CollectableTag extends Component {
  kind: CollectableKind;
}

export interface HouseTileTag extends Component {
  readonly _tag: 'house';
}

// ============================================================================
// POSITION COMPONENTS
// ============================================================================

/**
 * Discrete Position - integer coordinates for tile-based logic
 * Used by: Ghosts, Walls, Collectables, and for Chomp's tile detection
 */
export interface DiscretePosition extends Component {
  x: number; // integer
  y: number; // integer
}

/**
 * Continuous Position - float coordinates for smooth movement
 * Used by: Chomp only
 */
export interface ContinuousPosition extends Component {
  x: number; // float
  y: number; // float
}

// ============================================================================
// MOVEMENT COMPONENTS
// ============================================================================

/**
 * Movement Timer - for discrete tile-by-tile movement
 * Used by: Ghosts, Echos
 */
export interface MovementTimer extends Component {
  elapsed: number;     // ms accumulated
  interval: number;    // ms between movements (current)
  baseInterval: number; // ms between movements (base/reference for speed changes)
  isTimeToMove: boolean;
}

/**
 * Movement Speed - for continuous movement
 * Used by: Chomp only
 */
export interface MovementSpeed extends Component {
  current: number; // tiles/second current
  base: number;    // tiles/second base (constant for now)
}

/**
 * Movement Intent - output of decision systems
 * Used by: All moving entities
 */
export interface MovementIntent extends Component {
  direction: Direction | null; // UP, DOWN, LEFT, RIGHT, or null (no movement)
}

/**
 * Current Direction - for avoiding reverse and rendering
 * Used by: Ghosts
 */
export interface CurrentDirection extends Component {
  direction: Direction | null;
}

/**
 * Alignment State - for grid snapping when input is released
 * Used by: Chomp only
 */
export interface AlignmentState extends Component {
  isAligned: boolean;                    // true if x and y are integers
  aligningDirection: Direction | null;   // slide direction when no input
}

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

/**
 * Input State - singleton, captures keyboard state
 */
export interface InputState extends Component {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/**
 * Player Intent - desired direction from input
 * Used by: Chomp
 */
export interface PlayerIntent extends Component {
  desiredDirection: Direction | null;     // direction player WANTS to go
  lastValidDirection: Direction | null;   // last direction that was successful
}

/**
 * Playable - marker for player-controlled entities
 */
export interface Playable extends Component {
  readonly _tag: 'playable';
}

// ============================================================================
// GHOST BEHAVIOR COMPONENTS
// ============================================================================

/**
 * Behavior Mode - entity state machine state (for ghosts and echos)
 */
export interface BehaviorMode extends Component {
  mode: BehaviorModeEnum;
}

/**
 * Behavior Timer - ticks until mode change
 */
export interface BehaviorCounter extends Component {
  ticksRemaining: number;
}

/**
 * Target Position - where the ghost is navigating to
 */
export interface TargetPosition extends Component {
  x: number;
  y: number;
  kind: TargetKind;
}

/**
 * Peer Reference - for Inky's targeting algorithm
 */
export interface PeerReference extends Component {
  peerId: EntityId; // 'blinky' for Inky
}

// ============================================================================
// COMBAT/INTERACTION COMPONENTS
// ============================================================================

/**
 * Health - entity health points
 */
export interface Health extends Component {
  current: number;
  max: number;
}

/**
 * Invulnerability - temporary damage immunity
 */
export interface Invulnerability extends Component {
  ticksRemaining: number; // 0 = vulnerable
}

/**
 * Collector - what types of collectables this entity can collect
 */
export interface Collector extends Component {
  canCollect: CollectableKind[];
}

/**
 * Collected Score - points accumulated by this entity (Echos only)
 */
export interface CollectedScore extends Component {
  points: number;
}

// ============================================================================
// EVENT COMPONENTS (one-frame, cleared each frame)
// ============================================================================

/**
 * Collision Event - triggered when entities overlap
 */
export interface CollisionEvent extends Component {
  withEntity: EntityId;
  type: 'ghost' | 'echo' | 'wall' | 'collectable';
}

/**
 * Collection Event - triggered when a collectable is picked up
 */
export interface CollectionEvent extends Component {
  collectableId: EntityId;
  kind: CollectableKind;
  position: { x: number; y: number };
}

/**
 * Echo Eaten Event - triggered when Chomp eats an Echo
 */
export interface EchoEatenEvent extends Component {
  echoId: EntityId;
  collectedScore: number;
}

// ============================================================================
// RENDER MARKER
// ============================================================================

/**
 * Renderable - marks entities that should be synced to Hot State
 */
export interface Renderable extends Component {
  readonly _tag: 'renderable';
}

// ============================================================================
// COMPONENT TYPE MAP (for type-safe getComponent)
// ============================================================================

import { ComponentType } from './componentTypes';

export interface ComponentTypeMap {
  [ComponentType.PLAYER_TAG]: PlayerTag;
  [ComponentType.GHOST_TAG]: GhostTag;
  [ComponentType.ECHO_TAG]: EchoTag;
  [ComponentType.WALL_TAG]: WallTag;
  [ComponentType.COLLECTABLE_TAG]: CollectableTag;
  [ComponentType.HOUSE_TILE_TAG]: HouseTileTag;
  [ComponentType.DISCRETE_POSITION]: DiscretePosition;
  [ComponentType.CONTINUOUS_POSITION]: ContinuousPosition;
  [ComponentType.TIMER]: MovementTimer;
  [ComponentType.MOVEMENT_SPEED]: MovementSpeed;
  [ComponentType.MOVEMENT_INTENT]: MovementIntent;
  [ComponentType.CURRENT_DIRECTION]: CurrentDirection;
  [ComponentType.ALIGNMENT_STATE]: AlignmentState;
  [ComponentType.INPUT_STATE]: InputState;
  [ComponentType.PLAYER_INTENT]: PlayerIntent;
  [ComponentType.PLAYABLE]: Playable;
  [ComponentType.BEHAVIOR_MODE]: BehaviorMode;
  [ComponentType.BEHAVIOR_COUNTER]: BehaviorCounter;
  [ComponentType.TARGET_POSITION]: TargetPosition;
  [ComponentType.PEER_REFERENCE]: PeerReference;
  [ComponentType.HEALTH]: Health;
  [ComponentType.INVULNERABILITY]: Invulnerability;
  [ComponentType.COLLECTOR]: Collector;
  [ComponentType.COLLECTED_SCORE]: CollectedScore;
  [ComponentType.COLLISION_EVENT]: CollisionEvent;
  [ComponentType.COLLECTION_EVENT]: CollectionEvent;
  [ComponentType.ECHO_EATEN_EVENT]: EchoEatenEvent;
  [ComponentType.RENDERABLE]: Renderable;
}
