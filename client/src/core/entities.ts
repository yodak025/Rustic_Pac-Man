import { Direction } from "../types/directions";

export abstract class Entity {
  constructor(
    public x: number,
    public y: number
  ) {}
}

interface Movable {
  speed: number;
  move(delta: number, direction: Direction): void;
}

interface Collectible {
  isTaken: boolean;
  collect(): void;
}

export abstract class MovingEntity extends Entity implements Movable {
  constructor(
    x: number,
    y: number,
    public speed: number = 1
  ) {
    super(x, y);
  }

  move(delta: number, direction: Direction): void {
    switch (direction) {
      case Direction.Up:
        this.y -= this.speed * delta;
        break;
      case Direction.Down:
        this.y += this.speed * delta;
        break;
      case Direction.Left:
        this.x -= this.speed * delta;
        break;
      case Direction.Right:
        this.x += this.speed * delta;
        break;
    }
  }
}

export abstract class CollectibleEntity extends Entity implements Collectible {
  constructor(
    public isTaken: boolean = false,
    x: number,
    y: number
  ) {
    super(x, y);
  }

  collect(): void {
    this.isTaken = true;
  }
}

export class PacmanEntity extends MovingEntity {
  constructor(
    x: number,
    y: number,
    speed: number = 1
  ) {
    super(x, y, speed);
  }
}

export class GhostEntity extends MovingEntity {
  constructor(
    x: number,
    y: number,
    speed: number = 1,
    public kind: string
  ) {
    super(x, y, speed);
  }
}

export class DotEntity extends CollectibleEntity {
  constructor(
    x: number,
    y: number,
    isTaken: boolean = false
  ) {
    super(isTaken, x, y);
  }
}

export const createGhosts = () => {
  return [
    new GhostEntity(1, 1, 0.5, "Blinky"),
    new GhostEntity(2, 2, 0.5, "Pinky"),
    new GhostEntity(3, 3, 0.5, "Inky"),
    new GhostEntity(4, 4, 0.5, "Clyde")
  ];
}
