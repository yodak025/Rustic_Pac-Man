// Position component - discrete position in 2D space
export interface Position {
  x: number;
  y: number;
}

// Movement timer component - handles movement timing
export interface MovementTimer {
  elapsed: number;
  interval: number;
}

// Direction component - discrete directional values
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface DirectionComponent {
  directions: Array<Direction>;
}

// Playable component - marks entities as player-controllable
export interface Playable {
  value: boolean;
}

export interface Collectable {
  value: boolean;
}

export interface Collidable {
  value: boolean;
}

export interface Health {
  value: number;
  iTicks:number;
}

export enum CollectableKind {
  ESSENCE = 'ESSENCE',
  WHITE_NOISE_BALL = 'WHITE_NOISE_BALL',
  // Medallions (found in the world as tiles)
  MEDALLION_HEALTH = 'MEDALLION_HEALTH',
  MEDALLION_STEALTH = 'MEDALLION_STEALTH',
  MEDALLION_VISION = 'MEDALLION_VISION',
  MEDALLION_SHOUT = 'MEDALLION_SHOUT',
  MEDALLION_SPEED = 'MEDALLION_SPEED',
  MEDALLION_ESSENCE = 'MEDALLION_ESSENCE',
  // Power Ups (found in the world, consumed via essence bar)
  POWER_UP_SUPER_DASH = 'POWER_UP_SUPER_DASH',
}

export enum MedallionKind {
  HEALTH = 'HEALTH',
  STEALTH = 'STEALTH',
  VISION = 'VISION',
  SHOUT = 'SHOUT',
  SPEED = 'SPEED',
  ESSENCE = 'ESSENCE',
}

export enum PowerUpKind {
  SUPER_DASH = 'SUPER_DASH',
}

/** Maps MedallionKind to its CollectableKind tile variant */
export const MEDALLION_COLLECTABLE: Record<MedallionKind, CollectableKind> = {
  [MedallionKind.HEALTH]: CollectableKind.MEDALLION_HEALTH,
  [MedallionKind.STEALTH]: CollectableKind.MEDALLION_STEALTH,
  [MedallionKind.VISION]: CollectableKind.MEDALLION_VISION,
  [MedallionKind.SHOUT]: CollectableKind.MEDALLION_SHOUT,
  [MedallionKind.SPEED]: CollectableKind.MEDALLION_SPEED,
  [MedallionKind.ESSENCE]: CollectableKind.MEDALLION_ESSENCE,
};

/** Set of all medallion CollectableKinds for quick membership tests */
export const MEDALLION_COLLECTABLE_SET = new Set<CollectableKind>(
  Object.values(MEDALLION_COLLECTABLE)
);

/** Resolves which MedallionKind a CollectableKind represents (or null) */
export function medallionKindFromCollectable(kind: CollectableKind): MedallionKind | null {
  for (const [mk, ck] of Object.entries(MEDALLION_COLLECTABLE) as [MedallionKind, CollectableKind][]) {
    if (ck === kind) return mk;
  }
  return null;
}

export interface Collector {
  collects : Array<CollectableKind>;
}

export enum GhostBehaviorKind {
  BLINKY = 'BLINKY',
  PINKY = 'PINKY',
  INKY = 'INKY',
  CLYDE = 'CLYDE'
}

export enum EchoBehaviorKind {
  SINUSOID = 'SINUSOID'
}

export enum BehaviorMode {
  HOUSE = 'HOUSE',
  EXITING_HOUSE = 'EXITING_HOUSE',
  SCATTER = 'SCATTER',
  CHASE = 'CHASE',
  FRIGHTENED = 'FRIGHTENED',
  EATEN = 'EATEN',
  IDLE = 'IDLE'
}

// Legacy alias for backwards compatibility during refactor
export const GhostBehaviorMode = BehaviorMode;

export enum TargetKind {
  PLAYER = 'PLAYER',
  HOUSE = 'HOUSE',
  TILE = 'TILE',
  RANDOM = 'RANDOM',
}

export interface Behavior {
  kind: GhostBehaviorKind | null;
  mode: BehaviorMode;
  target : {
    kind: TargetKind;
    position: Position | null;
  }
  ticks : number | null;
  peer: object | null; // [TODO] Enhance this typing if possible
}