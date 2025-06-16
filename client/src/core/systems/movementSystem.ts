interface IMovementSystem {
  move: (
    position: { x: number; y: number },
    setPosition: ({ x, y }: { x: number; y: number }) => void,
    direction: any,
    delta: number
  ) => void;
}

export default class MovementSystem implements IMovementSystem {
  constructor(
    private readonly tileMap: any,
    private speed: number,
    private radius: number
  ) {}

  private isValidMove(x: number, y: number, direction: string): boolean {
    const tileX = Math.round(
      x +
        (direction === "right"
          ? this.radius
          : direction === "left"
            ? -this.radius
            : 0)
    );
    const tileY = Math.round(
      y +
        (direction === "down"
          ? this.radius
          : direction === "up"
            ? -this.radius
            : 0)
    );

    // Check if the new position is within bounds and not a wall
    if (
      tileX < 0 ||
      tileY < 0 ||
      tileX >= this.tileMap.width ||
      tileY >= this.tileMap.height
    ) {
      return false; // Out of bounds
    }
    const tileValue = this.tileMap.get(tileX, tileY);
    return tileValue !== 1; // Assuming 1 represents a wall
  }

  move(
    position: { x: number; y: number },
    setPosition: ({ x, y }: { x: number; y: number }) => void,
    keys: any,
    delta: number,
    onPositionChange?: ({ x, y }: { x: number; y: number }) => void
  ): void {
    let moved = false;
    let currentPosition = { ...position };

    if (
      keys.forward &&
      this.isValidMove(
        currentPosition.x,
        currentPosition.y - this.speed * delta,
        "up"
      )
    ) {
      currentPosition.y -= this.speed * delta;
      moved = true;
    }
    if (
      keys.backward &&
      this.isValidMove(
        currentPosition.x,
        currentPosition.y + this.speed * delta,
        "down"
      )
    ) {
      currentPosition.y += this.speed * delta;
      moved = true;
    }
    if (
      keys.left &&
      this.isValidMove(
        currentPosition.x - this.speed * delta,
        currentPosition.y,
        "left"
      )
    ) {
      currentPosition.x -= this.speed * delta;
      moved = true;
    }
    if (
      keys.right &&
      this.isValidMove(
        currentPosition.x + this.speed * delta,
        currentPosition.y,
        "right"
      )
    ) {
      currentPosition.x += this.speed * delta;
      moved = true;
    }

    if (moved) {
      setPosition(currentPosition);
      if (
        onPositionChange &&
        (Math.round(currentPosition.x) !== Math.round(position.x) ||
          Math.round(currentPosition.y) !== Math.round(position.y))
      ) {
        onPositionChange(currentPosition);
      }
    }
  }
}
