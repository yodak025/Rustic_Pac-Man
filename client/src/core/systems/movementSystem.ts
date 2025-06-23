const RADIUS_FACTOR = 0; // Factor to adjust the radius for movement checks

interface IMovementSystem {
  move: (
    position: { x: number; y: number },
    setPosition: ({ x, y }: { x: number; y: number }) => void,
    keys: { forward: boolean; backward: boolean; left: boolean; right: boolean },
    delta: number,
    tileMap: any,
    onPositionChange?: (position: { x: number; y: number }) => void
  ) => void;
}

export default class MovementSystem implements IMovementSystem {
  constructor(
    private speed: number,
    private radius: number
  ) {}

  private isValidMove(x: number, y: number, direction: string, tileMap: any): boolean {
    // Calcular las coordenadas de los puntos críticos según la dirección
    let criticalPoints: { x: number; y: number }[] = [];

    switch (direction) {
      case "right":
        // Solo verificar el lado derecho del círculo
        criticalPoints = [
          { x: x + this.radius, y: y - this.radius * RADIUS_FACTOR },
          { x: x + this.radius, y: y + this.radius * RADIUS_FACTOR }
        ];
        break;
      case "left":
        // Solo verificar el lado izquierdo del círculo
        criticalPoints = [
          { x: x - this.radius, y: y - this.radius * RADIUS_FACTOR },
          { x: x - this.radius, y: y + this.radius * RADIUS_FACTOR }
        ];
        break;
      case "up":
        // Solo verificar la parte superior del círculo
        criticalPoints = [
          { x: x - this.radius * RADIUS_FACTOR, y: y - this.radius },
          { x: x + this.radius * RADIUS_FACTOR, y: y - this.radius }
        ];
        break;
      case "down":
        // Solo verificar la parte inferior del círculo
        criticalPoints = [
          { x: x - this.radius * RADIUS_FACTOR, y: y + this.radius },
          { x: x + this.radius * RADIUS_FACTOR, y: y + this.radius }
        ];
        break;
      default:
        return false;
    }

    // Verificar que los puntos críticos estén en posiciones válidas
    for (const point of criticalPoints) {
      const tileX = Math.round(point.x);
      const tileY = Math.round(point.y);

      // Check if the position is within bounds
      if (
        tileX < 0 ||
        tileY < 0 ||
        tileX >= tileMap.width ||
        tileY >= tileMap.height
      ) {
        return false; // Out of bounds
      }

      const tileValue = tileMap.getTile({x: tileX, y: tileY});
      if ((tileValue === 1)) { // Assuming 1 represents a wall, -4 represents a ghost
        return false;
      }
    }

    return true;
  }

  move(
    position: { x: number; y: number },
    setPosition: ({ x, y }: { x: number; y: number }) => void,
    keys: { forward: boolean; backward: boolean; left: boolean; right: boolean },
    delta: number,
    tileMap: any,
    onPositionChange?: (position: { x: number; y: number }) => void
  ): void {
    let moved = false;
    let currentPosition = { ...position };

    if (
      keys.forward &&
      this.isValidMove(
        currentPosition.x,
        currentPosition.y - this.speed * delta,
        "up",
        tileMap
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
        "down",
        tileMap
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
        "left",
        tileMap
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
        "right",
        tileMap
      )
    ) {
      currentPosition.x += this.speed * delta;
      moved = true;
    }

    if (moved) {
      // Check if there was a change in rounded position
      const roundedOldX = Math.round(position.x);
      const roundedOldY = Math.round(position.y);
      const roundedNewX = Math.round(currentPosition.x);
      const roundedNewY = Math.round(currentPosition.y);

      // If X position changed, round Y position
      if (roundedNewX !== roundedOldX) {
        currentPosition.y = Math.round(currentPosition.y);
      }
      // If Y position changed, round X position
      if (roundedNewY !== roundedOldY) {
        currentPosition.x = Math.round(currentPosition.x);
      }

      setPosition(currentPosition);
      
      if (onPositionChange) {
        onPositionChange(currentPosition);
      }
    }
  }
}
