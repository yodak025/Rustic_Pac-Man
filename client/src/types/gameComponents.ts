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
}

export enum CollectableKind{
PAC_DOT = 'PAC_DOT',
POWER_PELLET = 'POWER_PELLET'
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

export enum GhostBehaviorMode {
  HOUSE = 'HOUSE',
  EXITING_HOUSE = 'EXITING_HOUSE',
  SCATTER = 'SCATTER',
  CHASE = 'CHASE',
  FRIGHTENED = 'FRIGHTENED',
  EATEN = 'EATEN'
}

export enum TargetKind {
  PLAYER = 'PLAYER',
  HOUSE = 'HOUSE',
  TILE = 'TILE',
  RANDOM = 'RANDOM',
}

export interface Behavior {
  kind: GhostBehaviorKind | null;
  mode: GhostBehaviorMode;
  target : {
    kind: TargetKind;
    position: Position | null;
  }
  ticks : number | null;
}