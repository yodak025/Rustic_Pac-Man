import { Direction } from "@custom-types/gameComponents";
import type { GameWorld } from "@core/GameWorld";
import { ComponentType } from "@custom-types/componentTypes";

/**
 * Discrete Movement System
 * 
 * Handles discrete tile-based movement for ghost entities.
 * Ghosts move one tile at a time when their timer signals it's time to move.
 */
export function movementSystem(_deltaTime: number, gameWorld: GameWorld): void {
  const ghostEntities = gameWorld.query(
    ComponentType.GHOST_TAG,
    ComponentType.DISCRETE_POSITION,
    ComponentType.TIMER,
    ComponentType.MOVEMENT_INTENT,
    ComponentType.CURRENT_DIRECTION
  );

  for (const entityId of ghostEntities) {
    const position = gameWorld.getComponent(entityId, ComponentType.DISCRETE_POSITION);
    const timer = gameWorld.getComponent(entityId, ComponentType.TIMER);
    const movementIntent = gameWorld.getComponent(entityId, ComponentType.MOVEMENT_INTENT);
    const currentDirection = gameWorld.getComponent(entityId, ComponentType.CURRENT_DIRECTION);

    if (!position || !timer || !movementIntent || !currentDirection) {
      console.error(`[movementSystem] Missing components for entity ${entityId}`);
      continue;
    }

    if (!timer.isTimeToMove) {
      continue;
    }

    if (!movementIntent.direction) {
      continue;
    }

    let newX = position.x;
    let newY = position.y;

    switch (movementIntent.direction) {
      case Direction.UP:
        newY = position.y - 1;
        break;
      case Direction.DOWN:
        newY = position.y + 1;
        break;
      case Direction.LEFT:
        newX = position.x === 1 ? 30 : position.x - 1;
        break;
      case Direction.RIGHT:
        newX = position.x === 30 ? 1 : position.x + 1;
        break;
    }

    gameWorld.setComponent(entityId, ComponentType.DISCRETE_POSITION, {
      x: newX,
      y: newY
    });

    gameWorld.setComponent(entityId, ComponentType.CURRENT_DIRECTION, {
      direction: movementIntent.direction
    });
  }
}
