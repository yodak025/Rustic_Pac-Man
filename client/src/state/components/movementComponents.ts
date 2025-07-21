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
  RIGHT = 'RIGHT',
  STOP = 'STOP'
}

export interface DirectionComponent {
  direction: Direction;
}

// Playable component - marks entities as player-controllable
export interface Playable {
  value: boolean;
}
